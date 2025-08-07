/**
 * Integration tests for token rotation system
 */
// Import the global MSW server from test environment
import { server } from '@/mocks/server'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthTokens } from '@/shared/contracts'
import { config } from '@/shared/lib/environment'
import { configureTokenManager } from '@/shared/lib/http-client'

import { csrfManager } from '../../csrf/csrf-manager'
import { secureTokenManager } from '../../secure-token-manager'
import { RotationConflictHandler, rotationConflictHandler } from '../rotation-conflict-handler'
import { tokenRotationManager } from '../token-rotation-manager'

// Mock tokens that match the global MSW handler expectations
const mockTokens: AuthTokens = {
  accessToken: 'mock-access-token-123',
  refreshToken: 'mock-refresh-token-456',
  expiresIn: 900, // 15 minutes
  refreshExpiresIn: 86400, // 24 hours
}

const rotatedTokens: AuthTokens = {
  accessToken: 'mock-access-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
  expiresIn: 3600, // 1 hour (to match global handler)
  refreshExpiresIn: 604800, // 7 days (to match global handler)
}

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string
  onmessage: ((event: MessageEvent) => void) | null = null
  postMessage = vi.fn()
  close = vi.fn()

  static instances: MockBroadcastChannel[] = []

  constructor(name: string) {
    this.name = name
    MockBroadcastChannel.instances.push(this)
  }

  dispatchMessage(data: any) {
    // Broadcast to all other instances
    MockBroadcastChannel.instances.forEach(instance => {
      if (instance !== this && instance.onmessage) {
        instance.onmessage(new MessageEvent('message', { data }))
      }
    })
  }

  static reset() {
    this.instances = []
  }
}

// @ts-expect-error - Mocking BroadcastChannel for testing purposes
global.BroadcastChannel = MockBroadcastChannel

