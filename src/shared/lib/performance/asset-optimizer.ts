/**
 * Asset optimization utilities
 * Handles image lazy loading, preloading, and caching strategies
 */

interface LazyImageOptions {
  rootMargin?: string
  threshold?: number
  placeholder?: string
  onLoad?: () => void
  onError?: (error: Event) => void
}

interface PreloadOptions {
  as: 'script' | 'style' | 'image' | 'font' | 'fetch'
  crossOrigin?: 'anonymous' | 'use-credentials'
  integrity?: string
  media?: string
  onLoad?: () => void
  onError?: (error: Event) => void
}

class AssetOptimizer {
  private imageObserver?: IntersectionObserver
  private preloadedResources = new Set<string>()
  private imageCache = new Map<string, HTMLImageElement>()

  constructor() {
    this.initializeImageObserver()
    this.setupServiceWorkerCaching()
  }

  /**
   * Initialize intersection observer for lazy loading
   */
  private initializeImageObserver(): void {
    if (!('IntersectionObserver' in window)) return

    this.imageObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            this.loadImage(img)
            this.imageObserver?.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px 0px', // Load images 50px before they enter viewport
        threshold: 0.01,
      }
    )
  }

  /**
   * Setup service worker for caching strategies
   */
  private setupServiceWorkerCaching(): void {
    if ('serviceWorker' in navigator) {
      // This would typically be handled by a separate service worker file
      // For now, we'll use browser caching strategies
      this.setupBrowserCaching()
    }
  }

  /**
   * Setup browser caching strategies
   */
  private setupBrowserCaching(): void {
    // Preload critical CSS
    this.preloadCriticalCSS()

    // Setup font preloading
    this.preloadCriticalFonts()

    // Setup DNS prefetch for external resources
    this.setupDNSPrefetch()
  }

  /**
   * Lazy load images with intersection observer
   */
  lazyLoadImage(img: HTMLImageElement, options: LazyImageOptions = {}): void {
    const { placeholder, onLoad, onError } = options

    // Set placeholder if provided
    if (placeholder && !img.src) {
      img.src = placeholder
    }

    // Store original src in data attribute
    if (img.dataset.src && !img.dataset.originalSrc) {
      img.dataset.originalSrc = img.dataset.src
    }

    // Add loading and error handlers
    if (onLoad) {
      img.addEventListener('load', onLoad, { once: true })
    }

    if (onError) {
      img.addEventListener('error', onError, { once: true })
    }

    // Observe for lazy loading
    if (this.imageObserver) {
      this.imageObserver.observe(img)
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img)
    }
  }

  /**
   * Load image from data-src
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src || img.dataset.originalSrc
    if (!src) return

    // Create new image element for preloading
    const imageLoader = new Image()

    imageLoader.onload = () => {
      // Update src and add loaded class
      img.src = src
      img.classList.add('loaded')
      img.classList.remove('loading')

      // Cache the loaded image
      this.imageCache.set(src, imageLoader)

      // Dispatch custom event
      img.dispatchEvent(
        new CustomEvent('imageLoaded', {
          detail: { src, cached: false },
        })
      )
    }

    imageLoader.onerror = () => {
      img.classList.add('error')
      img.classList.remove('loading')

      // Try to load fallback image
      const fallback = img.dataset.fallback
      if (fallback && fallback !== src) {
        img.dataset.src = fallback
        this.loadImage(img)
      }
    }

    // Add loading class
    img.classList.add('loading')

    // Check cache first
    if (this.imageCache.has(src)) {
      const cachedImage = this.imageCache.get(src)!
      img.src = cachedImage.src
      img.classList.add('loaded')
      img.classList.remove('loading')

      img.dispatchEvent(
        new CustomEvent('imageLoaded', {
          detail: { src, cached: true },
        })
      )
      return
    }

    // Start loading
    imageLoader.src = src
  }

  /**
   * Preload resource with link prefetch
   */
  preloadResource(href: string, options: PreloadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already preloaded
      if (this.preloadedResources.has(href)) {
        resolve()
        return
      }

      // Create link element
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = options.as

      if (options.crossOrigin) {
        link.crossOrigin = options.crossOrigin
      }

      if (options.integrity) {
        link.integrity = options.integrity
      }

      if (options.media) {
        link.media = options.media
      }

      // Handle load/error events
      link.onload = () => {
        this.preloadedResources.add(href)
        options.onLoad?.()
        resolve()
      }

      link.onerror = error => {
        options.onError?.(error)
        reject(error)
      }

      // Add to document head
      document.head.appendChild(link)
    })
  }

  /**
   * Preload critical CSS
   */
  private preloadCriticalCSS(): void {
    const criticalCSS = ['/assets/styles/critical.css', '/assets/styles/above-fold.css']

    criticalCSS.forEach(href => {
      if (document.querySelector(`link[href="${href}"]`)) return

      this.preloadResource(href, {
        as: 'style',
        onLoad: () => console.log(`✅ Preloaded CSS: ${href}`),
      }).catch(() => {
        // CSS file doesn't exist, that's okay
      })
    })
  }

  /**
   * Preload critical fonts
   */
  private preloadCriticalFonts(): void {
    const criticalFonts = [
      '/assets/fonts/inter-var.woff2',
      '/assets/fonts/inter-regular.woff2',
      '/assets/fonts/inter-medium.woff2',
    ]

    criticalFonts.forEach(href => {
      this.preloadResource(href, {
        as: 'font',
        crossOrigin: 'anonymous',
        onLoad: () => console.log(`✅ Preloaded font: ${href}`),
      }).catch(() => {
        // Font file doesn't exist, that's okay
      })
    })
  }

  /**
   * Setup DNS prefetch for external resources
   */
  private setupDNSPrefetch(): void {
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
    ]

    externalDomains.forEach(domain => {
      if (document.querySelector(`link[href="${domain}"]`)) return

      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = domain
      document.head.appendChild(link)
    })
  }

  /**
   * Optimize images with WebP fallback
   */
  optimizeImage(img: HTMLImageElement): void {
    const originalSrc = img.src || img.dataset.src
    if (!originalSrc) return

    // Check WebP support
    if (this.supportsWebP()) {
      // Try to load WebP version
      const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')

      // Test if WebP version exists
      const testImage = new Image()
      testImage.onload = () => {
        if (img.dataset.src) {
          img.dataset.src = webpSrc
        } else {
          img.src = webpSrc
        }
      }
      testImage.onerror = () => {
        // WebP version doesn't exist, keep original
      }
      testImage.src = webpSrc
    }
  }

  /**
   * Check WebP support
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('webp') > 0
  }

  /**
   * Setup lazy loading for all images on page
   */
  setupLazyLoading(): void {
    const images = document.querySelectorAll('img[data-src]')

    images.forEach(img => {
      this.lazyLoadImage(img as HTMLImageElement, {
        onLoad: () => {
          console.log(`✅ Lazy loaded: ${img.getAttribute('data-src')}`)
        },
      })
    })
  }

  /**
   * Preload images for next page
   */
  preloadImagesForRoute(route: string): void {
    // Define critical images for each route
    const routeImages: Record<string, string[]> = {
      '/dashboard': ['/assets/images/dashboard-hero.webp', '/assets/images/chart-placeholder.webp'],
      '/profile': ['/assets/images/default-avatar.webp', '/assets/images/profile-bg.webp'],
      '/settings': ['/assets/images/settings-icons.webp'],
    }

    const images = routeImages[route] || []

    images.forEach(src => {
      this.preloadResource(src, {
        as: 'image',
        onLoad: () => console.log(`✅ Preloaded image for ${route}: ${src}`),
      }).catch(() => {
        // Image doesn't exist, that's okay
      })
    })
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      preloadedResources: this.preloadedResources.size,
      cachedImages: this.imageCache.size,
      observedImages: this.imageObserver ? 0 : 0, // Would need to track this
    }
  }

  /**
   * Clear caches
   */
  clearCaches(): void {
    this.preloadedResources.clear()
    this.imageCache.clear()
    console.log('🧹 Asset caches cleared')
  }
}

// Create singleton instance
export const assetOptimizer = new AssetOptimizer()

// Utility functions
export const lazyLoadImage = (img: HTMLImageElement, options?: LazyImageOptions) =>
  assetOptimizer.lazyLoadImage(img, options)

export const preloadResource = (href: string, options: PreloadOptions) =>
  assetOptimizer.preloadResource(href, options)

export const setupLazyLoading = () => assetOptimizer.setupLazyLoading()

export const preloadImagesForRoute = (route: string) => assetOptimizer.preloadImagesForRoute(route)

// Auto-setup lazy loading when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLazyLoading)
  } else {
    setupLazyLoading()
  }
}
