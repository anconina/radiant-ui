'use client'

import * as React from 'react'

import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/shared/lib/utils'

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  /** Size variant of the progress bar */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  /** Whether to show the progress value label */
  showValue?: boolean
  /** Custom label text */
  label?: string
  /** Whether to animate the progress bar */
  animated?: boolean
  /** Whether to show stripes */
  striped?: boolean
}

const sizeClasses = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

const variantClasses = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
}

const variantBackgroundClasses = {
  default: 'bg-primary/20',
  success: 'bg-success/20',
  warning: 'bg-warning/20',
  destructive: 'bg-destructive/20',
  info: 'bg-info/20',
}

export function Progress({
  className,
  value = 0,
  size = 'md',
  variant = 'default',
  showValue = false,
  label,
  animated = true,
  striped = false,
  ...props
}: ProgressProps) {
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showValue && <span className="text-sm text-muted-foreground">{Math.round(value)}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          'relative w-full overflow-hidden rounded-full',
          sizeClasses[size],
          variantBackgroundClasses[variant],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            'h-full w-full flex-1',
            variantClasses[variant],
            animated && 'transition-all duration-500 ease-out',
            striped &&
              'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_1rem] animate-[progress-stripes_1s_linear_infinite]'
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}

/**
 * Progress bar component for determinate long operations
 */
export function ProgressBar({
  value = 0,
  max = 100,
  ...props
}: Omit<ProgressProps, 'value'> & { value?: number; max?: number }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  return <Progress value={percentage} {...props} />
}

/**
 * Progress bar component for indeterminate operations
 */
export function IndeterminateProgress({
  className,
  size = 'md',
  variant = 'default',
  label,
  ...props
}: Omit<ProgressProps, 'value' | 'showValue'>) {
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1">
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
      )}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full',
          sizeClasses[size],
          variantBackgroundClasses[variant],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'absolute h-full w-1/3',
            variantClasses[variant],
            'animate-[indeterminate-progress_1.5s_ease-in-out_infinite]'
          )}
        />
      </div>
    </div>
  )
}

/**
 * Multi-step progress component
 */
interface MultiStepProgressProps {
  steps: number
  currentStep: number
  labels?: string[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MultiStepProgress({
  steps,
  currentStep,
  labels,
  className,
  size = 'md',
}: MultiStepProgressProps) {
  const percentage = ((currentStep - 1) / (steps - 1)) * 100

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <Progress value={percentage} size={size} showValue={false} />
        <div className="absolute inset-0 flex items-center justify-between">
          {Array.from({ length: steps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background text-xs font-medium',
                index < currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground text-muted-foreground'
              )}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      {labels && (
        <div className="mt-2 flex justify-between">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn(
                'text-xs',
                index < currentStep ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
