/**
 * Core Web Vitals monitoring and reporting
 * Tracks LCP, FID, CLS, FCP, and TTFB metrics
 */

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

interface PerformanceMetrics {
  lcp?: WebVitalMetric // Largest Contentful Paint
  fid?: WebVitalMetric // First Input Delay
  cls?: WebVitalMetric // Cumulative Layout Shift
  fcp?: WebVitalMetric // First Contentful Paint
  ttfb?: WebVitalMetric // Time to First Byte
  inp?: WebVitalMetric // Interaction to Next Paint
}

type MetricCallback = (metric: WebVitalMetric) => void

class CoreWebVitalsMonitor {
  private metrics: PerformanceMetrics = {}
  private callbacks: MetricCallback[] = []
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return

    try {
      // Dynamic import to avoid blocking main bundle
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals')

      // Monitor all Core Web Vitals
      getCLS(this.handleMetric.bind(this), { reportAllChanges: true })
      getFID(this.handleMetric.bind(this))
      getFCP(this.handleMetric.bind(this))
      getLCP(this.handleMetric.bind(this), { reportAllChanges: true })
      getTTFB(this.handleMetric.bind(this))

      // Try to get INP if available (newer metric)
      try {
        const { getINP } = await import('web-vitals')
        getINP?.(this.handleMetric.bind(this), { reportAllChanges: true })
      } catch (error) {
        // INP not available in this version
        console.log('INP metric not available')
      }

      this.isInitialized = true
      console.log('📊 Core Web Vitals monitoring initialized')
    } catch (error) {
      console.warn('Failed to initialize Core Web Vitals:', error)
    }
  }

  /**
   * Handle metric updates
   */
  private handleMetric(metric: WebVitalMetric): void {
    // Store metric
    this.metrics[metric.name.toLowerCase() as keyof PerformanceMetrics] = metric

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
    }

    // Call registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(metric)
      } catch (error) {
        console.error('Error in metric callback:', error)
      }
    })

    // Send to analytics
    this.sendToAnalytics(metric)
  }

  /**
   * Add callback for metric updates
   */
  onMetric(callback: MetricCallback): () => void {
    this.callbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const weights = {
      lcp: 0.25, // Largest Contentful Paint
      fid: 0.25, // First Input Delay
      cls: 0.25, // Cumulative Layout Shift
      fcp: 0.15, // First Contentful Paint
      ttfb: 0.1, // Time to First Byte
    }

    let totalScore = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([metricName, weight]) => {
      const metric = this.metrics[metricName as keyof PerformanceMetrics]
      if (metric) {
        const score = this.getMetricScore(metric)
        totalScore += score * weight
        totalWeight += weight
      }
    })

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  }

  /**
   * Get individual metric score
   */
  private getMetricScore(metric: WebVitalMetric): number {
    switch (metric.rating) {
      case 'good':
        return 90
      case 'needs-improvement':
        return 60
      case 'poor':
        return 30
      default:
        return 0
    }
  }

  /**
   * Send metrics to analytics
   */
  private sendToAnalytics(metric: WebVitalMetric): void {
    // Send to Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value * 1000), // Convert to integer
        event_label: metric.id,
        non_interaction: true,
      })
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(metric)
  }

  /**
   * Send to custom analytics endpoint
   */
  private async sendToCustomAnalytics(metric: WebVitalMetric): Promise<void> {
    try {
      // Only send in production
      if (process.env.NODE_ENV !== 'production') return

      const payload = {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
      }

      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/web-vitals', JSON.stringify(payload))
      } else {
        // Fallback to fetch
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {
          // Fail silently for analytics
        })
      }
    } catch (error) {
      // Fail silently for analytics
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance-session-id')
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('performance-session-id', sessionId)
    }
    return sessionId
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    score: number
    metrics: PerformanceMetrics
    recommendations: string[]
  } {
    const score = this.getPerformanceScore()
    const recommendations: string[] = []

    // Analyze metrics and generate recommendations
    if (this.metrics.lcp && this.metrics.lcp.rating !== 'good') {
      recommendations.push(
        'Optimize Largest Contentful Paint by improving server response times and optimizing critical resources'
      )
    }

    if (this.metrics.fid && this.metrics.fid.rating !== 'good') {
      recommendations.push(
        'Reduce First Input Delay by minimizing JavaScript execution time and avoiding long tasks'
      )
    }

    if (this.metrics.cls && this.metrics.cls.rating !== 'good') {
      recommendations.push(
        'Minimize Cumulative Layout Shift by setting dimensions for media and avoiding dynamic content injection'
      )
    }

    if (this.metrics.fcp && this.metrics.fcp.rating !== 'good') {
      recommendations.push(
        'Improve First Contentful Paint by optimizing critical rendering path and reducing render-blocking resources'
      )
    }

    if (this.metrics.ttfb && this.metrics.ttfb.rating !== 'good') {
      recommendations.push(
        'Reduce Time to First Byte by optimizing server response times and using CDN'
      )
    }

    return {
      score,
      metrics: this.metrics,
      recommendations,
    }
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    const report = this.generateReport()

    console.group('📊 Performance Summary')
    console.log(`Overall Score: ${report.score}/100`)

    Object.entries(report.metrics).forEach(([name, metric]) => {
      if (metric) {
        const icon =
          metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
        console.log(`${icon} ${name.toUpperCase()}: ${metric.value.toFixed(2)} (${metric.rating})`)
      }
    })

    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:')
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    }

    console.groupEnd()
  }
}

// Export singleton instance
export const webVitalsMonitor = new CoreWebVitalsMonitor()

// Utility functions
export const getPerformanceScore = () => webVitalsMonitor.getPerformanceScore()
export const getMetrics = () => webVitalsMonitor.getMetrics()
export const onMetric = (callback: MetricCallback) => webVitalsMonitor.onMetric(callback)
export const generatePerformanceReport = () => webVitalsMonitor.generateReport()

// Auto-log summary in development
if (process.env.NODE_ENV === 'development') {
  // Log summary after page load and key interactions
  window.addEventListener('load', () => {
    setTimeout(() => webVitalsMonitor.logSummary(), 3000)
  })
}
