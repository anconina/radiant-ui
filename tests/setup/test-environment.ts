/**
 * Test environment setup for comprehensive testing
 */
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

import { server } from '../../src/mocks/server'

// Global test environment setup
beforeAll(() => {
  // Start MSW server
  server.listen({
    onUnhandledRequest: 'error',
  })

  // Mock window.matchMedia for responsive tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  // Mock localStorage
  const localStorageMock = {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: (key: string) => localStorage.removeItem(key),
    clear: () => localStorage.clear(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: (key: string) => sessionStorage.getItem(key),
    setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
    removeItem: (key: string) => sessionStorage.removeItem(key),
    clear: () => sessionStorage.clear(),
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  })

  // Suppress console errors in tests unless specifically needed
  const originalError = console.error
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  // Clean up MSW server
  server.close()
})

beforeEach(() => {
  // Reset MSW handlers before each test
  server.resetHandlers()
})

afterEach(() => {
  // Clean up React Testing Library
  cleanup()

  // Clear all timers
  vi.clearAllTimers()

  // Clear all mocks
  vi.clearAllMocks()

  // Reset modules
  vi.resetModules()
})
