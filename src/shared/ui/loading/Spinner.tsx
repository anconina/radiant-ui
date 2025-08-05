import { Loader2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
}

interface SpinnerOverlayProps {
  show?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function SpinnerOverlay({ show = true, className, size = 'lg' }: SpinnerOverlayProps) {
  if (!show) return null

  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <Spinner size={size} />
    </div>
  )
}
