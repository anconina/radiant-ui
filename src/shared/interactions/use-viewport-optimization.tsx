import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useIsMobile } from '@/shared/ui/responsive'

interface ViewportOptimizationOptions {
  // Defer non-critical rendering
  deferredRenderDelay?: number
  // Virtual scrolling threshold
  virtualScrollThreshold?: number
  // Intersection observer options
  rootMargin?: string
  threshold?: number | number[]
  // Performance monitoring
  enablePerformanceMonitoring?: boolean
}

// Hook for viewport-based optimization
export function useViewportOptimization(options: ViewportOptimizationOptions = {}) {
  const {
    deferredRenderDelay = 100,
    virtualScrollThreshold = 50,
    rootMargin = '50px',
    threshold = 0,
    enablePerformanceMonitoring = false,
  } = options

  const isMobile = useIsMobile()
  const [isInViewport, setIsInViewport] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  const renderTimeoutRef = useRef<NodeJS.Timeout>()

  // Track performance metrics
  const performanceRef = useRef({
    intersectionTime: 0,
    renderTime: 0,
    paintTime: 0,
  })

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const wasInViewport = isInViewport
          setIsInViewport(entry.isIntersecting)

          if (entry.isIntersecting && !wasInViewport) {
            // Element entered viewport
            if (enablePerformanceMonitoring) {
              performanceRef.current.intersectionTime = performance.now()
            }

            // Defer render for better performance on mobile
            if (isMobile && deferredRenderDelay > 0) {
              renderTimeoutRef.current = setTimeout(() => {
                setShouldRender(true)
                if (enablePerformanceMonitoring) {
                  performanceRef.current.renderTime = performance.now()
                }
              }, deferredRenderDelay)
            } else {
              setShouldRender(true)
            }
          } else if (!entry.isIntersecting && wasInViewport) {
            // Element left viewport - cleanup for memory optimization
            if (isMobile) {
              // Clear any pending render timeouts
              if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current)
              }
              // Optionally unmount heavy components when out of view
              // setShouldRender(false) // Uncomment if you want aggressive memory management
            }
          }
        })
      },
      {
        rootMargin,
        threshold,
      }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }
    }
  }, [
    isMobile,
    deferredRenderDelay,
    rootMargin,
    threshold,
    isInViewport,
    enablePerformanceMonitoring,
  ])

  // Performance monitoring
  useEffect(() => {
    if (enablePerformanceMonitoring && shouldRender) {
      // Measure paint time
      requestAnimationFrame(() => {
        performanceRef.current.paintTime = performance.now()
        const totalTime = performanceRef.current.paintTime - performanceRef.current.intersectionTime
        console.log('[Performance]', {
          component: elementRef.current?.tagName,
          intersectionToRender:
            performanceRef.current.renderTime - performanceRef.current.intersectionTime,
          renderToPaint: performanceRef.current.paintTime - performanceRef.current.renderTime,
          totalTime,
        })
      })
    }
  }, [shouldRender, enablePerformanceMonitoring])

  return {
    ref: elementRef,
    isInViewport,
    shouldRender,
  }
}

// Hook for virtual scrolling on mobile
export function useVirtualScroll<T>(
  items: T[],
  options: {
    itemHeight: number
    overscan?: number
    containerHeight?: number
  }
) {
  const { itemHeight, overscan = 3, containerHeight = window.innerHeight } = options
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLElement>(null)

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  useEffect(() => {
    const element = scrollElementRef.current
    if (!element) return

    const handleScroll = () => {
      setScrollTop(element.scrollTop)
    }

    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => element.removeEventListener('scroll', handleScroll)
  }, [])

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
  }
}

// Hook for optimizing animations on mobile
export function useMobileAnimationOptimization() {
  const isMobile = useIsMobile()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const frameRef = useRef<number>()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const requestAnimationFrame = useCallback(
    (callback: FrameRequestCallback) => {
      if (prefersReducedMotion) {
        // Skip animation if user prefers reduced motion
        callback(0)
        return 0
      }

      if (isMobile) {
        // Throttle animations on mobile for better performance
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current)
        }
        frameRef.current = window.requestAnimationFrame(callback)
        return frameRef.current
      }

      return window.requestAnimationFrame(callback)
    },
    [isMobile, prefersReducedMotion]
  )

  return {
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion && (!isMobile || navigator.hardwareConcurrency > 4),
    requestAnimationFrame,
  }
}

// Component for deferring heavy renders
interface DeferredRenderProps {
  children: React.ReactNode
  delay?: number
  fallback?: React.ReactNode
  disabled?: boolean
}

export function DeferredRender({
  children,
  delay = 100,
  fallback = null,
  disabled = false,
}: DeferredRenderProps) {
  const [shouldRender, setShouldRender] = useState(disabled)

  useEffect(() => {
    if (disabled) {
      setShouldRender(true)
      return
    }

    const timer = setTimeout(() => {
      setShouldRender(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, disabled])

  return <>{shouldRender ? children : fallback}</>
}
