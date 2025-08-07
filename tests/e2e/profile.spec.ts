import { Page, expect, test } from '@playwright/test'

// Helper function to login
async function login(page: Page) {
  await page.goto('/auth/login')
  await page.getByPlaceholder('m@example.com').fill('demo@example.com')
  await page.getByPlaceholder('Enter your password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')
}

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/profile')
  })

  test('should display profile page with user information', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

    // Check profile sections
    await expect(page.getByText('Personal Information')).toBeVisible()
    await expect(page.getByText('Profile Picture')).toBeVisible()

    // Check form fields are populated
    const firstNameInput = page.getByPlaceholder('John')
    const lastNameInput = page.getByPlaceholder('Doe')
    const usernameInput = page.getByPlaceholder('johndoe')

    await expect(firstNameInput).toHaveValue('John')
    await expect(lastNameInput).toHaveValue('Doe')
    await expect(usernameInput).not.toBeEmpty()
  })

  test('should update profile information', async ({ page }) => {
    // Update first name
    const firstNameInput = page.getByPlaceholder('John')
    await firstNameInput.clear()
    await firstNameInput.fill('Jane')

    // Update last name
    const lastNameInput = page.getByPlaceholder('Doe')
    await lastNameInput.clear()
    await lastNameInput.fill('Smith')

    // Update bio
    const bioTextarea = page.getByPlaceholder('Tell us a little about yourself...')
    await bioTextarea.fill('This is my updated bio.')

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Check success notification
    await expect(page.getByText('Profile updated successfully')).toBeVisible()

    // Reload page and verify changes persisted
    await page.reload()
    await expect(firstNameInput).toHaveValue('Jane')
    await expect(lastNameInput).toHaveValue('Smith')
    await expect(bioTextarea).toHaveValue('This is my updated bio.')
  })

  test('should validate profile form inputs', async ({ page }) => {
    // Clear required fields
    const firstNameInput = page.getByPlaceholder('John')
    const lastNameInput = page.getByPlaceholder('Doe')

    await firstNameInput.clear()
    await lastNameInput.clear()

    // Try to save
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Check validation messages
    await expect(page.getByText('First name is required')).toBeVisible()
    await expect(page.getByText('Last name is required')).toBeVisible()
  })

  test('should cancel profile changes', async ({ page }) => {
    // Get original values
    const firstNameInput = page.getByPlaceholder('John')
    const originalFirstName = await firstNameInput.inputValue()

    // Make changes
    await firstNameInput.clear()
    await firstNameInput.fill('NewName')

    // Cancel changes
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Check value restored
    await expect(firstNameInput).toHaveValue(originalFirstName)
  })

  test('should validate phone number format', async ({ page }) => {
    const phoneInput = page.getByPlaceholder('+1 (555) 123-4567')

    // Enter invalid phone number
    await phoneInput.clear()
    await phoneInput.fill('invalid-phone')

    // Try to save
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Check validation message
    await expect(page.getByText('Invalid phone number format')).toBeVisible()
  })

  test('should limit bio character count', async ({ page }) => {
    const bioTextarea = page.getByPlaceholder('Tell us a little about yourself...')

    // Try to enter more than 500 characters
    const longText = 'a'.repeat(501)
    await bioTextarea.fill(longText)

    // Check character counter or validation
    await expect(page.getByText(/500 characters/)).toBeVisible()
  })
})