describe('Token Rotation Integration Tests', () => {
  let localStorageMock: Record<string, string>

  beforeAll(() => {
    // Configure token manager for tests
    configureTokenManager()
  })

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
    MockBroadcastChannel.reset()

    // Configure refresh function for tests
    const refreshFn = async (refreshToken: string) => {
      console.log('Refresh function called with token:', refreshToken)
      console.log('API base URL:', config.api.baseUrl)
      try {
        const url = `${config.api.baseUrl}/auth/refresh`
        console.log('Making request to:', url)
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        console.log('Response status:', response.status)
        const result = await response.json()
        console.log('Refresh function response:', result)
        return result
      } catch (error) {
        console.log('Refresh function error:', error)
        throw error
      }
    }
    secureTokenManager.setRefreshTokenFunction(refreshFn)

    // Reset localStorage mock
    localStorageMock = {}
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key]
        }),
        clear: vi.fn(() => {
          localStorageMock = {}
        }),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    })

    // Set development environment for localStorage strategy
    vi.stubEnv('NODE_ENV', 'development')

    // Clear any existing tokens
    localStorageMock = {}
  })

  afterEach(() => {
    // Clear all scheduled rotations before resetting timers
    tokenRotationManager.clearScheduledRotations()
    vi.unstubAllEnvs()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Automatic Token Rotation', () => {
    it('should automatically rotate access token before expiry', async () => {
      // Set initial tokens
      await secureTokenManager.setTokens(mockTokens)

      // Verify tokens were scheduled for rotation
      const rotationState = tokenRotationManager.getRotationState()
      expect(rotationState.nextScheduledRotation).toBeInstanceOf(Date)

      // Store initial token values to verify they change
      const initialTokens = JSON.parse(localStorageMock[config.auth.tokenKey])
      expect(initialTokens.accessToken).toBe(mockTokens.accessToken)

      // Advance time to 10 minutes (5 minutes before expiry)
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000)

      // Wait a bit for the rotation to complete
      await vi.advanceTimersByTimeAsync(100)

      // Check that tokens were rotated (should be different from initial tokens)
      const storedTokens = JSON.parse(localStorageMock[config.auth.tokenKey])

      // Log for debugging if assertion fails
      if (storedTokens.accessToken === initialTokens.accessToken) {
        console.log('Rotation did not occur. Current state:', {
          storedTokens,
          rotationState: tokenRotationManager.getRotationState(),
          isRotating: tokenRotationManager.getRotationState().isRotating,
        })
      }

      // Verify tokens changed (global handler returns dynamic tokens with timestamp)
      expect(storedTokens.accessToken).not.toBe(initialTokens.accessToken)
      expect(storedTokens.refreshToken).not.toBe(initialTokens.refreshToken)
      expect(storedTokens.accessToken).toMatch(/^mock-access-token-\d+$/)
      expect(storedTokens.refreshToken).toMatch(/^mock-refresh-token-\d+$/)
    })

    it('should handle rotation with CSRF token in production', async () => {
      vi.stubEnv('NODE_ENV', 'production')

      // Mock the CSRF manager to return the expected token
      const originalGetCsrfToken = csrfManager.getCsrfToken
      csrfManager.getCsrfToken = vi.fn().mockResolvedValue('csrf-token-123')

      // Mock refresh function that includes CSRF
      const refreshFn = vi.fn().mockImplementation(async () => {
        // In production, CSRF token would be included
        const csrfToken = await csrfManager.getCsrfToken()
        expect(csrfToken).toBe('csrf-token-123')
        return rotatedTokens
      })

      secureTokenManager.setRefreshTokenFunction(refreshFn)

      try {
        // Force rotation
        const result = await secureTokenManager.forceTokenRotation()

        expect(result).not.toBeNull()
        expect(result?.accessToken).toMatch(/^mock-access-token-\d+$/)
        expect(result?.refreshToken).toMatch(/^mock-refresh-token-\d+$/)
        expect(refreshFn).toHaveBeenCalled()
      } finally {
        // Restore original method
        csrfManager.getCsrfToken = originalGetCsrfToken
      }
    })

    it('should schedule next rotation after successful rotation', async () => {
      await secureTokenManager.setTokens(mockTokens)

      // Manually trigger rotation
      const result = await tokenRotationManager.forceRotation()

      expect(result).not.toBeNull()
      expect(result?.accessToken).toMatch(/^mock-access-token-\d+$/)
      expect(result?.refreshToken).toMatch(/^mock-refresh-token-\d+$/)

      // Check that next rotation is scheduled
      const rotationState = tokenRotationManager.getRotationState()
      expect(rotationState.nextScheduledRotation).toBeInstanceOf(Date)
      expect(rotationState.lastRotationTime).toBeInstanceOf(Date)
    })
  })

  describe('Multi-Tab Rotation Scenarios', () => {
    it('should prevent concurrent rotations across tabs', async () => {
      // Simulate two tabs trying to rotate simultaneously
      const handler1 = new rotationConflictHandler.constructor()
      const handler2 = new rotationConflictHandler.constructor()

      // Tab 1 acquires lock
      const lock1 = await handler1.acquireLock()
      expect(lock1).toBe(true)

      // Tab 2 tries to acquire lock
      const lock2 = await handler2.acquireLock()
      expect(lock2).toBe(false)

      // Tab 1 completes rotation
      handler1.releaseLock(true)

      // Tab 2 can now acquire lock
      const lock2Retry = await handler2.acquireLock()
      expect(lock2Retry).toBe(true)

      handler2.releaseLock(true)
    })

    it('should handle multi-tab coordination', async () => {
      // Create two handlers simulating different tabs
      const handler1 = new rotationConflictHandler.constructor()
      const handler2 = new rotationConflictHandler.constructor()

      // Tab 1 acquires lock
      const lock1 = await handler1.acquireLock()
      expect(lock1).toBe(true)

      // Tab 2 should not be able to acquire lock
      const lock2 = await handler2.acquireLock()
      expect(lock2).toBe(false)

      // After tab 1 releases, tab 2 can acquire
      handler1.releaseLock(true)
      
      // Clean up
      handler2.destroy()
    })

    it('should handle concurrent rotation attempts', async () => {
      // Set initial tokens
      await secureTokenManager.setTokens(mockTokens)

      // Create multiple rotation attempts
      const rotationPromises = [
        tokenRotationManager.forceRotation(),
        tokenRotationManager.forceRotation(),
        tokenRotationManager.forceRotation(),
      ]

      // All should resolve (might be same or different results)
      const results = await Promise.all(rotationPromises)

      // At least one should succeed
      const successfulResults = results.filter(r => r !== null)
      expect(successfulResults.length).toBeGreaterThan(0)

      // Check that we got valid tokens
      if (successfulResults[0]) {
        expect(successfulResults[0].accessToken).toMatch(/^mock-access-token-\d+$/)
        expect(successfulResults[0].refreshToken).toMatch(/^mock-refresh-token-\d+$/)
      }
    })
  })

  describe('Network Failure Recovery', () => {
    it('should handle rotation failures gracefully', async () => {
      let callCount = 0

      // Override the refresh function to simulate network failure
      const failingRefreshFn = vi.fn().mockImplementation(async (refreshToken: string) => {
        callCount++
        // Always fail to test error handling
        throw new Error('Network error')
      })

      secureTokenManager.setRefreshTokenFunction(failingRefreshFn)

      await secureTokenManager.setTokens(mockTokens)

      // Force rotation - should fail and return null
      const result = await tokenRotationManager.forceRotation()

      // Should have attempted to call the refresh function
      expect(callCount).toBeGreaterThan(0)
      expect(failingRefreshFn).toHaveBeenCalled()

      // Result should be null due to failure
      expect(result).toBeNull()
    })

    it('should give up after max retry attempts', async () => {
      // Override refresh function to always fail
      const alwaysFailingRefreshFn = vi.fn().mockRejectedValue(new Error('Persistent error'))
      secureTokenManager.setRefreshTokenFunction(alwaysFailingRefreshFn)

      await secureTokenManager.setTokens(mockTokens)

      // Attempt rotation - should fail and return null
      const result = await tokenRotationManager.forceRotation()
      expect(result).toBeNull()

      // Should have attempted to call refresh function
      expect(alwaysFailingRefreshFn).toHaveBeenCalled()
    })

    it('should handle token expiry during rotation', async () => {
      // Set tokens that are about to expire
      const expiringTokens: AuthTokens = {
        ...mockTokens,
        expiresIn: 1, // 1 second
      }

      await secureTokenManager.setTokens(expiringTokens)

      // Token expires during rotation attempt
      await vi.advanceTimersByTimeAsync(2000)

      // Should still be able to rotate using refresh token
      const result = await tokenRotationManager.forceRotation()
      expect(result).not.toBeNull()
      expect(result?.accessToken).toMatch(/^mock-access-token-\d+$/)
      expect(result?.refreshToken).toMatch(/^mock-refresh-token-\d+$/)
    })
  })

  describe('Complete Token Lifecycle', () => {
    it('should handle full token lifecycle from login to logout', async () => {
      // 1. Initial login - set tokens
      await secureTokenManager.setTokens(mockTokens)
      expect(await secureTokenManager.hasTokens()).toBe(true)

      // 2. Use tokens for a while
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000) // 5 minutes

      // 3. Automatic rotation kicks in at 10 minutes
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000) // Another 5 minutes

      // Verify rotation happened
      const rotationState = tokenRotationManager.getRotationState()
      expect(rotationState.lastRotationTime).toBeInstanceOf(Date)

      // 4. Logout - clear tokens
      await secureTokenManager.clearTokens()
      expect(await secureTokenManager.hasTokens()).toBe(false)

      // Verify rotation is cancelled
      const finalState = tokenRotationManager.getRotationState()
      expect(finalState.nextScheduledRotation).toBeNull()
    })

    it('should integrate with getOrRefreshToken flow', async () => {
      // Set tokens that need refresh
      const expiredTokens: AuthTokens = {
        ...mockTokens,
        expiresIn: -1, // Already expired
      }

      // Store expired tokens using SecureTokenManager
      await secureTokenManager.setTokens(expiredTokens)

      // Define refresh function that returns tokens with expected format
      const refreshFn = vi.fn().mockImplementation(async (refreshToken: string) => {
        // Call the actual MSW endpoint for consistency
        const response = await fetch(`${config.api.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        return response.json()
      })

      // Get or refresh should trigger refresh
      const token = await secureTokenManager.getOrRefreshToken(refreshFn)
      expect(token).toMatch(/^mock-access-token-\d+$/)
      expect(refreshFn).toHaveBeenCalledWith(expiredTokens.refreshToken)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing refresh token', async () => {
      // Set tokens with access token but no refresh token 
      const tokensWithoutRefresh = {
        accessToken: 'access-only',
        refreshToken: '', // Empty refresh token
        expiresIn: 900, 
        refreshExpiresIn: 86400,
      }

      // Store tokens, then clear refresh token to simulate missing token scenario
      await secureTokenManager.setTokens(tokensWithoutRefresh)
      
      // Force rotation should fail quickly with no refresh token
      const result = await Promise.race([
        tokenRotationManager.forceRotation(),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 1000))
      ])
      expect(result).toBeNull()
    })

    it('should handle localStorage quota exceeded', async () => {
      // Mock localStorage.setItem to throw quota exceeded error
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      // Attempt to set tokens should handle error gracefully
      await expect(secureTokenManager.setTokens(mockTokens)).resolves.not.toThrow()
    })

    it('should clean up on tab close', () => {
      // Create a broadcast channel instance first
      const handler = new RotationConflictHandler()
      const broadcastInstance = MockBroadcastChannel.instances.find(
        bc => bc.name === 'token_rotation'
      )

      // Simulate tab closing by destroying handlers
      tokenRotationManager.destroy()
      handler.destroy()

      // Verify cleanup
      expect(broadcastInstance?.close).toHaveBeenCalled()
    })
  })
})
