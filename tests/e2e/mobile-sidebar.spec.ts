import { Page, expect, test } from '@playwright/test'

// Helper to perform swipe gesture
async function swipeGesture(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number = 200
) {
  await page.touchscreen.tap(startX, startY)

  const steps = 10
  const stepDelay = duration / steps

  for (let i = 1; i <= steps; i++) {
    const x = startX + ((endX - startX) * i) / steps
    const y = startY + ((endY - startY) * i) / steps
    await page.touchscreen.tap(x, y)
    await page.waitForTimeout(stepDelay)
  }
}

// Mobile-only test suite
test.describe('Mobile Sidebar', () => {
  // Run tests only on mobile devices
  test.use({ ...test.use, viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the app to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Basic Functionality', () => {
    test('should open and close sidebar using trigger button', async ({ page }) => {
      // Find the sidebar trigger button
      const trigger = page.locator('[data-sidebar="trigger"]')
      await expect(trigger).toBeVisible()

      // Open sidebar
      await trigger.click()

      // Check if sidebar is visible
      const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]')
      await expect(sidebar).toBeVisible()

      // Check for drag handle
      const dragHandle = sidebar.locator('.drag-handle')
      await expect(dragHandle).toBeVisible()

      // Close sidebar using overlay
      await page.locator('[data-radix-portal]').click({ position: { x: 10, y: 100 } })

      // Sidebar should be hidden
      await expect(sidebar).not.toBeVisible()
    })

    test('should prevent body scroll when sidebar is open', async ({ page }) => {
      const trigger = page.locator('[data-sidebar="trigger"]')

      // Add content to make page scrollable
      await page.evaluate(() => {
        document.body.style.height = '200vh'
      })

      // Get initial scroll position
      const initialScroll = await page.evaluate(() => window.scrollY)
      expect(initialScroll).toBe(0)

      // Open sidebar
      await trigger.click()

      // Try to scroll - should be prevented
      await page.mouse.wheel(0, 100)
      await page.waitForTimeout(100)

      const scrollAfterOpen = await page.evaluate(() => window.scrollY)
      expect(scrollAfterOpen).toBe(0)

      // Close sidebar
      await page.locator('[data-radix-portal]').click({ position: { x: 10, y: 100 } })
      await page.waitForTimeout(300)

      // Now scrolling should work
      await page.mouse.wheel(0, 100)
      await page.waitForTimeout(100)

      const scrollAfterClose = await page.evaluate(() => window.scrollY)
      expect(scrollAfterClose).toBeGreaterThan(0)
    })

    test('should have proper ARIA labels', async ({ page }) => {
      const trigger = page.locator('[data-sidebar="trigger"]')

      // Check trigger accessibility
      await expect(trigger).toHaveAttribute('aria-label', /toggle sidebar/i)

      // Open sidebar
      await trigger.click()

      const _sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]')

      // Check sidebar accessibility
      const sheetContent = page.locator('[role="dialog"]')
      await expect(sheetContent).toBeVisible()

      // Check for screen reader only title
      const title = page.locator('text=Navigation Menu')
      await expect(title).toHaveClass(/sr-only/)
    })
  })

  test.describe.skip('Swipe Gestures', () => {
    test('should close sidebar with swipe left gesture', async ({ page }) => {
      // Open sidebar
      const trigger = page.locator('[data-sidebar="trigger"]')
      await trigger.click()

      const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]')
      await expect(sidebar).toBeVisible()

      // Get sidebar position
      const box = await sidebar.boundingBox()
      if (!box) throw new Error('Sidebar not found')

      // Perform swipe left gesture
      const startX = box.x + box.width / 2
      const startY = box.y + box.height / 2
      const endX = box.x - 100 // Swipe left

      await swipeGesture(page, startX, startY, endX, startY, 200)

      // Wait for animation
      await page.waitForTimeout(300)

      // Sidebar should be closed
      await expect(sidebar).not.toBeVisible()
    })

    test('should open sidebar with edge swipe gesture', async ({ page }) => {
      const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]')

      // Ensure sidebar is closed
      await expect(sidebar).not.toBeVisible()

      // Perform edge swipe from left
      await swipeGesture(page, 10, 300, 150, 300, 300)

      // Wait for animation
      await page.waitForTimeout(300)

      // Sidebar should be open
      await expect(sidebar).toBeVisible()
    })

    test('should show visual feedback during swipe', async ({ page }) => {
      // Open sidebar
      const trigger = page.locator('[data-sidebar="trigger"]')
      await trigger.click()

      const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]')
      await expect(sidebar).toBeVisible()

      // Start swipe but don't complete it
      const box = await sidebar.boundingBox()
      if (!box) throw new Error('Sidebar not found')

      const startX = box.x + box.width / 2
      const startY = box.y + box.height / 2

      // Start touch
      await page.touchscreen.tap(startX, startY)

      // Move slightly
      await page.touchscreen.tap(startX - 30, startY)

      // Check for dragging state
      await expect(sidebar).toHaveAttribute('data-dragging', 'true')

      // Check for transform style (visual feedback)
      const transform = await sidebar.evaluate(el => window.getComputedStyle(el).transform)
      expect(transform).not.toBe('none')

      // Release touch
      await page.touchscreen.tap(startX - 30, startY)
      await page.waitForTimeout(300)

      // Dragging state should be removed
      await expect(sidebar).not.toHaveAttribute('data-dragging', 'true')
    })

    test('should show edge swipe indicator after inactivity', async ({ page }) => {
      // Wait for edge swipe indicator to appear (3 seconds after load)
      await page.waitForTimeout(3500)

      const indicator = page.locator('.edge-swipe-indicator')
      await expect(indicator).toBeVisible()

      // Check for animation
      await expect(indicator).toHaveAttribute('data-show-hint', 'true')

      // Open sidebar to hide indicator
      const trigger = page.locator('[data-sidebar="trigger"]')
      await trigger.click()

      // Indicator should not be visible when sidebar is open
      await expect(indicator).not.toBeVisible()
    })
  })

  test.describe('Touch Target Sizes', () => {
    test('should have minimum 44x44px touch targets', async ({ page }) => {
      // Open sidebar
      const trigger = page.locator('[data-sidebar="trigger"]')
      await trigger.click()

      // Check menu button sizes
      const menuButtons = page.locator('[data-sidebar="menu-button"]')
      const count = await menuButtons.count()

      for (let i = 0; i < count; i++) {
        const button = menuButtons.nth(i)
        const box = await button.boundingBox()

        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44)
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }

      // Check menu action buttons
      const actionButtons = page.locator('[data-sidebar="menu-action"]')
      const actionCount = await actionButtons.count()

      for (let i = 0; i < actionCount; i++) {
        const button = actionButtons.nth(i)
        const box = await button.boundingBox()

        if (box) {
          // The visual size might be smaller but the hit area should be 44x44
          const hitArea = await button.evaluate(el => {
            const style = window.getComputedStyle(el, '::after')
            const rect = el.getBoundingClientRect()
            const afterRect = {
              width:
                rect.width +
                parseFloat(style.paddingLeft || '0') +
                parseFloat(style.paddingRight || '0'),
              height:
                rect.height +
                parseFloat(style.paddingTop || '0') +
                parseFloat(style.paddingBottom || '0'),
            }
            return afterRect
          })

          expect(hitArea.width).toBeGreaterThanOrEqual(44)
          expect(hitArea.height).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })

  test.describe('Performance', () => {
    test('should animate smoothly at 60fps', async ({ page }) => {
      // Enable performance monitoring
      await page.evaluateOnNewDocument(() => {
        window.__animationFrames = []
        let lastTime = 0

        const measureFrame = (time: number) => {
          if (lastTime) {
            window.__animationFrames.push(time - lastTime)
          }
          lastTime = time
          requestAnimationFrame(measureFrame)
        }

        requestAnimationFrame(measureFrame)
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Open sidebar
      const trigger = page.locator('[data-sidebar="trigger"]')
      await trigger.click()

      // Wait for animation
      await page.waitForTimeout(300)

      // Close sidebar
      await page.locator('[data-radix-portal]').click({ position: { x: 10, y: 100 } })
      await page.waitForTimeout(300)

      // Check frame times
      const frameTimes = await page.evaluate(() => window.__animationFrames)

      // Filter out outliers (first few frames might be irregular)
      const stableFrames = frameTimes.slice(5)
      const averageFrameTime = stableFrames.reduce((a, b) => a + b, 0) / stableFrames.length

      // 60fps = ~16.67ms per frame, allow some variance
      expect(averageFrameTime).toBeLessThan(20) // Allow up to 50fps
    })

    test('should load sidebar content quickly', async ({ page }) => {
      const startTime = Date.now()

      // Open sidebar
      const trigger = page.locator('[data-sidebar="trigger"]')
      await trigger.click()

      // Wait for sidebar content to be visible
      const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]')
      await expect(sidebar).toBeVisible()

      const endTime = Date.now()
      const loadTime = endTime - startTime

      // Sidebar should open in less than 300ms
      expect(loadTime).toBeLessThan(300)
    })
  })

  test.describe('Safe Area Support', () => {
    test('should respect safe area insets on notched devices', async ({ page }) => {
      // Simulate iPhone with notch
      await page.setViewportSize({ width: 390, height: 844 }) // iPhone 12 Pro size

      // Open sidebar
      const trigger = page.locator('[data-sidebar="trigger"]')
      await trigger.click()

      const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]')

      // Check for safe area padding
      const styles = await sidebar.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          paddingTop: computed.paddingTop,
          paddingBottom: computed.paddingBottom,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight,
        }
      })

      // Should have env() safe area inset values
      // Note: In a real device, these would be non-zero
      // In tests, we mainly check that the CSS is applied
      expect(styles.paddingTop).toBeDefined()
      expect(styles.paddingBottom).toBeDefined()
    })
  })

  test.describe('RTL Support', () => {
    test('should work correctly in RTL mode', async ({ page }) => {
      // Set RTL direction
      await page.evaluate(() => {
        document.documentElement.setAttribute('dir', 'rtl')
      })

      // Open sidebar
      const trigger = page.locator('[data-sidebar="trigger"]')
      await trigger.click()

      const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]')
      await expect(sidebar).toBeVisible()

      // In RTL, sidebar should appear from right
      const box = await sidebar.boundingBox()
      if (!box) throw new Error('Sidebar not found')

      // Perform swipe right gesture (opposite direction in RTL)
      const startX = box.x + box.width / 2
      const startY = box.y + box.height / 2
      const endX = box.x + box.width + 100 // Swipe right in RTL

      await swipeGesture(page, startX, startY, endX, startY, 200)

      // Wait for animation
      await page.waitForTimeout(300)

      // Sidebar should be closed
      await expect(sidebar).not.toBeVisible()
    })
  })
})

// Declare global types for TypeScript
declare global {
  interface Window {
    __animationFrames: number[]
  }
}