test.describe('Profile Picture Upload', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/profile')
  })

  test('should upload profile picture', async ({ page }) => {
    // Click upload button
    await page.getByRole('button', { name: /upload|change picture/i }).click()

    // Upload file
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByText('Choose file').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles('tests/fixtures/test-avatar.jpg')

    // Check preview is shown
    await expect(page.getByAltText('Profile preview')).toBeVisible()

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Check success
    await expect(page.getByText('Profile picture updated')).toBeVisible()
  })

  test('should validate file type', async ({ page }) => {
    // Try to upload non-image file
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /upload|change picture/i }).click()
    await page.getByText('Choose file').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles('tests/fixtures/test-document.pdf')

    // Check error message
    await expect(page.getByText('Please upload an image file')).toBeVisible()
  })

  test('should validate file size', async ({ page }) => {
    // Mock large file upload
    await page.route('**/api/upload', route => {
      route.fulfill({
        status: 413,
        body: JSON.stringify({ message: 'File too large' }),
      })
    })

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /upload|change picture/i }).click()
    await page.getByText('Choose file').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles('tests/fixtures/large-image.jpg')

    // Check error message
    await expect(page.getByText(/File size must be less than/)).toBeVisible()
  })

  test('should remove profile picture', async ({ page }) => {
    // Click remove button
    await page.getByRole('button', { name: /remove picture/i }).click()

    // Confirm removal
    await page.getByRole('button', { name: 'Confirm' }).click()

    // Check default avatar is shown
    await expect(page.getByAltText('Default avatar')).toBeVisible()

    // Check success message
    await expect(page.getByText('Profile picture removed')).toBeVisible()
  })
})

test.describe('Account Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/profile')
  })

  test('should navigate to change password', async ({ page }) => {
    // Click change password link
    await page.getByRole('button', { name: 'Change Password' }).click()

    // Check change password form is displayed
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible()
    await expect(page.getByPlaceholder('Current password')).toBeVisible()
    await expect(page.getByPlaceholder('New password')).toBeVisible()
    await expect(page.getByPlaceholder('Confirm new password')).toBeVisible()
  })

  test('should change password successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Change Password' }).click()

    // Fill password form
    await page.getByPlaceholder('Current password').fill('password')
    await page.getByPlaceholder('New password').fill('newPassword123')
    await page.getByPlaceholder('Confirm new password').fill('newPassword123')

    // Submit
    await page.getByRole('button', { name: 'Update password' }).click()

    // Check success
    await expect(page.getByText('Password changed successfully')).toBeVisible()
  })

  test('should validate password requirements', async ({ page }) => {
    await page.getByRole('button', { name: 'Change Password' }).click()

    // Try weak password
    await page.getByPlaceholder('Current password').fill('password')
    await page.getByPlaceholder('New password').fill('weak')
    await page.getByPlaceholder('Confirm new password').fill('weak')

    // Submit
    await page.getByRole('button', { name: 'Update password' }).click()

    // Check validation
    await expect(page.getByText(/Password must be at least 8 characters/)).toBeVisible()
  })

  test('should enable two-factor authentication', async ({ page }) => {
    // Click security settings
    await page.getByRole('link', { name: 'Security' }).click()

    // Click enable 2FA
    await page.getByRole('button', { name: 'Enable 2FA' }).click()

    // Check QR code is displayed
    await expect(page.getByRole('img', { name: 'QR Code' })).toBeVisible()
    await expect(page.getByText(/Scan this QR code/)).toBeVisible()

    // Enter verification code
    await page.getByPlaceholder('000000').fill('123456')

    // Confirm
    await page.getByRole('button', { name: 'Verify and Enable' }).click()

    // Check success
    await expect(page.getByText('Two-factor authentication enabled')).toBeVisible()
  })

  test('should download account data', async ({ page }) => {
    // Navigate to privacy settings
    await page.getByRole('link', { name: 'Privacy' }).click()

    // Click download data
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download my data' }).click()

    // Check download started
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('account-data')
  })

  test('should delete account', async ({ page }) => {
    // Navigate to danger zone
    await page.getByRole('link', { name: 'Danger Zone' }).click()

    // Click delete account
    await page.getByRole('button', { name: 'Delete Account' }).click()

    // Check confirmation dialog
    await expect(page.getByText(/This action cannot be undone/)).toBeVisible()

    // Type confirmation
    await page.getByPlaceholder('DELETE').fill('DELETE')

    // Confirm deletion
    await page.getByRole('button', { name: 'Permanently Delete Account' }).click()

    // Should redirect to homepage
    await page.waitForURL('/')
    await expect(page.getByText('Account deleted successfully')).toBeVisible()
  })
})
