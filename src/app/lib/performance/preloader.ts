/**
 * Intelligent preloader for optimizing code splitting performance
 * Implements predictive loading and resource prioritization
 */

interface PreloadOptions {
  priority?: 'high' | 'low'
  crossOrigin?: 'anonymous' | 'use-credentials'
  onLoad?: () => void
  onError?: (error: Event) => void
}

interface RoutePreloadConfig {
  route: string
  probability: number
  preloadDelay?: number
  dependencies?: string[]
}

class IntelligentPreloader {
  private preloadedRoutes = new Set<string>()
  private preloadQueue = new Map<string, Promise<any>>()
  private routeAnalytics = new Map<string, { visits: number; lastVisit: number }>()

  // Route prediction configuration
  private routePredictions: RoutePreloadConfig[] = [
    { route: '/dashboard', probability: 0.8, preloadDelay: 1000 },
    { route: '/profile', probability: 0.6, preloadDelay: 2000 },
    { route: '/settings', probability: 0.4, preloadDelay: 3000 },
    { route: '/auth/login', probability: 0.9, preloadDelay: 500 },
    { route: '/auth/register', probability: 0.7, preloadDelay: 1500 },
  ]

  constructor() {
    this.initializeRouteAnalytics()
    this.setupIntersectionObserver()
    this.setupIdlePreloading()
  }

  /**
   * Preload a route module
   */
  async preloadRoute(route: string, options: PreloadOptions = {}): Promise<void> {
    if (this.preloadedRoutes.has(route)) {
      return
    }

    const { onLoad, onError } = options
    // const { priority = 'low' } = options // Reserved for future prioritization

    try {
      // Create preload promise if not already queued
      if (!this.preloadQueue.has(route)) {
        const preloadPromise = this.createRoutePreloadPromise(route)
        this.preloadQueue.set(route, preloadPromise)
      }

      await this.preloadQueue.get(route)

      this.preloadedRoutes.add(route)
      onLoad?.()

      console.log(`✅ Preloaded route: ${route}`)
    } catch (error) {
      console.warn(`⚠️ Failed to preload route: ${route}`, error)
      onError?.(error as Event)
    }
  }

