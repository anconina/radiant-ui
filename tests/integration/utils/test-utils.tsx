import React from 'react'

import { BrowserRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { RenderOptions, render } from '@testing-library/react'

import { ThemeProvider } from '@/app/providers/theme-provider'

// Custom render function with all providers
interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="test-ui-theme">
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Helper to create isolated query client for tests
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Helper to wait for async operations
export const waitForAsyncOperations = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Mock auth context for tests
export const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
