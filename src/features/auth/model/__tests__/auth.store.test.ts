/**
 * Comprehensive tests for Auth Store
 */
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/entities/session'
import type { User } from '@/entities/user'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as authApi from '@/features/auth/api/auth.api'

import { secureTokenManager } from '@/shared/lib/auth'
import { analytics } from '@/shared/lib/monitoring'
import { authLogger } from '@/shared/lib/monitoring'
import { useAppStore } from '@/shared/stores'

import { useAuthStore } from '../auth.store'

// Mock dependencies
vi.mock('@/features/auth/api/auth.api')
vi.mock('@/shared/lib/auth/secure-token-manager')
vi.mock('@/shared/lib/monitoring')
vi.mock('@/shared/lib/monitoring')
vi.mock('@/shared/stores')

// Mock data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  role: 'user',
  permissions: [],
  emailVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockTokens = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-456',
  tokenType: 'Bearer',
  expiresIn: 3600,
  refreshExpiresIn: 86400,
}

const mockAuthResponse: AuthResponse = {
  user: mockUser,
  tokens: mockTokens,
}

const mockLoginRequest: LoginRequest = {
  email: 'test@example.com',
  password: 'password123',
  rememberMe: true,
}

const mockRegisterRequest: RegisterRequest = {
  email: 'test@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  acceptTerms: true,
}

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState(useAuthStore.getInitialState())

    // Clear all mocks
    vi.clearAllMocks()

    // Set up default mock implementations
    vi.mocked(secureTokenManager.setTokens).mockResolvedValue()
    vi.mocked(secureTokenManager.clearTokens).mockResolvedValue()
    vi.mocked(secureTokenManager.hasTokens).mockResolvedValue(false)
    vi.mocked(secureTokenManager.getRefreshToken).mockResolvedValue(null)
    vi.mocked(secureTokenManager.isRefreshTokenExpired).mockResolvedValue(false)
    vi.mocked(secureTokenManager.setTokenExpiryCallback).mockImplementation(() => {})

    vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse)
    vi.mocked(authApi.register).mockResolvedValue(mockAuthResponse)
    vi.mocked(authApi.logout).mockResolvedValue()
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authApi.refreshTokens).mockResolvedValue(mockTokens)

    vi.mocked(useAppStore.getState).mockReturnValue({
      addNotification: vi.fn(),
    } as any)

    vi.mocked(authLogger.error).mockImplementation(() => {})
    vi.mocked(authLogger.warn).mockImplementation(() => {})
    vi.mocked(analytics.trackError).mockImplementation(() => {})
    vi.mocked(analytics.trackEvent).mockImplementation(() => {})
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()

      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('login', () => {
    it('should handle successful login', async () => {
      const { login } = useAuthStore.getState()

      await login(mockLoginRequest)

      const state = useAuthStore.getState()

      // Verify API was called
      expect(authApi.login).toHaveBeenCalledWith(mockLoginRequest)

      // Verify tokens were saved
      expect(secureTokenManager.setTokens).toHaveBeenCalledWith(mockTokens)

      // Verify token expiry callback was set
      expect(secureTokenManager.setTokenExpiryCallback).toHaveBeenCalled()

      // Verify state was updated
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()

      // Verify success notification
      expect(useAppStore.getState().addNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Welcome back!',
        message: `Logged in as ${mockUser.email}`,
      })
    })

    it('should handle login API error', async () => {
      const loginError = new Error('Invalid credentials')
      vi.mocked(authApi.login).mockRejectedValue(loginError)

      const { login } = useAuthStore.getState()

      await expect(login(mockLoginRequest)).rejects.toThrow('Invalid credentials')

      const state = useAuthStore.getState()

      // Verify error state
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(loginError)

      // Verify error logging
      expect(authLogger.error).toHaveBeenCalledWith(
        'Auth login failed',
        loginError,
        expect.objectContaining({
          action: 'login',
          timestamp: expect.any(String),
        })
      )

      // Verify analytics tracking
      expect(analytics.trackError).toHaveBeenCalledWith(loginError, false)
      expect(analytics.trackEvent).toHaveBeenCalledWith('auth_error', {
        action: 'login',
        error_type: 'Error',
        error_message: 'Invalid credentials',
      })
    })

    it('should handle token storage error', async () => {
      const storageError = new Error('Storage error')
      vi.mocked(secureTokenManager.setTokens).mockRejectedValue(storageError)

      const { login } = useAuthStore.getState()

      await expect(login(mockLoginRequest)).rejects.toThrow('Storage error')

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBe(storageError)
    })

    it('should set loading state during login', async () => {
      let resolveLogin: (value: AuthResponse) => void
      const loginPromise = new Promise<AuthResponse>(resolve => {
        resolveLogin = resolve
      })
      vi.mocked(authApi.login).mockReturnValue(loginPromise)

      const { login } = useAuthStore.getState()

      // Start login
      const loginPromiseCall = login(mockLoginRequest)

      // Check loading state
      expect(useAuthStore.getState().isLoading).toBe(true)
      expect(useAuthStore.getState().error).toBeNull()

      // Resolve login
      resolveLogin!(mockAuthResponse)
      await loginPromiseCall

      // Check final state
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('register', () => {
    it('should handle successful registration', async () => {
      const { register } = useAuthStore.getState()

      await register(mockRegisterRequest)

      const state = useAuthStore.getState()

      // Verify API was called
      expect(authApi.register).toHaveBeenCalledWith(mockRegisterRequest)

      // Verify tokens were saved
      expect(secureTokenManager.setTokens).toHaveBeenCalledWith(mockTokens)

      // Verify state was updated
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()

      // Verify success notification
      expect(useAppStore.getState().addNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Account created!',
        message: 'Please check your email to verify your account.',
      })
    })

    it('should handle registration error', async () => {
      const registrationError = new Error('Email already exists')
      vi.mocked(authApi.register).mockRejectedValue(registrationError)

      const { register } = useAuthStore.getState()

      await expect(register(mockRegisterRequest)).rejects.toThrow('Email already exists')

      const state = useAuthStore.getState()

      // Verify error state
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(registrationError)

      // Verify error handling was called
      expect(authLogger.error).toHaveBeenCalledWith(
        'Auth register failed',
        registrationError,
        expect.objectContaining({
          action: 'register',
        })
      )
    })
  })

  describe('logout', () => {
    beforeEach(async () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    })

    it('should handle successful logout', async () => {
      const { logout } = useAuthStore.getState()

      await logout()

      const state = useAuthStore.getState()

      // Verify API was called
      expect(authApi.logout).toHaveBeenCalled()

      // Verify tokens were cleared
      expect(secureTokenManager.clearTokens).toHaveBeenCalled()

      // Verify state was reset
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()

      // Verify logout notification
      expect(useAppStore.getState().addNotification).toHaveBeenCalledWith({
        type: 'info',
        title: 'Logged out',
        message: 'You have been successfully logged out.',
      })
    })

    it('should handle logout API error gracefully', async () => {
      const logoutError = new Error('Network error')
      vi.mocked(authApi.logout).mockRejectedValue(logoutError)

      const { logout } = useAuthStore.getState()

      // Should not throw even if API fails
      await expect(logout()).resolves.not.toThrow()

      const state = useAuthStore.getState()

      // Should still clear local state
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)

      // Verify warning was logged
      expect(authLogger.warn).toHaveBeenCalledWith(
        'Logout API error, proceeding with local logout',
        logoutError
      )

      // Verify tokens were still cleared
      expect(secureTokenManager.clearTokens).toHaveBeenCalled()
    })

    it('should handle token clearing error', async () => {
      const clearError = new Error('Clear tokens error')
      vi.mocked(secureTokenManager.clearTokens).mockRejectedValue(clearError)

      const { logout } = useAuthStore.getState()

      // Logout should throw if token clearing fails (current implementation)
      await expect(logout()).rejects.toThrow('Clear tokens error')

      // State remains unchanged when token clearing fails (error prevents state reset)
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)

      // Notification should not be called when error occurs
      expect(useAppStore.getState().addNotification).not.toHaveBeenCalledWith({
        type: 'info',
        title: 'Logged out',
        message: 'You have been successfully logged out.',
      })
    })
  })

  describe('updateUser', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    })

    it('should update user data when authenticated', () => {
      const { updateUser } = useAuthStore.getState()

      const updates = {
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
      }

      updateUser(updates)

      const state = useAuthStore.getState()

      expect(state.user).toEqual({
        ...mockUser,
        ...updates,
      })
    })

    it('should do nothing when user is null', () => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })

      const { updateUser } = useAuthStore.getState()

      updateUser({ firstName: 'Jane' })

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
    })
  })

  describe('checkAuth', () => {
    it('should authenticate when valid tokens exist', async () => {
      vi.mocked(secureTokenManager.hasTokens).mockResolvedValue(true)

      const { checkAuth } = useAuthStore.getState()

      await checkAuth()

      const state = useAuthStore.getState()

      // Verify tokens were checked
      expect(secureTokenManager.hasTokens).toHaveBeenCalled()

      // Verify user was fetched
      expect(authApi.getCurrentUser).toHaveBeenCalled()

      // Verify token expiry callback was set
      expect(secureTokenManager.setTokenExpiryCallback).toHaveBeenCalled()

      // Verify state was updated
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should not authenticate when no tokens exist', async () => {
      vi.mocked(secureTokenManager.hasTokens).mockResolvedValue(false)

      const { checkAuth } = useAuthStore.getState()

      await checkAuth()

      const state = useAuthStore.getState()

      // Verify user was not fetched
      expect(authApi.getCurrentUser).not.toHaveBeenCalled()

      // Verify state is unauthenticated
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })

    it('should handle invalid tokens by clearing them', async () => {
      vi.mocked(secureTokenManager.hasTokens).mockResolvedValue(true)
      const authError = new Error('Unauthorized')
      vi.mocked(authApi.getCurrentUser).mockRejectedValue(authError)

      const { checkAuth } = useAuthStore.getState()

      await expect(checkAuth()).rejects.toThrow('Unauthorized')

      // Verify tokens were cleared
      expect(secureTokenManager.clearTokens).toHaveBeenCalled()

      // Verify error handling
      expect(authLogger.error).toHaveBeenCalledWith(
        'Auth checkAuth failed',
        authError,
        expect.objectContaining({
          action: 'checkAuth',
        })
      )
    })

    it('should set loading state during check', async () => {
      vi.mocked(secureTokenManager.hasTokens).mockResolvedValue(true)

      let resolveGetUser: (value: AuthUser) => void
      const getUserPromise = new Promise<AuthUser>(resolve => {
        resolveGetUser = resolve
      })
      vi.mocked(authApi.getCurrentUser).mockReturnValue(getUserPromise)

      const { checkAuth } = useAuthStore.getState()

      // Start check
      const checkPromise = checkAuth()

      // Verify loading state
      expect(useAuthStore.getState().isLoading).toBe(true)

      // Resolve check
      resolveGetUser!(mockUser)
      await checkPromise

      // Verify final state
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      const error = new Error('Test error')
      useAuthStore.setState({ error })

      const { clearError } = useAuthStore.getState()
      clearError()

      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('Token Expiry Callback', () => {
    it('should refresh tokens when refresh token is valid', async () => {
      const { login } = useAuthStore.getState()
      await login(mockLoginRequest)

      // Get the token expiry callback that was set
      const setTokenExpiryCallbackCall = vi.mocked(secureTokenManager.setTokenExpiryCallback).mock
        .calls[0]
      const tokenExpiryCallback = setTokenExpiryCallbackCall[0]

      // Mock refresh token available and not expired
      vi.mocked(secureTokenManager.getRefreshToken).mockResolvedValue('refresh-token-456')
      vi.mocked(secureTokenManager.isRefreshTokenExpired).mockResolvedValue(false)

      // Execute the callback
      await tokenExpiryCallback()

      // Verify refresh was called
      expect(authApi.refreshTokens).toHaveBeenCalledWith('refresh-token-456')
      expect(secureTokenManager.setTokens).toHaveBeenCalledWith(mockTokens)
    })

    it('should logout when refresh token is expired', async () => {
      const { login } = useAuthStore.getState()
      await login(mockLoginRequest)

      // Get the token expiry callback
      const setTokenExpiryCallbackCall = vi.mocked(secureTokenManager.setTokenExpiryCallback).mock
        .calls[0]
      const tokenExpiryCallback = setTokenExpiryCallbackCall[0]

      // Mock refresh token expired
      vi.mocked(secureTokenManager.getRefreshToken).mockResolvedValue('refresh-token-456')
      vi.mocked(secureTokenManager.isRefreshTokenExpired).mockResolvedValue(true)

      // Execute the callback and wait for completion
      await tokenExpiryCallback()

      // Wait a bit for the logout to complete since it's called without await in the callback
      await new Promise(resolve => setTimeout(resolve, 0))

      // Verify logout was called (tokens cleared)
      expect(secureTokenManager.clearTokens).toHaveBeenCalled()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should logout when refresh token is not available', async () => {
      const { login } = useAuthStore.getState()
      await login(mockLoginRequest)

      // Get the token expiry callback
      const setTokenExpiryCallbackCall = vi.mocked(secureTokenManager.setTokenExpiryCallback).mock
        .calls[0]
      const tokenExpiryCallback = setTokenExpiryCallbackCall[0]

      // Mock no refresh token
      vi.mocked(secureTokenManager.getRefreshToken).mockResolvedValue(null)

      // Execute the callback and wait for completion
      await tokenExpiryCallback()

      // Wait a bit for the logout to complete since it's called without await in the callback
      await new Promise(resolve => setTimeout(resolve, 0))

      // Verify logout was called
      expect(secureTokenManager.clearTokens).toHaveBeenCalled()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should logout when token refresh fails', async () => {
      const { login } = useAuthStore.getState()
      await login(mockLoginRequest)

      // Get the token expiry callback
      const setTokenExpiryCallbackCall = vi.mocked(secureTokenManager.setTokenExpiryCallback).mock
        .calls[0]
      const tokenExpiryCallback = setTokenExpiryCallbackCall[0]

      // Mock refresh token available but refresh fails
      vi.mocked(secureTokenManager.getRefreshToken).mockResolvedValue('refresh-token-456')
      vi.mocked(secureTokenManager.isRefreshTokenExpired).mockResolvedValue(false)
      vi.mocked(authApi.refreshTokens).mockRejectedValue(new Error('Refresh failed'))

      // Execute the callback and wait for completion
      await tokenExpiryCallback()

      // Wait a bit for the logout to complete since it's called without await in the callback
      await new Promise(resolve => setTimeout(resolve, 0))

      // Verify logout was called
      expect(secureTokenManager.clearTokens).toHaveBeenCalled()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('handleAuthError Helper', () => {
    it('should reset auth state on error', async () => {
      // Set up authenticated state first
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      const loginError = new Error('Test error')
      vi.mocked(authApi.login).mockRejectedValue(loginError)

      const { login } = useAuthStore.getState()

      await expect(login(mockLoginRequest)).rejects.toThrow('Test error')

      const state = useAuthStore.getState()

      // Verify state was reset
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(loginError)
    })
  })
})
