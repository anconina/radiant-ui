import { defineConfig, devices } from '@playwright/test'

/**
 * Performance testing configuration for Playwright
 * Specialized setup for performance regression testing
 */
export default defineConfig({
  testDir: './tests/performance',
  timeout: 60000, // 60 seconds for performance tests
  fullyParallel: false, // Run sequentially for consistent performance measurement
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Minimal retries for performance consistency
  workers: 1, // Single worker for consistent performance measurement
  
  reporter: [
    ['html', { outputFolder: 'performance-test-results' }],
    ['json', { outputFile: 'performance-test-results/results.json' }],
    ['junit', { outputFile: 'performance-test-results/results.xml' }],
  ],
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Performance-specific settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Disable some features for consistent performance measurement
    colorScheme: 'light', // Consistent theme
    reducedMotion: 'reduce', // Disable animations
    
    // Extra HTTP headers for performance testing
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'no-cache',
    },
  },

  projects: [
    {
      name: 'performance-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Simulate typical desktop conditions
        launchOptions: {
          args: [
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--no-sandbox',
          ],
        },
      },
    },
    
    {
      name: 'performance-mobile',
      use: {
        ...devices['Pixel 5'],
        // Mobile-specific performance settings
        launchOptions: {
          args: [
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--no-sandbox',
          ],
        },
      },
    },
    
    {
      name: 'performance-slow-network',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // This will be configured per test for network throttling
      },
    },
  ],

  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173', // Use preview server for production-like performance
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 minutes for build and start
  },
  
  // Global setup for performance testing
  globalSetup: require.resolve('./tests/performance/global-setup.ts'),
  globalTeardown: require.resolve('./tests/performance/global-teardown.ts'),
})