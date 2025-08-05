// API-related type definitions

export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  withCredentials?: boolean
  signal?: AbortSignal
}

export interface ApiRequestOptions extends RequestConfig {
  skipAuth?: boolean
  retry?: number
  retryDelay?: number
}

export interface ApiErrorResponse {
  error: {
    message: string
    code?: string
    statusCode: number
    timestamp: string
    path?: string
    details?: Record<string, any>
  }
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Generic CRUD operation types
export interface CreateRequest<T> {
  data: T
}

export interface UpdateRequest<T> {
  id: string | number
  data: Partial<T>
}

export interface DeleteRequest {
  id: string | number
}

export interface GetByIdRequest {
  id: string | number
}

export interface ListRequest {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

// File upload types
export interface FileUploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface FileUploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}
