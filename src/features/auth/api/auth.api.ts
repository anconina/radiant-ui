import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  OAuthCallbackParams,
  OAuthLoginRequest,
  PasswordResetConfirm,
  PasswordResetRequest,
  RegisterRequest,
  ResendVerificationRequest,
  Session,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  VerifyEmailRequest,
} from '@/entities/session'
import type { ChangePasswordRequest, User } from '@/entities/user'

import { apiClient } from '@/shared/lib/http-client'

const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',
  verifyEmail: '/auth/verify-email',
  resendVerification: '/auth/resend-verification',
  oauth: {
    login: '/auth/oauth/login',
    callback: '/auth/oauth/callback',
  },
  twoFactor: {
    setup: '/auth/2fa/setup',
    enable: '/auth/2fa/enable',
    disable: '/auth/2fa/disable',
    verify: '/auth/2fa/verify',
  },
  sessions: {
    list: '/auth/sessions',
    revoke: '/auth/sessions/revoke',
  },
} as const

// Core authentication functions
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(AUTH_ENDPOINTS.login, credentials)
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(AUTH_ENDPOINTS.register, data)
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post(AUTH_ENDPOINTS.logout)
  } catch (error) {
    // Even if logout fails on server, we should clear local state
    console.error('Logout error:', error)
  }
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>(AUTH_ENDPOINTS.refresh, { refreshToken })
}

export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>(AUTH_ENDPOINTS.me)
}

// Password management
export async function forgotPassword(data: PasswordResetRequest): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(AUTH_ENDPOINTS.forgotPassword, data)
}

export async function resetPassword(data: PasswordResetConfirm): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(AUTH_ENDPOINTS.resetPassword, data)
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(AUTH_ENDPOINTS.changePassword, data)
}

// Email verification
export async function verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(AUTH_ENDPOINTS.verifyEmail, data)
}

export async function resendVerificationEmail(
  data: ResendVerificationRequest
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(AUTH_ENDPOINTS.resendVerification, data)
}

// OAuth authentication
export async function oauthLogin(data: OAuthLoginRequest): Promise<{ authUrl: string }> {
  return apiClient.post<{ authUrl: string }>(AUTH_ENDPOINTS.oauth.login, data)
}

export async function oauthCallback(params: OAuthCallbackParams): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(AUTH_ENDPOINTS.oauth.callback, params)
}

// Two-factor authentication
export async function setupTwoFactor(): Promise<TwoFactorSetupResponse> {
  return apiClient.post<TwoFactorSetupResponse>(AUTH_ENDPOINTS.twoFactor.setup)
}

export async function enableTwoFactor(code: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(AUTH_ENDPOINTS.twoFactor.enable, { code })
}

export async function disableTwoFactor(code: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(AUTH_ENDPOINTS.twoFactor.disable, { code })
}

export async function verifyTwoFactor(data: TwoFactorVerifyRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(AUTH_ENDPOINTS.twoFactor.verify, data)
}

// Session management
export async function getActiveSessions(): Promise<Session[]> {
  return apiClient.get<Session[]>(AUTH_ENDPOINTS.sessions.list)
}

export async function revokeSession(sessionId: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(AUTH_ENDPOINTS.sessions.revoke, { sessionId })
}

// Utility functions
export function isTokenExpired(expiresAt: string | number): boolean {
  const expiryTime =
    typeof expiresAt === 'string' ? new Date(expiresAt).getTime() : expiresAt * 1000 // Convert seconds to milliseconds if needed

  // Add a small buffer (5 seconds) to account for clock differences
  return Date.now() >= expiryTime - 5000
}

export function getTokenExpiryTime(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000)
}

// Auth header utility
export function getAuthHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` }
}
