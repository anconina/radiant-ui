import { useMediaQuery } from './use-media-query'

// Re-export for convenience
export { useMediaQuery }

interface ResponsiveConfig {
  breakpoints?: {
    sm?: string | number
    md?: string | number
    lg?: string | number
    xl?: string | number
    '2xl'?: string | number
  }
  defaultValue?: any
}

const defaultBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export function useResponsive<T = boolean>(
  values: {
    base?: T
    sm?: T
    md?: T
    lg?: T
    xl?: T
    '2xl'?: T
  },
  config?: ResponsiveConfig
): T {
  const breakpoints = config?.breakpoints || defaultBreakpoints

  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm})`)
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md})`)
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg})`)
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl})`)
  const is2xl = useMediaQuery(`(min-width: ${breakpoints['2xl']})`)

  // Return the value for the current breakpoint
  if (is2xl && values['2xl'] !== undefined) return values['2xl']
  if (isXl && values.xl !== undefined) return values.xl
  if (isLg && values.lg !== undefined) return values.lg
  if (isMd && values.md !== undefined) return values.md
  if (isSm && values.sm !== undefined) return values.sm

  return values.base ?? (config?.defaultValue as T)
}

// Responsive value hook for common use cases
export function useResponsiveValue<T>(base: T, sm?: T, md?: T, lg?: T, xl?: T, xxl?: T): T {
  return useResponsive({ base, sm, md, lg, xl, '2xl': xxl })
}

// Responsive breakpoint detection
export function useCurrentBreakpoint() {
  const is2xl = useMediaQuery(`(min-width: ${defaultBreakpoints['2xl']})`)
  const isXl = useMediaQuery(`(min-width: ${defaultBreakpoints.xl})`)
  const isLg = useMediaQuery(`(min-width: ${defaultBreakpoints.lg})`)
  const isMd = useMediaQuery(`(min-width: ${defaultBreakpoints.md})`)
  const isSm = useMediaQuery(`(min-width: ${defaultBreakpoints.sm})`)

  if (is2xl) return '2xl'
  if (isXl) return 'xl'
  if (isLg) return 'lg'
  if (isMd) return 'md'
  if (isSm) return 'sm'
  return 'base'
}

// Responsive visibility hooks
export function useIsAbove(breakpoint: keyof typeof defaultBreakpoints) {
  return useMediaQuery(`(min-width: ${defaultBreakpoints[breakpoint]})`)
}

export function useIsBelow(breakpoint: keyof typeof defaultBreakpoints) {
  return useMediaQuery(`(max-width: ${defaultBreakpoints[breakpoint]})`)
}

export function useIsBetween(
  min: keyof typeof defaultBreakpoints,
  max: keyof typeof defaultBreakpoints
) {
  return useMediaQuery(
    `(min-width: ${defaultBreakpoints[min]}) and (max-width: ${defaultBreakpoints[max]})`
  )
}

// Device type detection
export function useDeviceType() {
  const isMobile = useMediaQuery('(max-width: 639px)')
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  if (isDesktop) return 'desktop'
  return 'unknown'
}
