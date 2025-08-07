/**
 * Tests for Rotation Conflict Handler
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { authLogger } from '@/shared/lib/monitoring'

import { RotationConflictHandler } from '../rotation-conflict-handler'

// Mock dependencies
vi.mock('@/shared/lib/monitoring', () => ({
  authLogger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string
  onmessage: ((event: MessageEvent) => void) | null = null
  postMessage = vi.fn()
  close = vi.fn()

  constructor(name: string) {
    this.name = name
    mockBroadcastChannels.push(this)
  }

  dispatchMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }))
    }
  }
}

let mockBroadcastChannels: MockBroadcastChannel[] = []

// @ts-expect-error
global.BroadcastChannel = MockBroadcastChannel

describe('RotationConflictHandler', () => {
  let handler: RotationConflictHandler
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
    vi.clearAllMocks()

    // Reset broadcast channels
    mockBroadcastChannels = []

    // Mock localStorage
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
      },
      writable: true,
    })

    handler = new RotationConflictHandler()
  })

  afterEach(() => {
    // Destroy handler and clear all timers before resetting
    handler.destroy()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should create BroadcastChannel when available', () => {
      expect(mockBroadcastChannels).toHaveLength(1)
      expect(mockBroadcastChannels[0].name).toBe('token_rotation')
    })

    it('should clean up stale rotations on startup', () => {
      // Set up stale rotation state
      const staleRotation = {
        timestamp: Date.now() - 20000, // 20 seconds ago
        tabId: 'old-tab-123',
        status: 'started',
        version: 1,
      }
      localStorageMock['token_rotation_state'] = JSON.stringify(staleRotation)

      // Create new handler
      const handler2 = new RotationConflictHandler()

      expect(authLogger.info).toHaveBeenCalledWith(
        'Cleaning up stale rotation on startup',
        expect.objectContaining({
          tabId: 'old-tab-123',
        })
      )
      expect(localStorage.removeItem).toHaveBeenCalledWith('token_rotation_state')

      handler2.destroy()
    })

    it('should handle BroadcastChannel not being available', () => {
      // @ts-expect-error
      global.BroadcastChannel = undefined

      const handler2 = new RotationConflictHandler()

      // Should not throw and broadcast should be undefined
      expect(() => handler2.destroy()).not.toThrow()

      // @ts-expect-error - Restore for other tests
      global.BroadcastChannel = MockBroadcastChannel
    })
  })

  describe('checkForConflict', () => {
    it('should return false when no rotation state exists', async () => {
      const hasConflict = await handler.checkForConflict()
      expect(hasConflict).toBe(false)
    })

    it('should return true when another tab is rotating', async () => {
      const otherTabRotation = {
        timestamp: Date.now() - 1000, // 1 second ago
        tabId: 'other-tab-456',
        status: 'started',
        version: 1,
      }
      localStorageMock['token_rotation_state'] = JSON.stringify(otherTabRotation)

      const hasConflict = await handler.checkForConflict()
      expect(hasConflict).toBe(true)
    })

    it('should clean up stale rotation from another tab', async () => {
      const staleRotation = {
        timestamp: Date.now() - 15000, // 15 seconds ago (stale)
        tabId: 'stale-tab-789',
        status: 'started',
        version: 1,
      }
      localStorageMock['token_rotation_state'] = JSON.stringify(staleRotation)

      const hasConflict = await handler.checkForConflict()

      expect(hasConflict).toBe(false)
      expect(authLogger.warn).toHaveBeenCalledWith(
        'Found stale rotation, cleaning up',
        expect.objectContaining({
          tabId: 'stale-tab-789',
        })
      )
      expect(localStorage.removeItem).toHaveBeenCalledWith('token_rotation_state')
    })

    it('should return false for own tab rotation', async () => {
      // Set our own tab's rotation state
      const ownTabRotation = {
        timestamp: Date.now(),
        tabId: (handler as any).TAB_ID, // Access private property for testing
        status: 'started',
        version: 1,
      }
      localStorageMock['token_rotation_state'] = JSON.stringify(ownTabRotation)

      // Should return false for own tab
      const hasConflict = await handler.checkForConflict()
      expect(hasConflict).toBe(false)
    })
  })

  describe('acquireLock', () => {
    it('should successfully acquire lock when no conflict exists', async () => {
      const acquired = await handler.acquireLock()

      expect(acquired).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'token_rotation_state',
        expect.stringContaining('"status":"started"')
      )

      // Should broadcast the rotation event
      expect(mockBroadcastChannels[0].postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'started',
          version: 1,
        })
      )
    })

    it('should fail to acquire lock when another tab is rotating', async () => {
      const otherTabRotation = {
        timestamp: Date.now() - 1000,
        tabId: 'other-tab-123',
        status: 'started',
        version: 1,
      }
      localStorageMock['token_rotation_state'] = JSON.stringify(otherTabRotation)

      const acquired = await handler.acquireLock()

      expect(acquired).toBe(false)
      expect(authLogger.debug).toHaveBeenCalledWith(
        'Rotation conflict detected, waiting...',
        expect.any(Object)
      )
    })

    it('should handle race conditions with version tracking', async () => {
      // Simulate race condition where another tab wins
      let callCount = 0
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call - no rotation
          return null
        } else {
          // Second call - another tab won the race
          return JSON.stringify({
            timestamp: Date.now(),
            tabId: 'winner-tab-456',
            status: 'started',
            version: 2,
          })
        }
      })

      const acquired = await handler.acquireLock()

      expect(acquired).toBe(false)
      expect(authLogger.debug).toHaveBeenCalledWith(
        'Lost rotation race condition',
        expect.any(Object)
      )
    })

    it('should increment version number for each rotation', async () => {
      // First lock
      await handler.acquireLock()
      handler.releaseLock(true)

      // Second lock
      await handler.acquireLock()

      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'token_rotation_state',
        expect.stringContaining('"version":2')
      )
    })
  })

  describe('releaseLock', () => {
    it('should release lock and broadcast completion', async () => {
      await handler.acquireLock()

      handler.releaseLock(true)

      expect(localStorage.removeItem).toHaveBeenCalledWith('token_rotation_state')
      expect(mockBroadcastChannels[0].postMessage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'completed',
          version: 1,
        })
      )
      expect(authLogger.debug).toHaveBeenCalledWith(
        'Released rotation lock',
        expect.objectContaining({
          success: true,
        })
      )
    })

    it('should broadcast failure status when rotation fails', async () => {
      await handler.acquireLock()

      handler.releaseLock(false)

      expect(mockBroadcastChannels[0].postMessage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'failed',
          version: 1,
        })
      )
    })
  })

  describe('BroadcastChannel messaging', () => {
    it('should handle rotation messages from other tabs', async () => {
      const externalRotationCallback = vi.fn()
      handler.onExternalRotation = externalRotationCallback

      const externalMessage = {
        timestamp: Date.now(),
        tabId: 'external-tab-789',
        status: 'completed' as const,
        version: 1,
      }

      // Simulate message from another tab
      mockBroadcastChannels[0].dispatchMessage(externalMessage)

      expect(authLogger.debug).toHaveBeenCalledWith(
        'Received rotation event from another tab',
        externalMessage
      )
      expect(externalRotationCallback).toHaveBeenCalled()
    })

    it('should ignore messages from own tab', async () => {
      const externalRotationCallback = vi.fn()
      handler.onExternalRotation = externalRotationCallback

      // Acquire lock to get our tab ID
      await handler.acquireLock()

      // Get the message that was broadcast
      const ourMessage = mockBroadcastChannels[0].postMessage.mock.calls[0][0]

      // Simulate receiving our own message
      mockBroadcastChannels[0].dispatchMessage(ourMessage)

      expect(externalRotationCallback).not.toHaveBeenCalled()
    })

    it('should only trigger callback for completed rotations', async () => {
      const externalRotationCallback = vi.fn()
      handler.onExternalRotation = externalRotationCallback

      // Send 'started' message
      mockBroadcastChannels[0].dispatchMessage({
        timestamp: Date.now(),
        tabId: 'external-tab-123',
        status: 'started',
        version: 1,
      })

      expect(externalRotationCallback).not.toHaveBeenCalled()

      // Send 'failed' message
      mockBroadcastChannels[0].dispatchMessage({
        timestamp: Date.now(),
        tabId: 'external-tab-456',
        status: 'failed',
        version: 2,
      })

      expect(externalRotationCallback).not.toHaveBeenCalled()

      // Send 'completed' message
      mockBroadcastChannels[0].dispatchMessage({
        timestamp: Date.now(),
        tabId: 'external-tab-789',
        status: 'completed',
        version: 3,
      })

      expect(externalRotationCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('waitForRotation', () => {
    it('should wait for rotation to complete', async () => {
      // Set up active rotation
      localStorageMock['token_rotation_state'] = JSON.stringify({
        timestamp: Date.now(),
        tabId: 'other-tab-123',
        status: 'started',
        version: 1,
      })

      const waitPromise = handler.waitForRotation(5000)

      // After 200ms, clear the rotation
      setTimeout(() => {
        delete localStorageMock['token_rotation_state']
      }, 200)

      // Advance timers
      await vi.advanceTimersByTimeAsync(300)

      const result = await waitPromise
      expect(result).toBe(true)
    })

    it('should timeout if rotation takes too long', async () => {
      // Set up active rotation that never completes
      localStorageMock['token_rotation_state'] = JSON.stringify({
        timestamp: Date.now(),
        tabId: 'stuck-tab-456',
        status: 'started',
        version: 1,
      })

      const waitPromise = handler.waitForRotation(1000)

      // Advance past timeout
      await vi.advanceTimersByTimeAsync(1100)

      const result = await waitPromise
      expect(result).toBe(false)
      expect(authLogger.warn).toHaveBeenCalledWith('Timeout waiting for rotation to complete')
    })

    it('should return immediately if no rotation is active', async () => {
      const result = await handler.waitForRotation(5000)
      expect(result).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const hasConflict = await handler.checkForConflict()

      expect(hasConflict).toBe(false)
      expect(authLogger.error).toHaveBeenCalledWith(
        'Failed to get rotation state',
        expect.any(Error)
      )
    })

    it('should handle JSON parse errors', async () => {
      localStorageMock['token_rotation_state'] = 'invalid json'

      const hasConflict = await handler.checkForConflict()

      expect(hasConflict).toBe(false)
      expect(authLogger.error).toHaveBeenCalledWith(
        'Failed to get rotation state',
        expect.any(Error)
      )
    })
  })

  describe('destroy', () => {
    it('should close BroadcastChannel when destroyed', () => {
      const broadcastChannel = mockBroadcastChannels[0]

      handler.destroy()

      expect(broadcastChannel.close).toHaveBeenCalled()
    })

    it('should handle destroy when BroadcastChannel is not available', () => {
      // Create handler without BroadcastChannel
      // @ts-expect-error
      global.BroadcastChannel = undefined
      const handler2 = new RotationConflictHandler()

      expect(() => handler2.destroy()).not.toThrow()

      // @ts-expect-error - Restore
      global.BroadcastChannel = MockBroadcastChannel
    })
  })
})
