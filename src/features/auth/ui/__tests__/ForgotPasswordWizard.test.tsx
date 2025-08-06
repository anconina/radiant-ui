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

  it('can navigate back to login from any step', () => {
    render(<ForgotPasswordWizard />)

    const backLink = screen.getByRole('link', { name: /back to sign in/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/auth/login')
  })

})
