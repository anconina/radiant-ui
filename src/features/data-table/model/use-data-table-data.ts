import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/lib/http-client'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  lastActive: string
}

export interface DataTableData {
  users: User[]
  total: number
  page: number
  pageSize: number
}

async function fetchDataTableData(): Promise<DataTableData> {
  const response = await api.get('/users')
  return response.data
}

export function useDataTableData() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchDataTableData,
    staleTime: 30000, // Consider data stale after 30 seconds
  })

  return {
    data,
    loading: isLoading,
    error,
    refetch,
  }
}
