import * as React from 'react'

import { cn } from '@/shared/lib/utils'

interface CardProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  interactive?: boolean
  responsive?: boolean
}

function Card({
  className,
  variant = 'default',
  interactive = false,
  responsive = true,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col rounded-xl transition-all duration-200',
        // Mobile-first spacing - smaller on mobile, larger on desktop
        responsive ? 'gap-4 py-4 sm:gap-6 sm:py-6' : 'gap-6 py-6',
        // Variant styles
        variant === 'default' && 'border shadow-sm',
        variant === 'elevated' && 'shadow-md hover:shadow-lg',
        variant === 'outlined' && 'border-2',
        variant === 'ghost' && 'hover:bg-accent',
        // Interactive states optimized for touch
        interactive && [
          'cursor-pointer active:scale-[0.98] active:shadow-sm',
          'hover:shadow-md hover:border-accent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Ensure touch target size
          'min-h-[44px]',
        ],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5',
        // Mobile-first padding with CSS direction support
        'px-4 sm:px-6',
        'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        '[.border-b]:pb-4 sm:[.border-b]:pb-6',
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'leading-none font-semibold',
        // Responsive font size
        'text-lg sm:text-xl',
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start ltr:justify-self-end rtl:justify-self-start',
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        // Mobile-first padding with CSS direction support
        'px-4 sm:px-6',
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center',
        // Mobile-first padding with CSS direction support
        'px-4 sm:px-6',
        '[.border-t]:pt-4 sm:[.border-t]:pt-6',
        // Stack on mobile, inline on larger screens
        'flex-col gap-3 sm:flex-row sm:gap-4',
        className
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
