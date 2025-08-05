import { cn } from '@/shared/lib/utils'

import { Spinner } from './Spinner'

interface PageLoaderProps {
  className?: string
  fullScreen?: boolean
  text?: string
}

export function PageLoader({ className, fullScreen = false, text }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen ? 'fixed inset-0 bg-background z-50' : 'min-h-[400px]',
        className
      )}
    >
      <Spinner size="xl" />
      {text && <p className="mt-4 text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

// Progress bar loader for top of page
interface ProgressLoaderProps {
  isLoading?: boolean
  className?: string
}

export function ProgressLoader({ isLoading = true, className }: ProgressLoaderProps) {
  if (!isLoading) return null

  return (
    <div className={cn('fixed top-0 start-0 end-0 z-50 h-1', className)}>
      <div className="h-full bg-primary animate-progress" />
    </div>
  )
}
