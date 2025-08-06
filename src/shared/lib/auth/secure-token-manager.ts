/**
 * Secure token manager with environment-based storage strategies
 * Uses httpOnly cookies in production and localStorage in development
 */
import type { AuthTokens } from '@/shared/contracts'

import { tokenRotationManager } from './rotation/token-rotation-manager'
import { CookieStorageStrategy } from './strategies/cookie-storage.strategy'
import { LocalStorageStrategy } from './strategies/local-storage.strategy'
import type { TokenStorageStrategy } from './strategies/token-storage.strategy'

class SecureTokenManager {
  private strategy: TokenStorageStrategy
  private refreshPromise: Promise<AuthTokens> | null = null

  constructor() {
    // Select strategy based on environment
    this.strategy = this.createStrategy()

    // Configure token rotation manager
    this.configureTokenRotation()
  }

  /**
   * Initialize the token manager (call after all imports are resolved)
   */
  initialize(): void {
    // This method can be called after circular dependencies are resolved
    // Currently empty but available for future initialization needs
  }

  private createStrategy(): TokenStorageStrategy {
    // Use cookie strategy in production, localStorage in development
    if (process.env.NODE_ENV === 'production') {
      return new CookieStorageStrategy()
    }
    return new LocalStorageStrategy()
  }

  /**
   * Check if we have valid tokens
   */
  async hasTokens(): Promise<boolean> {
    const result = await this.strategy.hasTokens()
    return result
  }

  /**
   * Get the access token (returns null in production as it's in httpOnly cookie)
   */
  async getAccessToken(): Promise<string | null> {
    const result = await this.strategy.getAccessToken()
    return result
  }

  /**
   * Get the refresh token (returns null in production as it's in httpOnly cookie)
   */
  async getRefreshToken(): Promise<string | null> {
    const result = await this.strategy.getRefreshToken()
    return result
  }

  /**
   * Save tokens (in production, backend handles cookie setting)
   */
  async setTokens(tokens: AuthTokens): Promise<void> {
    await this.strategy.setTokens(tokens)
  }

  /**
   * Clear all tokens
   */
  async clearTokens(): Promise<void> {
    await this.strategy.clearTokens()
    this.refreshPromise = null
  }

  /**
   * Check if the access token is expired
   */
  async isTokenExpired(): Promise<boolean> {
    const result = await this.strategy.isTokenExpired()
    return result
  }

  /**
   * Check if the refresh token is expired
   */
  async isRefreshTokenExpired(): Promise<boolean> {
    const result = await this.strategy.isRefreshTokenExpired()
    return result
  }

  /**
   * Set callback for when token is about to expire
   */
  setTokenExpiryCallback(callback: () => void): void {
    this.strategy.setTokenExpiryCallback(callback)
  }

  /**
   * Get CSRF token for state-changing requests (production only)
   */
  async getCsrfToken(): Promise<string | null> {
    if ('getCsrfToken' in this.strategy) {
      return this.strategy.getCsrfToken()
    }
    return null
  }

  /**
   * Get or refresh access token with deduplication
   */
  async getOrRefreshToken(
    refreshFn: (token: string) => Promise<AuthTokens>
  ): Promise<string | null> {
    // In production, cookies are handled by backend
    if (process.env.NODE_ENV === 'production') {
      const hasTokens = await this.hasTokens()
      if (!hasTokens) {
        return null
      }
      // The backend will handle token refresh via cookies
      return 'cookie-auth'
    }

    // Development mode - use existing logic
    const accessToken = await this.getAccessToken()
    const isExpired = await this.isTokenExpired()

    if (accessToken && !isExpired) {
      return accessToken
    }

    const refreshToken = await this.getRefreshToken()
    if (!refreshToken) {
      await this.clearTokens()
      return null
    }

    // Prevent multiple refresh calls
    if (this.refreshPromise) {
      try {
        return await this.refreshPromise
      } catch {
        return null
      }
    }

    // Start a new refresh
    this.refreshPromise = refreshFn(refreshToken)
      .then(async tokens => {
        await this.setTokens(tokens)
        this.refreshPromise = null
        return tokens.accessToken
      })
      .catch(async error => {
        await this.clearTokens()
        this.refreshPromise = null
        throw error
      })

    try {
      return await this.refreshPromise
    } catch {
      return null
    }
  }

  /**
   * Configure token rotation manager
   */
  private configureTokenRotation(): void {
    // Set rotation callback
    tokenRotationManager.setRotationCallback(async (tokens: AuthTokens) => {
      await this.setTokens(tokens)
    })

    // Set refresh token function
    tokenRotationManager.setRefreshTokenFunction(async (refreshToken: string) => {
      if (!this.refreshTokenFn) {
        throw new Error('Refresh token function not configured')
      }
      return this.refreshTokenFn(refreshToken)
    })

    // Set get refresh token function
    tokenRotationManager.setGetRefreshTokenFunction(async () => {
      return this.getRefreshToken()
    })
  }

  /**
   * Set the refresh token function for rotation
   */
  setRefreshTokenFunction(fn: (refreshToken: string) => Promise<AuthTokens>): void {
    this.refreshTokenFn = fn
    tokenRotationManager.setRefreshTokenFunction(fn)
  }

  private refreshTokenFn?: (refreshToken: string) => Promise<AuthTokens>

  /**
   * Force token rotation
   */
  async forceTokenRotation(): Promise<AuthTokens | null> {
    return tokenRotationManager.forceRotation()
  }

  /**
   * Get token rotation state
   */
  getRotationState() {
    return tokenRotationManager.getRotationState()
  }

  /**
   * Check if we're using secure cookie storage
   */
  isUsingSecureCookies(): boolean {
    return process.env.NODE_ENV === 'production'
  }
}

// Export singleton instance
export const secureTokenManager = new SecureTokenManager()

// Export type for testing
export type { SecureTokenManager }
