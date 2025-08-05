/**
 * Local storage strategy for development environment
 * Maintains backward compatibility with existing TokenManager
 */
import { config } from '@/shared/lib/environment'

import { tokenRotationManager } from '../rotation/token-rotation-manager'
import type { TokenStorageStrategy } from './token-storage.strategy'

interface StoredTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
  refreshExpiresAt: string
}

export class LocalStorageStrategy implements TokenStorageStrategy {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiryTimeout: NodeJS.Timeout | null = null
  private onTokenExpiry?: () => void

  constructor() {
    this.loadTokens()
  }

  private loadTokens(): void {
    try {
      const stored = localStorage.getItem(config.auth.tokenKey)
      if (stored) {
        const tokens: StoredTokens = JSON.parse(stored)
        if (this.isValidStoredTokens(tokens)) {
          this.accessToken = tokens.accessToken
          this.refreshToken = tokens.refreshToken
          this.scheduleTokenRefresh(tokens.expiresAt)
        } else {
          this.clearTokens()
        }
      }
    } catch (error) {
      console.error('Failed to load tokens:', error)
      this.clearTokens()
    }
  }

  private isValidStoredTokens(tokens: any): tokens is StoredTokens {
    return (
      tokens &&
      typeof tokens.accessToken === 'string' &&
      typeof tokens.refreshToken === 'string' &&
      typeof tokens.expiresAt === 'string' &&
      typeof tokens.refreshExpiresAt === 'string'
    )
  }

  hasTokens(): boolean {
    return Boolean(this.accessToken && this.refreshToken)
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getRefreshToken(): string | null {
    return this.refreshToken
  }

  setTokens(tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    refreshExpiresIn: number
  }): void {
    // Calculate expiry times with validation to handle fake timers in tests
    const now = Date.now()
    const accessExpiryTime = now + tokens.expiresIn * 1000
    const refreshExpiryTime = now + tokens.refreshExpiresIn * 1000

    // Validate the calculated times
    if (!isFinite(accessExpiryTime) || !isFinite(refreshExpiryTime)) {
      console.error('Invalid expiry time calculation:', {
        now,
        expiresIn: tokens.expiresIn,
        refreshExpiresIn: tokens.refreshExpiresIn,
      })
      return
    }

    const expiresAt = new Date(accessExpiryTime).toISOString()
    const refreshExpiresAt = new Date(refreshExpiryTime).toISOString()

    const storedTokens: StoredTokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt,
      refreshExpiresAt,
    }

    this.accessToken = tokens.accessToken
    this.refreshToken = tokens.refreshToken

    try {
      localStorage.setItem(config.auth.tokenKey, JSON.stringify(storedTokens))
      this.scheduleTokenRefresh(expiresAt)

      // Schedule automatic token rotation
      tokenRotationManager.scheduleRotation(tokens)
    } catch (error) {
      console.error('Failed to save tokens:', error)
    }
  }

  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null

    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout)
      this.tokenExpiryTimeout = null
    }

    // Clear scheduled token rotations
    tokenRotationManager.clearScheduledRotations()

    try {
      localStorage.removeItem(config.auth.tokenKey)
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }

  isTokenExpired(): boolean {
    try {
      const stored = localStorage.getItem(config.auth.tokenKey)
      if (!stored) return true

      const tokens: StoredTokens = JSON.parse(stored)
      const expiryTime = new Date(tokens.expiresAt).getTime()

      // Consider token expired 1 minute before actual expiry
      return Date.now() >= expiryTime - 60000
    } catch {
      return true
    }
  }

  isRefreshTokenExpired(): boolean {
    try {
      const stored = localStorage.getItem(config.auth.tokenKey)
      if (!stored) return true

      const tokens: StoredTokens = JSON.parse(stored)
      const refreshExpiryTime = new Date(tokens.refreshExpiresAt).getTime()

      return Date.now() >= refreshExpiryTime
    } catch {
      return true
    }
  }

  setTokenExpiryCallback(callback: () => void): void {
    this.onTokenExpiry = callback
  }

  private scheduleTokenRefresh(expiresAt: string): void {
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout)
    }

    const expiryTime = new Date(expiresAt).getTime()
    const now = Date.now()

    // Refresh 1 minute before expiry
    const refreshTime = expiryTime - now - 60000

    if (refreshTime > 0) {
      this.tokenExpiryTimeout = setTimeout(() => {
        this.onTokenExpiry?.()
      }, refreshTime)
    } else {
      // Token is already expired or about to expire
      this.onTokenExpiry?.()
    }
  }
}
