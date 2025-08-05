// Mobile performance optimization utilities

// Device capability detection
export const deviceCapabilities = {
  // Check if device has good CPU performance
  hasGoodCPU: () => {
    return navigator.hardwareConcurrency > 4
  },

  // Check if device has sufficient memory
  hasGoodMemory: () => {
    // @ts-ignore - Navigator.deviceMemory is not in TypeScript types yet
    const memory = navigator.deviceMemory
    return memory ? memory >= 4 : true // Default to true if API not available
  },

  // Check connection quality
  hasGoodConnection: () => {
    // @ts-ignore - Navigator.connection is not in TypeScript types yet
    const connection = navigator.connection
    if (!connection) return true // Default to true if API not available

    const effectiveType = connection.effectiveType
    return effectiveType === '4g' || effectiveType === 'wifi'
  },

  // Check if device supports GPU acceleration
  hasGPUAcceleration: () => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  },

  // Get overall performance score
  getPerformanceScore: () => {
    let score = 0
    if (deviceCapabilities.hasGoodCPU()) score += 25
    if (deviceCapabilities.hasGoodMemory()) score += 25
    if (deviceCapabilities.hasGoodConnection()) score += 25
    if (deviceCapabilities.hasGPUAcceleration()) score += 25
    return score
  },
}

// Performance optimization strategies based on device capabilities
export const performanceStrategies = {
  // Determine if we should use high-quality images
  shouldUseHighQualityImages: () => {
    return deviceCapabilities.hasGoodConnection() && deviceCapabilities.hasGoodMemory()
  },

  // Determine if we should enable animations
  shouldEnableAnimations: () => {
    const score = deviceCapabilities.getPerformanceScore()
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return score >= 75 && !prefersReducedMotion
  },

  // Determine virtualization threshold
  getVirtualizationThreshold: () => {
    const score = deviceCapabilities.getPerformanceScore()
    if (score >= 75) return 100 // High-performance devices
    if (score >= 50) return 50 // Medium-performance devices
    return 25 // Low-performance devices
  },

  // Determine lazy loading distance
  getLazyLoadingDistance: () => {
    const score = deviceCapabilities.getPerformanceScore()
    if (score >= 75) return '200px' // Load further ahead on good devices
    if (score >= 50) return '100px'
    return '50px' // Load just before entering viewport on slow devices
  },

  // Determine debounce delay for inputs
  getDebounceDelay: () => {
    const score = deviceCapabilities.getPerformanceScore()
    if (score >= 75) return 150
    if (score >= 50) return 300
    return 500
  },
}

// Image optimization utilities
export const imageOptimization = {
  // Get optimal image format based on browser support
  getOptimalFormat: (): 'avif' | 'webp' | 'jpg' => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1

    // Check AVIF support
    if (canvas.toDataURL('image/avif').indexOf('image/avif') === 5) {
      return 'avif'
    }

    // Check WebP support
    if (canvas.toDataURL('image/webp').indexOf('image/webp') === 5) {
      return 'webp'
    }

    return 'jpg'
  },

  // Get optimal image quality based on connection
  getOptimalQuality: (): number => {
    if (!deviceCapabilities.hasGoodConnection()) return 70
    if (!deviceCapabilities.hasGoodMemory()) return 80
    return 90
  },

  // Get responsive image sizes based on device
  getResponsiveSizes: () => {
    const isMobile = window.innerWidth < 768
    const isTablet = window.innerWidth < 1024

    if (isMobile) {
      return [320, 640, 768]
    } else if (isTablet) {
      return [768, 1024, 1280]
    } else {
      return [1280, 1920, 2560]
    }
  },
}

// Bundle optimization utilities
export const bundleOptimization = {
  // Determine which features to load
  getFeatureFlags: () => {
    const score = deviceCapabilities.getPerformanceScore()

    return {
      enableAnimations: score >= 75,
      enableParticles: score >= 90,
      enable3D: score >= 90 && deviceCapabilities.hasGPUAcceleration(),
      enableVideoBackgrounds: score >= 75 && deviceCapabilities.hasGoodConnection(),
      enableRealtimeFeatures: score >= 50 && deviceCapabilities.hasGoodConnection(),
    }
  },

  // Get chunk loading priority
  getChunkPriority: (chunkName: string) => {
    const criticalChunks = ['main', 'vendor', 'runtime']
    const importantChunks = ['router', 'common-components']

    if (criticalChunks.includes(chunkName)) return 'high'
    if (importantChunks.includes(chunkName)) return 'medium'
    return 'low'
  },
}

// Performance monitoring utilities
export const performanceMonitoring = {
  // Mark performance timing
  mark: (name: string) => {
    if ('performance' in window && 'mark' in window.performance) {
      performance.mark(name)
    }
  },

  // Measure between marks
  measure: (name: string, startMark: string, endMark?: string) => {
    if ('performance' in window && 'measure' in window.performance) {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark)
        } else {
          performance.measure(name, startMark)
        }

        // Get the measurement
        const measures = performance.getEntriesByName(name, 'measure')
        const duration = measures[measures.length - 1]?.duration

        // Log in development
        if (process.env.NODE_ENV === 'development' && duration) {
          console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
        }

        return duration
      } catch (e) {
        console.warn('[Performance] Measurement failed:', e)
      }
    }
    return null
  },

  // Get core web vitals
  getCoreWebVitals: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    return {
      // First Contentful Paint
      FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      // Largest Contentful Paint (would need observer in real implementation)
      LCP: 0,
      // Time to Interactive
      TTI: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      // Total Blocking Time
      TBT: 0,
    }
  },
}

// Request idle callback polyfill for older browsers
export const requestIdleCallbackPolyfill = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options)
  }

  // Simple polyfill
  const start = Date.now()
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    } as IdleDeadline)
  }, 1) as unknown as number
}

// Cancel idle callback polyfill
export const cancelIdleCallbackPolyfill = (handle: number) => {
  if ('cancelIdleCallback' in window) {
    return window.cancelIdleCallback(handle)
  }
  return clearTimeout(handle)
}
