// Common utility types used throughout the application

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type Maybe<T> = T | null | undefined

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>
    }
  : T

export type ValueOf<T> = T[keyof T]

export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export type ArrayElement<T> = T extends (infer U)[] ? U : never

export type PromiseType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface LoadingState {
  isLoading: boolean
  error: Error | null
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Sort and filter types
export type SortDirection = 'asc' | 'desc'

export interface SortParams {
  field: string
  direction: SortDirection
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[]
}

// Date range types
export interface DateRange {
  from: Date
  to: Date
}

// Response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
  timestamp: string
}

export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: Record<string, any>
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}
