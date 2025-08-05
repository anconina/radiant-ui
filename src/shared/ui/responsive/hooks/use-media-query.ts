import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Define event handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener
    if (media.addEventListener) {
      media.addEventListener('change', handler)
    } else {
      // Fallback for older browsers
      media.addListener(handler)
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handler)
      } else {
        // Fallback for older browsers
        media.removeListener(handler)
      }
    }
  }, [query])

  return matches
}

// Preset breakpoint hooks based on Tailwind CSS defaults
export function useIsMobileQuery() {
  return useMediaQuery('(max-width: 639px)')
}

export function useIsTabletQuery() {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)')
}

export function useIsDesktopQuery() {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsLargeDesktop() {
  return useMediaQuery('(min-width: 1280px)')
}

// Orientation hooks
export function useIsPortrait() {
  return useMediaQuery('(orientation: portrait)')
}

export function useIsLandscape() {
  return useMediaQuery('(orientation: landscape)')
}

// Feature detection hooks
export function useIsTouch() {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}

export function useIsHover() {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}

// Reduced motion hook
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

// High contrast hook
export function usePrefersHighContrast() {
  return useMediaQuery('(prefers-contrast: high)')
}

// Color scheme hooks
export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

export function usePrefersLightMode() {
  return useMediaQuery('(prefers-color-scheme: light)')
}

// Alias exports for convenience (avoiding conflicts with use-mobile.ts)
export const useIsTablet = useIsTabletQuery
export const useIsDesktop = useIsDesktopQuery
