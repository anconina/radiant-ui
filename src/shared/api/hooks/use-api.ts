import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { FetchError, apiClient } from '@/shared/lib/http-client/fetch-client'

// Generic query hook
export function useApiQuery<TData = unknown>(
  key: string | string[],
  url: string,
  options?: Omit<UseQueryOptions<TData, FetchError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, FetchError>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => apiClient.get<TData>(url),
    ...options,
  })
}

interface ApiMutationOptions<TData = unknown, TVariables = unknown>
  extends UseMutationOptions<TData, FetchError, TVariables> {
  invalidateKeys?: string[] | string[][]
  invalidateAll?: boolean
}

// Generic mutation hook
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: ApiMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient()

  const { invalidateKeys, invalidateAll, ...mutationOptions } = options || {}

  return useMutation<TData, FetchError, TVariables>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Invalidate specific queries or all queries based on options
      if (invalidateAll) {
        queryClient.invalidateQueries()
      } else if (invalidateKeys && invalidateKeys.length > 0) {
        invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] })
        })
      }

      mutationOptions?.onSuccess?.(data, variables, context)
    },
    ...mutationOptions,
  })
}

// Pagination hook
export function usePaginatedQuery<TData = unknown>(
  key: string | string[],
  url: string,
  page: number = 1,
  limit: number = 10,
  options?: Omit<UseQueryOptions<TData, FetchError>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(key) ? [...key, page, limit] : [key, page, limit]

  return useQuery<TData, FetchError>({
    queryKey,
    queryFn: () => apiClient.get<TData>(`${url}?page=${page}&limit=${limit}`),
    ...options,
  })
}

// Infinite query hook for infinite scrolling
export { useInfiniteQuery } from '@tanstack/react-query'

// Re-export common types
export type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
export type { ApiMutationOptions }
