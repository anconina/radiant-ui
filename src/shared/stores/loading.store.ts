import { create } from 'zustand'

interface LoadingItem {
  id: string
  message?: string
  progress?: number
  type: 'spinner' | 'progress' | 'skeleton'
}

interface LoadingState {
  // Loading items by key
  items: Map<string, LoadingItem>

  // Global loading state
  isGlobalLoading: boolean
  globalMessage?: string

  // Actions
  startLoading: (key: string, options?: Partial<LoadingItem>) => void
  updateProgress: (key: string, progress: number, message?: string) => void
  stopLoading: (key: string) => void
  setGlobalLoading: (loading: boolean, message?: string) => void
  clearAll: () => void

  // Computed
  isLoading: (key?: string) => boolean
  getProgress: (key: string) => number | undefined
  getMessage: (key: string) => string | undefined
  getActiveLoadings: () => LoadingItem[]
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  items: new Map(),
  isGlobalLoading: false,
  globalMessage: undefined,

  startLoading: (key, options = {}) => {
    set(state => {
      const newItems = new Map(state.items)
      newItems.set(key, {
        id: key,
        type: 'spinner',
        ...options,
      })
      return { items: newItems }
    })
  },

  updateProgress: (key, progress, message) => {
    set(state => {
      const newItems = new Map(state.items)
      const existing = newItems.get(key)
      if (existing) {
        newItems.set(key, {
          ...existing,
          progress,
          ...(message !== undefined && { message }),
        })
      }
      return { items: newItems }
    })
  },

  stopLoading: key => {
    set(state => {
      const newItems = new Map(state.items)
      newItems.delete(key)
      return { items: newItems }
    })
  },

  setGlobalLoading: (loading, message) => {
    set({
      isGlobalLoading: loading,
      globalMessage: message,
    })
  },

  clearAll: () => {
    set({
      items: new Map(),
      isGlobalLoading: false,
      globalMessage: undefined,
    })
  },

  isLoading: key => {
    const state = get()
    if (!key) {
      return state.isGlobalLoading || state.items.size > 0
    }
    return state.items.has(key)
  },

  getProgress: key => {
    return get().items.get(key)?.progress
  },

  getMessage: key => {
    return get().items.get(key)?.message
  },

  getActiveLoadings: () => {
    return Array.from(get().items.values())
  },
}))

// Convenience hooks
export function useLoading(key?: string) {
  const store = useLoadingStore()

  if (!key) {
    return {
      isLoading: store.isGlobalLoading || store.items.size > 0,
      message: store.globalMessage,
      setLoading: (loading: boolean, message?: string) => store.setGlobalLoading(loading, message),
    }
  }

  return {
    isLoading: store.isLoading(key),
    progress: store.getProgress(key),
    message: store.getMessage(key),
    start: (options?: Partial<LoadingItem>) => store.startLoading(key, options),
    updateProgress: (progress: number, message?: string) =>
      store.updateProgress(key, progress, message),
    stop: () => store.stopLoading(key),
  }
}

// Hook for managing multiple loading states
export function useMultipleLoadings(keys: string[]) {
  const store = useLoadingStore()

  const loadingStates = keys.reduce(
    (acc, key) => {
      acc[key] = {
        isLoading: store.isLoading(key),
        progress: store.getProgress(key),
        message: store.getMessage(key),
      }
      return acc
    },
    {} as Record<string, { isLoading: boolean; progress?: number; message?: string }>
  )

  const isAnyLoading = keys.some(key => store.isLoading(key))
  const allLoaded = keys.every(key => !store.isLoading(key))

  return {
    states: loadingStates,
    isAnyLoading,
    allLoaded,
    startAll: (options?: Partial<LoadingItem>) => {
      keys.forEach(key => store.startLoading(key, options))
    },
    stopAll: () => {
      keys.forEach(key => store.stopLoading(key))
    },
  }
}

// Hook for global loading state
export function useGlobalLoading() {
  const store = useLoadingStore()

  return {
    isLoading: store.isGlobalLoading,
    message: store.globalMessage,
    showLoading: (message?: string) => store.setGlobalLoading(true, message),
    hideLoading: () => store.setGlobalLoading(false),
  }
}

// Hook for async operations with loading state
export function useAsyncLoading<T>(
  key: string,
  asyncFn: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    showProgress?: boolean
  }
) {
  const loading = useLoading(key)

  const execute = async () => {
    try {
      loading.start({
        type: options?.showProgress ? 'progress' : 'spinner',
      })

      const result = await asyncFn()

      options?.onSuccess?.(result)
      return result
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    } finally {
      loading.stop()
    }
  }

  return {
    ...loading,
    execute,
  }
}
