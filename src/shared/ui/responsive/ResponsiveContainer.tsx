import { CSSProperties, ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

import { useContainerQuery } from './hooks/use-container-query'

interface ResponsiveContainerProps {
  children: ReactNode | ((dimensions: ContainerState) => ReactNode)
  className?: string
  style?: CSSProperties
  breakpoints?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

interface ContainerState {
  width: number
  height: number
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  orientation: 'portrait' | 'landscape'
  aspectRatio: number
}

const defaultBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
}

export function ResponsiveContainer({
  children,
  className,
  style,
  breakpoints = defaultBreakpoints,
}: ResponsiveContainerProps) {
  const [ref, , dimensions] = useContainerQuery()

  const getSize = (width: number): ContainerState['size'] => {
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  }

  const containerState: ContainerState | null = dimensions
    ? {
        width: dimensions.width,
        height: dimensions.height,
        size: getSize(dimensions.width),
        orientation: dimensions.orientation,
        aspectRatio: dimensions.aspectRatio,
      }
    : null

  const containerClasses = cn(
    'responsive-container',
    containerState && {
      'container-xs': containerState.size === 'xs',
      'container-sm': containerState.size === 'sm',
      'container-md': containerState.size === 'md',
      'container-lg': containerState.size === 'lg',
      'container-xl': containerState.size === 'xl',
      'container-portrait': containerState.orientation === 'portrait',
      'container-landscape': containerState.orientation === 'landscape',
    },
    className
  )

  return (
    <div ref={ref} className={containerClasses} style={style}>
      {typeof children === 'function'
        ? containerState
          ? children(containerState)
          : null
        : children}
    </div>
  )
}

// Specialized responsive containers
interface GridContainerProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  cols?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number | string
}

export function ResponsiveGrid({
  children,
  className,
  style,
  cols = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = '1rem',
}: GridContainerProps) {
  const [ref, , dimensions] = useContainerQuery()

  const getColumns = (width: number): number => {
    if (width >= 1280 && cols.xl) return cols.xl
    if (width >= 1024 && cols.lg) return cols.lg
    if (width >= 768 && cols.md) return cols.md
    if (width >= 640 && cols.sm) return cols.sm
    return cols.base || 1
  }

  const columns = dimensions ? getColumns(dimensions.width) : cols.base || 1

  return (
    <div
      ref={ref}
      className={cn('grid', className)}
      style={{
        ...style,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  )
}

// Aspect ratio container
interface AspectRatioContainerProps {
  children: ReactNode
  ratio: string | number // e.g., "16/9" or 1.77
  className?: string
  style?: CSSProperties
}

export function AspectRatioContainer({
  children,
  ratio,
  className,
  style,
}: AspectRatioContainerProps) {
  const paddingBottom =
    typeof ratio === 'string'
      ? (() => {
          const [width, height] = ratio.split('/').map(Number)
          return `${(height / width) * 100}%`
        })()
      : `${(1 / ratio) * 100}%`

  return (
    <div className={cn('relative w-full', className)} style={style}>
      <div style={{ paddingBottom }} />
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}
