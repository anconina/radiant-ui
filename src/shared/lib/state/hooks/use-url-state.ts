import { useCallback, useEffect, useState } from 'react'

import { useSearchParams } from 'react-router-dom'

interface UseUrlStateOptions {
  debounceMs?: number
  removeEmpty?: boolean
  serialize?: (value: any) => string
  deserialize?: (value: string) => any
}

export function useUrlState<T>(
  key: string,
  defaultValue: T,
  options: UseUrlStateOptions = {}
): [T, (value: T) => void] {
  const {
    debounceMs = 0,
    removeEmpty = true,
    serialize = v => String(v),
    deserialize = v => v as T,
  } = options

  const [searchParams, setSearchParams] = useSearchParams()
  const [debouncedValue, setDebouncedValue] = useState<T | null>(null)

  // Get current value from URL or use default
  const value = searchParams.has(key) ? deserialize(searchParams.get(key)!) : defaultValue

  // Set value in URL
  const setValue = useCallback(
    (newValue: T) => {
      if (debounceMs > 0) {
        setDebouncedValue(newValue)
      } else {
        const newParams = new URLSearchParams(searchParams)

        if ((removeEmpty && !newValue) || newValue === defaultValue) {
          newParams.delete(key)
        } else {
          newParams.set(key, serialize(newValue))
        }

        setSearchParams(newParams)
      }
    },
    [key, searchParams, setSearchParams, debounceMs, removeEmpty, serialize, defaultValue]
  )

  // Handle debounced updates
  useEffect(() => {
    if (debouncedValue === null || debounceMs === 0) return

    const timeout = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams)

      if ((removeEmpty && !debouncedValue) || debouncedValue === defaultValue) {
        newParams.delete(key)
      } else {
        newParams.set(key, serialize(debouncedValue))
      }

      setSearchParams(newParams)
      setDebouncedValue(null)
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [
    debouncedValue,
    debounceMs,
    key,
    searchParams,
    setSearchParams,
    removeEmpty,
    serialize,
    defaultValue,
  ])

  return [value, setValue]
}

// Specialized hooks for common types
export function useUrlString(
  key: string,
  defaultValue = '',
  options?: Omit<UseUrlStateOptions, 'serialize' | 'deserialize'>
) {
  return useUrlState(key, defaultValue, options)
}

export function useUrlNumber(
  key: string,
  defaultValue = 0,
  options?: Omit<UseUrlStateOptions, 'serialize' | 'deserialize'>
) {
  return useUrlState(key, defaultValue, {
    ...options,
    serialize: v => String(v),
    deserialize: v => Number(v) || defaultValue,
  })
}

export function useUrlBoolean(
  key: string,
  defaultValue = false,
  options?: Omit<UseUrlStateOptions, 'serialize' | 'deserialize'>
) {
  return useUrlState(key, defaultValue, {
    ...options,
    serialize: v => (v ? 'true' : 'false'),
    deserialize: v => v === 'true',
  })
}

export function useUrlArray<T = string>(
  key: string,
  defaultValue: T[],
  options?: Omit<UseUrlStateOptions, 'serialize' | 'deserialize'> & {
    separator?: string
    itemSerialize?: (item: T) => string
    itemDeserialize?: (item: string) => T
  }
) {
  const {
    separator = ',',
    itemSerialize = v => String(v),
    itemDeserialize = v => v as T,
    ...restOptions
  } = options || {}

  return useUrlState(key, defaultValue, {
    ...restOptions,
    serialize: v => v.map(itemSerialize).join(separator),
    deserialize: v => (v ? v.split(separator).map(itemDeserialize) : defaultValue),
  })
}

export function useUrlObject<T extends Record<string, any>>(
  key: string,
  defaultValue: T,
  options?: Omit<UseUrlStateOptions, 'serialize' | 'deserialize'>
) {
  return useUrlState(key, defaultValue, {
    ...options,
    serialize: v => JSON.stringify(v),
    deserialize: v => {
      try {
        return JSON.parse(v)
      } catch {
        return defaultValue
      }
    },
  })
}
