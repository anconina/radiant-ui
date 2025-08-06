import { server } from '@/mocks/server'
import { testAuthHandlers } from '@/mocks/test-handlers'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import './i18n-test-setup'

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  
  // Add test-specific handlers with minimal delays on top of existing handlers
  server.use(...testAuthHandlers)

  // Initialize API client for test environment
  // The HTTP client has conditional setup that skips test env,
  // but MSW will handle the actual requests
})

// Reset handlers after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Clean up after all tests
afterAll(() => server.close())

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock getBoundingClientRect for chart components
Element.prototype.getBoundingClientRect = vi.fn().mockImplementation(function () {
  // Return reasonable dimensions for charts in tests
  if (
    this.classList &&
    (this.classList.contains('recharts-wrapper') ||
      this.classList.contains('chart-container') ||
      this.getAttribute('role') === 'img')
  ) {
    return {
      width: 400,
      height: 300,
      top: 0,
      left: 0,
      bottom: 300,
      right: 400,
      x: 0,
      y: 0,
      toJSON: () => {},
    }
  }
  // Default dimensions for other elements
  return {
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
    toJSON: () => {},
  }
})

// Mock scrollTo
window.scrollTo = vi.fn()

// Mock offsetWidth and offsetHeight for chart components
Object.defineProperties(HTMLElement.prototype, {
  offsetHeight: {
    get: function () {
      if (
        this.classList &&
        (this.classList.contains('recharts-wrapper') || this.classList.contains('chart-container'))
      ) {
        return 300
      }
      return 100
    },
    configurable: true,
  },
  offsetWidth: {
    get: function () {
      if (
        this.classList &&
        (this.classList.contains('recharts-wrapper') || this.classList.contains('chart-container'))
      ) {
        return 400
      }
      return 100
    },
    configurable: true,
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
global.sessionStorage = sessionStorageMock as any

// Complete AbortController/AbortSignal polyfill for jsdom compatibility
;(function () {
  // Don't override if already exists and is working
  if (typeof global.AbortController !== 'undefined' && typeof global.AbortSignal !== 'undefined') {
    // Test if the existing AbortController works properly
    try {
      const testController = new global.AbortController()
      if (testController.signal && typeof testController.signal.aborted === 'boolean') {
        return // Already exists and works
      }
    } catch (e) {
      // Fall through to polyfill
    }
  }

  class AbortSignalPolyfill implements AbortSignal {
    aborted = false
    reason: any = undefined
    onabort: ((this: AbortSignal, ev: Event) => any) | null = null
    
    private _abortAlgorithms = new Set<() => void>()
    
    constructor() {
      // Ensure the signal is an EventTarget
      Object.setPrototypeOf(this, EventTarget.prototype)
    }

    throwIfAborted() {
      if (this.aborted) {
        throw new DOMException(this.reason || 'The operation was aborted', 'AbortError')
      }
    }
    
    addEventListener(type: string, listener: any, options?: any) {
      // @ts-ignore
      EventTarget.prototype.addEventListener.call(this, type, listener, options)
    }
    
    removeEventListener(type: string, listener: any, options?: any) {
      // @ts-ignore
      EventTarget.prototype.removeEventListener.call(this, type, listener, options)
    }
    
    dispatchEvent(event: Event): boolean {
      // @ts-ignore
      return EventTarget.prototype.dispatchEvent.call(this, event)
    }

    // Override toString to help with debugging
    toString() {
      return '[object AbortSignal]'
    }
    
    get [Symbol.toStringTag]() {
      return 'AbortSignal'
    }
  }
  
  // Mix in EventTarget
  Object.setPrototypeOf(AbortSignalPolyfill.prototype, EventTarget.prototype)

  class AbortControllerPolyfill implements AbortController {
    signal: AbortSignalPolyfill

    constructor() {
      this.signal = new AbortSignalPolyfill() as any
    }

    abort(reason?: any) {
      if (this.signal.aborted) return

      this.signal.aborted = true
      this.signal.reason = reason

      // Create and dispatch abort event
      const event = new Event('abort')
      this.signal.dispatchEvent(event)

      if (this.signal.onabort) {
        this.signal.onabort.call(this.signal, event)
      }
    }
  }

  // Install polyfills globally
  // @ts-ignore
  global.AbortSignal = AbortSignalPolyfill
  // @ts-ignore  
  global.AbortController = AbortControllerPolyfill
  
  // Make sure window also has them
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.AbortSignal = AbortSignalPolyfill
    // @ts-ignore
    window.AbortController = AbortControllerPolyfill
  }
})()

// Mock DOMException if not available
if (!global.DOMException) {
  // @ts-ignore
  global.DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message)
      this.name = name || 'DOMException'
    }
  }
}
