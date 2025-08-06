import { server } from '@/mocks/server'
import { fireEvent, render, screen, waitFor } from '@/test/utils'
import { HttpResponse, http } from 'msw'
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

  it('handles successful login', async () => {
    const { user } = render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Fill form using React Hook Form compatible approach
    await user.click(emailInput)
    await user.keyboard('demo@example.com')

    await user.click(passwordInput)
    await user.keyboard('password')

    // Submit the form
    await user.click(submitButton)

    // Wait for navigation to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })
  })

  it('handles login failure', async () => {
    // Override the handler for this test
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      })
    )

    const { user } = render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')

    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
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

  it('remembers user preference when remember me is checked', async () => {
    const { user } = render(<LoginForm />)

    const rememberMeCheckbox = screen.getByRole('checkbox')
    await user.click(rememberMeCheckbox)

    expect(rememberMeCheckbox).toBeChecked()

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    // Use fireEvent to change values directly
    fireEvent.change(emailInput, { target: { value: 'demo@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })

    // Wait for React Hook Form to update
    await waitFor(() => {
      expect(passwordInput).toHaveValue('password')
    })

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  it('shows loading state while submitting', async () => {
    // Add a delay to the login handler for this specific test
    server.use(
      http.post('*/auth/login', async ({ request }) => {
        const body = (await request.json()) as any
        // Add longer delay to capture loading state
        await new Promise(resolve => setTimeout(resolve, 100))

        return HttpResponse.json({
          user: {
            id: '1',
            email: body.email,
            firstName: 'Demo',
            lastName: 'User',
            fullName: 'Demo User',
            role: 'user',
            permissions: [],
          },
          tokens: {
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh',
            expiresIn: 3600,
            refreshExpiresIn: 604800,
          },
        })
      })
    )

    const { user } = render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'demo@example.com')
    await user.type(passwordInput, 'password')

    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Click the button without await to catch the loading state
    user.click(submitButton)

    // Wait for the loading state to appear - checking for the text change
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/signing in/i)
    })

    // The button should be disabled during formState.isSubmitting
    // Note: We're testing the form's built-in loading state, not the auth store's isLoading
    // The form.formState.isSubmitting handles the disabled state during submission

    // Wait for navigation to complete
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalled()
      },
      { timeout: 2000 }
    )
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
