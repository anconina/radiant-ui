// Role constants for type safety
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
} as const

// Permission constants for type safety
export const PERMISSIONS = {
  // User permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Post permissions
  POST_VIEW: 'post:view',
  POST_CREATE: 'post:create',
  POST_UPDATE: 'post:update',
  POST_DELETE: 'post:delete',

  // Admin permissions
  ADMIN_ACCESS: 'admin:access',
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings',

  // System permissions
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
} as const

// Type for role values
export type Role = (typeof ROLES)[keyof typeof ROLES]

// Type for permission values
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
