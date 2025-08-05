/**
 * Token Rotation Manager
 * Handles automatic token rotation before expiry
 */
import type { AuthTokens } from '@/shared/contracts'
import { authLogger } from '@/shared/lib/monitoring'

import { rotationConflictHandler } from './rotation-conflict-handler'

interface RotationConfig {
  // Time before expiry to trigger rotation (in milliseconds)
  accessTokenRotationBuffer: number // Default: 5 minutes
  refreshTokenRotationBuffer: number // Default: 1 day
  // Maximum rotation attempts before giving up
  maxRetryAttempts: number // Default: 3
  // Base delay for exponential backoff (in milliseconds)
  baseRetryDelay: number // Default: 1000ms
}

interface RotationState {
  isRotating: boolean
  lastRotationTime: Date | null
  failedAttempts: number
  nextScheduledRotation: Date | null
}

export class TokenRotationManager {
  private config: RotationConfig
  private rotationState: RotationState = {
    isRotating: false,
    lastRotationTime: null,
    failedAttempts: 0,
    nextScheduledRotation: null,
  }
  private rotationPromise: Promise<AuthTokens> | null = null
  private rotationTimers: Map<string, NodeJS.Timeout> = new Map()
  private onRotationCallback?: (tokens: AuthTokens) => Promise<void>
  private refreshTokenFn?: (refreshToken: string) => Promise<AuthTokens>
  private getRefreshTokenFn?: () => Promise<string | null>

  constructor(config?: Partial<RotationConfig>) {
    this.config = {
      accessTokenRotationBuffer: 5 * 60 * 1000, // 5 minutes
      refreshTokenRotationBuffer: 24 * 60 * 60 * 1000, // 1 day
      maxRetryAttempts: 3,
      baseRetryDelay: 1000,
      ...config,
    }

    // Set up external rotation callback
    rotationConflictHandler.onExternalRotation = () => {
      authLogger.info('External token rotation detected, reloading tokens')
      // Token reload will be handled by the storage strategy
      // which will detect the updated tokens in storage
    }
  }

  /**
   * Set the callback function for token rotation
   */
  setRotationCallback(callback: (tokens: AuthTokens) => Promise<void>): void {
    this.onRotationCallback = callback
  }

  /**
   * Set the refresh token function
   */
  setRefreshTokenFunction(fn: (refreshToken: string) => Promise<AuthTokens>): void {
    this.refreshTokenFn = fn
  }

  /**
   * Set the function to get current refresh token
   */
  setGetRefreshTokenFunction(fn: () => Promise<string | null>): void {
    this.getRefreshTokenFn = fn
  }

  /**
   * Schedule token rotation based on expiry times
   */
  scheduleRotation(tokens: AuthTokens): void {
    this.clearScheduledRotations()

    // Calculate rotation times with validation
    const now = Date.now()

    // Validate inputs to handle fake timers in tests
    if (!isFinite(now) || !isFinite(tokens.expiresIn) || !isFinite(tokens.refreshExpiresIn)) {
      authLogger.error('Invalid time values for rotation scheduling', { now, tokens })
      return
    }

    const accessTokenExpiry = now + tokens.expiresIn * 1000
    const refreshTokenExpiry = now + tokens.refreshExpiresIn * 1000

    const accessRotationTime = accessTokenExpiry - this.config.accessTokenRotationBuffer
    const refreshRotationTime = refreshTokenExpiry - this.config.refreshTokenRotationBuffer

    // Schedule access token rotation
    const accessDelay = Math.max(0, accessRotationTime - now)
    if (accessDelay > 0) {
      const accessTimer = setTimeout(() => {
        this.rotateTokens('access')
      }, accessDelay)
      this.rotationTimers.set('access', accessTimer)

      authLogger.debug('Scheduled access token rotation', {
        rotationTime: new Date(accessRotationTime).toISOString(),
        delayMs: accessDelay,
      })
    }

    // Schedule refresh token rotation
    const refreshDelay = Math.max(0, refreshRotationTime - now)
    if (refreshDelay > 0) {
      const refreshTimer = setTimeout(() => {
        this.rotateTokens('refresh')
      }, refreshDelay)
      this.rotationTimers.set('refresh', refreshTimer)

      authLogger.debug('Scheduled refresh token rotation', {
        rotationTime: new Date(refreshRotationTime).toISOString(),
        delayMs: refreshDelay,
      })
    }

    // Update next scheduled rotation with validation
    const nextRotationTime = Math.min(accessRotationTime, refreshRotationTime)
    if (isFinite(nextRotationTime)) {
      this.rotationState.nextScheduledRotation = new Date(nextRotationTime)
    } else {
      authLogger.error('Invalid next rotation time calculated', {
        accessRotationTime,
        refreshRotationTime,
      })
      this.rotationState.nextScheduledRotation = null
    }
  }

  /**
   * Perform token rotation with race condition prevention
   */
  async rotateTokens(reason: 'access' | 'refresh' | 'manual'): Promise<AuthTokens | null> {
    // Check if rotation is already in progress
    if (this.rotationState.isRotating && this.rotationPromise) {
      authLogger.debug('Token rotation already in progress, waiting...')
      try {
        return await this.rotationPromise
      } catch (error) {
        return null
      }
    }

    // Validate prerequisites
    if (!this.refreshTokenFn || !this.onRotationCallback) {
      authLogger.error('Token rotation not configured properly')
      return null
    }

    // Start rotation
    this.rotationState.isRotating = true
    this.rotationPromise = this.performRotation(reason)

    try {
      const tokens = await this.rotationPromise
      return tokens
    } catch (error) {
      // Return null on rotation failure for consistent API
      return null
    } finally {
      this.rotationState.isRotating = false
      this.rotationPromise = null
    }
  }

