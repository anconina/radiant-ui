import { ReactElement, ReactNode } from 'react'

import { MemoryRouter, MemoryRouterProps } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { RenderOptions, RenderResult, render } from '@testing-library/react'
// Import additional utilities
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from '@/shared/providers'

import { TestI18nProvider } from './test-i18n-provider'

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps
  queryClient?: QueryClient
}

// Create providers wrapper
function createWrapper({ routerProps, queryClient }: CustomRenderOptions = {}) {
  const testQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: false,
        },
      },
    })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter {...routerProps}>
        <QueryClientProvider client={testQueryClient}>
          <TestI18nProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </TestI18nProvider>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }
}

export function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const { routerProps, queryClient, ...renderOptions } = options || {}

  const result = render(ui, {
    wrapper: createWrapper({ routerProps, queryClient }),
    ...renderOptions,
  })

  return {
    ...result,
    user: userEvent.setup(),
  }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override the default render with our custom one
export { customRender as render }

// Test data factory utilities
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  role: 'user',
  permissions: [],
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockAuthTokens = (overrides = {}) => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600,
  refreshExpiresIn: 604800,
  ...overrides,
})

export const createMockAuthResponse = (overrides = {}) => ({
  user: createMockUser(),
  tokens: createMockAuthTokens(),
  ...overrides,
})

// Wait utilities
export const waitForLoadingToFinish = () =>
  waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
