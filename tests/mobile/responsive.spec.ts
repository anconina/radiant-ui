import { devices, expect, test } from '@playwright/test'

// Test on iPhone 13
test.use(devices['iPhone 13'])

test('mobile navigation works', async ({ page }) => {
  await page.goto('/')

  // Check mobile menu is visible
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

  // Test swipe gesture
  await page.locator('[data-testid="sidebar"]').swipe('left')
  await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible()
})

// Test different viewports
const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 720 },
]

for (const viewport of viewports) {
  test(`layout adapts on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.screenshot({
      path: `screenshots/${viewport.name}.png`,
      fullPage: true,
    })
  })
}

// Test touch targets
test('touch targets meet minimum size', async ({ page }) => {
  await page.goto('/')

  const buttons = await page.locator('button').all()
  for (const button of buttons) {
    const box = await button.boundingBox()
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
  }
})

// Test responsive tables
test('tables transform to cards on mobile', async ({ page }) => {
  await page.goto('/dashboard')

  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 667 })
  const mobileTable = await page.locator('[data-testid="responsive-table"]')
  await expect(mobileTable).toHaveClass(/card-layout/)

  // Desktop viewport
  await page.setViewportSize({ width: 1280, height: 720 })
  await expect(mobileTable).not.toHaveClass(/card-layout/)
})

// Test mobile forms
test('forms are optimized for mobile', async ({ page }) => {
  await page.goto('/settings')

  // Check input heights
  const inputs = await page.locator('input[type="text"], input[type="email"]').all()
  for (const input of inputs) {
    const box = await input.boundingBox()
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(56)
    }
  }

  // Check floating labels
  const floatingLabels = await page.locator('[data-testid="floating-label"]').count()
  expect(floatingLabels).toBeGreaterThan(0)
})

// Test orientation changes
test('handles orientation changes gracefully', async ({ page }) => {
  await page.goto('/')

  // Portrait
  await page.setViewportSize({ width: 375, height: 667 })
  await page.screenshot({ path: 'screenshots/portrait.png' })

  // Landscape
  await page.setViewportSize({ width: 667, height: 375 })
  await page.screenshot({ path: 'screenshots/landscape.png' })

  // Verify layout adjusts
  const sidebar = await page.locator('[data-testid="sidebar"]')
  await expect(sidebar).toBeVisible()
})

// Test safe area support
test('respects safe areas on notched devices', async ({ page }) => {
  // iPhone 14 Pro with notch
  await page.setViewportSize({ width: 393, height: 852 })
  await page.goto('/')

  const header = await page.locator('header')
  const headerStyles = await header.evaluate(el => window.getComputedStyle(el).paddingTop)

  // Should have safe area padding
  expect(parseInt(headerStyles)).toBeGreaterThan(0)
})

// Test lazy loading
test('images lazy load on scroll', async ({ page }) => {
  await page.goto('/')

  // Get all lazy images
  const lazyImages = await page.locator('img[loading="lazy"]').all()
  expect(lazyImages.length).toBeGreaterThan(0)

  // Check first image is loaded
  const firstImage = lazyImages[0]
  await expect(firstImage).toHaveAttribute('src', /\.(jpg|png|webp)/)

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  // Check last image is now loaded
  const lastImage = lazyImages[lazyImages.length - 1]
  await expect(lastImage).toHaveAttribute('src', /\.(jpg|png|webp)/)
})

// Test mobile-specific features
test('mobile bottom navigation is functional', async ({ page }) => {
  await page.goto('/')

  const bottomNav = await page.locator('[data-testid="mobile-bottom-nav"]')
  await expect(bottomNav).toBeVisible()

  // Test navigation
  await bottomNav.locator('button:has-text("Profile")').click()
  await expect(page).toHaveURL(/\/profile/)

  // Test active state
  const activeButton = await bottomNav.locator('[data-active="true"]')
  await expect(activeButton).toHaveCount(1)
})

// Test hide-on-scroll behavior
test('header hides on scroll down, shows on scroll up', async ({ page }) => {
  await page.goto('/')

  const header = await page.locator('[data-testid="mobile-header"]')

  // Initial state - visible
  await expect(header).toBeVisible()

  // Scroll down - should hide
  await page.evaluate(() => window.scrollBy(0, 200))
  await page.waitForTimeout(300) // Wait for animation
  await expect(header).not.toBeVisible()

  // Scroll up - should show
  await page.evaluate(() => window.scrollBy(0, -100))
  await page.waitForTimeout(300) // Wait for animation
  await expect(header).toBeVisible()
})
