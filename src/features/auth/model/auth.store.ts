import type { LoginRequest, RegisterRequest } from '@/entities/session'
import type { User } from '@/entities/user'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import * as authApi from '@/features/auth/api/auth.api'

import { secureTokenManager } from '@/shared/lib/auth'
import { i18n } from '@/shared/lib/i18n'
import { analytics } from '@/shared/lib/monitoring'
import { authLogger } from '@/shared/lib/monitoring'
import { useAppStore } from '@/shared/stores'

// Define AuthState locally since it's feature-specific
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
}

interface AuthStore extends AuthState {
  // Auth initialization state
  isInitialized: boolean
  isInitializing: boolean

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => {
        // Private helper method for error handling
        const handleAuthError = (error: Error, action: string) => {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error,
          })

          authLogger.error(`Auth ${action} failed`, error, {
            timestamp: new Date().toISOString(),
            action,
          })

          // Analytics tracking
          analytics.trackError(error, false)
          analytics.trackEvent('auth_error', {
            action,
            error_type: error.constructor.name,
            error_message: error.message,
          })

          throw error
        }

        return {
          // Initial state
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isInitialized: false,
          isInitializing: false,

          // Actions
          login: async (credentials: LoginRequest) => {
            set({ isLoading: true, error: null })

            try {
              const response = await authApi.login(credentials)

              // Save tokens
              await secureTokenManager.setTokens(response.tokens)

              // Set token expiry callback to auto-refresh
              secureTokenManager.setTokenExpiryCallback(async () => {
                try {
                  const refreshToken = await secureTokenManager.getRefreshToken()
                  const isRefreshExpired = await secureTokenManager.isRefreshTokenExpired()
                  if (refreshToken && !isRefreshExpired) {
                    const tokens = await authApi.refreshTokens(refreshToken)
                    await secureTokenManager.setTokens(tokens)
                  } else {
                    // Refresh token expired, logout
                    get().logout()
                  }
                } catch (error) {
                  get().logout()
                }
              })

              set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })

              // Show success notification
              useAppStore.getState().addNotification({
                type: 'success',
                title: i18n.t('auth:login.notification.title'),
                message: i18n.t('auth:login.notification.message'),
              })
            } catch (error) {
              handleAuthError(error as Error, 'login')
            }
          },

          register: async (data: RegisterRequest) => {
            set({ isLoading: true, error: null })

            try {
              const response = await authApi.register(data)

              // Save tokens
              await secureTokenManager.setTokens(response.tokens)

              // Set token expiry callback
              secureTokenManager.setTokenExpiryCallback(async () => {
                try {
                  const refreshToken = await secureTokenManager.getRefreshToken()
                  const isRefreshExpired = await secureTokenManager.isRefreshTokenExpired()
                  if (refreshToken && !isRefreshExpired) {
                    const tokens = await authApi.refreshTokens(refreshToken)
                    await secureTokenManager.setTokens(tokens)
                  } else {
                    get().logout()
                  }
                } catch (error) {
                  get().logout()
                }
              })

              set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })

              // Show success notification
              useAppStore.getState().addNotification({
                type: 'success',
                title: i18n.t('auth:register.notification.title'),
                message: i18n.t('auth:register.notification.message'),
              })
            } catch (error) {
              handleAuthError(error as Error, 'register')
            }
          },

          logout: async () => {
            try {
              // Call logout API
              await authApi.logout()
            } catch (error) {
              // Even if API call fails, we should still logout locally
              authLogger.warn('Logout API error, proceeding with local logout', error as Error)
            } finally {
              // Clear tokens
              await secureTokenManager.clearTokens()

              // Reset state
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: false,
                isInitializing: false,
                error: null,
              })

              // Show notification
              useAppStore.getState().addNotification({
                type: 'info',
                title: i18n.t('auth:logout.notification.title'),
                message: i18n.t('auth:logout.notification.message'),
              })
            }
          },

          updateUser: (userData: Partial<User>) => {
            const currentUser = get().user
            if (currentUser) {
              set({
                user: { ...currentUser, ...userData },
              })
            }
          },

          checkAuth: async () => {
            const state = get()

            // Prevent multiple concurrent checkAuth calls
            if (state.isInitialized || state.isInitializing) {
              return
            }

            set({ isLoading: true, isInitializing: true })

            try {
              // Check if we have tokens
              const hasTokens = await secureTokenManager.hasTokens()
              if (!hasTokens) {
                set({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  isInitialized: true,
                  isInitializing: false,
                })
                return
              }

              // Get current user from API
              const user = await authApi.getCurrentUser()

              // Set token expiry callback
              secureTokenManager.setTokenExpiryCallback(async () => {
                try {
                  const refreshToken = await secureTokenManager.getRefreshToken()
                  const isRefreshExpired = await secureTokenManager.isRefreshTokenExpired()
                  if (refreshToken && !isRefreshExpired) {
                    const tokens = await authApi.refreshTokens(refreshToken)
                    await secureTokenManager.setTokens(tokens)
                  } else {
                    get().logout()
                  }
                } catch (error) {
                  get().logout()
                }
              })

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
                isInitializing: false,
                error: null,
              })
            } catch (error) {
              // Token invalid or expired - don't throw error to prevent infinite loops
              await secureTokenManager.clearTokens()
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
                isInitializing: false,
                error: error as Error,
              })

              authLogger.error('Auth checkAuth failed', error as Error, {
                timestamp: new Date().toISOString(),
                action: 'checkAuth',
              })

              // Analytics tracking but don't throw
              analytics.trackError(error as Error, false)
              analytics.trackEvent('auth_error', {
                action: 'checkAuth',
                error_type: (error as Error).constructor.name,
                error_message: (error as Error).message,
              })
            }
          },

          clearError: () => {
            set({ error: null })
          },
        }
      },
      {
        name: 'auth-storage',
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
)
