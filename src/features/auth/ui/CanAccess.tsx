import { useAuth } from '@/features/auth'

import type { Permission, Role } from '@/shared/config'

interface CanAccessProps {
  children: React.ReactNode
  roles?: Role[]
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

/**
 * Component that conditionally renders children based on user roles and permissions
 * Unlike RequireAuth, this doesn't redirect - it just shows/hides content
 */
export function CanAccess({
  children,
  roles,
  permissions,
  requireAll = false,
  fallback = null,
}: CanAccessProps) {
  const { isAuthenticated, hasAnyRole, hasAnyPermission, hasAllRoles, hasAllPermissions } =
    useAuth()

  // Not authenticated
  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  // Check role requirements
  if (roles && roles.length > 0) {
    const hasRequiredRoles = requireAll ? hasAllRoles(roles) : hasAnyRole(roles)
    if (!hasRequiredRoles) {
      return <>{fallback}</>
    }
  }

  // Check permission requirements
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    if (!hasRequiredPermissions) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

// Convenience components
export function CanAccessAdmin({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <CanAccess roles={['admin']} fallback={fallback}>
      {children}
    </CanAccess>
  )
}

export function CanAccessModerator({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <CanAccess roles={['moderator', 'admin']} fallback={fallback}>
      {children}
    </CanAccess>
  )
}

// Hook version for programmatic access control
export function useCanAccess(
  roles?: Role[],
  permissions?: Permission[],
  requireAll = false
): boolean {
  const { isAuthenticated, hasAnyRole, hasAnyPermission, hasAllRoles, hasAllPermissions } =
    useAuth()

  if (!isAuthenticated) {
    return false
  }

  // Check role requirements
  if (roles && roles.length > 0) {
    const hasRequiredRoles = requireAll ? hasAllRoles(roles) : hasAnyRole(roles)
    if (!hasRequiredRoles) {
      return false
    }
  }

  // Check permission requirements
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    if (!hasRequiredPermissions) {
      return false
    }
  }

  return true
}
