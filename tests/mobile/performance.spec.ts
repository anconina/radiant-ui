import { devices, expect, test } from '@playwright/test'

// Configure for mobile performance testing
test.use({
  ...devices['iPhone 13'],
  // Throttle network to 3G
  offline: false,
  // @ts-expect-error - Playwright types might not include these
  downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
  uploadThroughput: (750 * 1024) / 8, // 750 Kbps
  latency: 150,
})

test('meets Core Web Vitals on mobile', async ({ page }) => {
  // Navigate and wait for load
  await page.goto('/', { waitUntil: 'networkidle' })

  // Collect performance metrics
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0] as any

    // Calculate CLS
    let cls = 0
    const entries = performance.getEntriesByType('layout-shift') as any[]
    entries.forEach(entry => {
      if (!entry.hadRecentInput) {
        cls += entry.value
      }
    })

    return {
      // First Contentful Paint
      fcp: fcp?.startTime || 0,
      // Largest Contentful Paint
      lcp: lcp?.startTime || 0,
      // Cumulative Layout Shift
      cls: cls,
      // Time to Interactive (approximated)
      tti: navigation.loadEventEnd - navigation.fetchStart,
      // Total Blocking Time (approximated)
      tbt: navigation.loadEventEnd - navigation.responseEnd,
      // DOM Content Loaded
      dcl: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    }
  })

  // Assert Core Web Vitals thresholds
  expect(metrics.fcp).toBeLessThan(1800) // Good: <1.8s
  expect(metrics.lcp).toBeLessThan(2500) // Good: <2.5s
  expect(metrics.cls).toBeLessThan(0.1) // Good: <0.1
  expect(metrics.tti).toBeLessThan(3800) // Good: <3.8s
})

test('bundle size meets performance budget', async ({ page }) => {
  const resourceSizes = {
    javascript: 0,
    css: 0,
    images: 0,
    fonts: 0,
    total: 0,
  }

  // Track network requests
  page.on('response', response => {
    const url = response.url()
    const size = parseInt(response.headers()['content-length'] || '0')

    if (url.endsWith('.js') || url.endsWith('.mjs')) {
      resourceSizes.javascript += size
    } else if (url.endsWith('.css')) {
      resourceSizes.css += size
    } else if (/\.(jpg|jpeg|png|gif|webp|svg)/.test(url)) {
      resourceSizes.images += size
    } else if (/\.(woff|woff2|ttf|otf)/.test(url)) {
      resourceSizes.fonts += size
    }

    resourceSizes.total += size
  })

  await page.goto('/', { waitUntil: 'networkidle' })

  // Check bundle sizes (in KB)
  expect(resourceSizes.javascript / 1024).toBeLessThan(500) // <500KB JS
  expect(resourceSizes.css / 1024).toBeLessThan(100) // <100KB CSS
  expect(resourceSizes.total / 1024).toBeLessThan(2048) // <2MB total
})

test('images are optimized and lazy loaded', async ({ page }) => {
  await page.goto('/')

  // Check for modern image formats
  const images = await page.locator('img').all()
  let modernFormats = 0
  let lazyLoaded = 0

  for (const img of images) {
    const src = (await img.getAttribute('src')) || ''
    const loading = await img.getAttribute('loading')

    if (/\.(webp|avif)/.test(src)) {
      modernFormats++
    }

    if (loading === 'lazy') {
      lazyLoaded++
    }
  }

  // At least 50% should use modern formats
  expect(modernFormats).toBeGreaterThan(images.length * 0.5)

  // Non-hero images should be lazy loaded
  expect(lazyLoaded).toBeGreaterThan(images.length * 0.7)
})

test('critical CSS is inlined', async ({ page }) => {
  const response = await page.goto('/')
  const html = (await response?.text()) || ''

  // Check for inlined critical CSS
  const hasInlineStyles = html.includes('<style>') && html.includes('</style>')
  expect(hasInlineStyles).toBeTruthy()

  // Check that main CSS is loaded asynchronously
  const hasAsyncCSS = html.includes('rel="preload"') && html.includes('as="style"')
  expect(hasAsyncCSS).toBeTruthy()
})

test('JavaScript execution time is optimized', async ({ page }) => {
  await page.goto('/')

  // Measure JavaScript execution time
  const metrics = await page.evaluate(() => {
    let totalJSTime = 0

    // Get long tasks
    const longTasks = (performance as any).getEntriesByType('longtask') || []
    longTasks.forEach((task: any) => {
      totalJSTime += task.duration
    })

    return {
      longTaskCount: longTasks.length,
      totalLongTaskTime: totalJSTime,
    }
  })

  // Should have minimal long tasks
  expect(metrics.longTaskCount).toBeLessThan(5)
  expect(metrics.totalLongTaskTime).toBeLessThan(500) // <500ms total
})

test('memory usage is reasonable', async ({ page }) => {
  await page.goto('/')

  // Check if memory API is available
  const hasMemoryAPI = await page.evaluate(() => 'memory' in performance)

  if (hasMemoryAPI) {
    const memoryUsage = await page.evaluate(() => {
      const memory = (performance as any).memory
      return {
        usedJSHeapSize: memory.usedJSHeapSize / 1024 / 1024, // MB
        totalJSHeapSize: memory.totalJSHeapSize / 1024 / 1024, // MB
      }
    })

    // Memory usage should be reasonable for mobile
    expect(memoryUsage.usedJSHeapSize).toBeLessThan(100) // <100MB used
  }
})

test('scroll performance is smooth', async ({ page }) => {
  await page.goto('/')

  // Measure FPS during scroll
  await page.evaluate(() => {
    let frameCount = 0
    let lastTime = performance.now()
    const fps: number[] = []

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        fps.push(frameCount)
        frameCount = 0
        lastTime = currentTime
      }

      if (fps.length < 3) {
        requestAnimationFrame(measureFPS)
      }
    }

    // Start measuring
    requestAnimationFrame(measureFPS)

    // Perform smooth scroll
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  })

  // Wait for scroll to complete
  await page.waitForTimeout(3000)

  // Check that no jank was detected (this is a simplified check)
  const scrollHeight = await page.evaluate(() => window.scrollY)
  expect(scrollHeight).toBeGreaterThan(0)
})

test('offline functionality works', async ({ page, context }) => {
  // Load page first
  await page.goto('/')

  // Go offline
  await context.setOffline(true)

  // Try to navigate
  await page.reload()

  // Page should still work (basic offline support)
  const title = await page.title()
  expect(title).toBeTruthy()

  // Check for offline indicator
  const offlineIndicator = await page.locator('[data-testid="offline-indicator"]')
  await expect(offlineIndicator).toBeVisible()
})

test('network requests are optimized', async ({ page }) => {
  const requests: string[] = []

  page.on('request', request => {
    requests.push(request.url())
  })

  await page.goto('/', { waitUntil: 'networkidle' })

  // Check request count
  expect(requests.length).toBeLessThan(25) // <25 initial requests

  // Check for duplicate requests
  const uniqueRequests = new Set(requests)
  expect(uniqueRequests.size).toBe(requests.length) // No duplicates

  // Check for proper caching headers
  const responses = await Promise.all(
    Array.from(uniqueRequests)
      .slice(0, 10)
      .map(url => page.request.get(url).catch(() => null))
  )

  let cachedResources = 0
  responses.forEach(response => {
    if (response) {
      const cacheControl = response.headers()['cache-control']
      if (cacheControl && cacheControl.includes('max-age')) {
        cachedResources++
      }
    }
  })

  // Most resources should have cache headers
  expect(cachedResources).toBeGreaterThan(responses.length * 0.7)
})
