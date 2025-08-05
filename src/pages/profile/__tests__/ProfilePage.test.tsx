import { MemoryRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProfilePage } from '../ui/ProfilePage'

// Mock file reading
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(function (this: any) {
    this.onload?.({ target: { result: 'data:image/png;base64,mockbase64' } })
  }),
})) as any

// Mock toast
vi.mock('@/shared/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders profile page with heading', async () => {
    await act(async () => {
      render(<ProfilePage />, { wrapper: createWrapper() })
    })

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Manage your personal information and preferences')).toBeInTheDocument()
  })

  it('loads and displays user profile data', async () => {
    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+1 (555) 123-4567')).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />, { wrapper: createWrapper() })

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    // Clear required field
    const nameInput = screen.getByLabelText(/name/i)
    await user.clear(nameInput)

    // Try to submit
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument()
    })

    // Enter invalid email
    const emailInput = screen.getByLabelText(/email/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'invalid-email')

    // Try to submit
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('handles image upload', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Upload new photo')).toBeInTheDocument()
    })

    // Create mock file
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload new photo/i)

    // Upload file
    await user.upload(input, file)

    // Check that image preview is shown
    await waitFor(() => {
      const preview = screen.getByAltText('Profile')
      expect(preview).toHaveAttribute('src', 'data:image/png;base64,mockbase64')
    })
  })

  it('validates image file type', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Upload new photo')).toBeInTheDocument()
    })

    // Create invalid file type
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/upload new photo/i)

    // Try to upload file
    await user.upload(input, file)

    // Check for error
    const { toast } = await import('@/shared/lib/toast')
    expect(toast.error).toHaveBeenCalledWith('Please upload a valid image file')
  })

  it('validates image file size', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Upload new photo')).toBeInTheDocument()
    })

    // Create large file (> 5MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload new photo/i)

    // Try to upload file
    await user.upload(input, largeFile)

    // Check for error
    const { toast } = await import('@/shared/lib/toast')
    expect(toast.error).toHaveBeenCalledWith('Image must be less than 5MB')
  })

  it('removes uploaded image', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Upload new photo')).toBeInTheDocument()
    })

    // Upload an image first
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload new photo/i)
    await user.upload(input, file)

    // Wait for remove button to appear
    await waitFor(() => {
      expect(screen.getByText('Remove photo')).toBeInTheDocument()
    })

    // Click remove button
    const removeButton = screen.getByRole('button', { name: /remove photo/i })
    await user.click(removeButton)

    // Check that image is removed
    expect(screen.queryByAltText('Profile')).not.toBeInTheDocument()
    expect(screen.getByText('Upload new photo')).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const { toast } = await import('@/shared/lib/toast')

    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    // Update some fields
    const bioInput = screen.getByLabelText(/bio/i)
    await user.clear(bioInput)
    await user.type(bioInput, 'Updated bio text')

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Check success message
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully')
    })
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Check button is disabled during submission
    expect(saveButton).toBeDisabled()
    expect(saveButton).toHaveTextContent('Saving...')
  })

  it('handles submission errors', async () => {
    const user = userEvent.setup()
    const { toast } = await import('@/shared/lib/toast')

    // Mock API error
    const { server } = await import('@/mocks/server')
    const { http, HttpResponse } = await import('msw')

    server.use(
      http.put('*/profile', () => {
        return HttpResponse.error()
      })
    )

    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Check error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update profile')
    })
  })

  it('maintains form state on navigation', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    // Update a field
    const bioInput = screen.getByLabelText(/bio/i)
    await user.type(bioInput, ' - Additional text')

    // Simulate navigation away and back
    rerender(<div>Other page</div>)
    rerender(<ProfilePage />)

    // Form should be reset to original data
    await waitFor(() => {
      expect(
        screen.getByDisplayValue('Passionate about creating amazing user experiences.')
      ).toBeInTheDocument()
    })
  })

  it('handles optional fields correctly', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    // Clear optional fields
    const phoneInput = screen.getByLabelText(/phone/i)
    const locationInput = screen.getByLabelText(/location/i)
    const websiteInput = screen.getByLabelText(/website/i)

    await user.clear(phoneInput)
    await user.clear(locationInput)
    await user.clear(websiteInput)

    // Submit should still work
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    const { toast } = await import('@/shared/lib/toast')
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully')
    })
  })
})
