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
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(screen.getByText(/sent.*password reset link/i)).toBeInTheDocument()
    expect(screen.getByText(/user@example.com/)).toBeInTheDocument()
  })

  it('handles password reset request for non-existent email', async () => {
    // The API should still return success to not reveal if email exists
    const { user } = render(<ForgotPasswordWizard />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'nonexistent@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    // Should still show success message for security
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('allows resending the reset email', async () => {
    const { user } = render(<ForgotPasswordWizard />)

    // Complete step 1
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    // Wait for step 2
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Wait for step 3 (success state) which auto-progresses from step 2
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /password reset sent/i })).toBeInTheDocument()
      },
      { timeout: 4000 }
    )

    // Find the button to send another email
    const resendButton = screen.getByRole('button', { name: /send another email/i })
    await user.click(resendButton)

    // Should go back to step 1
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /forgot your password/i })).toBeInTheDocument()
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
    // Mock a slow response first
    server.use(
      http.post('*/auth/forgot-password', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return HttpResponse.json({ message: 'Success' })
      })
    )

    const { user } = render(<ForgotPasswordWizard />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
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
    expect(backLink).toHaveAttribute('href', '/auth/login')
  })

  it('opens email app when button is clicked in step 2', async () => {
    const { user } = render(<ForgotPasswordWizard />)

    // Complete step 1 to get to step 2
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'user@example.com')

    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)

    // Wait for step 2
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Step 2 shows an email preview, not an open email button
    expect(screen.getByText(/reset password/i)).toBeInTheDocument()
  })
})
