/**
 * Token storage strategy interface for environment-based implementations
 */
export interface TokenStorageStrategy {
  /**
   * Check if tokens exist in storage
   */
  hasTokens(): boolean | Promise<boolean>

  /**
   * Get the current access token
   * For httpOnly cookies, this will always return null as the token is not accessible
   */
  getAccessToken(): string | null | Promise<string | null>

  /**
   * Get the current refresh token
   * For httpOnly cookies, this will always return null as the token is not accessible
   */
  getRefreshToken(): string | null | Promise<string | null>

  /**
   * Save tokens to storage
   * For httpOnly cookies, this is handled by the backend
   */
  setTokens(tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    refreshExpiresIn: number
  }): void | Promise<void>

  /**
   * Clear all tokens from storage
   */
  clearTokens(): void | Promise<void>

  /**
   * Check if the access token is expired
   */
  isTokenExpired(): boolean | Promise<boolean>

  /**
   * Check if the refresh token is expired
   */
  isRefreshTokenExpired(): boolean | Promise<boolean>

  /**
   * Set a callback to be called when the token is about to expire
   */
  setTokenExpiryCallback(callback: () => void): void

  /**
   * Get CSRF token for requests (production only)
   */
  getCsrfToken?(): Promise<string | null>
}
