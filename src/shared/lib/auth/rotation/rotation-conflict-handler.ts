/**
 * Rotation Conflict Handler
 * Manages conflicts during token rotation across tabs/instances
 */
import { authLogger } from '@/shared/lib/monitoring'

interface RotationEvent {
  timestamp: number
  tabId: string
  status: 'started' | 'completed' | 'failed'
  version?: number
}

export class RotationConflictHandler {
  private readonly STORAGE_KEY = 'token_rotation_state'
  private readonly TAB_ID = this.generateTabId()
  private readonly ROTATION_TIMEOUT = 10000 // 10 seconds max for rotation
  private broadcastChannel?: BroadcastChannel
  private currentVersion = 0

  constructor() {
    this.initializeBroadcastChannel()
    this.cleanupStaleRotations()
  }

  /**
   * Initialize broadcast channel for cross-tab communication
   */
  private initializeBroadcastChannel(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('token_rotation')

      this.broadcastChannel.onmessage = event => {
        this.handleRotationMessage(event.data)
      }
    }
  }

  /**
   * Generate unique tab identifier
   */
  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Check if another rotation is in progress
   */
  async checkForConflict(): Promise<boolean> {
    const state = this.getRotationState()

    if (!state) {
      return false
    }

    // Check if rotation is from another tab
    if (state.tabId !== this.TAB_ID) {
      const elapsed = Date.now() - state.timestamp

      // If rotation is stale, clean it up
      if (elapsed > this.ROTATION_TIMEOUT) {
        authLogger.warn('Found stale rotation, cleaning up', {
          tabId: state.tabId,
          elapsed,
        })
        this.clearRotationState()
        return false
      }

      // Active rotation from another tab
      return true
    }

    return false
  }

  /**
   * Acquire rotation lock
   */
  async acquireLock(): Promise<boolean> {
    // Check for existing rotation
    if (await this.checkForConflict()) {
      authLogger.debug('Rotation conflict detected, waiting...', {
        tabId: this.TAB_ID,
      })
      return false
    }

    // Increment version for this rotation
    this.currentVersion++

    // Set rotation state
    const rotationEvent: RotationEvent = {
      timestamp: Date.now(),
      tabId: this.TAB_ID,
      status: 'started',
      version: this.currentVersion,
    }

    this.setRotationState(rotationEvent)
    this.broadcastRotationEvent(rotationEvent)

    // Double-check after a small delay (handle race conditions)
    await new Promise(resolve => setTimeout(resolve, 50))

    const currentState = this.getRotationState()
    if (currentState?.tabId !== this.TAB_ID || currentState?.version !== this.currentVersion) {
      authLogger.debug('Lost rotation race condition', {
        tabId: this.TAB_ID,
        expectedVersion: this.currentVersion,
        actualVersion: currentState?.version,
      })
      return false
    }

    return true
  }

  /**
   * Release rotation lock
   */
  releaseLock(success: boolean): void {
    const rotationEvent: RotationEvent = {
      timestamp: Date.now(),
      tabId: this.TAB_ID,
      status: success ? 'completed' : 'failed',
      version: this.currentVersion,
    }

    this.clearRotationState()
    this.broadcastRotationEvent(rotationEvent)

    authLogger.debug('Released rotation lock', {
      tabId: this.TAB_ID,
      success,
      version: this.currentVersion,
    })
  }

  /**
   * Handle rotation messages from other tabs
   */
  private handleRotationMessage(event: RotationEvent): void {
    if (event.tabId === this.TAB_ID) {
      return // Ignore our own messages
    }

    authLogger.debug('Received rotation event from another tab', event)

    // If another tab completed rotation, we might need to update our tokens
    if (event.status === 'completed') {
      // Trigger token reload from storage
      this.onExternalRotation?.()
    }
  }

  /**
   * Broadcast rotation event to other tabs
   */
  private broadcastRotationEvent(event: RotationEvent): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(event)
    }
  }

  /**
   * Get current rotation state from storage
   */
  private getRotationState(): RotationEvent | null {
    try {
      const state = localStorage.getItem(this.STORAGE_KEY)
      return state ? JSON.parse(state) : null
    } catch (error) {
      authLogger.error('Failed to get rotation state', error as Error)
      return null
    }
  }

  /**
   * Set rotation state in storage
   */
  private setRotationState(event: RotationEvent): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(event))
    } catch (error) {
      authLogger.error('Failed to set rotation state', error as Error)
    }
  }

  /**
   * Clear rotation state from storage
   */
  private clearRotationState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      authLogger.error('Failed to clear rotation state', error as Error)
    }
  }

  /**
   * Clean up stale rotations on initialization
   */
  private cleanupStaleRotations(): void {
    const state = this.getRotationState()

    if (state) {
      const elapsed = Date.now() - state.timestamp

      if (elapsed > this.ROTATION_TIMEOUT) {
        authLogger.info('Cleaning up stale rotation on startup', {
          tabId: state.tabId,
          elapsed,
        })
        this.clearRotationState()
      }
    }
  }

  /**
   * Set callback for external rotation events
   */
  onExternalRotation?: () => void

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close()
    }
  }

  /**
   * Wait for ongoing rotation to complete
   */
  async waitForRotation(maxWaitTime = 5000): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      if (!(await this.checkForConflict())) {
        return true
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    authLogger.warn('Timeout waiting for rotation to complete')
    return false
  }
}

// Export singleton instance for production
export const rotationConflictHandler = new RotationConflictHandler()

// Export type for testing
export type { RotationConflictHandler }
