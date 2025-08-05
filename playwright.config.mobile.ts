import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/mobile',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/mobile-results.json' }],
    ['junit', { outputFile: 'test-results/mobile-junit.xml' }],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Mobile Safari SE',
      use: { ...devices['iPhone SE'] },
    },

    // Tablets
    {
      name: 'iPad Mini',
      use: { ...devices['iPad Mini'] },
    },
    {
      name: 'iPad Pro',
      use: { ...devices['iPad Pro'] },
    },

    // Mobile browsers on desktop for comparison
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'], viewport: { width: 375, height: 667 } },
    },

    // Accessibility testing
    {
      name: 'Mobile Accessibility',
      use: {
        ...devices['iPhone 13'],
        // Enable accessibility testing features
        bypassCSP: true,
        javaScriptEnabled: true,
      },
    },

    // Performance testing on slower devices
    {
      name: 'Slow 3G',
      use: {
        ...devices['Pixel 5'],
        // Simulate slow 3G
        offline: false,
        // @ts-expect-error - Playwright types might not include these
        downloadThroughput: (1.6 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
        latency: 150,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
