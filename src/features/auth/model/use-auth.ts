import { useCallback, useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import type { LoginRequest, RegisterRequest } from '@/entities/session'

import { PERMISSIONS, type Permission, ROLES, type Role } from '@/shared/config'
import { ROUTES } from '@/shared/routes'

import { useAuthStore } from './auth.store'

interface UseAuthReturn {
  // State
  user: ReturnType<typeof useAuthStore>['user']
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: any) => void
  clearError: () => void

  // Utilities
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllRoles: (roles: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    isInitializing,
    login: authLogin,
    register: authRegister,
    logout: authLogout,
    updateUser,
    clearError,
    checkAuth,
  } = useAuthStore()

  // Check auth status on mount only if not already initialized or initializing
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      checkAuth()
    }
  }, [checkAuth, isInitialized, isInitializing])

  // Enhanced login with redirect
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await authLogin(credentials)

        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from?.pathname || ROUTES.dashboard
        navigate(from, { replace: true })
      } catch (error) {
        // Error is handled in the store
        throw error
      }
    },
    [authLogin, navigate, location]
  )

  // Enhanced register with redirect
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        await authRegister(data)

        // Redirect to dashboard after successful registration
        navigate(ROUTES.dashboard, { replace: true })
      } catch (error) {
        // Error is handled in the store
        throw error
      }
    },
    [authRegister, navigate]
  )

  // Enhanced logout with redirect
  const logout = useCallback(async () => {
    await authLogout()
    navigate(ROUTES.login, { replace: true })
  }, [authLogout, navigate])

  // Role checking utilities
  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.role === role
    },
    [user]
  )

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return user?.permissions?.includes(permission) || false
    },
    [user]
  )

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      return roles.some(role => user?.role === role)
    },
    [user]
  )

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some(permission => user?.permissions?.includes(permission)) || false
    },
    [user]
  )

  const hasAllRoles = useCallback(
    (roles: string[]): boolean => {
      // A user can only have one role, so this checks if the user's role is in the list
      return roles.includes(user?.role || '')
    },
    [user]
  )

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every(permission => user?.permissions?.includes(permission)) || false
    },
    [user]
  )

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,

    // Utilities
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    hasAllRoles,
    hasAllPermissions,
  }
}

// Convenience hooks for common auth checks
export function useIsAuthenticated() {
  return useAuthStore(state => state.isAuthenticated)
}

export function useCurrentUser() {
  return useAuthStore(state => state.user)
}

export function useAuthLoading() {
  return useAuthStore(state => state.isLoading)
}
