import { ReactNode } from 'react'

import { useIsAbove, useIsBelow, useIsBetween, useMediaQuery } from './hooks/use-responsive'

interface ShowProps {
  children: ReactNode
  when?: boolean
  fallback?: ReactNode
}

export function Show({ children, when = true, fallback = null }: ShowProps) {
  return <>{when ? children : fallback}</>
}

interface ShowAboveProps {
  children: ReactNode
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallback?: ReactNode
}

export function ShowAbove({ children, breakpoint, fallback = null }: ShowAboveProps) {
  const isAbove = useIsAbove(breakpoint)
  return (
    <Show when={isAbove} fallback={fallback}>
      {children}
    </Show>
  )
}

interface ShowBelowProps {
  children: ReactNode
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallback?: ReactNode
}

export function ShowBelow({ children, breakpoint, fallback = null }: ShowBelowProps) {
  const isBelow = useIsBelow(breakpoint)
  return (
    <Show when={isBelow} fallback={fallback}>
      {children}
    </Show>
  )
}

interface ShowBetweenProps {
  children: ReactNode
  min: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  max: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallback?: ReactNode
}

export function ShowBetween({ children, min, max, fallback = null }: ShowBetweenProps) {
  const isBetween = useIsBetween(min, max)
  return (
    <Show when={isBetween} fallback={fallback}>
      {children}
    </Show>
  )
}

interface ShowForDeviceProps {
  children: ReactNode
  device: 'mobile' | 'tablet' | 'desktop'
  fallback?: ReactNode
}

export function ShowForDevice({ children, device, fallback = null }: ShowForDeviceProps) {
  const queries = {
    mobile: '(max-width: 639px)',
    tablet: '(min-width: 640px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)',
  }

  const matches = useMediaQuery(queries[device])
  return (
    <Show when={matches} fallback={fallback}>
      {children}
    </Show>
  )
}

interface ShowForOrientationProps {
  children: ReactNode
  orientation: 'portrait' | 'landscape'
  fallback?: ReactNode
}

export function ShowForOrientation({
  children,
  orientation,
  fallback = null,
}: ShowForOrientationProps) {
  const matches = useMediaQuery(`(orientation: ${orientation})`)
  return (
    <Show when={matches} fallback={fallback}>
      {children}
    </Show>
  )
}

interface ShowForTouchProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ShowForTouch({ children, fallback = null }: ShowForTouchProps) {
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)')
  return (
    <Show when={isTouch} fallback={fallback}>
      {children}
    </Show>
  )
}

interface ShowForHoverProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ShowForHover({ children, fallback = null }: ShowForHoverProps) {
  const isHover = useMediaQuery('(hover: hover) and (pointer: fine)')
  return (
    <Show when={isHover} fallback={fallback}>
      {children}
    </Show>
  )
}
