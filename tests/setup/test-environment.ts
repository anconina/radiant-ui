/**
 * Test environment setup for comprehensive testing
 */
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'

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

  // Mock localStorage with proper implementation
  const localStorageData: Record<string, string> = {}
  const localStorageMock = {
    getItem: (key: string) => localStorageData[key] || null,
    setItem: (key: string, value: string) => {
      localStorageData[key] = value
    },
    removeItem: (key: string) => {
      delete localStorageData[key]
    },
    clear: () => {
      Object.keys(localStorageData).forEach(key => delete localStorageData[key])
    },
    length: 0,
    key: (index: number) => Object.keys(localStorageData)[index] || null,
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  // Mock sessionStorage with proper implementation  
  const sessionStorageData: Record<string, string> = {}
  const sessionStorageMock = {
    getItem: (key: string) => sessionStorageData[key] || null,
    setItem: (key: string, value: string) => {
      sessionStorageData[key] = value
    },
    removeItem: (key: string) => {
      delete sessionStorageData[key]
    },
    clear: () => {
      Object.keys(sessionStorageData).forEach(key => delete sessionStorageData[key])
    },
    length: 0,
    key: (index: number) => Object.keys(sessionStorageData)[index] || null,
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  })

  // Mock DOMException if not available
  if (typeof global.DOMException === 'undefined') {
    global.DOMException = class DOMException extends Error {
      constructor(message?: string, name?: string) {
        super(message)
        this.name = name || 'DOMException'
      }
    }
  }

  // Mock AbortController and AbortSignal for test compatibility
  // Use proper polyfill approach that creates instances that pass instanceof checks
  if (typeof global.AbortController === 'undefined') {
    // Import node's AbortController if available (Node 16+)
    try {
      const { AbortController, AbortSignal } = require('node:util')
      global.AbortController = AbortController
      global.AbortSignal = AbortSignal
    } catch {
      // Enhanced polyfill with better instanceof compatibility
      class MockAbortSignal {
        public aborted = false
        public reason: any = undefined

        constructor() {
          // Ensure the instance has the correct prototype
          Object.setPrototypeOf(this, MockAbortSignal.prototype)
        }

        addEventListener() {}
        removeEventListener() {}
        dispatchEvent() { return true }

        throwIfAborted() {
          if (this.aborted) {
            throw this.reason || new DOMException('AbortError', 'AbortError')
          }
        }
      }

      class MockAbortController {
        public signal: MockAbortSignal

        constructor() {
          this.signal = new MockAbortSignal()
          Object.setPrototypeOf(this, MockAbortController.prototype)
        }

        abort(reason?: any) {
          if (!this.signal.aborted) {
            this.signal.aborted = true
            this.signal.reason = reason || new DOMException('AbortError', 'AbortError')
          }
        }
      }

      // Set prototype names for better debugging
      Object.defineProperty(MockAbortSignal.prototype, 'constructor', {
        value: MockAbortSignal,
        writable: true,
        configurable: true
      })
      
      Object.defineProperty(MockAbortController.prototype, 'constructor', {
        value: MockAbortController, 
        writable: true,
        configurable: true
      })

      // Make instanceof work by setting up the global constructors
      global.AbortSignal = MockAbortSignal as any
      global.AbortController = MockAbortController as any

      // Also set on window for browser compatibility
      if (typeof window !== 'undefined') {
        ;(window as any).AbortSignal = MockAbortSignal
        ;(window as any).AbortController = MockAbortController
      }
    }
  }

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
