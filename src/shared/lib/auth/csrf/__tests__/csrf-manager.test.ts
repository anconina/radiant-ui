/**
 * Tests for CSRF Manager
 */
import { server } from '@/mocks/server'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { config } from '@/shared/lib/environment'

import { CsrfManager, csrfManager } from '../csrf-manager'

// Mock CSRF token response
const mockCsrfToken = 'mock-csrf-token-123'

// Set up default handler for CSRF token
beforeEach(() => {
  server.use(
    http.get(`${config.api.baseUrl}/auth/csrf-token`, () => {
      return HttpResponse.json({ token: mockCsrfToken })
    })
  )
})

afterEach(() => {
  server.resetHandlers()
})

describe('CsrfManager', () => {
  let manager: CsrfManager

  beforeEach(() => {
    // Create fresh instance for each test
    manager = new CsrfManager()
    // Mock environment
    vi.stubEnv('NODE_ENV', 'production')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  describe('getCsrfToken', () => {
    it('should fetch CSRF token in production', async () => {
      const token = await manager.getCsrfToken()
      expect(token).toBe(mockCsrfToken)
    })

    it('should return null in development', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      const token = await manager.getCsrfToken()
      expect(token).toBeNull()
    })

    it('should cache token for 23 hours', async () => {
      // First request
      const token1 = await manager.getCsrfToken()
      expect(token1).toBe(mockCsrfToken)

      // Second request should use cache
      const token2 = await manager.getCsrfToken()
      expect(token2).toBe(mockCsrfToken)

      // Both tokens should be the same (from cache)
      expect(token1).toBe(token2)
    })

    it('should refetch token after cache expiry', async () => {
      // Mock Date.now to control time
      const originalNow = Date.now
      let currentTime = originalNow()
      Date.now = vi.fn(() => currentTime)

      // First fetch
      const token1 = await manager.getCsrfToken()
      expect(token1).toBe(mockCsrfToken)

      // Advance time by 24 hours
      currentTime += 24 * 60 * 60 * 1000

      // Should refetch
      const newToken = 'new-csrf-token-456'
      server.use(
        http.get(`${config.api.baseUrl}/auth/csrf-token`, () => {
          return HttpResponse.json({ token: newToken })
        })
      )

      const token2 = await manager.getCsrfToken()
      expect(token2).toBe(newToken)

      // Restore Date.now
      Date.now = originalNow
    })

    it('should handle concurrent requests with deduplication', async () => {
      let requestCount = 0
      server.use(
        http.get(`${config.api.baseUrl}/auth/csrf-token`, async () => {
          requestCount++
          await new Promise(resolve => setTimeout(resolve, 100))
          return HttpResponse.json({ token: mockCsrfToken })
        })
      )

      // Make concurrent requests
      const [token1, token2, token3] = await Promise.all([
        manager.getCsrfToken(),
        manager.getCsrfToken(),
        manager.getCsrfToken(),
      ])

      // All should return same token
      expect(token1).toBe(mockCsrfToken)
      expect(token2).toBe(mockCsrfToken)
      expect(token3).toBe(mockCsrfToken)

      // Only one request should be made
      expect(requestCount).toBe(1)
    })

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get(`${config.api.baseUrl}/auth/csrf-token`, () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        })
      )

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const token = await manager.getCsrfToken()

      expect(token).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch CSRF token:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should handle network errors', async () => {
      server.use(
        http.get(`${config.api.baseUrl}/auth/csrf-token`, () => {
          return HttpResponse.error()
        })
      )

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const token = await manager.getCsrfToken()

      expect(token).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('clearCsrfToken', () => {
    it('should clear cached token', async () => {
      // Fetch token
      const token1 = await manager.getCsrfToken()
      expect(token1).toBe(mockCsrfToken)

      // Clear token
      manager.clearCsrfToken()

      // Next fetch should make new request
      const newToken = 'new-csrf-token-789'
      server.use(
        http.get(`${config.api.baseUrl}/auth/csrf-token`, () => {
          return HttpResponse.json({ token: newToken })
        })
      )

      const token2 = await manager.getCsrfToken()
      expect(token2).toBe(newToken)
    })
  })

  describe('requiresCsrfToken', () => {
    it('should return true for state-changing methods', () => {
      expect(manager.requiresCsrfToken('post')).toBe(true)
      expect(manager.requiresCsrfToken('POST')).toBe(true)
      expect(manager.requiresCsrfToken('put')).toBe(true)
      expect(manager.requiresCsrfToken('PUT')).toBe(true)
      expect(manager.requiresCsrfToken('patch')).toBe(true)
      expect(manager.requiresCsrfToken('PATCH')).toBe(true)
      expect(manager.requiresCsrfToken('delete')).toBe(true)
      expect(manager.requiresCsrfToken('DELETE')).toBe(true)
    })

    it('should return false for safe methods', () => {
      expect(manager.requiresCsrfToken('get')).toBe(false)
      expect(manager.requiresCsrfToken('GET')).toBe(false)
      expect(manager.requiresCsrfToken('head')).toBe(false)
      expect(manager.requiresCsrfToken('HEAD')).toBe(false)
      expect(manager.requiresCsrfToken('options')).toBe(false)
      expect(manager.requiresCsrfToken('OPTIONS')).toBe(false)
    })
  })

  describe('validateCsrfToken', () => {
    it('should always return true in development', () => {
      vi.stubEnv('NODE_ENV', 'development')

      expect(manager.validateCsrfToken(null, 'POST')).toBe(true)
      expect(manager.validateCsrfToken('token', 'POST')).toBe(true)
      expect(manager.validateCsrfToken(null, 'GET')).toBe(true)
    })

    it('should validate token exists for state-changing requests in production', () => {
      expect(manager.validateCsrfToken('token', 'POST')).toBe(true)
      expect(manager.validateCsrfToken(null, 'POST')).toBe(false)
    })

    it('should not require token for safe methods in production', () => {
      expect(manager.validateCsrfToken(null, 'GET')).toBe(true)
      expect(manager.validateCsrfToken('token', 'GET')).toBe(true)
    })
  })
})

describe('csrfManager singleton', () => {
  it('should export singleton instance', () => {
    expect(csrfManager).toBeDefined()
    expect(csrfManager).toBeInstanceOf(CsrfManager)
  })
})
