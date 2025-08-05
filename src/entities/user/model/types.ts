// User entity type definitions

export interface User {
  id: string
  email: string
  username?: string
  firstName: string
  lastName: string
  fullName: string
  avatar?: string
  bio?: string
  phone?: string
  dateOfBirth?: string
  gender?: Gender
  address?: Address
  role: UserRole
  permissions: Permission[]
  emailVerified: boolean
  preferences?: UserPreferences
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'user' | 'moderator' | 'guest'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

export interface Address {
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationPreferences
  privacy: PrivacySettings
}

export interface NotificationPreferences {
  email: {
    marketing: boolean
    updates: boolean
    security: boolean
    newsletter: boolean
  }
  push: {
    enabled: boolean
    sound: boolean
    vibrate: boolean
  }
  sms: {
    enabled: boolean
    marketing: boolean
    security: boolean
  }
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showPhone: boolean
  allowDataCollection: boolean
  allowAnalytics: boolean
}

export interface UserProfile {
  id: string
  email: string
  username?: string
  firstName: string
  lastName: string
  fullName: string
  avatar?: string
  bio?: string
  phone?: string
  dateOfBirth?: string
  gender?: Gender
  address?: Address
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  username?: string
  bio?: string
  phone?: string
  dateOfBirth?: string
  gender?: Gender
  address?: Address
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

export interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  notifications?: Partial<NotificationPreferences>
  privacy?: Partial<PrivacySettings>
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface UserActivity {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: string
}

export interface UserStats {
  totalPosts: number
  totalComments: number
  totalLikes: number
  totalFollowers: number
  totalFollowing: number
  joinedDays: number
  lastActiveAt: string
}
