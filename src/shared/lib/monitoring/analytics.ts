/**
 * Analytics tracking with multiple providers
 */
import { env } from '../environment/env'
import { logger } from './logger'

// Event types
export interface AnalyticsEvent {
  name: string
  category?: string
  properties?: Record<string, any>
  value?: number
}

// User properties
export interface UserProperties {
  id?: string
  email?: string
  plan?: string
  role?: string
  [key: string]: any
}

// Page view data
export interface PageViewData {
  path: string
  title?: string
  referrer?: string
  search?: string
}

// Analytics provider interface
interface AnalyticsProvider {
  initialize(): void
  trackEvent(event: AnalyticsEvent): void
  trackPageView(data: PageViewData): void
  identifyUser(properties: UserProperties): void
  reset(): void
}

// Google Analytics provider
class GoogleAnalyticsProvider implements AnalyticsProvider {
  private initialized = false

  initialize() {
    if (!env.gaTrackingId || this.initialized) {
      return
    }

    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${env.gaTrackingId}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', env.gaTrackingId, {
      send_page_view: false,
    })

    this.initialized = true
    logger.info('Google Analytics initialized')
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.initialized || !window.gtag) {
      return
    }

    window.gtag('event', event.name, {
      event_category: event.category || 'engagement',
      event_label: event.properties?.label,
      value: event.value,
      ...event.properties,
    })
  }

  trackPageView(data: PageViewData) {
    if (!this.initialized || !window.gtag) {
      return
    }

    window.gtag('event', 'page_view', {
      page_path: data.path,
      page_title: data.title,
      page_referrer: data.referrer,
      page_search: data.search,
    })
  }

  identifyUser(properties: UserProperties) {
    if (!this.initialized || !window.gtag) {
      return
    }

    window.gtag('set', {
      user_id: properties.id,
      user_properties: properties,
    })
  }

  reset() {
    if (!this.initialized || !window.gtag) {
      return
    }

    window.gtag('set', {
      user_id: undefined,
      user_properties: {},
    })
  }
}

// Plausible Analytics provider
class PlausibleProvider implements AnalyticsProvider {
  private initialized = false

  initialize() {
    if (!env.plausibleDomain || this.initialized) {
      return
    }

    // Load Plausible script
    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = env.plausibleDomain
    script.src = 'https://plausible.io/js/script.js'
    document.head.appendChild(script)

    this.initialized = true
    logger.info('Plausible Analytics initialized')
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.initialized || !window.plausible) {
      return
    }

    window.plausible(event.name, {
      props: {
        category: event.category,
        ...event.properties,
      },
    })
  }

  trackPageView(data: PageViewData) {
    if (!this.initialized || !window.plausible) {
      return
    }

    // Plausible tracks page views automatically
    // This is called for consistency with other providers
  }

  identifyUser(properties: UserProperties) {
    // Plausible doesn't support user identification
    // This is a privacy feature
  }

  reset() {
    // Nothing to reset for Plausible
  }
}

// Development/debug provider
class DebugProvider implements AnalyticsProvider {
  initialize() {
    logger.debug('Debug Analytics initialized')
  }

  trackEvent(event: AnalyticsEvent) {
    logger.debug('Analytics Event', {
      ...event,
      timestamp: new Date().toISOString(),
    })
  }

  trackPageView(data: PageViewData) {
    logger.debug('Page View', {
      ...data,
      timestamp: new Date().toISOString(),
    })
  }

  identifyUser(properties: UserProperties) {
    logger.debug('Identify User', {
      ...properties,
      timestamp: new Date().toISOString(),
    })
  }

  reset() {
    logger.debug('Analytics Reset')
  }
}

// Main analytics class
class Analytics {
  private providers: AnalyticsProvider[] = []
  private initialized = false
  private queue: Array<() => void> = []

  constructor() {
    // Add providers based on configuration
    if (env.enableAnalytics) {
      if (env.gaTrackingId) {
        this.providers.push(new GoogleAnalyticsProvider())
      }

      if (env.plausibleDomain) {
        this.providers.push(new PlausibleProvider())
      }
    }

    // Always add debug provider in development
    if (env.isDevelopment) {
      this.providers.push(new DebugProvider())
    }
  }

  // Initialize analytics
  initialize() {
    if (this.initialized || !env.enableAnalytics) {
      return
    }

    this.providers.forEach(provider => provider.initialize())
    this.initialized = true

    // Process queued events
    this.queue.forEach(fn => fn())
    this.queue = []

    logger.info('Analytics initialized', {
      providers: this.providers.length,
    })
  }

  // Track custom event
  trackEvent(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties,
    }

    this.runOrQueue(() => {
      this.providers.forEach(provider => provider.trackEvent(event))
    })
  }

  // Track page view
  trackPageView(path: string, title?: string) {
    const data: PageViewData = {
      path,
      title: title || document.title,
      referrer: document.referrer,
      search: window.location.search,
    }

    this.runOrQueue(() => {
      this.providers.forEach(provider => provider.trackPageView(data))
    })
  }

  // Identify user
  identifyUser(id: string, properties?: Omit<UserProperties, 'id'>) {
    const userProps: UserProperties = {
      id,
      ...properties,
    }

    this.runOrQueue(() => {
      this.providers.forEach(provider => provider.identifyUser(userProps))
    })
  }

  // Reset user
  reset() {
    this.runOrQueue(() => {
      this.providers.forEach(provider => provider.reset())
    })
  }

  // Helper to run or queue operations
  private runOrQueue(fn: () => void) {
    if (this.initialized) {
      fn()
    } else {
      this.queue.push(fn)
    }
  }

  // Timing helpers
  startTiming(label: string): () => void {
    const start = performance.now()

    return () => {
      const duration = Math.round(performance.now() - start)
      this.trackEvent('timing_complete', {
        label,
        value: duration,
        metric: 'milliseconds',
      })
    }
  }

  // Error tracking
  trackError(error: Error, fatal = false) {
    this.trackEvent('exception', {
      description: error.message,
      fatal,
      stack: error.stack,
    })
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string, metadata?: Record<string, any>) {
    this.trackEvent('feature_used', {
      feature,
      ...metadata,
    })
  }

  // Form tracking
  trackFormSubmit(formName: string, success: boolean, metadata?: Record<string, any>) {
    this.trackEvent('form_submit', {
      form_name: formName,
      success,
      ...metadata,
    })
  }

  // Search tracking
  trackSearch(query: string, resultCount: number, metadata?: Record<string, any>) {
    this.trackEvent('search', {
      search_term: query,
      result_count: resultCount,
      ...metadata,
    })
  }

  // Social tracking
  trackSocialShare(network: string, contentId?: string) {
    this.trackEvent('share', {
      method: network,
      content_id: contentId,
    })
  }
}

// Create singleton instance
export const analytics = new Analytics()

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    analytics.initialize()
  } else {
    window.addEventListener('load', () => analytics.initialize())
  }
}

// TypeScript declarations for global objects
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    plausible?: (eventName: string, options?: any) => void
  }
}
