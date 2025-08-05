import { secureTokenManager } from '@/shared/lib/auth'
import { setTokenProvider } from '@/shared/lib/http-client'

import { useAuthStore } from '../model/auth.store'

// Initialize auth system by connecting the token provider
export function initializeAuth() {
  // Set up token provider for API client
  setTokenProvider({
    getAccessToken: () => secureTokenManager.getAccessToken(),
    getRefreshToken: () => secureTokenManager.getRefreshToken(),
    setTokens: async tokens => {
      await secureTokenManager.setTokens(tokens)
    },
    clearTokens: async () => {
      await secureTokenManager.clearTokens()
      useAuthStore.getState().logout()
    },
  })
}
