// Session entity API methods
import { apiClient } from '@/shared/lib/http-client'

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
} from '../model'

export const sessionApi = {
  // Authentication
  login: (data: LoginRequest) => apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/auth/register', data),

  logout: () => apiClient.post('/auth/logout'),

  refreshTokens: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/auth/refresh', { refreshToken }),

  // Password reset
  requestPasswordReset: (data: PasswordResetRequest) =>
    apiClient.post('/auth/forgot-password', data),

  confirmPasswordReset: (data: PasswordResetConfirm) =>
    apiClient.post('/auth/reset-password', data),

  // Email verification
  verifyEmail: (data: VerifyEmailRequest) => apiClient.post('/auth/verify-email', data),

  resendVerification: (data: ResendVerificationRequest) =>
    apiClient.post('/auth/resend-verification', data),

  // OAuth
  initiateOAuth: (data: OAuthLoginRequest) =>
    apiClient.post<{ authUrl: string }>('/auth/oauth/init', data),

  handleOAuthCallback: (provider: string, params: OAuthCallbackParams) =>
    apiClient.post<AuthResponse>(`/auth/oauth/${provider}/callback`, params),

  // Two-factor authentication
  setupTwoFactor: () => apiClient.post<TwoFactorSetupResponse>('/auth/2fa/setup'),

  verifyTwoFactor: (data: TwoFactorVerifyRequest) => apiClient.post('/auth/2fa/verify', data),

  disableTwoFactor: (code: string) => apiClient.post('/auth/2fa/disable', { code }),

  // Session management
  getSessions: () => apiClient.get<Session[]>('/auth/sessions'),

  revokeSession: (sessionId: string) => apiClient.delete(`/auth/sessions/${sessionId}`),

  revokeAllSessions: () => apiClient.post('/auth/sessions/revoke-all'),
}
