import * as React from 'react'

import { cn } from '@/shared/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variant of skeleton based on content type */
  variant?: 'default' | 'text' | 'circular' | 'rectangular' | 'rounded'
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none'
  /** Width of the skeleton (can be number or string) */
  width?: number | string
  /** Height of the skeleton (can be number or string) */
  height?: number | string
}

function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }[animation]

  const variantClass = {
    default: 'rounded-md',
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }[variant]

  const dimensions = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('bg-muted', animationClass, variantClass, className)}
      style={dimensions}
      {...props}
    />
  )
}

/**
 * Skeleton component for text content
 */
function SkeletonText({
  lines = 3,
  className,
  ...props
}: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" height={16} width={i === lines - 1 ? '80%' : '100%'} />
      ))}
    </div>
  )
}

/**
 * Skeleton component for avatar/profile images
 */
function SkeletonAvatar({
  size = 40,
  className,
  ...props
}: { size?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton variant="circular" width={size} height={size} className={className} {...props} />
}

/**
 * Skeleton component for buttons
 */
function SkeletonButton({
  size = 'default',
  className,
  ...props
}: { size?: 'sm' | 'default' | 'lg' } & React.HTMLAttributes<HTMLDivElement>) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    default: 'h-10 w-28',
    lg: 'h-12 w-32',
  }

  return <Skeleton variant="rounded" className={cn(sizeClasses[size], className)} {...props} />
}

/**
 * Skeleton component for cards
 */
function SkeletonCard({
  className,
  showMedia = true,
  ...props
}: { showMedia?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {showMedia && <Skeleton variant="rounded" height={200} />}
      <div className="space-y-2 p-4">
        <Skeleton variant="text" height={24} width="60%" />
        <SkeletonText lines={2} />
      </div>
    </div>
  )
}

/**
 * Skeleton component for input fields
 */
function SkeletonInput({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton variant="rounded" height={40} className={cn('w-full', className)} {...props} />
}

/**
 * Skeleton component for badges
 */
function SkeletonBadge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton variant="rounded" height={20} width={60} className={className} {...props} />
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonInput,
  SkeletonBadge,
}
