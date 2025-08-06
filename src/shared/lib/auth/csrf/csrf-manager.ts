/**
 * CSRF token management for state-changing requests
 * Only used in production with httpOnly cookies
 */
import { apiClient } from '@/shared/lib/http-client'

class CsrfManager {
  private csrfToken: string | null = null
  private csrfTokenExpiry: number = 0
  private fetchPromise: Promise<string | null> | null = null

  /**
   * Get CSRF token for state-changing requests
   * Caches token for 23 hours (assuming 24-hour rotation)
   */
  async getCsrfToken(): Promise<string | null> {
    // Only use CSRF tokens in production
    if (process.env.NODE_ENV !== 'production') {
      return null
    }

    // Check if we have a valid cached token
    if (this.csrfToken && Date.now() < this.csrfTokenExpiry) {
      return this.csrfToken
    }

    // If already fetching, wait for that request
    if (this.fetchPromise) {
      return this.fetchPromise
    }

    // Fetch new CSRF token
    this.fetchPromise = this.fetchCsrfToken()

    try {
      const token = await this.fetchPromise
      return token
    } finally {
      this.fetchPromise = null
    }
  }

  /**
   * Fetch CSRF token from backend
   */
  private async fetchCsrfToken(): Promise<string | null> {
    try {
      // Check if API client is available (may not be in test environments)
      if (!apiClient || typeof apiClient.get !== 'function') {
        console.warn('API client not available for CSRF token fetch')
        return null
      }

      const response = await apiClient.get<{ token: string }>('/auth/csrf-token')

      if (response && response.token) {
        this.csrfToken = response.token
        // Cache for 23 hours (1 hour before expiry for safety)
        this.csrfTokenExpiry = Date.now() + 23 * 60 * 60 * 1000
        return this.csrfToken
      }

      return null
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
      return null
    }
  }

  /**
   * Clear cached CSRF token
   */
  clearCsrfToken(): void {
    this.csrfToken = null
    this.csrfTokenExpiry = 0
    this.fetchPromise = null
  }

  /**
   * Check if a request method requires CSRF protection
   */
  requiresCsrfToken(method: string): boolean {
    const stateChangingMethods = ['post', 'put', 'patch', 'delete']
    return stateChangingMethods.includes(method.toLowerCase())
  }

  /**
   * Validate CSRF token exists for state-changing requests
   */
  validateCsrfToken(token: string | null, method: string): boolean {
    // In development, CSRF is not required
    if (process.env.NODE_ENV !== 'production') {
      return true
    }

    // Check if method requires CSRF
    if (!this.requiresCsrfToken(method)) {
      return true
    }

    // Token must exist for state-changing requests
    return token !== null
  }
}

// Export singleton instance
export const csrfManager = new CsrfManager()

// Export class for testing
export { CsrfManager }
