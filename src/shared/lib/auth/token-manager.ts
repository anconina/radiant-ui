import type { AuthTokens } from '@/shared/contracts'
import { config } from '@/shared/lib/environment'

interface StoredTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
  refreshExpiresAt: string
}

class TokenManager {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiryTimeout: NodeJS.Timeout | null = null
  private refreshPromise: Promise<AuthTokens> | null = null
  private onTokenExpiry?: () => void

  constructor() {
    this.loadTokens()
  }

  // Load tokens from storage
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

  // Validate stored tokens structure
  private isValidStoredTokens(tokens: any): tokens is StoredTokens {
    return (
      tokens &&
      typeof tokens.accessToken === 'string' &&
      typeof tokens.refreshToken === 'string' &&
      typeof tokens.expiresAt === 'string' &&
      typeof tokens.refreshExpiresAt === 'string'
    )
  }

  // Save tokens to storage
  setTokens(tokens: AuthTokens): void {
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
    const refreshExpiresAt = new Date(Date.now() + tokens.refreshExpiresIn * 1000).toISOString()

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
    } catch (error) {
      console.error('Failed to save tokens:', error)
    }
  }

  // Get access token
  getAccessToken(): string | null {
    return this.accessToken
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return this.refreshToken
  }

  // Check if tokens exist
  hasTokens(): boolean {
    return Boolean(this.accessToken && this.refreshToken)
  }

  // Clear all tokens
  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.refreshPromise = null

    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout)
      this.tokenExpiryTimeout = null
    }

    try {
      localStorage.removeItem(config.auth.tokenKey)
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }

  // Schedule automatic token refresh
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

  // Set token expiry callback
  setTokenExpiryCallback(callback: () => void): void {
    this.onTokenExpiry = callback
  }

  // Get or refresh tokens (prevents multiple refresh calls)
  async getOrRefreshToken(
    refreshFn: (token: string) => Promise<AuthTokens>
  ): Promise<string | null> {
    // If we have a valid access token, return it
    if (this.accessToken && !this.isTokenExpired()) {
      return this.accessToken
    }

    // If we don't have a refresh token, we can't refresh
    if (!this.refreshToken) {
      this.clearTokens()
      return null
    }

    // If we're already refreshing, wait for that to complete
    if (this.refreshPromise) {
      try {
        const tokens = await this.refreshPromise
        return tokens.accessToken
      } catch {
        return null
      }
    }

    // Start a new refresh
    this.refreshPromise = refreshFn(this.refreshToken)
      .then(tokens => {
        this.setTokens(tokens)
        this.refreshPromise = null
        return tokens
      })
      .catch(error => {
        this.clearTokens()
        this.refreshPromise = null
        throw error
      })

    try {
      const tokens = await this.refreshPromise
      return tokens.accessToken
    } catch {
      return null
    }
  }

  // Check if access token is expired
  private isTokenExpired(): boolean {
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

  // Check if refresh token is expired
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
}

// Export singleton instance
export const tokenManager = new TokenManager()
