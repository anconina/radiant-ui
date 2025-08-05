import { MemoryRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '@/shared/providers'

import { SettingsPage } from '../ui/SettingsPage'

// Mock i18n
vi.mock('@/shared/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  useLanguage: () => ({
    language: 'en',
    changeLanguage: vi.fn(),
    languages: {
      en: { name: 'English', nativeName: 'English', dir: 'ltr' },
      es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
    },
  }),
}))

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
      <ThemeProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders settings page with all sections', () => {
    render(<SettingsPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your account settings and preferences.')).toBeInTheDocument()

    // Check tabs
    expect(screen.getByRole('tab', { name: /appearance/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /language/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /privacy/i })).toBeInTheDocument()
  })

  it('loads and displays settings data', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      // Check appearance settings
      expect(screen.getByText('Theme')).toBeInTheDocument()
      expect(screen.getByText('Font Size')).toBeInTheDocument()
      expect(screen.getByText('Reduce Motion')).toBeInTheDocument()
      expect(screen.getByText('High Contrast Mode')).toBeInTheDocument()
    })
  })

  it('changes theme preference', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    // Click on dark theme
    const darkThemeOption = screen.getByRole('radio', { name: /dark/i })
    await user.click(darkThemeOption)

    // Check that save button appears
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('adjusts font size with slider', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Font Size')).toBeInTheDocument()
    })

    // Find the slider
    const slider = screen.getByRole('slider', { name: /font size/i })

    // Change value
    fireEvent.change(slider, { target: { value: '120' } })

    // Check that value updated
    expect(screen.getByText('120%')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('toggles accessibility settings', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Reduce Motion')).toBeInTheDocument()
    })

    // Toggle reduce motion
    const reduceMotionSwitch = screen.getByRole('switch', { name: /reduce motion/i })
    await user.click(reduceMotionSwitch)

    // Toggle high contrast
    const highContrastSwitch = screen.getByRole('switch', { name: /high contrast mode/i })
    await user.click(highContrastSwitch)

    // Check save button appears
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('switches to language tab and changes language', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    // Switch to language tab
    const languageTab = screen.getByRole('tab', { name: /language/i })
    await user.click(languageTab)

    await waitFor(() => {
      expect(screen.getByText('Display Language')).toBeInTheDocument()
    })

    // Open language selector
    const languageSelect = screen.getByRole('combobox', { name: /display language/i })
    await user.click(languageSelect)

    // Select Spanish
    const spanishOption = screen.getByRole('option', { name: /español/i })
    await user.click(spanishOption)

    // Check save button appears
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('configures regional settings', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    // Switch to language tab
    const languageTab = screen.getByRole('tab', { name: /language/i })
    await user.click(languageTab)

    await waitFor(() => {
      expect(screen.getByText('Date Format')).toBeInTheDocument()
    })

    // Change date format
    const dateFormatSelect = screen.getByRole('combobox', { name: /date format/i })
    await user.click(dateFormatSelect)

    const ddmmyyyyOption = screen.getByRole('option', { name: 'DD/MM/YYYY' })
    await user.click(ddmmyyyyOption)

    // Change time format
    const timeFormat24h = screen.getByRole('radio', { name: /24-hour/i })
    await user.click(timeFormat24h)

    // Check save button appears
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('manages notification preferences', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    // Switch to notifications tab
    const notificationsTab = screen.getByRole('tab', { name: /notifications/i })
    await user.click(notificationsTab)

    await waitFor(() => {
      expect(screen.getByText('Product Updates')).toBeInTheDocument()
    })

    // Toggle email notifications for updates
    const emailCheckboxes = screen.getAllByRole('checkbox', { name: /email/i })
    await user.click(emailCheckboxes[0])

    // Enable quiet hours
    const quietHoursSwitch = screen.getByRole('switch', { name: /enable quiet hours/i })
    await user.click(quietHoursSwitch)

    // Check save button appears
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('configures privacy settings', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    // Switch to privacy tab
    const privacyTab = screen.getByRole('tab', { name: /privacy/i })
    await user.click(privacyTab)

    await waitFor(() => {
      expect(screen.getByText('Profile Visibility')).toBeInTheDocument()
    })

    // Change profile visibility
    const privateOption = screen.getByRole('radio', { name: /private/i })
    await user.click(privateOption)

    // Toggle privacy switches
    const showEmailSwitch = screen.getByRole('switch', { name: /show email address/i })
    await user.click(showEmailSwitch)

    // Check save button appears
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('saves settings successfully', async () => {
    const user = userEvent.setup()
    const { toast } = await import('@/shared/lib/toast')

    render(<SettingsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    // Make a change
    const darkThemeOption = screen.getByRole('radio', { name: /dark/i })
    await user.click(darkThemeOption)

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Check success message
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Settings saved successfully')
    })

    // Save button should disappear
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
  })

  it('handles save errors gracefully', async () => {
    const user = userEvent.setup()
    const { toast } = await import('@/shared/lib/toast')

    // Mock API error
    const { server } = await import('@/mocks/server')
    const { http, HttpResponse } = await import('msw')

    server.use(
      http.put('*/settings', () => {
        return HttpResponse.error()
      })
    )

    render(<SettingsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    // Make a change
    const darkThemeOption = screen.getByRole('radio', { name: /dark/i })
    await user.click(darkThemeOption)

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Check error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save settings')
    })
  })

  it('shows saving state during submission', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    // Make a change
    const darkThemeOption = screen.getByRole('radio', { name: /dark/i })
    await user.click(darkThemeOption)

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Check button shows saving state
    expect(saveButton).toBeDisabled()
    expect(saveButton).toHaveTextContent('Saving...')
  })

  it('persists theme changes to ThemeProvider', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    // Select dark theme
    const darkThemeOption = screen.getByRole('radio', { name: /dark/i })
    await user.click(darkThemeOption)

    // Check that theme is applied immediately (before saving)
    expect(document.documentElement).toHaveClass('dark')
  })

  it('resets unsaved changes when switching tabs', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Theme')).toBeInTheDocument()
    })

    // Make a change
    const darkThemeOption = screen.getByRole('radio', { name: /dark/i })
    await user.click(darkThemeOption)

    // Switch to another tab without saving
    const languageTab = screen.getByRole('tab', { name: /language/i })
    await user.click(languageTab)

    // Switch back
    const appearanceTab = screen.getByRole('tab', { name: /appearance/i })
    await user.click(appearanceTab)

    // Check that changes were not persisted
    const systemThemeOption = screen.getByRole('radio', { name: /system/i })
    expect(systemThemeOption).toBeChecked()
  })

  it('handles loading state correctly', () => {
    render(<SettingsPage />, { wrapper: createWrapper() })

    // Check for loading skeleton
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
