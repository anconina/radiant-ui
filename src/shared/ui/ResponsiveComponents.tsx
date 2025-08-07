import * as React from 'react'

import { useBreakpoint } from './responsive/hooks/use-breakpoint'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface ShowProps {
  children: React.ReactNode
  /** Show content above this breakpoint (inclusive) */
  above?: Exclude<Breakpoint, 'xs'>
  /** Show content below this breakpoint (exclusive) */
  below?: Exclude<Breakpoint, 'xs'>
  /** Show content exactly at this breakpoint */
  at?: Breakpoint
  /** Show content between these breakpoints */
  between?: [Breakpoint, Exclude<Breakpoint, 'xs'>]
}

type HideProps = ShowProps

/**
 * Show content based on breakpoint conditions
 * @example
 * <Show above="md">Desktop content</Show>
 * <Show below="md">Mobile content</Show>
 * <Show at="md">Tablet only content</Show>
 * <Show between={["sm", "lg"]}>Tablet range content</Show>
 */
export function Show({ children, above, below, at, between }: ShowProps) {
  const { isAbove, isBelow, isExactly, isBetween } = useBreakpoint()

  const shouldShow = React.useMemo(() => {
    if (at) return isExactly(at)
    if (above) return isAbove(above)
    if (below) return isBelow(below)
    if (between) return isBetween(between[0], between[1])
    return true
  }, [at, above, below, between, isAbove, isBelow, isExactly, isBetween])

  if (!shouldShow) return null
  return <>{children}</>
}

/**
 * Hide content based on breakpoint conditions
 * @example
 * <Hide above="md">Hide on desktop</Hide>
 * <Hide below="md">Hide on mobile</Hide>
 * <Hide at="md">Hide on tablet</Hide>
 * <Hide between={["sm", "lg"]}>Hide on tablet range</Hide>
 */
export function Hide({ children, above, below, at, between }: HideProps) {
  const { isAbove, isBelow, isExactly, isBetween } = useBreakpoint()

  const shouldHide = React.useMemo(() => {
    if (at) return isExactly(at)
    if (above) return isAbove(above)
    if (below) return isBelow(below)
    if (between) return isBetween(between[0], between[1])
    return false
  }, [at, above, below, between, isAbove, isBelow, isExactly, isBetween])

  if (shouldHide) return null
  return <>{children}</>
}

interface MediaQueryProps {
  children: React.ReactNode
  /** Custom media query string */
  query: string
}

/**
 * Render content based on custom media query
 * @example
 * <MediaQuery query="(min-width: 768px) and (max-width: 1024px)">
 *   Tablet content
 * </MediaQuery>
 */
export function MediaQuery({ children, query }: MediaQueryProps) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  if (!matches) return null
  return <>{children}</>
}

interface ResponsiveProps {
  children: React.ReactNode
  /** Mobile content (below md) */
  mobile?: React.ReactNode
  /** Tablet content (md to lg) */
  tablet?: React.ReactNode
  /** Desktop content (lg and above) */
  desktop?: React.ReactNode
}

/**
 * Render different content for different device types
 * @example
 * <Responsive
 *   mobile={<MobileNav />}
 *   tablet={<TabletNav />}
 *   desktop={<DesktopNav />}
 * />
 */
export function Responsive({ children, mobile, tablet, desktop }: ResponsiveProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  if (isMobile && mobile !== undefined) return <>{mobile}</>
  if (isTablet && tablet !== undefined) return <>{tablet}</>
  if (isDesktop && desktop !== undefined) return <>{desktop}</>

  return <>{children}</>
}
