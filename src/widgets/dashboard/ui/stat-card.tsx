import { TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useIsMobile } from '@/shared/ui/responsive'
import { Skeleton } from '@/shared/ui/skeleton'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease'
  icon: React.ElementType
  loading?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  loading,
  className,
}: StatCardProps) {
  const isMobile = useIsMobile()

  if (loading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Skeleton className="h-4 w-24 ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto" />
          <Skeleton
            className="h-8 w-8 rounded-full ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto"
            data-slot="card-action"
          />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-lg',
        'active:scale-[0.98] cursor-pointer',
        isMobile && 'card-mobile ripple',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <CardTitle className="text-sm font-medium ltr:order-1 rtl:order-2 ltr:mr-auto rtl:ml-auto ltr:text-left rtl:text-right">
          {title}
        </CardTitle>
        <div
          className={cn(
            'h-8 w-8 rounded-full flex items-center justify-center',
            'bg-primary/10 text-primary ltr:order-2 rtl:order-1 ltr:ml-auto rtl:mr-auto'
          )}
          data-slot="card-action"
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-left">{value}</div>
        {change && (
          <div className="flex items-center text-xs mt-2 ltr:flex-row rtl:flex-row-reverse">
            {changeType === 'increase' ? (
              <TrendingUp className="ltr:mr-1 rtl:ml-1 h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="ltr:mr-1 rtl:ml-1 h-3 w-3 text-red-600 dark:text-red-400" />
            )}
            <span
              className={cn(
                'font-medium',
                changeType === 'increase'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {change}
            </span>
            <span className="text-muted-foreground ltr:ml-1 rtl:mr-1">vs last month</span>
          </div>
        )}
      </CardContent>
      {/* Beautiful gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none" />
    </Card>
  )
}
