import { expect, test } from '@playwright/test'

/**
 * Performance regression tests
 * Validates Core Web Vitals and loading performance across key pages
 */

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP_GOOD: 2500, // Largest Contentful Paint
  FID_GOOD: 100, // First Input Delay
  CLS_GOOD: 0.1, // Cumulative Layout Shift
  FCP_GOOD: 1800, // First Contentful Paint
  TTFB_GOOD: 800, // Time to First Byte

  // Load times
  DOM_LOAD: 3000, // DOM content loaded
  FULL_LOAD: 5000, // All resources loaded

  // Bundle sizes (approximate)
  INITIAL_JS: 250000, // 250KB
  INITIAL_CSS: 50000, // 50KB
  TOTAL_BUNDLE: 1000000, // 1MB
}

test.describe('Performance Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup performance monitoring
    await page.addInitScript(() => {
      // Store performance metrics
      window.performanceMetrics = {
        navigationStart: performance.now(),
        metrics: {},
        resources: [],
      }

      // Monitor Core Web Vitals
      if ('PerformanceObserver' in window) {
        // LCP Observer
        new PerformanceObserver(entryList => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          window.performanceMetrics.metrics.lcp = lastEntry.startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // FID Observer
        new PerformanceObserver(entryList => {
          const entries = entryList.getEntries()
          entries.forEach(entry => {
            if (entry.name === 'first-input') {
              window.performanceMetrics.metrics.fid = entry.processingStart - entry.startTime
            }
          })
        }).observe({ entryTypes: ['first-input'] })

        // CLS Observer
        let clsValue = 0
        new PerformanceObserver(entryList => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          window.performanceMetrics.metrics.cls = clsValue
        }).observe({ entryTypes: ['layout-shift'] })

        // Resource timing
        new PerformanceObserver(entryList => {
          const entries = entryList.getEntries()
          entries.forEach(entry => {
            window.performanceMetrics.resources.push({
              name: entry.name,
              type: entry.initiatorType,
              size: entry.transferSize || 0,
              duration: entry.responseEnd - entry.requestStart,
            })
          })
        }).observe({ entryTypes: ['resource'] })
      }
    })
  })

  test('Homepage performance', async ({ page }) => {
    // Navigate to homepage with network monitoring
    const startTime = Date.now()

    await page.goto('/', { waitUntil: 'networkidle' })

    const loadTime = Date.now() - startTime

    // Wait for performance metrics to be collected
    await page.waitForTimeout(2000)

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      return {
        // Navigation timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        ttfb: navigation.responseStart - navigation.navigationStart,

        // Paint timing
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,

        // Custom metrics
        lcp: window.performanceMetrics?.metrics.lcp || 0,
        fid: window.performanceMetrics?.metrics.fid || 0,
        cls: window.performanceMetrics?.metrics.cls || 0,

        // Resource info
        resources: window.performanceMetrics?.resources || [],
      }
    })

    // Performance assertions
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FULL_LOAD)
    expect(metrics.domContentLoaded).toBeLessThan(PERFORMANCE_THRESHOLDS.DOM_LOAD)
    expect(metrics.ttfb).toBeLessThan(PERFORMANCE_THRESHOLDS.TTFB_GOOD)
    expect(metrics.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP_GOOD)

    if (metrics.lcp > 0) {
      expect(metrics.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP_GOOD)
    }

    if (metrics.cls > 0) {
      expect(metrics.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS_GOOD)
    }

    // Log performance metrics
    console.log('Homepage Performance Metrics:', {
      loadTime: `${loadTime}ms`,
      domContentLoaded: `${metrics.domContentLoaded.toFixed(2)}ms`,
      ttfb: `${metrics.ttfb.toFixed(2)}ms`,
      fcp: `${metrics.fcp.toFixed(2)}ms`,
      lcp: `${metrics.lcp.toFixed(2)}ms`,
      cls: metrics.cls.toFixed(4),
      resourceCount: metrics.resources.length,
    })
  })

  test('Dashboard performance', async ({ page }) => {
    // Navigate to dashboard (simulating logged-in user)
    await page.goto('/dashboard')

    // Wait for page to load
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 })

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        ttfb: navigation.responseStart - navigation.navigationStart,
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        lcp: window.performanceMetrics?.metrics.lcp || 0,
        cls: window.performanceMetrics?.metrics.cls || 0,
        resources: window.performanceMetrics?.resources || [],
      }
    })

    // Performance assertions
    expect(metrics.domContentLoaded).toBeLessThan(PERFORMANCE_THRESHOLDS.DOM_LOAD)
    expect(metrics.ttfb).toBeLessThan(PERFORMANCE_THRESHOLDS.TTFB_GOOD)
    expect(metrics.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP_GOOD)

    if (metrics.lcp > 0) {
      expect(metrics.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP_GOOD)
    }

    // Check for lazy loading effectiveness
    const images = await page.locator('img').count()
    const visibleImages = await page.locator('img:visible').count()

    // Should lazy load non-visible images
    if (images > 5) {
      expect(visibleImages).toBeLessThan(images)
    }

    console.log('Dashboard Performance Metrics:', {
      domContentLoaded: `${metrics.domContentLoaded.toFixed(2)}ms`,
      ttfb: `${metrics.ttfb.toFixed(2)}ms`,
      fcp: `${metrics.fcp.toFixed(2)}ms`,
      lcp: `${metrics.lcp.toFixed(2)}ms`,
      cls: metrics.cls.toFixed(4),
      images: `${visibleImages}/${images} visible`,
    })
  })

  test('Bundle size analysis', async ({ page }) => {
    // Enable request interception to measure bundle sizes
    const resourceSizes = new Map<string, number>()

    page.on('response', async response => {
      const url = response.url()
      const headers = response.headers()

      if (url.includes('.js') || url.includes('.css')) {
        try {
          const contentLength = headers['content-length']
          if (contentLength) {
            resourceSizes.set(url, parseInt(contentLength))
          }
        } catch {
          // Ignore errors getting content length
        }
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    // Calculate bundle sizes
    let totalJSSize = 0
    let totalCSSSize = 0
    let initialJSSize = 0
    let initialCSSSize = 0

    resourceSizes.forEach((size, url) => {
      if (url.includes('.js')) {
        totalJSSize += size
        if (url.includes('index') || url.includes('main') || url.includes('app')) {
          initialJSSize += size
        }
      } else if (url.includes('.css')) {
        totalCSSSize += size
        if (url.includes('index') || url.includes('main') || url.includes('app')) {
          initialCSSSize += size
        }
      }
    })

    const totalBundleSize = totalJSSize + totalCSSSize

    // Bundle size assertions
    expect(initialJSSize).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIAL_JS)
    expect(initialCSSSize).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIAL_CSS)
    expect(totalBundleSize).toBeLessThan(PERFORMANCE_THRESHOLDS.TOTAL_BUNDLE)

    console.log('Bundle Size Analysis:', {
      initialJS: `${(initialJSSize / 1024).toFixed(2)}KB`,
      initialCSS: `${(initialCSSSize / 1024).toFixed(2)}KB`,
      totalJS: `${(totalJSSize / 1024).toFixed(2)}KB`,
      totalCSS: `${(totalCSSSize / 1024).toFixed(2)}KB`,
      totalBundle: `${(totalBundleSize / 1024).toFixed(2)}KB`,
    })
  })

  test('Lighthouse performance audit', async ({ page }) => {
    // This would integrate with Lighthouse CI
    // For now, we'll simulate basic performance checks

    await page.goto('/', { waitUntil: 'networkidle' })

    // Check for performance best practices
    const performanceIssues: string[] = []

    // Check for render-blocking resources
    const stylesheets = await page.locator('link[rel="stylesheet"]').count()
    if (stylesheets > 3) {
      performanceIssues.push(`Too many render-blocking stylesheets: ${stylesheets}`)
    }

    // Check for unoptimized images
    const images = await page.locator('img').all()
    for (const img of images) {
      const src = await img.getAttribute('src')
      if (src && !src.includes('.webp') && !src.includes('data:')) {
        const naturalWidth = await img.evaluate(el => el.naturalWidth)
        const displayWidth = await img.evaluate(el => el.offsetWidth)

        if (naturalWidth > displayWidth * 2) {
          performanceIssues.push(`Oversized image: ${src}`)
        }
      }
    }

    // Check for missing alt attributes
    const imagesWithoutAlt = await page.locator('img:not([alt])').count()
    if (imagesWithoutAlt > 0) {
      performanceIssues.push(`${imagesWithoutAlt} images missing alt attributes`)
    }

    // Check for inline styles
    const inlineStyles = await page.locator('[style]').count()
    if (inlineStyles > 10) {
      performanceIssues.push(`Too many inline styles: ${inlineStyles}`)
    }

    // Performance score calculation (simplified)
    const performanceScore = Math.max(0, 100 - performanceIssues.length * 10)

    console.log('Performance Audit Results:', {
      score: performanceScore,
      issues: performanceIssues,
    })

    // Should have good performance score
    expect(performanceScore).toBeGreaterThan(80)
  })

  test('Mobile performance', async ({ page }) => {
    // Set mobile viewport and network conditions
    await page.setViewportSize({ width: 375, height: 667 })

    // Simulate slow 3G network
    const client = await page.context().newCDPSession(page)
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 500 * 1024, // 500 KB/s
      uploadThroughput: 500 * 1024,
      latency: 400, // 400ms RTT
    })

    const startTime = Date.now()
    await page.goto('/', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - startTime

    // Mobile performance should still be reasonable on slow network
    expect(loadTime).toBeLessThan(10000) // 10 seconds max on slow 3G

    // Check mobile-specific optimizations
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewportMeta).toContain('width=device-width')

    // Check for touch-friendly interactive elements
    const buttons = await page.locator('button, [role="button"]').all()
    for (const button of buttons.slice(0, 5)) {
      // Check first 5 buttons
      const box = await button.boundingBox()
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44) // Minimum 44px touch target
        expect(box.width).toBeGreaterThanOrEqual(44)
      }
    }

    console.log('Mobile Performance:', {
      loadTime: `${loadTime}ms`,
      viewport: viewportMeta,
      buttonsChecked: Math.min(buttons.length, 5),
    })
  })
})
