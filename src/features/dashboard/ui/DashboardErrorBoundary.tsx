import React from 'react'

import { BarChart3, RefreshCw, TrendingDown } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorBoundary } from '@/shared/ui/error-boundary'

interface DashboardErrorFallbackProps {
  onRetry: () => void
  onRefreshData: () => void
}

function DashboardErrorFallback({ onRetry, onRefreshData }: DashboardErrorFallbackProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <TrendingDown className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-xl font-bold text-destructive">Dashboard Error</CardTitle>
        <CardDescription>
          We&apos;re having trouble loading your dashboard data. This might be due to a network issue or
          a temporary problem with our servers.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRefreshData} variant="default">
            <BarChart3 className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>

          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Component
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Dashboard functionality is temporarily unavailable.</p>
          <p>Other parts of the application should continue to work normally.</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardErrorBoundaryProps {
  children: React.ReactNode
  onDataRefresh?: () => void
}

export function DashboardErrorBoundary({ children, onDataRefresh }: DashboardErrorBoundaryProps) {
  const handleRefreshData = () => {
    // Trigger data refresh if callback provided
    if (onDataRefresh) {
      onDataRefresh()
    }

    // Also reload the component
    window.location.reload()
  }

  return (
    <ErrorBoundary
      level="feature"
      featureName="Dashboard"
      fallback={
        <DashboardErrorFallback
          onRetry={() => window.location.reload()}
          onRefreshData={handleRefreshData}
        />
      }
      onError={(error, errorInfo, errorId) => {
        // Custom dashboard error handling
        console.error('Dashboard Feature Error:', { error, errorInfo, errorId })

        // Clear dashboard cache if available
        try {
          // Clear any dashboard-related cache
          const cacheKeys = Object.keys(localStorage).filter(
            key => key.includes('dashboard') || key.includes('chart') || key.includes('stats')
          )
          cacheKeys.forEach(key => localStorage.removeItem(key))
        } catch (e) {
          console.warn('Failed to clear dashboard cache:', e)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
