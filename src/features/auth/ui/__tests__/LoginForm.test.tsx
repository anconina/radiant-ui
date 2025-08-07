// import { server } from '@/mocks/server' // Reserved for mock setup
import { render, screen, waitFor } from '@/test/utils'
// import { HttpResponse, http } from 'msw' // Reserved for mock responses
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginForm } from '../LoginForm'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders login form correctly', async () => {
    render(<LoginForm />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('renders language selector', async () => {
    render(<LoginForm />)

    await waitFor(() => {
      // Language selector should be present
      expect(screen.getByTestId('language-selector')).toBeInTheDocument()
    })
  })

  it('renders social login buttons', async () => {
    render(<LoginForm />)

    await waitFor(() => {
      // Check for social login buttons by looking for the sr-only text
      expect(screen.getByText(/continue with apple/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
    expect(screen.getByText(/continue with github/i)).toBeInTheDocument()
  })

  it('renders demo credentials notice', async () => {
    render(<LoginForm />)

    await waitFor(() => {
      expect(screen.getByText(/demo credentials/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/demo@example.com/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const { user } = render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Try to submit form without filling fields
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const { user } = render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    // Type invalid email and valid password
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'ValidPass123!')

    // Submit to trigger validation
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const { user } = render(<LoginForm />)

    // Get all inputs and find the password input by its placeholder
    const passwordInput = screen.getByPlaceholderText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByLabelText(/show password/i)

    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('has proper accessibility attributes', async () => {
    render(<LoginForm />)

    await waitFor(() => {
      const passwordToggle = screen.getByLabelText(/show password/i)
      expect(passwordToggle).toHaveAttribute('tabIndex', '-1')
      expect(passwordToggle).toHaveAttribute('aria-label')
    })

    // Check form fields have proper labels
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('supports internationalization', async () => {
    render(<LoginForm />)

    // Check for translated text (not i18n keys)
    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
  })
})
