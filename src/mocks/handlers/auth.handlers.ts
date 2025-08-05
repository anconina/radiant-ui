import { HttpResponse, http } from 'msw'

import { config } from '@/shared/lib/environment'

import { mockUsers } from '../data'

// Mock tokens
const mockTokens = {
  accessToken: 'mock-access-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
  expiresIn: 3600, // 1 hour
  refreshExpiresIn: 604800, // 7 days
}

// Store for auth state
const currentUser = mockUsers[0]
const sessions: any[] = []

// Mock CSRF token
const currentCsrfToken = 'mock-csrf-token-' + Date.now()

export const authHandlers = [
  // CSRF Token
  http.get(`${config.api.baseUrl}/auth/csrf-token`, () => {
    return HttpResponse.json({ token: currentCsrfToken })
  }),

  // Auth Status
  http.get(`${config.api.baseUrl}/auth/status`, () => {
    // Check if user is authenticated (simplified for mocking)
    return HttpResponse.json({ authenticated: true })
  }),

  // Refresh Status
  http.get(`${config.api.baseUrl}/auth/refresh-status`, () => {
    // Check if refresh token is valid (simplified for mocking)
    return HttpResponse.json({ canRefresh: true })
  }),

  // Login
  http.post(`${config.api.baseUrl}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as any

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (body.email === 'demo@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: currentUser,
        tokens: mockTokens,
      })
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  // Register
  http.post(`${config.api.baseUrl}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as any

    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if user already exists
    if (mockUsers.find(u => u.email === body.email)) {
      return HttpResponse.json({ message: 'User already exists' }, { status: 409 })
    }

    const newUser = {
      id: String(mockUsers.length + 1),
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      fullName: `${body.firstName} ${body.lastName}`,
      role: 'user',
      permissions: ['user:view'],
      emailVerified: false,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${body.email}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    return HttpResponse.json({
      user: newUser,
      tokens: mockTokens,
    })
  }),

  // Logout
  http.post(`${config.api.baseUrl}/auth/logout`, async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  // Refresh token
  http.post(`${config.api.baseUrl}/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as any

    if (!body.refreshToken || !body.refreshToken.startsWith('mock-refresh-token-')) {
      return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 401 })
    }

    return HttpResponse.json({
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 3600,
      refreshExpiresIn: 604800,
    })
  }),

  // Get current user
  http.get(`${config.api.baseUrl}/auth/me`, async ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer mock-access-token-')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    return HttpResponse.json(currentUser)
  }),

  // Forgot password
  http.post(`${config.api.baseUrl}/auth/forgot-password`, async ({ request }) => {
    const body = (await request.json()) as any

    await new Promise(resolve => setTimeout(resolve, 500))

    const user = mockUsers.find(u => u.email === body.email)
    if (!user) {
      // Don't reveal if user exists or not
      return HttpResponse.json({
        message: 'If an account exists with this email, you will receive a password reset link.',
      })
    }

    return HttpResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    })
  }),

  // Reset password
  http.post(`${config.api.baseUrl}/auth/reset-password`, async ({ request }) => {
    const body = (await request.json()) as any

    await new Promise(resolve => setTimeout(resolve, 500))

    if (!body.token || !body.password) {
      return HttpResponse.json({ message: 'Invalid reset token' }, { status: 400 })
    }

    return HttpResponse.json({
      message: 'Password reset successfully',
    })
  }),

  // Change password
  http.post(`${config.api.baseUrl}/auth/change-password`, async ({ request }) => {
    const body = (await request.json()) as any
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    return HttpResponse.json({
      message: 'Password changed successfully',
    })
  }),

  // Verify email
  http.post(`${config.api.baseUrl}/auth/verify-email`, async ({ request }) => {
    const body = (await request.json()) as any

    await new Promise(resolve => setTimeout(resolve, 500))

    if (!body.token) {
      return HttpResponse.json({ message: 'Invalid verification token' }, { status: 400 })
    }

    currentUser.emailVerified = true

    return HttpResponse.json({
      message: 'Email verified successfully',
    })
  }),

  // Resend verification
  http.post(`${config.api.baseUrl}/auth/resend-verification`, async ({ request }) => {
    const body = (await request.json()) as any

    await new Promise(resolve => setTimeout(resolve, 500))

    return HttpResponse.json({
      message: 'Verification email sent',
    })
  }),

  // OAuth login
  http.post(`${config.api.baseUrl}/auth/oauth/login`, async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json({
      authUrl: `https://oauth.provider.com/authorize?provider=${body.provider}&client_id=mock`,
    })
  }),

  // OAuth callback
  http.post(`${config.api.baseUrl}/auth/oauth/callback`, async ({ request }) => {
    const body = (await request.json()) as any

    await new Promise(resolve => setTimeout(resolve, 500))

    return HttpResponse.json({
      user: currentUser,
      tokens: mockTokens,
    })
  }),

  // 2FA setup
  http.post(`${config.api.baseUrl}/auth/2fa/setup`, async ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    return HttpResponse.json({
      qrCode:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      secret: 'MOCK2FASECRET',
      backupCodes: ['12345678', '87654321', '11223344', '44332211'],
    })
  }),

  // 2FA enable
  http.post(`${config.api.baseUrl}/auth/2fa/enable`, async ({ request }) => {
    const body = (await request.json()) as any

    if (body.code !== '123456') {
      return HttpResponse.json({ message: 'Invalid verification code' }, { status: 400 })
    }

    return HttpResponse.json({
      message: '2FA enabled successfully',
    })
  }),

  // 2FA disable
  http.post(`${config.api.baseUrl}/auth/2fa/disable`, async ({ request }) => {
    const body = (await request.json()) as any

    if (body.code !== '123456') {
      return HttpResponse.json({ message: 'Invalid verification code' }, { status: 400 })
    }

    return HttpResponse.json({
      message: '2FA disabled successfully',
    })
  }),

  // 2FA verify
  http.post(`${config.api.baseUrl}/auth/2fa/verify`, async ({ request }) => {
    const body = (await request.json()) as any

    if (body.code !== '123456') {
      return HttpResponse.json({ message: 'Invalid verification code' }, { status: 400 })
    }

    return HttpResponse.json({
      user: currentUser,
      tokens: mockTokens,
    })
  }),

  // Get sessions
  http.get(`${config.api.baseUrl}/auth/sessions`, async ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    return HttpResponse.json([
      {
        id: '1',
        device: 'Chrome on Windows',
        ip: '192.168.1.1',
        location: 'New York, US',
        lastActive: new Date().toISOString(),
        current: true,
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        ip: '192.168.1.2',
        location: 'New York, US',
        lastActive: new Date(Date.now() - 3600000).toISOString(),
        current: false,
      },
    ])
  }),

  // Revoke session
  http.post(`${config.api.baseUrl}/auth/sessions/revoke`, async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json({
      message: 'Session revoked successfully',
    })
  }),
]
