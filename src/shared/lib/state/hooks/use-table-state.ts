import { useCallback, useMemo } from 'react'

import { useQueryParams } from './use-query-params'

export interface TableState {
  page: number
  pageSize: number
  sort: string | null
  order: 'asc' | 'desc'
  search: string
  filters: Record<string, any>
}

interface UseTableStateOptions {
  defaultPageSize?: number
  defaultSort?: string
  defaultOrder?: 'asc' | 'desc'
  syncToUrl?: boolean
}

export function useTableState(options: UseTableStateOptions = {}) {
  const {
    defaultPageSize = 10,
    defaultSort = null,
    defaultOrder = 'asc',
    syncToUrl = true,
  } = options

  const { params, setParams, removeParam } = useQueryParams<{
    page: string
    pageSize: string
    sort: string
    order: string
    search: string
    [key: string]: string
  }>()

  // Parse state from URL params
  const state = useMemo<TableState>(() => {
    if (!syncToUrl) {
      return {
        page: 1,
        pageSize: defaultPageSize,
        sort: defaultSort,
        order: defaultOrder,
        search: '',
        filters: {},
      }
    }

    const filters: Record<string, any> = {}
    Object.entries(params).forEach(([key, value]) => {
      if (!['page', 'pageSize', 'sort', 'order', 'search'].includes(key)) {
        filters[key] = value
      }
    })

    return {
      page: params.page ? parseInt(params.page, 10) : 1,
      pageSize: params.pageSize ? parseInt(params.pageSize, 10) : defaultPageSize,
      sort: params.sort || defaultSort,
      order: (params.order as 'asc' | 'desc') || defaultOrder,
      search: params.search || '',
      filters,
    }
  }, [params, syncToUrl, defaultPageSize, defaultSort, defaultOrder])

  // Update page
  const setPage = useCallback(
    (page: number) => {
      if (!syncToUrl) return
      setParams({ page: String(page) })
    },
    [setParams, syncToUrl]
  )

  // Update page size
  const setPageSize = useCallback(
    (pageSize: number) => {
      if (!syncToUrl) return
      setParams({ pageSize: String(pageSize), page: '1' }) // Reset to page 1
    },
    [setParams, syncToUrl]
  )

  // Update sort
  const setSort = useCallback(
    (sort: string | null, order?: 'asc' | 'desc') => {
      if (!syncToUrl) return

      const updates: Record<string, string | null> = {}

      if (sort === null) {
        removeParam('sort')
        removeParam('order')
      } else {
        updates.sort = sort
        updates.order = order || (state.sort === sort && state.order === 'asc' ? 'desc' : 'asc')
      }

      if (Object.keys(updates).length > 0) {
        setParams(updates)
      }
    },
    [setParams, removeParam, state.sort, state.order, syncToUrl]
  )

  // Update search
  const setSearch = useCallback(
    (search: string) => {
      if (!syncToUrl) return

      if (!search) {
        removeParam('search')
      } else {
        setParams({ search, page: '1' }) // Reset to page 1
      }
    },
    [setParams, removeParam, syncToUrl]
  )

  // Update single filter
  const setFilter = useCallback(
    (key: string, value: any) => {
      if (!syncToUrl) return

      if (value === null || value === undefined || value === '') {
        removeParam(key)
      } else {
        setParams({ [key]: String(value), page: '1' }) // Reset to page 1
      }
    },
    [setParams, removeParam, syncToUrl]
  )

  // Update multiple filters
  const setFilters = useCallback(
    (filters: Record<string, any>) => {
      if (!syncToUrl) return

      const updates: Record<string, string> = { page: '1' } // Reset to page 1

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          updates[key] = String(value)
        }
      })

      setParams(updates)
    },
    [setParams, syncToUrl]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    if (!syncToUrl) return

    // Keep only page, pageSize, sort, order, search
    const preserved: Record<string, string> = {}
    if (params.page) preserved.page = params.page
    if (params.pageSize) preserved.pageSize = params.pageSize
    if (params.sort) preserved.sort = params.sort
    if (params.order) preserved.order = params.order
    if (params.search) preserved.search = params.search

    setParams(preserved)
  }, [params, setParams, syncToUrl])

  // Reset all state
  const reset = useCallback(() => {
    if (!syncToUrl) return

    const defaults: Record<string, string> = {}
    if (defaultPageSize !== 10) defaults.pageSize = String(defaultPageSize)
    if (defaultSort) defaults.sort = defaultSort
    if (defaultOrder !== 'asc') defaults.order = defaultOrder

    setParams(defaults)
  }, [setParams, defaultPageSize, defaultSort, defaultOrder, syncToUrl])

  return {
    state,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setFilter,
    setFilters,
    clearFilters,
    reset,
  }
}
