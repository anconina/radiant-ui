import { useEffect, useState } from 'react'

import {
  Activity,
  Calendar,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  ShoppingCart,
  Users,
} from 'lucide-react'

import {
  ActivityChart,
  RecentSales,
  RevenueChart,
  StatCard,
  TopProducts,
} from '@/widgets/dashboard'

import { DashboardErrorBoundary, useDashboardData } from '@/features/dashboard'

import { useTranslation } from '@/shared/lib/i18n'
import { cn } from '@/shared/lib/utils'
import { useTheme } from '@/shared/providers'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

function DashboardPageContent() {
  const { t } = useTranslation('dashboard')
  const { theme } = useTheme()
  const { data, loading, error, refetch, exportData, exporting } = useDashboardData()
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  // Pull-to-refresh functionality for mobile
  useEffect(() => {
    let startY = 0
    let pulling = false

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        pulling = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling) return

      const currentY = e.touches[0].clientY
      const pullDistance = currentY - startY

      if (pullDistance > 100 && !refreshing) {
        setRefreshing(true)
        handleRefresh()
      }
    }

    const handleTouchEnd = () => {
      pulling = false
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [refreshing])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-destructive mb-4">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load dashboard data</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="me-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6" data-testid="dashboard-content">
      {/* Header with mobile-optimized layout */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title', 'Dashboard')}</h2>
          <p className="text-muted-foreground">{t('subtitle', 'Your business at a glance')}</p>
        </div>

        {/* Action buttons - stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={cn('me-2 h-4 w-4', refreshing && 'animate-spin')} />
            {t('refresh', 'Refresh')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Calendar className="me-2 h-4 w-4" />
                {selectedPeriod === 'day'
                  ? t('today')
                  : selectedPeriod === 'week'
                    ? t('thisWeek')
                    : t('thisMonth')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedPeriod('day')}>
                {t('today', 'Today')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod('week')}>
                {t('thisWeek', 'This Week')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPeriod('month')}>
                {t('thisMonth', 'This Month')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto" disabled={exporting}>
                <Download className="me-2 h-4 w-4" />
                {exporting ? t('exporting', 'Exporting...') : t('download', 'Download')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportData('csv')}>
                {t('downloadCsv', 'Download as CSV')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('json')}>
                {t('downloadJson', 'Download as JSON')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('pdf')}>
                {t('downloadPdf', 'Download as PDF')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Period selector tabs */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="day">{t('today')}</TabsTrigger>
          <TabsTrigger value="week">{t('thisWeek')}</TabsTrigger>
          <TabsTrigger value="month">{t('thisMonth')}</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-4">
          {/* Stats Grid - Responsive with touch-friendly cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t('totalRevenue', 'Total Revenue')}
              value={data?.stats.revenue || '$0'}
              change="+20.1%"
              changeType="increase"
              icon={DollarSign}
              loading={loading}
            />
            <StatCard
              title={t('totalUsers', 'Total Users')}
              value={data?.stats.users || '0'}
              change="+15.2%"
              changeType="increase"
              icon={Users}
              loading={loading}
            />
            <StatCard
              title={t('totalOrders', 'Total Orders')}
              value={data?.stats.orders || '0'}
              change="-5.4%"
              changeType="decrease"
              icon={ShoppingCart}
              loading={loading}
            />
            <StatCard
              title={t('activeNow', 'Active Now')}
              value={data?.stats.activeUsers || '0'}
              change="+8.2%"
              changeType="increase"
              icon={Activity}
              loading={loading}
            />
          </div>

          {/* Charts Section - Stack on mobile */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>{t('revenue', 'Revenue')}</CardTitle>
                <CardDescription>
                  {t('revenueDescription', 'Your revenue over time')}
                </CardDescription>
              </CardHeader>
              <CardContent className="ps-2">
                {loading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <RevenueChart data={data?.revenueData || []} />
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>{t('activity', 'Activity')}</CardTitle>
                <CardDescription>
                  {t('activityDescription', 'User activity breakdown')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <ActivityChart data={data?.activityData || []} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader className="flex flex-row items-center">
                <div className="ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto">
                  <CardTitle>{t('recentSales', 'Recent Sales')}</CardTitle>
                  <CardDescription>
                    {t('recentSalesDescription', 'You made 265 sales this month')}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <RecentSales sales={data?.recentSales || []} />
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-3">
              <CardHeader className="flex flex-row items-center">
                <div className="ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto">
                  <CardTitle>{t('topProducts', 'Top Products')}</CardTitle>
                  <CardDescription>
                    {t('topProductsDescription', 'Best performing products')}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto"
                >
                  Live
                </Badge>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <TopProducts products={data?.topProducts || []} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function DashboardPage() {
  const { refetch } = useDashboardData()

  return (
    <DashboardErrorBoundary onDataRefresh={refetch}>
      <DashboardPageContent />
    </DashboardErrorBoundary>
  )
}
