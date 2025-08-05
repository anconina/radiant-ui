/**
 * Test helper utilities for consistent testing patterns
 */
import React from 'react'
import { ReactElement, ReactNode } from 'react'

import { BrowserRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { RenderOptions, fireEvent, render } from '@testing-library/react'
import { expect, vi } from 'vitest'

// Create a custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  queryClient?: QueryClient
}

export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  const {
    initialEntries: _initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  } = options

  function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(BrowserRouter, null, children)
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Mock user for authenticated tests
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  role: 'user' as const,
  preferences: {
    theme: 'light' as const,
    language: 'en',
    notifications: true,
  },
}

// Mock authentication helpers
export const mockAuthenticatedUser = () => {
  localStorage.setItem('auth-token', 'mock-token')
  localStorage.setItem('user', JSON.stringify(mockUser))
}

export const mockUnauthenticatedUser = () => {
  localStorage.removeItem('auth-token')
  localStorage.removeItem('user')
}

// Wait for async operations
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Create mock functions with proper typing
export const createMockFunction = <T extends (...args: any[]) => any>(implementation?: T) => {
  return vi.fn(implementation)
}

// Mock API responses
export const mockApiResponse = <T>(data: T, delay = 0) => {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

export const mockApiError = (message = 'API Error', status = 500, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(message)
      ;(error as any).status = status
      reject(error)
    }, delay)
  })
}

// Form testing helpers
export const fillForm = async (fields: Record<string, string>, getByLabelText: any) => {
  for (const [label, value] of Object.entries(fields)) {
    const field = getByLabelText(label)
    await fireEvent.change(field, { target: { value } })
  }
}

// Local storage helpers for tests
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    },
  }
}

// Responsive testing helpers
export const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

// Component testing utilities
export const getByDataTestId = (container: HTMLElement, testId: string) => {
  const element = container.querySelector(`[data-testid="${testId}"]`)
  if (!element) {
    throw new Error(`Unable to find element with data-testid: ${testId}`)
  }
  return element
}

export const queryByDataTestId = (container: HTMLElement, testId: string) => {
  return container.querySelector(`[data-testid="${testId}"]`)
}

// Accessibility testing helpers
export const expectAccessibleName = (element: HTMLElement, name: string) => {
  expect(element).toHaveAccessibleName(name)
}

export const expectAriaLabel = (element: HTMLElement, label: string) => {
  expect(element).toHaveAttribute('aria-label', label)
}

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  await waitForLoadingToFinish()
  const end = performance.now()
  return end - start
}

// Error boundary testing
export const TestErrorBoundary = ({ children }: { children: ReactNode }) => {
  try {
    return React.createElement(React.Fragment, null, children)
  } catch {
    return React.createElement('div', { 'data-testid': 'error-boundary' }, 'Error occurred')
  }
}

// Export common testing library functions
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
