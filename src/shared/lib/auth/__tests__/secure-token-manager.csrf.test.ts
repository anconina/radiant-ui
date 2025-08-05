/**
 * Tests for SecureTokenManager CSRF integration
 */
import { server } from '@/mocks/server'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { config } from '@/shared/lib/environment'

// Mock CSRF token
const mockCsrfToken = 'secure-csrf-token-456'

// Set up default handlers
beforeEach(() => {
  server.use(
    http.get(`${config.api.baseUrl}/auth/csrf-token`, () => {
      return HttpResponse.json({ token: mockCsrfToken })
    }),
    http.get(`${config.api.baseUrl}/auth/status`, () => {
      return HttpResponse.json({ authenticated: true })
    })
  )
})

afterEach(() => {
  server.resetHandlers()
})

describe('SecureTokenManager CSRF Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getCsrfToken', () => {
    it('should return CSRF token in production', async () => {
      // Mock API client to return our test token
      const mockApi = {
        get: vi.fn().mockResolvedValue({ data: { token: mockCsrfToken } }),
      }
      vi.doMock('@/shared/lib/http-client', () => ({ api: mockApi }))

      // Set production environment before importing
      vi.stubEnv('NODE_ENV', 'production')

      // Import after environment is set
      const { CookieStorageStrategy } = await import('../strategies/cookie-storage.strategy')
      const strategy = new CookieStorageStrategy()

      const token = await strategy.getCsrfToken()
      expect(token).toBe(mockCsrfToken)
      expect(mockApi.get).toHaveBeenCalledWith('/auth/csrf-token')

      vi.doUnmock('@/shared/lib/http-client')
    })

    it('should return null in development', async () => {
      vi.stubEnv('NODE_ENV', 'development')

      // Import after environment is set
      const { secureTokenManager } = await import('../secure-token-manager')

      const token = await secureTokenManager.getCsrfToken()
      expect(token).toBeNull()
    })

    it('should cache CSRF token across multiple calls', async () => {
      // Clear module cache and set production environment
      vi.resetModules()
      vi.stubEnv('NODE_ENV', 'production')

      // Track actual HTTP requests through MSW
      let csrfRequestCount = 0
      server.use(
        http.get(`${config.api.baseUrl}/auth/csrf-token`, () => {
          csrfRequestCount++
          return HttpResponse.json({ token: mockCsrfToken })
        })
      )

      // Import after environment is set to get production strategy
      const { secureTokenManager } = await import('../secure-token-manager')

      // Multiple calls should use cache
      const token1 = await secureTokenManager.getCsrfToken()
      const token2 = await secureTokenManager.getCsrfToken()
      const token3 = await secureTokenManager.getCsrfToken()

      expect(token1).toBe(mockCsrfToken)
      expect(token2).toBe(mockCsrfToken)
      expect(token3).toBe(mockCsrfToken)
      // All tokens should be the same (from cache)
      expect(token1).toBe(token2)
      expect(token2).toBe(token3)
      // Should only make one request due to caching
      expect(csrfRequestCount).toBe(1)
    })
  })

  describe('isUsingSecureCookies', () => {
    it('should return true in production', async () => {
      // Clear module cache to ensure fresh import
      vi.resetModules()
      vi.stubEnv('NODE_ENV', 'production')
      const { secureTokenManager } = await import('../secure-token-manager')
      expect(secureTokenManager.isUsingSecureCookies()).toBe(true)
    })

    it('should return false in development', async () => {
      // Clear module cache to ensure fresh import
      vi.resetModules()
      vi.stubEnv('NODE_ENV', 'development')
      const { secureTokenManager } = await import('../secure-token-manager')
      expect(secureTokenManager.isUsingSecureCookies()).toBe(false)
    })
  })

  describe('Environment-based behavior', () => {
    it('should use different strategies based on environment', async () => {
      // Test production behavior with mocked API
      const mockApi = {
        get: vi.fn().mockImplementation(url => {
          if (url === '/auth/status') {
            return Promise.resolve({ data: { authenticated: true } })
          }
          return Promise.resolve({ data: {} })
        }),
      }
      vi.doMock('@/shared/lib/http-client', () => ({ api: mockApi }))

      // Clear module cache and set production env
      vi.resetModules()
      vi.stubEnv('NODE_ENV', 'production')
      const { secureTokenManager: prodManager } = await import('../secure-token-manager')
      const prodHasTokens = await prodManager.hasTokens()
      expect(prodHasTokens).toBe(true) // Mock server returns authenticated: true

      vi.doUnmock('@/shared/lib/http-client')

      // Test development behavior
      vi.resetModules()
      vi.stubEnv('NODE_ENV', 'development')

      // Mock localStorage for development
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      })

      const { secureTokenManager: devManager } = await import('../secure-token-manager')
      const devHasTokens = await devManager.hasTokens()
      expect(devHasTokens).toBe(false) // No tokens in localStorage
    })
  })
})
