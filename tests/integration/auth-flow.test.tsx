/**
 * Integration tests for authentication flow
 */
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '../../src/App'
import { server } from '../../src/mocks/server'
import { mockUnauthenticatedUser, renderWithProviders } from '../helpers/test-helpers'

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    mockUnauthenticatedUser()
  })

  it('should complete full login flow', async () => {
    const user = userEvent.setup()

    // Mock successful login
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
          token: 'mock-jwt-token',
        })
      })
    )

    renderWithProviders(<App />)

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })

    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Should redirect to dashboard after successful login
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Should display user info
    expect(screen.getByText(/test user/i)).toBeInTheDocument()
  })

  it('should handle login error gracefully', async () => {
    const user = userEvent.setup()

    // Mock login error
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      })
    )

    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })

    // Fill in login form with invalid credentials
    await user.type(screen.getByLabelText(/email/i), 'invalid@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    // Should remain on login page
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('should complete registration flow', async () => {
    const user = userEvent.setup()

    // Mock successful registration
    server.use(
      http.post('/api/auth/register', () => {
        return HttpResponse.json(
          {
            user: {
              id: '1',
              email: 'newuser@example.com',
              name: 'New User',
            },
            token: 'mock-jwt-token',
          },
          { status: 201 }
        )
      })
    )

    renderWithProviders(<App />)

    // Navigate to registration page
    await user.click(screen.getByText(/sign up/i))

    await waitFor(() => {
      expect(screen.getByText(/create account/i)).toBeInTheDocument()
    })

    // Fill in registration form
    await user.type(screen.getByLabelText(/name/i), 'New User')
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/password/i), 'newpassword123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }))

    // Should redirect to dashboard after successful registration
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it('should handle forgot password flow', async () => {
    const user = userEvent.setup()

    // Mock successful password reset request
    server.use(
      http.post('/api/auth/forgot-password', () => {
        return HttpResponse.json({
          message: 'Password reset email sent',
        })
      })
    )

    renderWithProviders(<App />)

    // Navigate to forgot password page
    await user.click(screen.getByText(/forgot password/i))

    await waitFor(() => {
      expect(screen.getByText(/reset password/i)).toBeInTheDocument()
    })

    // Fill in email
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')

    // Submit form
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument()
    })
  })

  it('should handle logout flow', async () => {
    const user = userEvent.setup()

    // Start with authenticated user
    localStorage.setItem('auth-token', 'mock-token')
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      })
    )

    // Mock logout
    server.use(
      http.post('/api/auth/logout', () => {
        return HttpResponse.json({ success: true })
      })
    )

    renderWithProviders(<App />)

    // Should be on dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Click logout
    await user.click(screen.getByText(/logout/i))

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })

    // Should clear local storage
    expect(localStorage.getItem('auth-token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('should protect routes requiring authentication', async () => {
    mockUnauthenticatedUser()

    // Try to access protected route directly
    renderWithProviders(<App />, {
      initialEntries: ['/dashboard'],
    })

    // Should redirect to login
    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })
  })

  it('should persist authentication across page refreshes', async () => {
    // Mock authenticated user in localStorage
    localStorage.setItem('auth-token', 'mock-token')
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      })
    )

    // Mock token validation
    server.use(
      http.get('/api/auth/me', () => {
        return HttpResponse.json({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        })
      })
    )

    renderWithProviders(<App />)

    // Should be authenticated and show dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/test user/i)).toBeInTheDocument()
  })
})
