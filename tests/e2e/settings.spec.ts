import { Page, expect, test } from '@playwright/test'

// Helper function to login
async function login(page: Page) {
  await page.goto('/auth/login')
  await page.getByPlaceholder('m@example.com').fill('demo@example.com')
  await page.getByPlaceholder('Enter your password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')
}

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/settings')
  })

  test('should display settings sections', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    // Check settings tabs
    await expect(page.getByText('Appearance')).toBeVisible()
    await expect(page.getByText('Language')).toBeVisible()
    await expect(page.getByText('Notifications')).toBeVisible()
    await expect(page.getByText('Privacy')).toBeVisible()
  })

  test('should navigate between settings sections', async ({ page }) => {
    // Click notifications
    await page.getByRole('tab', { name: /Notifications/i }).click()
    await expect(page.getByText('Notification Preferences')).toBeVisible()

    // Click privacy  
    await page.getByRole('tab', { name: /Privacy/i }).click()
    await expect(page.getByText('Privacy Settings')).toBeVisible()

    // Click language
    await page.getByRole('tab', { name: /Language/i }).click()
    await expect(page.getByText('Language & Region')).toBeVisible()
  })
})

test.describe('General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/settings')
  })

  test('should update language preference', async ({ page }) => {
    // Find language selector
    const languageSelect = page.getByRole('combobox', { name: /language/i })

    // Change language
    await languageSelect.selectOption('es')

    // Save changes
    await page.getByRole('button', { name: 'Save changes' }).click()

    // Check success message
    await expect(page.getByText('Settings saved successfully')).toBeVisible()

    // Reload and verify
    await page.reload()
    await expect(languageSelect).toHaveValue('es')
  })

  test('should update timezone', async ({ page }) => {
    // Find timezone selector
    const timezoneSelect = page.getByRole('combobox', { name: /timezone/i })

    // Change timezone
    await timezoneSelect.selectOption('America/Los_Angeles')

    // Save changes
    await page.getByRole('button', { name: 'Save changes' }).click()

    // Check success message
    await expect(page.getByText('Settings saved successfully')).toBeVisible()
  })

  test('should update date format preference', async ({ page }) => {
    // Find date format radio buttons
    await page.getByLabel('MM/DD/YYYY').click()

    // Save changes
    await page.getByRole('button', { name: 'Save changes' }).click()

    // Check success message
    await expect(page.getByText('Settings saved successfully')).toBeVisible()

    // Verify format is applied
    await expect(page.getByLabel('MM/DD/YYYY')).toBeChecked()
  })
})

test.describe('Notification Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/settings')
    await page.getByRole('tab', { name: /Notifications/i }).click()
  })

  test('should toggle email notifications', async ({ page }) => {
    // Check notifications section
    await expect(page.getByText('Notification Preferences')).toBeVisible()

    // Toggle marketing emails
    const marketingToggle = page.getByRole('checkbox', { name: /marketing emails/i })
    const initialState = await marketingToggle.isChecked()

    await marketingToggle.click()

    // Save changes
    await page.getByRole('button', { name: /Save/i }).click()

    // Check success
    await expect(page.getByText(/saved/i)).toBeVisible()

    // Verify state changed
    await expect(marketingToggle).toHaveChecked(!initialState)
  })

  test('should configure push notifications', async ({ page }) => {
    // Enable push notifications
    const pushToggle = page.getByRole('checkbox', { name: /enable push notifications/i })
    await pushToggle.check()

    // Configure push settings
    await page.getByRole('checkbox', { name: /notification sound/i }).check()
    await page.getByRole('checkbox', { name: /vibration/i }).check()

    // Save changes
    await page.getByRole('button', { name: /Save/i }).click()

    // Check success
    await expect(page.getByText(/saved/i)).toBeVisible()
  })

  test('should disable all notifications', async ({ page }) => {
    // Click disable all
    await page.getByRole('button', { name: 'Disable all notifications' }).click()

    // Confirm
    await page.getByRole('button', { name: 'Confirm' }).click()

    // Check all toggles are off
    const checkboxes = page.getByRole('checkbox')
    const count = await checkboxes.count()

    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked()
    }
  })

  test('should configure notification schedule', async ({ page }) => {
    // Enable quiet hours
    await page.getByRole('checkbox', { name: /quiet hours/i }).check()

    // Set start time
    await page.getByLabel('Start time').fill('22:00')

    // Set end time
    await page.getByLabel('End time').fill('08:00')

    // Save changes
    await page.getByRole('button', { name: /Save/i }).click()

    // Check success
    await expect(page.getByText(/saved/i)).toBeVisible()
  })
})

