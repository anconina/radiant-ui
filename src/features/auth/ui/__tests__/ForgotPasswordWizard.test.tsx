import { server } from '@/mocks/server'
import { render, screen, waitFor } from '@/test/utils'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ForgotPasswordWizard } from '../ForgotPasswordWizard'

describe('ForgotPasswordWizard', () => {
  it('renders step 1 - email input correctly', () => {
    render(<ForgotPasswordWizard />)

    expect(screen.getByRole('heading', { name: /forgot your password/i })).toBeInTheDocument()
    expect(screen.getByText(/enter your email.*reset link/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument()
  })

  it('validates email input', async () => {
    const { user } = render(<ForgotPasswordWizard />)

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    const emailInput = screen.getByLabelText(/email/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('handles successful password reset request', async () => {
    const { user } = render(<ForgotPasswordWizard />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    // Wait for step 2 to appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/we.*sent.*password reset link/i)).toBeInTheDocument()
    expect(screen.getByText(/user@example.com/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open email app/i })).toBeInTheDocument()
  })

  it('handles password reset request for non-existent email', async () => {
    // The API should still return success to not reveal if email exists
    const { user } = render(<ForgotPasswordWizard />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'nonexistent@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    // Should still show success message for security
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
    })
  })

  it('allows resending the reset email', async () => {
    const { user } = render(<ForgotPasswordWizard />)

    // Complete step 1
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    // Wait for step 2
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
    })

    // Click resend button
    const resendButton = screen.getByRole('button', { name: /didn.*t receive.*resend/i })
    await user.click(resendButton)

    // Should show resending state
    await waitFor(() => {
      expect(resendButton).toHaveTextContent(/resending/i)
    })

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/email sent successfully/i)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    server.use(
      http.post('*/auth/forgot-password', () => {
        return HttpResponse.json({ message: 'Service unavailable' }, { status: 503 })
      })
    )

    const { user } = render(<ForgotPasswordWizard />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/service unavailable/i)).toBeInTheDocument()
    })
  })

  it('shows loading state while submitting', async () => {
    const { user } = render(<ForgotPasswordWizard />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    // Mock a slow response
    server.use(
      http.post('*/auth/forgot-password', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return HttpResponse.json({ message: 'Success' })
      })
    )

    user.click(submitButton)

    // Check for loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent(/sending/i)
    })
  })

  it('can navigate back to login from any step', () => {
    render(<ForgotPasswordWizard />)

    const backLink = screen.getByRole('link', { name: /back to sign in/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/login')
  })

  it('opens email app when button is clicked in step 2', async () => {
    const { user } = render(<ForgotPasswordWizard />)

    // Complete step 1 to get to step 2
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    // Wait for step 2
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
    })

    // Mock window.location.href
    const originalLocation = window.location
    delete (window as any).location
    window.location = { ...originalLocation, href: '' }

    const openEmailButton = screen.getByRole('button', { name: /open email app/i })
    await user.click(openEmailButton)

    expect(window.location.href).toBe('mailto:')

    // Restore original location
    window.location = originalLocation
  })
})
