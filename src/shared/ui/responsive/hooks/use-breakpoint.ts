import * as React from 'react'

/**
 * Breakpoints matching Tailwind CSS defaults
 * sm: 640px
 * md: 768px
 * lg: 1024px
 * xl: 1280px
 * 2xl: 1536px
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Hook that returns current breakpoint information
 * @returns Object with breakpoint utilities
 */
export function useBreakpoint() {
  const [windowWidth, setWindowWidth] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth
    }
    return 0
  })

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const breakpoint = React.useMemo((): Breakpoint | 'xs' => {
    if (windowWidth >= BREAKPOINTS['2xl']) return '2xl'
    if (windowWidth >= BREAKPOINTS.xl) return 'xl'
    if (windowWidth >= BREAKPOINTS.lg) return 'lg'
    if (windowWidth >= BREAKPOINTS.md) return 'md'
    if (windowWidth >= BREAKPOINTS.sm) return 'sm'
    return 'xs'
  }, [windowWidth])

  const isAbove = React.useCallback(
    (bp: Breakpoint): boolean => {
      return windowWidth >= BREAKPOINTS[bp]
    },
    [windowWidth]
  )

  const isBelow = React.useCallback(
    (bp: Breakpoint): boolean => {
      return windowWidth < BREAKPOINTS[bp]
    },
    [windowWidth]
  )

  const isBetween = React.useCallback(
    (min: Breakpoint | 'xs', max: Breakpoint): boolean => {
      const minWidth = min === 'xs' ? 0 : BREAKPOINTS[min]
      const maxWidth = BREAKPOINTS[max]
      return windowWidth >= minWidth && windowWidth < maxWidth
    },
    [windowWidth]
  )

  const isExactly = React.useCallback(
    (bp: Breakpoint | 'xs'): boolean => {
      if (bp === 'xs') {
        return windowWidth < BREAKPOINTS.sm
      }

      const breakpointKeys = Object.keys(BREAKPOINTS) as Breakpoint[]
      const currentIndex = breakpointKeys.indexOf(bp)

      if (currentIndex === breakpointKeys.length - 1) {
        return windowWidth >= BREAKPOINTS[bp]
      }

      const nextBreakpoint = breakpointKeys[currentIndex + 1]
      return windowWidth >= BREAKPOINTS[bp] && windowWidth < BREAKPOINTS[nextBreakpoint]
    },
    [windowWidth]
  )

  return {
    /** Current window width */
    width: windowWidth,
    /** Current breakpoint */
    breakpoint,
    /** Check if viewport is above or equal to a breakpoint */
    isAbove,
    /** Check if viewport is below a breakpoint */
    isBelow,
    /** Check if viewport is between two breakpoints */
    isBetween,
    /** Check if viewport is exactly at a breakpoint */
    isExactly,
    /** Convenience methods */
    isMobile: windowWidth < BREAKPOINTS.md,
    isTablet: windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg,
    isDesktop: windowWidth >= BREAKPOINTS.lg,
    isWide: windowWidth >= BREAKPOINTS.xl,
    /** Raw breakpoint values */
    breakpoints: BREAKPOINTS,
  }
}

/**
 * Hook that executes a callback when breakpoint changes
 * @param callback Function to execute when breakpoint changes
 * @param deps Optional dependency array
 */
export function useBreakpointEffect(
  callback: (breakpoint: Breakpoint | 'xs') => void,
  deps: React.DependencyList = []
) {
  const { breakpoint } = useBreakpoint()

  React.useEffect(() => {
    callback(breakpoint)
  }, [breakpoint, ...deps])
}

/**
 * Hook that returns a value based on current breakpoint
 * @param values Object with breakpoint keys and values
 * @param defaultValue Default value if no breakpoint matches
 */
export function useBreakpointValue<T>(
  values: Partial<Record<Breakpoint | 'xs', T>>,
  defaultValue: T
): T {
  const { breakpoint } = useBreakpoint()

  return React.useMemo(() => {
    // Try exact match first
    if (values[breakpoint] !== undefined) {
      return values[breakpoint]
    }

    // Fall back to smaller breakpoints
    const breakpointOrder: (Breakpoint | 'xs')[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
    const currentIndex = breakpointOrder.indexOf(breakpoint)

    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i]
      if (values[bp] !== undefined) {
        return values[bp]
      }
    }

    return defaultValue
  }, [breakpoint, values, defaultValue])
}
