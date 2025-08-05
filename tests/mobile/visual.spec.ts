import { devices, expect, test } from '@playwright/test'

// Test visual consistency across different mobile devices
const mobileDevices = [
  { name: 'iPhone-SE', device: devices['iPhone SE'] },
  { name: 'iPhone-13', device: devices['iPhone 13'] },
  { name: 'Pixel-5', device: devices['Pixel 5'] },
  { name: 'Galaxy-S9', device: devices['Galaxy S9+'] },
  { name: 'iPad-Mini', device: devices['iPad Mini'] },
  { name: 'iPad-Pro', device: devices['iPad Pro'] },
]

// Pages to test
const pages = [
  { path: '/', name: 'home' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/settings', name: 'settings' },
  { path: '/profile', name: 'profile' },
]

// Test each page on each device
mobileDevices.forEach(({ name, device }) => {
  test.describe(`Visual tests on ${name}`, () => {
    test.use(device)

    pages.forEach(({ path, name: pageName }) => {
      test(`${pageName} page matches snapshot`, async ({ page }) => {
        await page.goto(path)

        // Wait for animations to complete
        await page.waitForTimeout(500)

        // Take screenshot
        await expect(page).toHaveScreenshot(`${name}-${pageName}.png`, {
          fullPage: true,
          animations: 'disabled',
        })
      })
    })
  })
})

// Test specific UI components
test.describe('Component visual tests', () => {
  test.use(devices['iPhone 13'])

  test('mobile navigation states', async ({ page }) => {
    await page.goto('/')

    // Closed sidebar
    await expect(page.locator('[data-testid="app-shell"]')).toHaveScreenshot(
      'navigation-closed.png'
    )

    // Open sidebar
    await page.locator('[data-testid="menu-trigger"]').click()
    await page.waitForTimeout(300) // Wait for animation
    await expect(page.locator('[data-testid="app-shell"]')).toHaveScreenshot('navigation-open.png')
  })

  test('form components', async ({ page }) => {
    await page.goto('/settings')

    // Normal state
    await expect(page.locator('form')).toHaveScreenshot('form-normal.png')

    // Focus state
    await page.locator('input[type="email"]').first().focus()
    await expect(page.locator('form')).toHaveScreenshot('form-focused.png')

    // Error state
    await page.locator('input[type="email"]').first().fill('invalid-email')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(100)
    await expect(page.locator('form')).toHaveScreenshot('form-error.png')
  })

  test('card layouts', async ({ page }) => {
    await page.goto('/dashboard')

    // Mobile card stack
    await expect(page.locator('[data-testid="card-grid"]')).toHaveScreenshot('cards-mobile.png')

    // Tablet grid
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('[data-testid="card-grid"]')).toHaveScreenshot('cards-tablet.png')
  })

  test('responsive tables', async ({ page }) => {
    await page.goto('/dashboard')

    const table = page.locator('[data-testid="responsive-table"]')

    // Mobile card view
    await expect(table).toHaveScreenshot('table-mobile.png')

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(table).toHaveScreenshot('table-tablet.png')
  })
})

// Test dark mode
test.describe('Dark mode visual tests', () => {
  test.use({
    ...devices['iPhone 13'],
    colorScheme: 'dark',
  })

  pages.forEach(({ path, name }) => {
    test(`${name} page in dark mode`, async ({ page }) => {
      await page.goto(path)
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot(`dark-${name}.png`, { fullPage: true })
    })
  })
})

// Test landscape orientation
test.describe('Landscape visual tests', () => {
  test.use({
    ...devices['iPhone 13 landscape'],
  })

  test('home page in landscape', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('landscape-home.png', {
      fullPage: true,
    })
  })

  test('navigation in landscape', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="menu-trigger"]').click()
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('landscape-navigation.png')
  })
})

// Test high contrast mode
test.describe('Accessibility visual tests', () => {
  test.use(devices['iPhone 13'])

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await expect(page).toHaveScreenshot('focus-first-element.png')

    await page.keyboard.press('Tab')
    await expect(page).toHaveScreenshot('focus-second-element.png')
  })

  test('high contrast mode', async ({ page }) => {
    // Emulate high contrast
    await page.emulateMedia({ forcedColors: 'active' })
    await page.goto('/')

    await expect(page).toHaveScreenshot('high-contrast.png', {
      fullPage: true,
    })
  })
})

// Test loading states
test.describe('Loading state visual tests', () => {
  test.use(devices['iPhone 13'])

  test('skeleton screens', async ({ page }) => {
    // Intercept API calls to simulate loading
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 2000)
    })

    await page.goto('/dashboard')

    // Capture skeleton state
    await expect(page).toHaveScreenshot('skeleton-loading.png')

    // Wait for content
    await page.waitForSelector('[data-testid="content-loaded"]', {
      timeout: 5000,
    })
    await expect(page).toHaveScreenshot('content-loaded.png')
  })
})

// Test animation states
test.describe('Animation visual tests', () => {
  test.use(devices['iPhone 13'])

  test('page transitions', async ({ page }) => {
    await page.goto('/')

    // Capture initial state
    await expect(page).toHaveScreenshot('transition-start.png')

    // Navigate to trigger transition
    await page.locator('a[href="/dashboard"]').click()

    // Capture mid-transition (if possible)
    await page.waitForTimeout(150)
    await expect(page).toHaveScreenshot('transition-mid.png')

    // Capture end state
    await page.waitForSelector('[data-testid="dashboard-content"]')
    await expect(page).toHaveScreenshot('transition-end.png')
  })

  test('gesture feedback', async ({ page }) => {
    await page.goto('/')

    const sidebar = page.locator('[data-testid="sidebar"]')

    // Start swipe
    const box = await sidebar.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)

      // Capture mid-swipe
      await expect(page).toHaveScreenshot('swipe-progress.png')

      await page.mouse.up()
    }
  })
})
