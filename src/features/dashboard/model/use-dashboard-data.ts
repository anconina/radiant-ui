import { useMutation, useQuery } from '@tanstack/react-query'

import { api } from '@/shared/lib/http-client'
import { toast } from '@/shared/lib/toast'

export interface DashboardStats {
  revenue: string
  users: number
  orders: number
  activeUsers: number
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export interface ActivityData {
  name: string
  total: number
}

export interface Sale {
  id: string
  customer: {
    name: string
    email: string
    avatar?: string
  }
  amount: string
  status: 'completed' | 'pending' | 'failed'
  date: string
}

export interface Product {
  id: string
  name: string
  sales: number
  revenue: string
  growth: number
}

export interface DashboardData {
  stats: DashboardStats
  revenueData: RevenueData[]
  activityData: ActivityData[]
  recentSales: Sale[]
  topProducts: Product[]
}

async function fetchDashboardData(): Promise<DashboardData> {
  try {
    console.log('🔍 Fetching dashboard data from /dashboard')
    const response = await api.get<DashboardData>('/dashboard')
    console.log('📊 Dashboard API response:', response)

    if (!response) {
      console.error('❌ Dashboard response is null/undefined')
      throw new Error('Dashboard data is null or undefined')
    }

    return response
  } catch (error) {
    console.error('❌ Dashboard fetch error:', error)
    throw error
  }
}

async function exportDashboardData(format: 'csv' | 'json' | 'pdf') {
  const response = await api.post('/dashboard/export', { format })

  if (format === 'csv') {
    // Create a blob and download for CSV
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } else if (format === 'pdf' && response.data.downloadUrl) {
    // For PDF, open the download URL
    window.open(response.data.downloadUrl, '_blank')
  }

  return response.data
}

export function useDashboardData() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })

  const exportMutation = useMutation({
    mutationFn: exportDashboardData,
    onSuccess: (_, format) => {
      toast.success(`Dashboard exported as ${format.toUpperCase()}`)
    },
    onError: () => {
      toast.error('Failed to export dashboard data')
    },
  })

  return {
    data,
    loading: isLoading,
    error,
    refetch,
    exportData: exportMutation.mutate,
    exporting: exportMutation.isPending,
  }
}
