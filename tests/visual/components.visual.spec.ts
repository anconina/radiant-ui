import { expect, test } from '@playwright/test'

/**
 * Visual regression tests for UI components
 * Tests visual consistency across different states and themes
 */

test.describe('Component Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component showcase page
    await page.goto('/components')

    // Wait for all fonts and images to load
    await page.waitForLoadState('networkidle')

    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    })
  })

  test('Button Component Variants', async ({ page }) => {
    // Navigate to button showcase
    await page.goto('/components/buttons')

    // Wait for components to render
    await page.waitForSelector('[data-testid="button-showcase"]')

    // Take screenshot of all button variants
    await expect(page.locator('[data-testid="button-showcase"]')).toHaveScreenshot(
      'buttons-all-variants.png'
    )

    // Test button hover states
    await page.hover('[data-testid="primary-button"]')
    await expect(page.locator('[data-testid="primary-button"]')).toHaveScreenshot(
      'button-primary-hover.png'
    )

    // Test button focus states
    await page.focus('[data-testid="secondary-button"]')
    await expect(page.locator('[data-testid="secondary-button"]')).toHaveScreenshot(
      'button-secondary-focus.png'
    )
  })

  test('Form Components', async ({ page }) => {
    await page.goto('/components/forms')

    // Wait for form components to render
    await page.waitForSelector('[data-testid="form-showcase"]')

    // Test various form states
    await expect(page.locator('[data-testid="form-showcase"]')).toHaveScreenshot(
      'forms-default-state.png'
    )

    // Test form validation states
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.blur('[data-testid="email-input"]')
    await expect(page.locator('[data-testid="form-showcase"]')).toHaveScreenshot(
      'forms-validation-error.png'
    )

    // Test form success states
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.blur('[data-testid="email-input"]')
    await expect(page.locator('[data-testid="form-showcase"]')).toHaveScreenshot(
      'forms-validation-success.png'
    )
  })

  test('Card Components', async ({ page }) => {
    await page.goto('/components/cards')

    await page.waitForSelector('[data-testid="card-showcase"]')

    // Test different card layouts
    await expect(page.locator('[data-testid="card-showcase"]')).toHaveScreenshot(
      'cards-all-variants.png'
    )

    // Test responsive card layout
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('[data-testid="card-showcase"]')).toHaveScreenshot(
      'cards-tablet-layout.png'
    )

    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="card-showcase"]')).toHaveScreenshot(
      'cards-mobile-layout.png'
    )
  })

  test('Dark Theme Consistency', async ({ page }) => {
    // Switch to dark theme
    await page.goto('/components')
    await page.click('[data-testid="theme-toggle"]')

    // Wait for theme transition
    await page.waitForTimeout(300)

    // Test components in dark theme
    await expect(page.locator('[data-testid="component-showcase"]')).toHaveScreenshot(
      'components-dark-theme.png'
    )

    // Test specific components in dark mode
    await page.goto('/components/buttons')
    await expect(page.locator('[data-testid="button-showcase"]')).toHaveScreenshot(
      'buttons-dark-theme.png'
    )
  })

  test('Loading States', async ({ page }) => {
    await page.goto('/components/loading')

    // Test various loading states
    await expect(page.locator('[data-testid="loading-showcase"]')).toHaveScreenshot(
      'loading-states.png'
    )

    // Test skeleton loading
    await page.click('[data-testid="skeleton-toggle"]')
    await expect(page.locator('[data-testid="skeleton-content"]')).toHaveScreenshot(
      'skeleton-loading.png'
    )
  })

  test('Accessibility States', async ({ page }) => {
    await page.goto('/components/accessibility')

    // Test high contrast mode
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(page.locator('[data-testid="accessibility-showcase"]')).toHaveScreenshot(
      'accessibility-reduced-motion.png'
    )

    // Test focus indicators
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveScreenshot('focus-indicator.png')
  })
})

test.describe('Layout Visual Regression', () => {
  test('Responsive Layouts', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-xl' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 375, height: 667, name: 'mobile' },
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`)
    }
  })

  test('Navigation States', async ({ page }) => {
    await page.goto('/dashboard')

    // Test navigation menu states
    await expect(page.locator('[data-testid="main-navigation"]')).toHaveScreenshot(
      'navigation-default.png'
    )

    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 })
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-navigation"]')).toHaveScreenshot(
      'navigation-mobile-open.png'
    )
  })
})
