import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth'

import type { Permission, Role } from '@/shared/config'
import { ROUTES } from '@/shared/routes'

interface RequireAuthProps {
  children: React.ReactNode
  roles?: Role[]
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RequireAuth({
  children,
  roles,
  permissions,
  requireAll = false,
  fallback,
  redirectTo = ROUTES.login,
}: RequireAuthProps) {
  const location = useLocation()
  const {
    isAuthenticated,
    isLoading,
    hasAnyRole,
    hasAnyPermission,
    hasAllRoles,
    hasAllPermissions,
  } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check role requirements
  if (roles && roles.length > 0) {
    const hasRequiredRoles = requireAll ? hasAllRoles(roles) : hasAnyRole(roles)
    if (!hasRequiredRoles) {
      return fallback ? <>{fallback}</> : <Navigate to={ROUTES.home} replace />
    }
  }

  // Check permission requirements
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    if (!hasRequiredPermissions) {
      return fallback ? <>{fallback}</> : <Navigate to={ROUTES.home} replace />
    }
  }

  return <>{children}</>
}

// Convenience components for common auth requirements
export function RequireAdmin({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RequireAuth roles={['admin']} fallback={fallback}>
      {children}
    </RequireAuth>
  )
}

export function RequireUser({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RequireAuth roles={['user', 'admin', 'moderator']} fallback={fallback}>
      {children}
    </RequireAuth>
  )
}

export function RequireModerator({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RequireAuth roles={['moderator', 'admin']} fallback={fallback}>
      {children}
    </RequireAuth>
  )
}
