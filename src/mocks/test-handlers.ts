import { HttpResponse, http } from 'msw'
import { config } from '@/shared/lib/environment'

// Test-specific handlers with minimal delays for faster test execution
export const testAuthHandlers = [
  // Auth status endpoints
  http.get(`${config.api.baseUrl}/auth/csrf-token`, () => {
    return HttpResponse.json({ token: 'test-csrf-token' })
  }),
  
  http.get(`${config.api.baseUrl}/auth/status`, () => {
    return HttpResponse.json({ authenticated: false })
  }),
  
  http.get(`${config.api.baseUrl}/auth/refresh-status`, () => {
    return HttpResponse.json({ canRefresh: false })
  }),
  // Login - minimal delay for tests
  http.post(`${config.api.baseUrl}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as any
    
    // Minimal delay for tests (10ms instead of 500ms)
    await new Promise(resolve => setTimeout(resolve, 10))
    
    if (body.email === 'demo@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: {
          id: '1',
          email: body.email,
          firstName: 'Demo',
          lastName: 'User',
          fullName: 'Demo User',
          role: 'user',
          permissions: [],
        },
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          expiresIn: 3600,
          refreshExpiresIn: 604800,
        },
      })
    }
    
    return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 })
  }),
  
  // Register - minimal delay
  http.post(`${config.api.baseUrl}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as any
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Simulate user already exists
    if (body.email === 'existing@example.com') {
      return HttpResponse.json({ message: 'User already exists' }, { status: 409 })
    }
    
    return HttpResponse.json({
      user: {
        id: '2',
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        fullName: `${body.firstName} ${body.lastName}`,
        role: 'user',
        permissions: [],
      },
      tokens: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        expiresIn: 3600,
        refreshExpiresIn: 604800,
      },
    })
  }),
  
  // Forgot password - minimal delay
  http.post(`${config.api.baseUrl}/auth/forgot-password`, async () => {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    return HttpResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    })
  }),
  
  // Reset password - minimal delay
  http.post(`${config.api.baseUrl}/auth/reset-password`, async ({ request }) => {
    const body = (await request.json()) as any
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    if (!body.token || !body.password) {
      return HttpResponse.json({ message: 'Invalid or expired token' }, { status: 400 })
    }
    
    // Simulate expired token
    if (body.token === 'expired-token') {
      return HttpResponse.json({ message: 'Invalid or expired token' }, { status: 400 })
    }
    
    return HttpResponse.json({
      message: 'Password reset successfully',
    })
  }),
]