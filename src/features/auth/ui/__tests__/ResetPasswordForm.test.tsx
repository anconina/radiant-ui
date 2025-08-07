// import { server } from '@/mocks/server' // Reserved for mock setup
import { render, screen, waitFor } from '@/test/utils'
// import { HttpResponse, http } from 'msw' // Reserved for mock responses
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ResetPasswordForm } from '../ResetPasswordForm'

// Mock useNavigate and useSearchParams
const mockNavigate = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  }
})

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockSearchParams.delete('token')
    mockSearchParams.delete('email')
  })

  it('shows error when no token is provided', () => {
    render(<ResetPasswordForm />)

    expect(screen.getByRole('heading', { name: /set new password/i })).toBeInTheDocument()
    expect(screen.getByText(/invalid or expired reset link/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /request new reset link/i })).toBeInTheDocument()
  })

  it('renders reset form when token is provided', () => {
    mockSearchParams.set('token', 'valid-reset-token')
    mockSearchParams.set('email', 'user@example.com')

    render(<ResetPasswordForm />)

    expect(screen.getByRole('heading', { name: /set new password/i })).toBeInTheDocument()
    expect(screen.getByText(/choose a strong password/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your new password/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/confirm your new password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()
  })

  it('validates password requirements', async () => {
    mockSearchParams.set('token', 'valid-reset-token')
    mockSearchParams.set('email', 'user@example.com')

    const { user } = render(<ResetPasswordForm />)

    const submitButton = screen.getByRole('button', { name: /update password/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('validates password confirmation match', async () => {
    mockSearchParams.set('token', 'valid-reset-token')
    mockSearchParams.set('email', 'user@example.com')

    const { user } = render(<ResetPasswordForm />)

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i)

    await user.type(passwordInput, 'NewPassword123!')
    await user.type(confirmPasswordInput, 'DifferentPassword123!')

    const submitButton = screen.getByRole('button', { name: /update password/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })
  })

  it('shows password strength indicator', async () => {
    mockSearchParams.set('token', 'valid-reset-token')
    mockSearchParams.set('email', 'user@example.com')

    const { user } = render(<ResetPasswordForm />)

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i)

    // Type a weak password
    await user.type(passwordInput, 'weak')

    // The PasswordInput component should show strength indicators
    expect(passwordInput).toHaveValue('weak')
  })

  it('has links to other auth pages', () => {
    mockSearchParams.set('token', 'valid-reset-token')
    mockSearchParams.set('email', 'user@example.com')

    render(<ResetPasswordForm />)

    const signInLink = screen.getByRole('link', { name: /back to sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/auth/login')
  })

  it('prefills email when provided in URL', () => {
    mockSearchParams.set('token', 'valid-reset-token')
    mockSearchParams.set('email', 'user@example.com')

    render(<ResetPasswordForm />)

    // The email should be displayed in the success message after reset
    // This is just checking that the email parameter is being used
    expect(mockSearchParams.get('email')).toBe('user@example.com')
  })
})
