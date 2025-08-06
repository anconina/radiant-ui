import type { AuthTokens } from '@/shared/contracts'
import { secureTokenManager } from '@/shared/lib/auth'
import { csrfManager } from '@/shared/lib/auth/csrf/csrf-manager'
import { config } from '@/shared/lib/environment'
import { i18n } from '@/shared/lib/i18n'
import { useAppStore } from '@/shared/stores'

import { getTokenProvider } from './token-provider'

// Custom error class to replace AxiosError
export class FetchError extends Error {
  public response?: Response
  public data?: any
  public status?: number
  public config?: FetchRequestConfig

  constructor(message: string, response?: Response, data?: any, config?: FetchRequestConfig) {
    super(message)
    this.name = 'FetchError'
    this.response = response
    this.data = data
    this.status = response?.status
    this.config = config
  }
}

// Request configuration interface
export interface FetchRequestConfig extends RequestInit {
  url?: string
  baseURL?: string
  timeout?: number
  params?: Record<string, any>
  _retry?: boolean
}

// Interceptor types
export type RequestInterceptor = (
  config: FetchRequestConfig
) => Promise<FetchRequestConfig> | FetchRequestConfig
export type ResponseInterceptor = {
  onFulfilled?: (response: Response) => Promise<Response> | Response
  onRejected?: (error: FetchError) => Promise<any> | any
}

// FetchClient class
export class FetchClient {
  private baseURL: string
  private timeout: number
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private abortControllers = new Map<string, AbortController>()

  constructor(config: { baseURL?: string; timeout?: number; headers?: HeadersInit } = {}) {
    this.baseURL = config.baseURL || ''
    this.timeout = config.timeout || 30000
  }

