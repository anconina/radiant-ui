import { Page, expect, test } from '@playwright/test'

// Helper function to login
async function login(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('name@example.com').fill('demo@example.com')
  await page.getByPlaceholder('Enter your password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')
}

test.describe('Dashboard Features', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display dashboard overview', async ({ page }) => {
    // Check dashboard elements
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Welcome back,')).toBeVisible()

    // Check stats cards
    await expect(page.getByText('Total Revenue')).toBeVisible()
    await expect(page.getByText('Active Users')).toBeVisible()
    await expect(page.getByText('Sales')).toBeVisible()
    await expect(page.getByText('Performance')).toBeVisible()
  })

  test('should display recent activity', async ({ page }) => {
    // Check recent activity section
    await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible()

    // Check if activity items are displayed
    const activityItems = page.locator('[data-testid="activity-item"]')
    await expect(activityItems).toHaveCount(5)
  })

  test('should navigate to different sections via sidebar', async ({ page }) => {
    // Click on Users in sidebar
    await page.getByRole('link', { name: 'Users' }).click()
    await page.waitForURL('/users')
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()

    // Click on Settings
    await page.getByRole('link', { name: 'Settings' }).click()
    await page.waitForURL('/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    // Go back to Dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await page.waitForURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should toggle theme between light and dark mode', async ({ page }) => {
    // Get initial theme
    const initialTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    )

    // Click theme toggle
    await page.getByRole('button', { name: /toggle theme/i }).click()

    // Check theme changed
    const newTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(newTheme).toBe(!initialTheme)

    // Toggle back
    await page.getByRole('button', { name: /toggle theme/i }).click()

    // Check theme restored
    const restoredTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    )
    expect(restoredTheme).toBe(initialTheme)
  })

  test('should show user menu with profile options', async ({ page }) => {
    // Click on user avatar/menu
    await page.getByRole('button', { name: /user menu/i }).click()

    // Check menu items
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()

    // Click profile
    await page.getByRole('menuitem', { name: 'Profile' }).click()
    await page.waitForURL('/profile')
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  })
})

test.describe('Data Table Features', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    // Navigate to a page with data table (assuming users page has one)
    await page.goto('/users')
  })

  test('should display data table with pagination', async ({ page }) => {
    // Check table is visible
    await expect(page.getByRole('table')).toBeVisible()

    // Check pagination controls
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible()
    await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible()
  })

  test('should sort table columns', async ({ page }) => {
    // Get initial first row data
    const firstRowInitial = await page.locator('tbody tr').first().textContent()

    // Click on a sortable column header (e.g., Name)
    await page.getByRole('columnheader', { name: 'Name' }).click()

    // Get first row after sorting
    const firstRowAfterSort = await page.locator('tbody tr').first().textContent()

    // Check that order changed
    expect(firstRowInitial).not.toBe(firstRowAfterSort)
  })

  test('should filter table data', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('tbody tr').count()

    // Type in search/filter input
    await page.getByPlaceholder('Search...').fill('admin')

    // Get filtered row count
    const filteredRows = await page.locator('tbody tr').count()

    // Check that filtering reduced rows
    expect(filteredRows).toBeLessThan(initialRows)
  })

  test('should navigate through pages', async ({ page }) => {
    // Check we're on page 1
    await expect(page.getByText('Page 1 of')).toBeVisible()

    // Click next
    await page.getByRole('button', { name: 'Next' }).click()

    // Check we're on page 2
    await expect(page.getByText('Page 2 of')).toBeVisible()

    // Click previous
    await page.getByRole('button', { name: 'Previous' }).click()

    // Check we're back on page 1
    await expect(page.getByText('Page 1 of')).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check hamburger menu is visible
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible()

    // Click hamburger menu
    await page.getByRole('button', { name: /menu/i }).click()

    // Check mobile menu is open
    await expect(page.getByRole('navigation')).toBeVisible()

    // Click a link
    await page.getByRole('link', { name: 'Settings' }).click()

    // Check navigation happened and menu closed
    await page.waitForURL('/settings')
    await expect(page.getByRole('navigation')).not.toBeVisible()
  })

  test('should adapt layout for tablet screens', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Check sidebar is in collapsed state
    const sidebarWidth = await page.locator('aside').evaluate(el => el.offsetWidth)
    expect(sidebarWidth).toBeLessThan(100) // Collapsed width

    // Hover or click to expand
    await page.locator('aside').hover()

    // Check sidebar expanded
    const expandedWidth = await page.locator('aside').evaluate(el => el.offsetWidth)
    expect(expandedWidth).toBeGreaterThan(200) // Expanded width
  })
})

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show error boundary on component error', async ({ page }) => {
    // Navigate to a page that triggers an error (you'd need to implement this)
    await page.goto('/dashboard?error=true')

    // Check error boundary is displayed
    await expect(page.getByText(/Something went wrong/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Try again/i })).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/users', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      })
    })

    // Navigate to users page
    await page.goto('/users')

    // Check error message is displayed
    await expect(page.getByText(/Failed to load users/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Retry/i })).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load dashboard quickly', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/login')
    await page.getByPlaceholder('name@example.com').fill('demo@example.com')
    await page.getByPlaceholder('Enter your password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Wait for dashboard to be fully loaded
    await page.waitForURL('/dashboard')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should lazy load routes', async ({ page }) => {
    await login(page)

    // Monitor network requests
    const requests: string[] = []
    page.on('request', request => {
      if (request.url().includes('.js')) {
        requests.push(request.url())
      }
    })

    // Navigate to settings (should be lazy loaded)
    await page.goto('/settings')

    // Check that settings chunk was loaded
    const settingsChunk = requests.find(url => url.includes('settings') || url.includes('chunk'))
    expect(settingsChunk).toBeTruthy()
  })
})
