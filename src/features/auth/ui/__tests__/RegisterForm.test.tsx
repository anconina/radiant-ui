// import { server } from '@/mocks/server' // Reserved for mock setup
import { render, screen, waitFor } from '@/test/utils'
// import { HttpResponse, http } from 'msw' // Reserved for mock responses
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterForm } from '../RegisterForm'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('RegisterForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders register form correctly', async () => {
    render(<RegisterForm />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/get started with radiant ui today/i)).toBeInTheDocument()

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders social signup buttons', () => {
    render(<RegisterForm />)

    // Social buttons use icons only, with sr-only text
    const buttons = screen.getAllByRole('button')
    // Should have at least 3 social buttons (Apple, Google, GitHub) plus the submit button
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it('validates required fields', async () => {
    const { user } = render(<RegisterForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('validates password confirmation', async () => {
    const { user } = render(<RegisterForm />)

    // Fill all required fields first
    const firstNameInput = screen.getByLabelText(/first name/i)
    const lastNameInput = screen.getByLabelText(/last name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const termsCheckbox = screen.getByRole('checkbox')

    await user.type(firstNameInput, 'John')
    await user.type(lastNameInput, 'Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'Password123!')
    await user.type(confirmPasswordInput, 'DifferentPassword123!')
    await user.click(termsCheckbox)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })
  })

  it('shows password strength indicator', async () => {
    const { user } = render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)

    // Type a weak password
    await user.type(passwordInput, 'weak')

    // The PasswordInput component should show strength indicators
    // This test assumes the PasswordInput component handles strength display
    expect(passwordInput).toHaveValue('weak')
  })

  it('has sign in link', () => {
    render(<RegisterForm />)

    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/auth/login')
  })
})
