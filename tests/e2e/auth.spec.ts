import { expect, test } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('should display login form', async ({ page }) => {
    // Check if login form elements are visible
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expect(page.getByPlaceholder('m@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByText("Don't have an account?")).toBeVisible()
  })

  test('should show validation errors with invalid inputs', async ({ page }) => {
    // Click sign in without filling fields
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Check validation messages
    await expect(page.getByText('Invalid email format')).toBeVisible()
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should show error message with wrong credentials', async ({ page }) => {
    // Fill in wrong credentials
    await page.getByPlaceholder('m@example.com').fill('wrong@example.com')
    await page.getByPlaceholder('Enter your password').fill('wrongpassword')

    // Submit form
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Check error message
    await expect(page.getByText('Invalid email or password')).toBeVisible()
  })

  test('should successfully login with correct credentials', async ({ page }) => {
    // Fill in correct credentials
    await page.getByPlaceholder('m@example.com').fill('demo@example.com')
    await page.getByPlaceholder('Enter your password').fill('password')

    // Submit form
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard')

    // Check if user is on dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    // Click on register link
    await page.getByRole('link', { name: 'Sign up' }).click()

    // Check if on register page
    await page.waitForURL('/auth/register')
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  })

  test('should navigate to forgot password page', async ({ page }) => {
    // Click on forgot password link
    await page.getByRole('link', { name: 'Forgot password?' }).click()

    // Check if on forgot password page
    await page.waitForURL('/auth/forgot-password')
    await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible()
  })

  test('should remember user with remember me checkbox', async ({ page }) => {
    // Fill in credentials
    await page.getByPlaceholder('m@example.com').fill('demo@example.com')
    await page.getByPlaceholder('Enter your password').fill('password')

    // Check remember me
    await page.getByRole('checkbox').check()

    // Submit form
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Wait for navigation
    await page.waitForURL('/dashboard')

    // Check localStorage for remember flag
    const rememberMe = await page.evaluate(() => localStorage.getItem('rememberMe'))
    expect(rememberMe).toBe('true')
  })
})

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register')
  })

  test('should display registration form', async ({ page }) => {
    // Check if registration form elements are visible
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await expect(page.getByPlaceholder('John')).toBeVisible()
    await expect(page.getByPlaceholder('Doe')).toBeVisible()
    await expect(page.getByPlaceholder('m@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('Create a strong password')).toBeVisible()
    await expect(page.getByPlaceholder('Confirm your password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
  })

  test('should show validation errors with invalid inputs', async ({ page }) => {
    // Click create account without filling fields
    await page.getByRole('button', { name: 'Create account' }).click()

    // Check validation messages
    await expect(page.getByText('First name is required')).toBeVisible()
    await expect(page.getByText('Last name is required')).toBeVisible()
    await expect(page.getByText('Invalid email format')).toBeVisible()
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should show error when passwords do not match', async ({ page }) => {
    // Fill form with mismatched passwords
    await page.getByPlaceholder('John').fill('John')
    await page.getByPlaceholder('Doe').fill('Doe')
    await page.getByPlaceholder('m@example.com').fill('test@example.com')
    await page.getByPlaceholder('Create a strong password').fill('password123')
    await page.getByPlaceholder('Confirm your password').fill('password456')

    // Submit form
    await page.getByRole('button', { name: 'Create account' }).click()

    // Check error message
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('should successfully register new user', async ({ page }) => {
    // Fill in registration form
    await page.getByPlaceholder('John').fill('Test')
    await page.getByPlaceholder('Doe').fill('User')
    await page.getByPlaceholder('m@example.com').fill('newuser@example.com')
    await page.getByPlaceholder('Create a strong password').fill('password123')
    await page.getByPlaceholder('Confirm your password').fill('password123')

    // Accept terms
    await page.getByRole('checkbox').check()

    // Submit form
    await page.getByRole('button', { name: 'Create account' }).click()

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard')

    // Check if user is on dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })
})

test.describe('Password Reset Flow', () => {
  test('should send password reset email', async ({ page }) => {
    await page.goto('/auth/forgot-password')

    // Check page elements
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()

    // Fill email
    await page.getByPlaceholder('m@example.com').fill('demo@example.com')

    // Submit form
    await page.getByRole('button', { name: 'Send reset link' }).click()

    // Check success message
    await expect(page.getByText('Reset link sent to your email!')).toBeVisible()
  })

  test('should reset password with valid token', async ({ page }) => {
    // Navigate to reset password with token
    await page.goto('/reset-password?token=valid-reset-token')

    // Check page elements
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()

    // Fill new password
    await page.getByPlaceholder('Enter new password').fill('newpassword123')
    await page.getByPlaceholder('Confirm new password').fill('newpassword123')

    // Submit form
    await page.getByRole('button', { name: 'Reset password' }).click()

    // Should redirect to login with success message
    await page.waitForURL('/auth/login')
    await expect(page.getByText('Password reset successfully')).toBeVisible()
  })
})

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard')

    // Should redirect to login
    await page.waitForURL('/auth/login')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })

  test('should redirect to login after logout', async ({ page }) => {
    // Login first
    await page.goto('/auth/login')
    await page.getByPlaceholder('m@example.com').fill('demo@example.com')
    await page.getByPlaceholder('Enter your password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Wait for dashboard
    await page.waitForURL('/dashboard')

    // Click logout
    await page.getByRole('button', { name: 'Sign out' }).click()

    // Should redirect to login
    await page.waitForURL('/auth/login')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()

    // Try to go back to dashboard
    await page.goto('/dashboard')

    // Should still be on login
    await page.waitForURL('/auth/login')
  })
})
