/**
 * Performance monitoring hooks
 */
import { useCallback, useEffect, useRef } from 'react'

import { analytics } from '../monitoring/analytics'
import {
  PerformanceTimer,
  createTimer,
  measureComponentPerformance,
} from '../monitoring/performance'

// Hook to measure component mount/unmount time
export function useComponentPerformance(componentName: string) {
  const timerRef = useRef<PerformanceTimer | null>(null)

  useEffect(() => {
    // Start timer on mount
    timerRef.current = createTimer(`${componentName}_mount`, 'component')

    return () => {
      // End timer on unmount
      if (timerRef.current) {
        timerRef.current.end()
      }
    }
  }, [componentName])

  // Return render callback for React.Profiler
  return measureComponentPerformance(componentName)
}

// Hook to measure effect execution time
export function useEffectPerformance(effectName: string, deps: any[] = []) {
  useEffect(() => {
    const timer = createTimer(`${effectName}_effect`, 'effect')

    return () => {
      timer.end()
    }
  }, deps)
}

// Hook to measure async operation performance
export function useAsyncPerformance<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  operationName: string
): T {
  const wrappedFn = useCallback(
    async (...args: Parameters<T>) => {
      const timer = createTimer(operationName, 'async')

      try {
        const result = await asyncFn(...args)
        timer.end({ success: true })
        return result
      } catch (error) {
        timer.end({ success: false, error: (error as Error).message })
        throw error
      }
    },
    [asyncFn, operationName]
  ) as T

  return wrappedFn
}

// Hook to track user interactions
export function useInteractionTracking(interactionName: string) {
  const startTimeRef = useRef<number | null>(null)

  const startInteraction = useCallback(() => {
    startTimeRef.current = performance.now()
  }, [])

  const endInteraction = useCallback(
    (metadata?: Record<string, any>) => {
      if (startTimeRef.current === null) {
        return
      }

      const duration = performance.now() - startTimeRef.current
      startTimeRef.current = null

      analytics.trackEvent('user_interaction', {
        interaction: interactionName,
        duration: Math.round(duration),
        ...metadata,
      })
    },
    [interactionName]
  )

  return { startInteraction, endInteraction }
}

// Hook to monitor scroll performance
export function useScrollPerformance(threshold = 16) {
  const frameCountRef = useRef(0)
  const droppedFramesRef = useRef(0)
  const lastFrameTimeRef = useRef(0)

  useEffect(() => {
    let rafId: number

    const measureFrame = (timestamp: number) => {
      if (lastFrameTimeRef.current) {
        const delta = timestamp - lastFrameTimeRef.current
        frameCountRef.current++

        // Check if frame took longer than threshold (60fps = ~16ms)
        if (delta > threshold) {
          droppedFramesRef.current++
        }
      }

      lastFrameTimeRef.current = timestamp
      rafId = requestAnimationFrame(measureFrame)
    }

    const handleScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(measureFrame)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }

      // Report scroll performance metrics
      if (frameCountRef.current > 0) {
        const dropRate = droppedFramesRef.current / frameCountRef.current

        analytics.trackEvent('scroll_performance', {
          total_frames: frameCountRef.current,
          dropped_frames: droppedFramesRef.current,
          drop_rate: Math.round(dropRate * 100),
        })
      }
    }
  }, [threshold])
}

// Hook to track time to interactive
export function useTimeToInteractive(componentName: string) {
  useEffect(() => {
    const timer = createTimer(`${componentName}_tti`, 'interactive')

    // Wait for component to be interactive
    const checkInteractive = () => {
      // Check if all critical resources are loaded
      if (document.readyState === 'complete') {
        // Additional checks for component-specific readiness
        requestIdleCallback(() => {
          timer.end()
        })
      } else {
        requestAnimationFrame(checkInteractive)
      }
    }

    checkInteractive()
  }, [componentName])
}

// Hook to monitor memory usage
export function useMemoryMonitoring(intervalMs = 60000) {
  useEffect(() => {
    if (!('memory' in performance)) {
      return
    }

    const checkMemory = () => {
      const memory = (performance as any).memory

      analytics.trackEvent('memory_usage', {
        used_js_heap_size: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total_js_heap_size: Math.round(memory.totalJSHeapSize / 1048576), // MB
        js_heap_size_limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      })
    }

    // Initial check
    checkMemory()

    // Set up interval
    const intervalId = setInterval(checkMemory, intervalMs)

    return () => {
      clearInterval(intervalId)
    }
  }, [intervalMs])
}

// Polyfill for requestIdleCallback
const requestIdleCallback =
  window.requestIdleCallback ||
  ((cb: IdleRequestCallback) => {
    const start = Date.now()
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      })
    }, 1)
  })
