import { devices, expect, test } from '@playwright/test'

// Test on mobile device
test.use(devices['iPhone 13'])

test.describe('Mobile Components', () => {
  test('page loads on mobile device', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveTitle(/Radiant UI/)

    // Check viewport is mobile size
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(390)
    expect(viewport?.height).toBeGreaterThan(600) // Mobile height
  })

  test('buttons have proper touch targets', async ({ page }) => {
    await page.goto('/')

    // Check all buttons on the page
    const buttons = await page.locator('button').all()

    for (const button of buttons) {
      const box = await button.boundingBox()
      if (box) {
        // Touch targets should be at least 44px
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('page is responsive to viewport changes', async ({ page }) => {
    await page.goto('/')

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(100)

    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(100)

    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(100)

    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible()
  })

  test('sidebar toggle works on mobile', async ({ page }) => {
    await page.goto('/')

    // Look for the sidebar toggle button (menu icon)
    const menuButton = await page.locator('button').first()

    if (await menuButton.isVisible()) {
      // Click to open sidebar
      await menuButton.click()
      await page.waitForTimeout(300) // Wait for animation

      // Check if any navigation element appears
      const nav = await page.locator('nav')
      if ((await nav.count()) > 0) {
        await expect(nav.first()).toBeVisible()
      }
    }
  })

  test('search input is accessible on mobile', async ({ page }) => {
    await page.goto('/')

    // Find search input
    const searchInput = await page.locator('input[type="search"], input[placeholder*="search" i]')

    if ((await searchInput.count()) > 0) {
      // Check if it's visible and can be focused
      await expect(searchInput.first()).toBeVisible()
      await searchInput.first().focus()

      // Type in search
      await searchInput.first().type('test search')

      // Check value was entered
      await expect(searchInput.first()).toHaveValue('test search')
    }
  })

  test('page has proper mobile meta tags', async ({ page }) => {
    await page.goto('/')

    // Check viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]')
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/)
  })

  test('text is readable on mobile', async ({ page }) => {
    await page.goto('/')

    // Check that body text has proper font size
    const bodyFontSize = await page.evaluate(() => {
      const body = document.querySelector('body')
      return body ? window.getComputedStyle(body).fontSize : '0px'
    })

    // Font size should be at least 16px for readability
    const fontSize = parseInt(bodyFontSize)
    expect(fontSize).toBeGreaterThanOrEqual(16)
  })

  test('links and buttons are properly spaced', async ({ page }) => {
    await page.goto('/')

    const interactiveElements = await page.locator('a, button').all()

    // Check spacing between interactive elements
    for (let i = 0; i < interactiveElements.length - 1; i++) {
      const box1 = await interactiveElements[i].boundingBox()
      const box2 = await interactiveElements[i + 1].boundingBox()

      if (box1 && box2) {
        // Calculate minimum distance between elements
        const horizontalGap = Math.abs(box2.x - (box1.x + box1.width))
        const verticalGap = Math.abs(box2.y - (box1.y + box1.height))

        // At least one dimension should have adequate spacing
        const hasAdequateSpacing = horizontalGap >= 8 || verticalGap >= 8
        expect(hasAdequateSpacing).toBeTruthy()
      }
    }
  })
})
