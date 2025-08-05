import * as React from 'react'

import { cn } from '@/shared/lib/utils'

import { useBreakpointValue } from './responsive/hooks/use-breakpoint'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  /** Maximum width constraints for different breakpoints */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'
  /** Padding for different breakpoints */
  padding?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
  /** Whether to center the container */
  center?: boolean
  /** Custom styles for different breakpoints */
  responsive?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
  none: '',
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = {
    xs: 'px-4',
    sm: 'px-6',
    md: 'px-8',
    lg: 'px-12',
    xl: 'px-16',
    '2xl': 'px-20',
  },
  center = true,
  responsive = {},
}: ResponsiveContainerProps) {
  const paddingClass = useBreakpointValue(padding, 'px-4')
  const responsiveClass = useBreakpointValue(responsive, '')

  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        center && 'mx-auto',
        paddingClass,
        responsiveClass,
        className
      )}
    >
      {children}
    </div>
  )
}
