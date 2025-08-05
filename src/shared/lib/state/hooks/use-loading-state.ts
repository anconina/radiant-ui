import { useCallback, useState } from 'react'

interface LoadingState<T = any> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  isSuccess: boolean
  isEmpty: boolean
}

interface UseLoadingStateOptions<T = any> {
  initialData?: T | null
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useLoadingState<T = any>(options: UseLoadingStateOptions<T> = {}) {
  const { initialData = null, onSuccess, onError } = options

  const [state, setState] = useState<LoadingState<T>>({
    data: initialData,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
    isEmpty: initialData === null || (Array.isArray(initialData) && initialData.length === 0),
  })

  const setLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
    }))
  }, [])

  const setSuccess = useCallback(
    (data: T) => {
      setState({
        data,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        isEmpty: data === null || (Array.isArray(data) && data.length === 0),
      })
      onSuccess?.(data)
    },
    [onSuccess]
  )

  const setError = useCallback(
    (error: Error) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error,
        isSuccess: false,
      }))
      onError?.(error)
    },
    [onError]
  )

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
      isEmpty: initialData === null || (Array.isArray(initialData) && initialData.length === 0),
    })
  }, [initialData])

  const execute = useCallback(
    async (promise: Promise<T>) => {
      setLoading()
      try {
        const result = await promise
        setSuccess(result)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An error occurred')
        setError(err)
        throw err
      }
    },
    [setLoading, setSuccess, setError]
  )

  return {
    ...state,
    setLoading,
    setSuccess,
    setError,
    reset,
    execute,
  }
}

// Hook for managing multiple loading states
export function useMultiLoadingState<T extends Record<string, any>>() {
  const [states, setStates] = useState<Record<string, LoadingState>>({})

  const getState = useCallback(
    (key: string): LoadingState => {
      return (
        states[key] || {
          data: null,
          isLoading: false,
          isError: false,
          error: null,
          isSuccess: false,
          isEmpty: true,
        }
      )
    },
    [states]
  )

  const setLoading = useCallback(
    (key: string) => {
      setStates(prev => ({
        ...prev,
        [key]: {
          ...getState(key),
          isLoading: true,
          isError: false,
          error: null,
          isSuccess: false,
        },
      }))
    },
    [getState]
  )

  const setSuccess = useCallback((key: string, data: any) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        data,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        isEmpty: data === null || (Array.isArray(data) && data.length === 0),
      },
    }))
  }, [])

  const setError = useCallback(
    (key: string, error: Error) => {
      setStates(prev => ({
        ...prev,
        [key]: {
          ...getState(key),
          isLoading: false,
          isError: true,
          error,
          isSuccess: false,
        },
      }))
    },
    [getState]
  )

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => {
        const newStates = { ...prev }
        delete newStates[key]
        return newStates
      })
    } else {
      setStates({})
    }
  }, [])

  return {
    states,
    getState,
    setLoading,
    setSuccess,
    setError,
    reset,
  }
}