  /**
   * Create preload promise for specific route
   */
  private createRoutePreloadPromise(route: string): Promise<any> {
    // Map routes to their dynamic imports
    const routeImports: Record<string, () => Promise<any>> = {
      '/dashboard': () => import('@/pages/dashboard'),
      '/profile': () => import('@/pages/profile'),
      '/settings': () => import('@/pages/settings'),
      '/auth/login': () => import('@/pages/auth'),
      '/auth/register': () => import('@/pages/auth'),
      '/examples/data-table': () => import('@/pages/examples'),
      '/components/ui': () => import('@/pages/examples'),
      '/admin': () => import('@/pages/admin'),
      '/notifications': () => import('@/pages/notifications'),
      '/help': () => import('@/pages/help'),
    }

    const importFn = routeImports[route]
    if (!importFn) {
      return Promise.reject(new Error(`No import function defined for route: ${route}`))
    }

    return importFn()
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources(): void {
    const criticalRoutes = ['/dashboard', '/auth/login']

    criticalRoutes.forEach(route => {
      setTimeout(() => {
        this.preloadRoute(route, { priority: 'high' })
      }, 100) // Small delay to not block initial render
    })
  }

  /**
   * Preload link on hover
   */
  preloadOnHover(element: HTMLElement, route: string): void {
    let timeoutId: NodeJS.Timeout

    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        this.preloadRoute(route, { priority: 'high' })
      }, 100) // 100ms delay to avoid accidental hovers
    }

    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  /**
   * Predictive preloading based on user behavior
   */
  private initializeRouteAnalytics(): void {
    // Load analytics from localStorage
    const stored = localStorage.getItem('route-analytics')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        this.routeAnalytics = new Map(Object.entries(data))
      } catch (error) {
        console.warn('Failed to load route analytics:', error)
      }
    }

    // Track current route visits
    this.trackRouteVisit(window.location.pathname)
  }

  /**
   * Track route visits for analytics
   */
  trackRouteVisit(route: string): void {
    const current = this.routeAnalytics.get(route) || { visits: 0, lastVisit: 0 }

    this.routeAnalytics.set(route, {
      visits: current.visits + 1,
      lastVisit: Date.now(),
    })

    // Save to localStorage
    this.saveRouteAnalytics()

    // Trigger predictive preloading
    this.triggerPredictivePreloading(route)
  }

  /**
   * Save route analytics to localStorage
   */
  private saveRouteAnalytics(): void {
    try {
      const data = Object.fromEntries(this.routeAnalytics.entries())
      localStorage.setItem('route-analytics', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save route analytics:', error)
    }
  }

  /**
   * Trigger predictive preloading based on current route
   */
  private triggerPredictivePreloading(currentRoute: string): void {
    // Find routes with high probability of being visited next
    const candidates = this.routePredictions.filter(config => {
      // Don't preload current route
      if (config.route === currentRoute) return false

      // Check if already preloaded
      if (this.preloadedRoutes.has(config.route)) return false

      // Check probability threshold
      return config.probability > 0.5
    })

    // Sort by probability and preload top candidates
    candidates
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 2) // Limit to top 2 candidates
      .forEach(config => {
        setTimeout(() => {
          this.preloadRoute(config.route, { priority: 'low' })
        }, config.preloadDelay || 2000)
      })
  }

  /**
   * Setup intersection observer for visible links
   */
  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            const route = element.getAttribute('data-preload-route')

            if (route && !this.preloadedRoutes.has(route)) {
              // Delay preload to not interfere with current navigation
              setTimeout(() => {
                this.preloadRoute(route, { priority: 'low' })
              }, 1000)
            }
          }
        })
      },
      {
        rootMargin: '100px', // Preload when link is 100px from viewport
      }
    )

    // Observe all preloadable links
    document.addEventListener('DOMContentLoaded', () => {
      const preloadableLinks = document.querySelectorAll('[data-preload-route]')
      preloadableLinks.forEach(link => observer.observe(link))
    })
  }

  /**
   * Setup idle time preloading
   */
  private setupIdlePreloading(): void {
    if (!('requestIdleCallback' in window)) {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => this.preloadDuringIdle(), 5000)
      return
    }

    const preloadDuringIdle = () => {
      window.requestIdleCallback(deadline => {
        while (deadline.timeRemaining() > 0) {
          const unprioritizedRoutes = this.routePredictions
            .filter(config => !this.preloadedRoutes.has(config.route))
            .sort((a, b) => a.probability - b.probability) // Load least likely first during idle

          if (unprioritizedRoutes.length === 0) break

          const route = unprioritizedRoutes[0]
          this.preloadRoute(route.route, { priority: 'low' })
          break // Only preload one per idle callback
        }
      })
    }

    // Start idle preloading after initial page load
    setTimeout(preloadDuringIdle, 3000)
  }

  /**
   * Get preload statistics
   */
  getPreloadStats() {
    return {
      preloadedRoutes: Array.from(this.preloadedRoutes),
      queueSize: this.preloadQueue.size,
      routeAnalytics: Object.fromEntries(this.routeAnalytics.entries()),
    }
  }

  /**
   * Clear preload cache
   */
  clearCache(): void {
    this.preloadedRoutes.clear()
    this.preloadQueue.clear()
    localStorage.removeItem('route-analytics')
    console.log('🧹 Preload cache cleared')
  }
}

// Export singleton instance
export const preloader = new IntelligentPreloader()

// Initialize critical resource preloading
if (typeof window !== 'undefined') {
  // Wait for initial render before preloading
  setTimeout(() => {
    preloader.preloadCriticalResources()
  }, 1000)
}

// Export utility functions
export const preloadRoute = (route: string, options?: PreloadOptions) =>
  preloader.preloadRoute(route, options)

export const preloadOnHover = (element: HTMLElement, route: string) =>
  preloader.preloadOnHover(element, route)

export const trackRouteVisit = (route: string) => preloader.trackRouteVisit(route)
