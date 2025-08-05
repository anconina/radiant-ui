import { ReactNode } from 'react'

import { AlertCircle } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import { Spinner } from './Spinner'

interface LoadingStateProps {
  children?: ReactNode
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  error?: Error | null
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  emptyComponent?: ReactNode
  className?: string
}

export function LoadingState({
  children,
  isLoading = false,
  isError = false,
  isEmpty = false,
  error = null,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className,
}: LoadingStateProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[200px]', className)}>
        {loadingComponent || <Spinner size="lg" />}
      </div>
    )
  }

  // Error state
  if (isError || error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-[200px] text-center',
          className
        )}
      >
        {errorComponent || (
          <>
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground">
              {error?.message || 'An unexpected error occurred'}
            </p>
          </>
        )}
      </div>
    )
  }

  // Empty state
  if (isEmpty) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-[200px] text-center',
          className
        )}
      >
        {emptyComponent || (
          <>
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No data found</h3>
            <p className="text-muted-foreground">There's nothing to display here yet</p>
          </>
        )}
      </div>
    )
  }

  // Success state - render children
  return <>{children}</>
}

// Specialized loading state for lists
interface LoadingListProps {
  items: any[]
  isLoading?: boolean
  isError?: boolean
  error?: Error | null
  renderItem: (item: any, index: number) => ReactNode
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  emptyComponent?: ReactNode
  className?: string
}

export function LoadingList({
  items,
  isLoading = false,
  isError = false,
  error = null,
  renderItem,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className,
}: LoadingListProps) {
  return (
    <LoadingState
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && items.length === 0}
      error={error}
      loadingComponent={loadingComponent}
      errorComponent={errorComponent}
      emptyComponent={emptyComponent}
      className={className}
    >
      <div className={className}>{items.map((item, index) => renderItem(item, index))}</div>
    </LoadingState>
  )
}
