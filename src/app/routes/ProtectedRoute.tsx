import { ReactNode } from 'react'

import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth'
import { UnauthorizedPage } from '@/features/auth'

import type { Permission, Role } from '@/shared/config'
import { ROUTES } from '@/shared/routes'

interface ProtectedRouteProps {
  children: ReactNode
  requireRoles?: Role[]
  requirePermissions?: Permission[]
  requireAll?: boolean
  redirectTo?: string
  showUnauthorized?: boolean
}

export function ProtectedRoute({
  children,
  requireRoles,
  requirePermissions,
  requireAll = false,
  redirectTo = ROUTES.login,
  showUnauthorized = true,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    hasAnyRole,
    hasAnyPermission,
    hasAllRoles,
    hasAllPermissions,
  } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check role requirements
  if (requireRoles && requireRoles.length > 0) {
    const hasRequiredRoles = requireAll ? hasAllRoles(requireRoles) : hasAnyRole(requireRoles)
    if (!hasRequiredRoles) {
      return showUnauthorized ? <UnauthorizedPage /> : <Navigate to={ROUTES.home} replace />
    }
  }

  // Check permission requirements
  if (requirePermissions && requirePermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(requirePermissions)
      : hasAnyPermission(requirePermissions)
    if (!hasRequiredPermissions) {
      return showUnauthorized ? <UnauthorizedPage /> : <Navigate to={ROUTES.home} replace />
    }
  }

  return <>{children}</>
}
