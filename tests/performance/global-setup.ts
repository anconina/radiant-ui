import { FullConfig, chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * Global setup for performance tests
 * Prepares baseline measurements and test environment
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up performance testing environment...')

  // Create performance results directory
  const resultsDir = path.resolve('./performance-test-results')
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }

  try {
    // Launch browser for warmup
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    console.log('🔥 Warming up application...')

    // Warmup requests to avoid cold start effects
    const baseURL = config.projects[0].use?.baseURL || 'http://localhost:5173'

    try {
      await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(2000) // Let everything settle

      // Navigate to key pages to warm up
      const warmupPages = ['/dashboard', '/profile', '/settings']

      for (const pagePath of warmupPages) {
        try {
          await page.goto(`${baseURL}${pagePath}`, { waitUntil: 'networkidle', timeout: 15000 })
          await page.waitForTimeout(1000)
        } catch (error) {
          console.log(`⚠️  Could not warm up ${pagePath}:`, error.message)
        }
      }

      console.log('✅ Application warmup completed')
    } catch (error) {
      console.warn('⚠️  Application warmup failed:', error.message)
    } finally {
      await browser.close()
    }

    // Create baseline performance file if it doesn't exist
    const baselinePath = path.resolve('./performance-baseline.json')
    if (!fs.existsSync(baselinePath)) {
      const baseline = {
        created: new Date().toISOString(),
        thresholds: {
          lcp: 2500,
          fid: 100,
          cls: 0.1,
          fcp: 1800,
          ttfb: 800,
          domLoad: 3000,
          fullLoad: 5000,
        },
        measurements: {},
      }

      fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2))
      console.log('📊 Created performance baseline file')
    }

    // Clear performance cache if needed
    const perfCachePath = path.resolve('./performance-cache.json')
    if (process.env.CLEAR_PERF_CACHE === 'true' && fs.existsSync(perfCachePath)) {
      fs.unlinkSync(perfCachePath)
      console.log('🧹 Cleared performance cache')
    }

    console.log('✅ Performance testing environment ready')
  } catch (error) {
    console.error('❌ Performance setup failed:', error)
    throw error
  }
}

export default globalSetup
