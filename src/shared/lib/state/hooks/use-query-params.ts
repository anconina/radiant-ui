import { useCallback, useMemo } from 'react'

import { useSearchParams } from 'react-router-dom'

interface QueryParamOptions {
  removeEmpty?: boolean
  debounceMs?: number
}

export function useQueryParams<T extends Record<string, any>>() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse query params to object
  const params = useMemo(() => {
    const result: Record<string, any> = {}
    searchParams.forEach((value, key) => {
      // Handle array values (e.g., ?filter=a&filter=b)
      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [result[key], value]
        }
      } else {
        result[key] = value
      }
    })
    return result as T
  }, [searchParams])

  // Set single param
  const setParam = useCallback(
    (key: string, value: any, options?: QueryParamOptions) => {
      const newParams = new URLSearchParams(searchParams)

      if (value === null || value === undefined || (options?.removeEmpty && !value)) {
        newParams.delete(key)
      } else if (Array.isArray(value)) {
        // Remove existing values for this key
        newParams.delete(key)
        // Add all array values
        value.forEach(v => newParams.append(key, String(v)))
      } else {
        newParams.set(key, String(value))
      }

      setSearchParams(newParams)
    },
    [searchParams, setSearchParams]
  )

  // Set multiple params at once
  const setParams = useCallback(
    (params: Partial<T>, options?: QueryParamOptions) => {
      const newParams = new URLSearchParams(searchParams)

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || (options?.removeEmpty && !value)) {
          newParams.delete(key)
        } else if (Array.isArray(value)) {
          newParams.delete(key)
          value.forEach(v => newParams.append(key, String(v)))
        } else {
          newParams.set(key, String(value))
        }
      })

      setSearchParams(newParams)
    },
    [searchParams, setSearchParams]
  )

  // Remove param
  const removeParam = useCallback(
    (key: string) => {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete(key)
      setSearchParams(newParams)
    },
    [searchParams, setSearchParams]
  )

  // Clear all params
  const clearParams = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  // Get single param with type safety
  const getParam = useCallback(
    <K extends keyof T>(key: K): T[K] | undefined => {
      const value = searchParams.get(String(key))
      return value as T[K] | undefined
    },
    [searchParams]
  )

  // Check if param exists
  const hasParam = useCallback(
    (key: string): boolean => {
      return searchParams.has(key)
    },
    [searchParams]
  )

  return {
    params,
    setParam,
    setParams,
    removeParam,
    clearParams,
    getParam,
    hasParam,
    searchParams,
  }
}
