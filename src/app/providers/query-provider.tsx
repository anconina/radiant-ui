import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { config } from '@/shared/lib/environment'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long until a query is considered stale
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Cache time: how long unused data stays in cache
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Network mode
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry configuration for mutations
      retry: false,
      networkMode: 'offlineFirst',
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {config.development.devTools && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  )
}