test.describe('Privacy Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/settings/privacy')
  })

  test('should update profile visibility', async ({ page }) => {
    // Change profile visibility
    await page.getByRole('radio', { name: 'Friends only' }).click()

    // Save changes
    await page.getByRole('button', { name: 'Save privacy settings' }).click()

    // Check success
    await expect(page.getByText('Privacy settings updated')).toBeVisible()
  })

  test('should manage data sharing preferences', async ({ page }) => {
    // Toggle analytics
    await page.getByRole('checkbox', { name: /analytics/i }).uncheck()

    // Toggle personalization
    await page.getByRole('checkbox', { name: /personalization/i }).uncheck()

    // Save changes
    await page.getByRole('button', { name: 'Save privacy settings' }).click()

    // Check success
    await expect(page.getByText('Privacy settings updated')).toBeVisible()
  })

  test('should manage blocked users', async ({ page }) => {
    // Click manage blocked users
    await page.getByRole('button', { name: 'Manage blocked users' }).click()

    // Check blocked users list
    await expect(page.getByRole('heading', { name: 'Blocked Users' })).toBeVisible()

    // Unblock a user if any
    const unblockButtons = page.getByRole('button', { name: 'Unblock' })
    if ((await unblockButtons.count()) > 0) {
      await unblockButtons.first().click()
      await expect(page.getByText('User unblocked')).toBeVisible()
    }
  })
})

test.describe('Security Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/settings/security')
  })

  test('should view active sessions', async ({ page }) => {
    // Check active sessions section
    await expect(page.getByRole('heading', { name: 'Active Sessions' })).toBeVisible()

    // Check current session is listed
    await expect(page.getByText('Current session')).toBeVisible()

    // Check session details
    await expect(page.getByText(/Chrome/i)).toBeVisible()
  })

  test('should revoke other sessions', async ({ page }) => {
    // Find revoke button for non-current session
    const revokeButtons = page.getByRole('button', { name: 'Revoke' })

    if ((await revokeButtons.count()) > 0) {
      await revokeButtons.first().click()

      // Confirm
      await page.getByRole('button', { name: 'Confirm' }).click()

      // Check success
      await expect(page.getByText('Session revoked')).toBeVisible()
    }
  })

  test('should view security log', async ({ page }) => {
    // Click view security log
    await page.getByRole('link', { name: 'View security log' }).click()

    // Check log is displayed
    await expect(page.getByRole('heading', { name: 'Security Log' })).toBeVisible()

    // Check log entries
    const logEntries = page.locator('[data-testid="log-entry"]')
    await expect(logEntries.first()).toBeVisible()
  })

  test('should enable login notifications', async ({ page }) => {
    // Toggle login notifications
    await page.getByRole('checkbox', { name: /notify me of new logins/i }).check()

    // Save changes
    await page.getByRole('button', { name: 'Save security settings' }).click()

    // Check success
    await expect(page.getByText('Security settings updated')).toBeVisible()
  })
})

test.describe('Billing Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/settings/billing')
  })

  test('should display billing overview', async ({ page }) => {
    // Check billing information
    await expect(page.getByRole('heading', { name: 'Billing' })).toBeVisible()
    await expect(page.getByText('Current Plan')).toBeVisible()
    await expect(page.getByText('Payment Method')).toBeVisible()
  })

  test('should update payment method', async ({ page }) => {
    // Click update payment method
    await page.getByRole('button', { name: 'Update payment method' }).click()

    // Fill card details
    await page.getByPlaceholder('1234 5678 9012 3456').fill('4242424242424242')
    await page.getByPlaceholder('MM/YY').fill('12/25')
    await page.getByPlaceholder('123').fill('123')

    // Save
    await page.getByRole('button', { name: 'Save card' }).click()

    // Check success
    await expect(page.getByText('Payment method updated')).toBeVisible()
  })

  test('should view billing history', async ({ page }) => {
    // Click billing history
    await page.getByRole('link', { name: 'Billing history' }).click()

    // Check invoices table
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Amount' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  })

  test('should download invoice', async ({ page }) => {
    await page.getByRole('link', { name: 'Billing history' }).click()

    // Click download on first invoice
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download' }).first().click()

    // Check download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('invoice')
  })

  test('should change subscription plan', async ({ page }) => {
    // Click change plan
    await page.getByRole('button', { name: 'Change plan' }).click()

    // Select new plan
    await page.getByRole('radio', { name: 'Pro Plan' }).click()

    // Continue
    await page.getByRole('button', { name: 'Continue' }).click()

    // Confirm
    await page.getByRole('button', { name: 'Confirm change' }).click()

    // Check success
    await expect(page.getByText('Plan updated successfully')).toBeVisible()
  })

  test('should cancel subscription', async ({ page }) => {
    // Click cancel subscription
    await page.getByRole('button', { name: 'Cancel subscription' }).click()

    // Select reason
    await page.getByRole('radio', { name: 'Too expensive' }).click()

    // Add feedback
    await page.getByPlaceholder('Tell us more...').fill('Testing cancellation flow')

    // Confirm cancellation
    await page.getByRole('button', { name: 'Cancel subscription' }).click()

    // Final confirmation
    await page.getByRole('button', { name: 'Yes, cancel' }).click()

    // Check success
    await expect(page.getByText('Subscription cancelled')).toBeVisible()
  })
})
