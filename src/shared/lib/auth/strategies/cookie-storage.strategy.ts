/**
 * Cookie storage strategy for production environment
 * Works with httpOnly cookies set by the backend
 */
import { api } from '@/shared/lib/http-client'

import type { TokenStorageStrategy } from './token-storage.strategy'

export class CookieStorageStrategy implements TokenStorageStrategy {
  private tokenExpiryTimeout: NodeJS.Timeout | null = null
  private onTokenExpiry?: () => void
  private csrfToken: string | null = null
  private csrfTokenExpiry: number = 0

  constructor() {
    // In production, tokens are managed by httpOnly cookies
    // We need to check auth status on initialization
    this.checkAuthStatus()
  }

  private async checkAuthStatus(): Promise<void> {
    try {
      // The backend will validate the httpOnly cookies
      await api.get('/auth/status')
      // If successful, schedule token refresh based on cookie expiry
      this.scheduleTokenRefresh()
    } catch (error) {
      // No valid cookies, user is not authenticated
      console.debug('No valid auth cookies found')
    }
  }

  private scheduleTokenRefresh(): void {
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout)
    }

    // In production, we rely on the backend to tell us when to refresh
    // Schedule a check 14 minutes after login (for 15-minute tokens)
    this.tokenExpiryTimeout = setTimeout(
      () => {
        this.onTokenExpiry?.()
      },
      14 * 60 * 1000
    )
  }

  async hasTokens(): Promise<boolean> {
    try {
      // Check if we have valid auth cookies by calling a lightweight endpoint
      const response = await api.get('/auth/status')
      return response.data.authenticated === true
    } catch {
      return false
    }
  }

  getAccessToken(): null {
    // Access token is in httpOnly cookie, not accessible to JavaScript
    return null
  }

  getRefreshToken(): null {
    // Refresh token is in httpOnly cookie, not accessible to JavaScript
    return null
  }

  async setTokens(): Promise<void> {
    // In production, tokens are set by the backend as httpOnly cookies
    // This method is called after successful login/register
    // We just need to schedule the refresh
    this.scheduleTokenRefresh()
  }

  async clearTokens(): Promise<void> {
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout)
      this.tokenExpiryTimeout = null
    }

    // Clear CSRF token
    this.csrfToken = null
    this.csrfTokenExpiry = 0

    // The backend will clear the httpOnly cookies
    // This is typically called during logout
  }

  async isTokenExpired(): Promise<boolean> {
    try {
      // Let the backend check cookie validity
      const response = await api.get('/auth/status')
      return !response.data.authenticated
    } catch {
      return true
    }
  }

  async isRefreshTokenExpired(): Promise<boolean> {
    try {
      // Check if refresh token is still valid
      const response = await api.get('/auth/refresh-status')
      return !response.data.canRefresh
    } catch {
      return true
    }
  }

  setTokenExpiryCallback(callback: () => void): void {
    this.onTokenExpiry = callback
  }

  async getCsrfToken(): Promise<string | null> {
    // Check if we have a valid cached CSRF token
    if (this.csrfToken && Date.now() < this.csrfTokenExpiry) {
      return this.csrfToken
    }

    try {
      // Fetch a new CSRF token from the backend
      const response = await api.get('/auth/csrf-token')
      this.csrfToken = response.data.token
      // Cache for 23 hours (assuming 24-hour rotation)
      this.csrfTokenExpiry = Date.now() + 23 * 60 * 60 * 1000
      return this.csrfToken
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
      return null
    }
  }
}
