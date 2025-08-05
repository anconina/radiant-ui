import * as React from 'react'

import { Loader2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface LoadingOverlayProps {
  /** Whether the loading overlay is visible */
  isLoading?: boolean
  /** Loading message to display */
  message?: string
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to blur the background content */
  blur?: boolean
  /** Whether to make the overlay fullscreen */
  fullscreen?: boolean
  /** Custom spinner component */
  spinner?: React.ReactNode
  /** Additional className */
  className?: string
  /** Children to render behind the overlay */
  children?: React.ReactNode
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function LoadingOverlay({
  isLoading = true,
  message,
  size = 'md',
  blur = true,
  fullscreen = false,
  spinner,
  className,
  children,
}: LoadingOverlayProps) {
  if (!isLoading && !children) {
    return null
  }

  const overlayContent = (
    <div
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center',
        'bg-background/80 backdrop-blur-sm',
        'transition-opacity duration-200',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none',
        !blur && 'backdrop-blur-none',
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {spinner || <Loader2 className={cn('animate-spin text-primary', spinnerSizes[size])} />}
        {message && <p className="text-sm text-muted-foreground animate-pulse">{message}</p>}
      </div>
    </div>
  )

  if (fullscreen && isLoading) {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            {spinner || <Loader2 className={cn('animate-spin text-primary', spinnerSizes[size])} />}
            {message && <p className="text-sm text-muted-foreground animate-pulse">{message}</p>}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="relative">
      {children}
      {overlayContent}
    </div>
  )
}

/**
 * Hook to manage loading overlay state
 */
export function useLoadingOverlay(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [message, setMessage] = React.useState<string>()

  const show = React.useCallback((msg?: string) => {
    setMessage(msg)
    setIsLoading(true)
  }, [])

  const hide = React.useCallback(() => {
    setIsLoading(false)
    // Clear message after animation completes
    setTimeout(() => setMessage(undefined), 200)
  }, [])

  const updateMessage = React.useCallback((msg: string) => {
    setMessage(msg)
  }, [])

  return {
    isLoading,
    message,
    show,
    hide,
    updateMessage,
  }
}
