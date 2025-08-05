import { devices, expect, test } from '@playwright/test'
import { checkA11y, injectAxe } from 'axe-playwright'

// Use mobile device
test.use(devices['iPhone 13'])

test.describe('Mobile Accessibility Tests', () => {
  test('home page passes axe accessibility checks', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)

    // Check for accessibility violations
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    })
  })

  test('all interactive elements have proper labels', async ({ page }) => {
    await page.goto('/')

    // Check buttons
    const buttons = await page.locator('button').all()
    for (const button of buttons) {
      const label = await button.getAttribute('aria-label')
      const text = await button.textContent()
      const hasLabel = label || text?.trim()

      expect(hasLabel).toBeTruthy()
    }

    // Check links
    const links = await page.locator('a').all()
    for (const link of links) {
      const label = await link.getAttribute('aria-label')
      const text = await link.textContent()
      const hasLabel = label || text?.trim()

      expect(hasLabel).toBeTruthy()
    }

    // Check form inputs
    const inputs = await page.locator('input, textarea, select').all()
    for (const input of inputs) {
      const label = await input.getAttribute('aria-label')
      const labelledBy = await input.getAttribute('aria-labelledby')
      const id = await input.getAttribute('id')

      // Check if there's a label element
      let hasLabel = !!(label || labelledBy)
      if (id && !hasLabel) {
        const labelElement = await page.locator(`label[for="${id}"]`).count()
        hasLabel = labelElement > 0
      }

      expect(hasLabel).toBeTruthy()
    }
  })

  test('focus management works correctly', async ({ page }) => {
    await page.goto('/')

    // Open modal/dialog
    await page.locator('[data-testid="open-modal"]').click()

    // Check focus is trapped in modal
    const modalFirstFocusable = await page
      .locator('[data-testid="modal"] button, [data-testid="modal"] a, [data-testid="modal"] input')
      .first()
    await expect(modalFirstFocusable).toBeFocused()

    // Tab through elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should cycle back to first element
    await page.keyboard.press('Tab')
    await expect(modalFirstFocusable).toBeFocused()

    // Close modal
    await page.keyboard.press('Escape')

    // Focus should return to trigger
    const trigger = await page.locator('[data-testid="open-modal"]')
    await expect(trigger).toBeFocused()
  })

  test('touch targets meet minimum size requirements', async ({ page }) => {
    await page.goto('/')

    const interactiveElements = await page
      .locator('button, a, input, select, textarea, [role="button"], [role="link"]')
      .all()

    for (const element of interactiveElements) {
      const box = await element.boundingBox()
      if (box) {
        // WCAG requires 44x44px minimum
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('/')

    // Use axe for contrast checking
    await injectAxe(page)
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
  })

  test('page has proper heading structure', async ({ page }) => {
    await page.goto('/')

    // Check for h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    let lastLevel = 0

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName)
      const level = parseInt(tagName.substring(1))

      // Heading levels shouldn't skip (e.g., h1 -> h3)
      if (lastLevel > 0) {
        expect(level).toBeLessThanOrEqual(lastLevel + 1)
      }

      lastLevel = level
    }
  })

  test('images have alt text', async ({ page }) => {
    await page.goto('/')

    const images = await page.locator('img').all()

    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')

      // Images should have alt text or role="presentation" for decorative images
      const hasAccessibleMarkup = alt !== null || role === 'presentation'
      expect(hasAccessibleMarkup).toBeTruthy()
    }
  })

  test('forms are properly labeled', async ({ page }) => {
    await page.goto('/settings')

    // Check all form fields
    const formFields = await page.locator('input, textarea, select').all()

    for (const field of formFields) {
      const id = await field.getAttribute('id')
      const ariaLabel = await field.getAttribute('aria-label')
      const ariaLabelledBy = await field.getAttribute('aria-labelledby')

      // Check for associated label
      let hasLabel = !!(ariaLabel || ariaLabelledBy)

      if (id && !hasLabel) {
        const label = await page.locator(`label[for="${id}"]`).count()
        hasLabel = label > 0
      }

      expect(hasLabel).toBeTruthy()

      // Check for error messages
      const ariaDescribedBy = await field.getAttribute('aria-describedby')
      const ariaInvalid = await field.getAttribute('aria-invalid')

      if (ariaInvalid === 'true') {
        expect(ariaDescribedBy).toBeTruthy()
      }
    }
  })

  test('keyboard navigation works throughout the app', async ({ page }) => {
    await page.goto('/')

    // Tab through main navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Continue tabbing and ensure focus is visible
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const focusedElement = await page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Check focus indicator is visible
      const outline = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.outline || styles.boxShadow
      })

      expect(outline).not.toBe('none')
    }
  })

  test('ARIA landmarks are properly used', async ({ page }) => {
    await page.goto('/')

    // Check for main landmarks
    const landmarks = {
      header: await page.locator('header, [role="banner"]').count(),
      nav: await page.locator('nav, [role="navigation"]').count(),
      main: await page.locator('main, [role="main"]').count(),
      footer: await page.locator('footer, [role="contentinfo"]').count(),
    }

    // Should have exactly one of each main landmark
    expect(landmarks.header).toBe(1)
    expect(landmarks.nav).toBeGreaterThanOrEqual(1)
    expect(landmarks.main).toBe(1)
    expect(landmarks.footer).toBe(1)
  })

  test('live regions announce dynamic changes', async ({ page }) => {
    await page.goto('/')

    // Trigger an action that causes a live region update
    await page.locator('[data-testid="submit-form"]').click()

    // Check for live region
    const liveRegion = await page.locator(
      '[aria-live="polite"], [aria-live="assertive"], [role="status"], [role="alert"]'
    )
    await expect(liveRegion).toBeVisible()

    // Check content is not empty
    const content = await liveRegion.textContent()
    expect(content?.trim()).not.toBe('')
  })

  test('reduced motion is respected', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    // Check that animations are disabled
    const animatedElements = await page.locator('[class*="animate"], [class*="transition"]').all()

    for (const element of animatedElements) {
      const animationDuration = await element.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.animationDuration || styles.transitionDuration
      })

      // Animations should be instant or very short with reduced motion
      expect(animationDuration).toMatch(/^(0s|0ms|[0-9.]+ms)$/)
    }
  })

  test('screen reader text is properly hidden', async ({ page }) => {
    await page.goto('/')

    // Check sr-only elements
    const srOnlyElements = await page.locator('.sr-only').all()

    for (const element of srOnlyElements) {
      // Should be hidden visually but available to screen readers
      const isVisible = await element.isVisible()
      expect(isVisible).toBeFalsy()

      // Should have content
      const content = await element.textContent()
      expect(content?.trim()).not.toBe('')
    }
  })

  test('mobile-specific accessibility features work', async ({ page }) => {
    await page.goto('/')

    // Test swipe gesture announcements
    const sidebar = await page.locator('[data-testid="sidebar"]')

    // Simulate swipe
    const box = await sidebar.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + 10, box.y + box.height / 2)
      await page.mouse.up()

      // Check for gesture announcement
      const announcement = await page.locator('[role="status"]').last()
      const text = await announcement.textContent()
      expect(text).toContain('closed') // or similar announcement
    }
  })

  test('error messages are accessible', async ({ page }) => {
    await page.goto('/settings')

    // Submit invalid form
    await page.locator('input[type="email"]').fill('invalid-email')
    await page.locator('button[type="submit"]').click()

    // Check error message
    const errorMessage = await page.locator('[role="alert"], [aria-live="assertive"]').first()
    await expect(errorMessage).toBeVisible()

    // Check field is marked invalid
    const emailInput = await page.locator('input[type="email"]')
    const ariaInvalid = await emailInput.getAttribute('aria-invalid')
    expect(ariaInvalid).toBe('true')

    // Check field is described by error
    const describedBy = await emailInput.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()

    // Check error message has matching ID
    const errorId = await errorMessage.getAttribute('id')
    expect(describedBy).toContain(errorId)
  })
})
