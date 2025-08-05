// Session entity type definitions

// Re-export shared auth types for convenience
export type { AuthTokens, DecodedToken } from '@/shared/contracts'

export interface Session {
  id: string
  userId: string
  deviceName: string
  ipAddress: string
  location?: string
  lastActive: string
  current: boolean
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  acceptTerms: boolean
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    avatar?: string
    role: string
    permissions: string[]
    emailVerified: boolean
    createdAt: string
    updatedAt: string
  }
  tokens: AuthTokens
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
  confirmPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ResendVerificationRequest {
  email: string
}

// OAuth types
export type OAuthProvider = 'google' | 'github' | 'facebook' | 'twitter'

export interface OAuthLoginRequest {
  provider: OAuthProvider
  redirectUri?: string
}

export interface OAuthCallbackParams {
  code: string
  state?: string
  error?: string
  error_description?: string
}

// Two-factor authentication
export interface TwoFactorSetupResponse {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TwoFactorVerifyRequest {
  code: string
  rememberDevice?: boolean
}