  /**
   * Perform the actual token rotation
   */
  private async performRotation(reason: string): Promise<AuthTokens> {
    // Try to acquire rotation lock
    const lockAcquired = await rotationConflictHandler.acquireLock()

    if (!lockAcquired) {
      authLogger.info('Failed to acquire rotation lock, waiting for other rotation to complete')

      // Wait for the other rotation to complete
      const rotationCompleted = await rotationConflictHandler.waitForRotation()

      if (!rotationCompleted) {
        throw new Error('Timeout waiting for other rotation to complete')
      }

      // After waiting, check if we still need to rotate
      // The other tab might have already rotated the tokens
      const currentToken = await this.getCurrentRefreshToken()
      if (currentToken) {
        // Tokens were rotated by another tab, we can skip
        authLogger.info('Tokens already rotated by another tab')
        throw new Error('Token rotation completed by another instance')
      }

      // Try to acquire lock again
      const retryLock = await rotationConflictHandler.acquireLock()
      if (!retryLock) {
        throw new Error('Failed to acquire rotation lock after waiting')
      }
    }

    let rotationSuccess = false

    try {
      authLogger.info('Starting token rotation with lock acquired', { reason })

      // Get current refresh token (this would come from storage)
      const refreshToken = await this.getCurrentRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      // Call refresh token function
      const newTokens = await this.refreshTokenFn!(refreshToken)

      // Validate the response contains valid tokens
      if (
        !newTokens ||
        !newTokens.accessToken ||
        !newTokens.refreshToken ||
        typeof newTokens.expiresIn !== 'number' ||
        typeof newTokens.refreshExpiresIn !== 'number'
      ) {
        throw new Error(`Invalid tokens received from refresh: ${JSON.stringify(newTokens)}`)
      }

      // Update tokens via callback
      await this.onRotationCallback!(newTokens)

      // Reset failure counter on success
      this.rotationState.failedAttempts = 0
      this.rotationState.lastRotationTime = new Date()

      // Schedule next rotation
      this.scheduleRotation(newTokens)

      authLogger.info('Token rotation completed successfully', {
        reason,
        nextRotation: this.rotationState.nextScheduledRotation,
      })

      rotationSuccess = true
      return newTokens
    } catch (error) {
      this.rotationState.failedAttempts++
      authLogger.error('Token rotation failed', error as Error, {
        reason,
        attempt: this.rotationState.failedAttempts,
      })

      // Handle failure with exponential backoff
      if (this.rotationState.failedAttempts < this.config.maxRetryAttempts) {
        await this.scheduleRetry()
      } else {
        authLogger.error('Max rotation attempts reached, giving up')
        this.clearScheduledRotations()
      }

      throw error
    } finally {
      // Always release the lock
      rotationConflictHandler.releaseLock(rotationSuccess)
    }
  }

  /**
   * Schedule a retry with exponential backoff
   */
  private async scheduleRetry(): Promise<void> {
    const delay = this.calculateBackoffDelay()
    authLogger.debug('Scheduling rotation retry', {
      attempt: this.rotationState.failedAttempts,
      delayMs: delay,
    })

    await new Promise(resolve => setTimeout(resolve, delay))

    // Retry rotation
    if (this.rotationState.isRotating) {
      return // Another rotation started while we were waiting
    }

    await this.rotateTokens('retry')
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(): number {
    const attempt = this.rotationState.failedAttempts
    const delay = this.config.baseRetryDelay * Math.pow(2, attempt - 1)
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000
    return Math.min(delay + jitter, 30000) // Max 30 seconds
  }

  /**
   * Clear all scheduled rotations
   */
  clearScheduledRotations(): void {
    for (const [key, timer] of this.rotationTimers) {
      clearTimeout(timer)
      this.rotationTimers.delete(key)
    }
    this.rotationState.nextScheduledRotation = null
  }

  /**
   * Get current refresh token from storage
   * This will be implemented by the storage strategy
   */
  private async getCurrentRefreshToken(): Promise<string | null> {
    if (!this.getRefreshTokenFn) {
      authLogger.error('Get refresh token function not configured')
      return null
    }
    return this.getRefreshTokenFn()
  }

  /**
   * Get rotation state for monitoring
   */
  getRotationState(): Readonly<RotationState> {
    return { ...this.rotationState }
  }

  /**
   * Force immediate token rotation
   */
  async forceRotation(): Promise<AuthTokens | null> {
    this.clearScheduledRotations()
    return this.rotateTokens('manual')
  }

  /**
   * Check if tokens need rotation
   */
  needsRotation(expiresAt: Date): boolean {
    const now = Date.now()
    const expiryTime = expiresAt.getTime()
    const bufferTime = this.config.accessTokenRotationBuffer
    return now >= expiryTime - bufferTime
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.clearScheduledRotations()
    rotationConflictHandler.destroy()
    this.rotationPromise = null
    this.onRotationCallback = undefined
    this.refreshTokenFn = undefined
    this.getRefreshTokenFn = undefined
  }
}

// Export singleton instance
export const tokenRotationManager = new TokenRotationManager()

// Export type for testing
export type { TokenRotationManager, RotationConfig, RotationState }