  // Add request interceptor
  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  // Add response interceptor
  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  // Build full URL
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      return queryString ? `${fullURL}?${queryString}` : fullURL
    }

    return fullURL
  }

  // Execute request interceptors
  private async executeRequestInterceptors(
    config: FetchRequestConfig
  ): Promise<FetchRequestConfig> {
    let processedConfig = config

    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig)
    }

    return processedConfig
  }

  // Execute response interceptors
  private async executeResponseInterceptors(
    response: Response,
    config: FetchRequestConfig
  ): Promise<Response> {
    let processedResponse = response

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onFulfilled) {
        processedResponse = await interceptor.onFulfilled(processedResponse)
      }
    }

    return processedResponse
  }

  // Execute error interceptors
  private async executeErrorInterceptors(error: FetchError): Promise<any> {
    let processedError = error

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onRejected) {
        try {
          return await interceptor.onRejected(processedError)
        } catch (e) {
          processedError = e instanceof FetchError ? e : new FetchError(String(e))
        }
      }
    }

    throw processedError
  }

  // Main request method
  public async request<T = any>(url: string, config: FetchRequestConfig = {}): Promise<T> {
    // Generate request ID for abort control
    const requestId = `${url}-${Date.now()}`

    try {
      // Create abort controller
      const abortController = new AbortController()
      this.abortControllers.set(requestId, abortController)

      // Set timeout
      const timeoutId = setTimeout(() => {
        abortController.abort()
      }, config.timeout || this.timeout)

      // Build configuration
      const fullURL = this.buildURL(url, config.params)
      const requestConfig: FetchRequestConfig = {
        ...config,
        url: fullURL,
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
      }

      // Execute request interceptors
      const processedConfig = await this.executeRequestInterceptors(requestConfig)

      // Make request
      const response = await fetch(fullURL, {
        ...processedConfig,
        credentials: 'include', // Always include cookies
      })

      // Clear timeout
      clearTimeout(timeoutId)

      // Parse response
      const contentType = response.headers.get('content-type')
      let data: any

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else if (contentType?.includes('text')) {
        data = await response.text()
      } else {
        data = await response.blob()
      }

      // Handle errors
      if (!response.ok) {
        const error = new FetchError(
          `Request failed with status ${response.status}`,
          response,
          data,
          processedConfig
        )
        throw await this.executeErrorInterceptors(error)
      }

      // Execute response interceptors
      await this.executeResponseInterceptors(response, processedConfig)

      return data as T
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FetchError('Request timeout', undefined, undefined, config)
      }

      if (error instanceof FetchError) {
        throw await this.executeErrorInterceptors(error)
      }

      throw new FetchError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      // Clean up abort controller
      this.abortControllers.delete(requestId)
    }
  }

  // Helper methods
  public async get<T = any>(url: string, config?: FetchRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  public async post<T = any>(url: string, data?: any, config?: FetchRequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  public async put<T = any>(url: string, data?: any, config?: FetchRequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  public async patch<T = any>(url: string, data?: any, config?: FetchRequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  public async delete<T = any>(url: string, config?: FetchRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }
}

// Create default instance
export const fetchClient = new FetchClient({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
})

// Refresh token function
async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${config.api.baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new FetchError('Token refresh failed', response)
  }

  return response.json()
}

// Configure token manager
export function configureFetchTokenManager(): void {
  if (secureTokenManager && secureTokenManager.setRefreshTokenFunction) {
    secureTokenManager.setRefreshTokenFunction(refreshTokens)
  }
}

// Auto-configure in non-test environments
if (process.env.NODE_ENV !== 'test') {
  setTimeout(() => {
    configureFetchTokenManager()
  }, 0)
}

// Add request interceptor for auth and CSRF
fetchClient.addRequestInterceptor(async config => {
  const isAuthEndpoint = config.url?.includes('/auth/') && !config.url?.includes('/auth/me')

  if (!isAuthEndpoint) {
    // Get or refresh token
    const token = await secureTokenManager.getOrRefreshToken(refreshTokens)
    if (token && config.headers) {
      const headers = config.headers as Record<string, string>
      if (token === 'cookie-auth') {
        // Cookies are automatically sent, no need for Authorization header
      } else {
        // Development mode - use bearer token
        headers.Authorization = `Bearer ${token}`
      }
    }
  }

  // Add CSRF token for state-changing requests
  if (config.method && csrfManager.requiresCsrfToken(config.method)) {
    const csrfToken = await csrfManager.getCsrfToken()
    if (csrfToken && config.headers) {
      const headers = config.headers as Record<string, string>
      headers['X-CSRF-Token'] = csrfToken
    }
  }

  // Add request timestamp
  if (config.headers) {
    const headers = config.headers as Record<string, string>
    headers['X-Request-Time'] = new Date().toISOString()
  }

  return config
})

// Add response interceptor for error handling
fetchClient.addResponseInterceptor({
  onFulfilled: response => {
    // Log response time in development
    if (config.app.isDevelopment) {
      // Note: We need to pass config through to access request headers
      console.log(`[API] ${response.url} - ${response.status}`)
    }
    return response
  },
  onRejected: async (error: FetchError) => {
    const originalRequest = error.config

    // Handle network errors
    if (!error.response) {
      useAppStore.getState().addNotification({
        type: 'error',
        title: i18n.t('common:toast.networkError.title'),
        message: i18n.t('common:toast.networkError.message'),
      })
      throw error
    }

    // Handle 401 Unauthorized
    if (error.status === 401 && !originalRequest?._retry) {
      if (originalRequest) {
        originalRequest._retry = true
      }

      // Skip retry for auth endpoints
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
      if (isAuthEndpoint) {
        throw error
      }

      try {
        // Try to refresh token
        const token = await secureTokenManager.getOrRefreshToken(refreshTokens)

        if (token && originalRequest) {
          // Retry original request with new token
          const headers = originalRequest.headers as Record<string, string>
          if (token === 'cookie-auth') {
            // Production - cookies will be sent automatically
          } else {
            // Development - use bearer token
            headers.Authorization = `Bearer ${token}`
          }

          return fetchClient.request(originalRequest.url!, originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and logout
        await secureTokenManager.clearTokens()
        csrfManager.clearCsrfToken()

        // Clear tokens via provider if available
        const tokenProvider = getTokenProvider()
        if (tokenProvider) {
          tokenProvider.clearTokens()
        }

        // Redirect to login
        window.location.href = '/auth/login'

        throw refreshError
      }
    }

    // Handle 403 Forbidden
    if (error.status === 403) {
      // Check if it's a CSRF error
      if (error.data?.error?.includes('CSRF') || error.data?.message?.includes('CSRF')) {
        // Clear CSRF token and retry once
        if (!originalRequest?._retry) {
          if (originalRequest) {
            originalRequest._retry = true
          }
          csrfManager.clearCsrfToken()

          // Get new CSRF token
          const csrfToken = await csrfManager.getCsrfToken()
          if (csrfToken && originalRequest) {
            const headers = originalRequest.headers as Record<string, string>
            headers['X-CSRF-Token'] = csrfToken
            return fetchClient.request(originalRequest.url!, originalRequest)
          }
        }
      }

      useAppStore.getState().addNotification({
        type: 'error',
        title: i18n.t('common:toast.accessDenied.title'),
        message: i18n.t('common:toast.accessDenied.message'),
      })
    }

    // Handle 404 Not Found
    if (error.status === 404) {
      useAppStore.getState().addNotification({
        type: 'error',
        title: i18n.t('common:toast.notFound.title'),
        message: i18n.t('common:toast.notFound.message'),
      })
    }

    // Handle 500 Server Error
    if (error.status && error.status >= 500) {
      useAppStore.getState().addNotification({
        type: 'error',
        title: i18n.t('common:toast.serverError.title'),
        message: i18n.t('common:toast.serverError.message'),
      })
    }

    // Handle validation errors (422)
    if (error.status === 422 && error.data) {
      if (error.data.errors) {
        // Show first validation error
        const firstError = Object.values(error.data.errors)[0]
        useAppStore.getState().addNotification({
          type: 'error',
          title: i18n.t('common:toast.validationError.title'),
          message: Array.isArray(firstError) ? firstError[0] : (firstError as string),
        })
      }
    }

    throw error
  },
})

// Export helper object for backward compatibility
export const apiClient = {
  get: <T = any>(url: string, config?: any) => fetchClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => fetchClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => fetchClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) =>
    fetchClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => fetchClient.delete<T>(url, config),
}

export default fetchClient
