/**
 * Performance monitoring utilities
 */
import { analytics } from './analytics'
import { logger } from './logger'
import { startTransaction } from './sentry'

// Performance thresholds
const THRESHOLDS = {
  // Core Web Vitals thresholds
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte

  // Custom thresholds
  apiCall: { good: 500, needsImprovement: 1000 },
  dbQuery: { good: 100, needsImprovement: 300 },
  render: { good: 16, needsImprovement: 100 },
}

// Performance observer for Core Web Vitals
const performanceObserver: PerformanceObserver | null = null

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return
  }

  // Observe Core Web Vitals
  observeWebVitals()

  // Monitor long tasks
  observeLongTasks()

  // Monitor resource timing
  observeResourceTiming()

  logger.info('Performance monitoring initialized')
}

// Observe Core Web Vitals
function observeWebVitals() {
  try {
    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1] as any

      reportWebVital('LCP', lastEntry.renderTime || lastEntry.loadTime)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        const fidEntry = entry as any
        reportWebVital('FID', fidEntry.processingStart - fidEntry.startTime)
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    const clsEntries: any[] = []

    const clsObserver = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          clsEntries.push(entry)
        }
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // Report CLS when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportWebVital('CLS', clsValue)
      }
    })
  } catch (error) {
    logger.error('Failed to initialize web vitals monitoring', error as Error)
  }
}

// Monitor long tasks
function observeLongTasks() {
  if (!('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (entry.duration > 50) {
          logger.warn('Long task detected', {
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
          })

          analytics.trackEvent('long_task', {
            duration: Math.round(entry.duration),
            category: 'performance',
          })
        }
      }
    })

    observer.observe({ entryTypes: ['longtask'] })
  } catch (error) {
    // Long task observer not supported
  }
}

// Monitor resource timing
function observeResourceTiming() {
  if (!('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming

        // Track slow resources
        if (resourceEntry.duration > 1000) {
          logger.warn('Slow resource detected', {
            name: resourceEntry.name,
            duration: Math.round(resourceEntry.duration),
            type: resourceEntry.initiatorType,
            size: resourceEntry.transferSize,
          })
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
  } catch (error) {
    // Resource timing observer not supported
  }
}

// Report web vital metric
function reportWebVital(metric: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB', value: number) {
  const threshold = THRESHOLDS[metric]
  let rating: 'good' | 'needs-improvement' | 'poor'

  if (value <= threshold.good) {
    rating = 'good'
  } else if (value <= threshold.needsImprovement) {
    rating = 'needs-improvement'
  } else {
    rating = 'poor'
  }

  logger.info(`Web Vital: ${metric}`, {
    value: Math.round(value),
    rating,
  })

  analytics.trackEvent('web_vital', {
    metric,
    value: Math.round(value),
    rating,
    category: 'performance',
  })
}

// Performance timer class
export class PerformanceTimer {
  private startTime: number
  private marks: Map<string, number> = new Map()
  private transaction: any

  constructor(
    private name: string,
    private category = 'custom'
  ) {
    this.startTime = performance.now()
    this.transaction = startTransaction(name, category)
  }

  // Mark a point in time
  mark(label: string) {
    const elapsed = performance.now() - this.startTime
    this.marks.set(label, elapsed)

    logger.debug(`Performance mark: ${this.name}/${label}`, {
      elapsed: Math.round(elapsed),
    })
  }

  // End timing and report
  end(metadata?: Record<string, any>) {
    const duration = performance.now() - this.startTime

    // Finish Sentry transaction
    if (this.transaction) {
      this.transaction.finish()
    }

    // Log performance data
    logger.info(`Performance: ${this.name}`, {
      duration: Math.round(duration),
      marks: Object.fromEntries(
        Array.from(this.marks.entries()).map(([label, time]) => [label, Math.round(time)])
      ),
      ...metadata,
    })

    // Track in analytics
    analytics.trackEvent('performance_timing', {
      name: this.name,
      category: this.category,
      duration: Math.round(duration),
      ...metadata,
    })

    return duration
  }
}

// Create a performance timer
export function createTimer(name: string, category = 'custom'): PerformanceTimer {
  return new PerformanceTimer(name, category)
}

// Measure function execution time
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  category = 'function'
): T {
  return ((...args: Parameters<T>) => {
    const timer = createTimer(name, category)

    try {
      const result = fn(...args)

      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => timer.end()) as ReturnType<T>
      }

      timer.end()
      return result
    } catch (error) {
      timer.end({ error: true })
      throw error
    }
  }) as T
}

// React component render performance
export function measureComponentPerformance(componentName: string) {
  return {
    onRender: (
      id: string,
      phase: 'mount' | 'update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      const data = {
        component: componentName,
        phase,
        actualDuration: Math.round(actualDuration),
        baseDuration: Math.round(baseDuration),
        startTime: Math.round(startTime),
        commitTime: Math.round(commitTime),
      }

      // Log if render is slow
      if (actualDuration > THRESHOLDS.render.needsImprovement) {
        logger.warn('Slow component render', data)
      } else if (actualDuration > THRESHOLDS.render.good) {
        logger.debug('Component render', data)
      }

      // Track in analytics
      analytics.trackEvent('component_render', {
        ...data,
        category: 'performance',
      })
    },
  }
}

// API call performance tracking
export function trackApiPerformance(
  endpoint: string,
  method: string,
  duration: number,
  status: number,
  size?: number
) {
  const data = {
    endpoint,
    method,
    duration: Math.round(duration),
    status,
    size,
  }

  // Check against thresholds
  if (duration > THRESHOLDS.apiCall.needsImprovement) {
    logger.warn('Slow API call', data)
  } else if (duration > THRESHOLDS.apiCall.good) {
    logger.info('API call performance', data)
  }

  // Track in analytics
  analytics.trackEvent('api_performance', {
    ...data,
    category: 'performance',
  })
}
