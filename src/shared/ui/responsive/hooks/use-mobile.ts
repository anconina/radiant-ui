import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Check on mount
    checkScreenSize()

    // Create media query
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', checkScreenSize)
      return () => mediaQuery.removeEventListener('change', checkScreenSize)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(checkScreenSize)
      return () => mediaQuery.removeListener(checkScreenSize)
    }
  }, [])

  return !!isMobile
}
