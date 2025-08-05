# 🔐 Secure Token Management Documentation

## Overview

Radiant UI implements a comprehensive secure token management system that uses environment-based strategies to ensure maximum security in production while maintaining developer experience in development environments.

## Architecture

### Environment-Based Token Storage

The system automatically selects the appropriate storage mechanism based on the environment:

- **Production**: HttpOnly cookies with CSRF protection
- **Development**: localStorage for easier debugging

### Key Components

```
src/shared/lib/auth/
├── token-manager.ts             # Main secure token manager with strategy pattern
├── strategies/
│   ├── token-storage.strategy.ts   # Interface for storage strategies
│   ├── cookie-storage.strategy.ts  # Production: httpOnly cookies
│   └── local-storage.strategy.ts   # Development: localStorage
├── csrf/
│   └── csrf-manager.ts          # CSRF token management for production
└── types.ts                     # TypeScript interfaces and types
```

## Security Features

### 1. HttpOnly Cookies (Production)

- **Protection**: Cookies are not accessible via JavaScript, preventing XSS attacks
- **Attributes**:
  - `httpOnly`: true - Prevents JavaScript access
  - `secure`: true - HTTPS transmission only
  - `sameSite`: strict - CSRF protection
  - `path`: /api - Restricts cookie scope

### 2. CSRF Protection

- **Double-Submit Cookie Pattern**: CSRF token in both cookie and header
- **Token Caching**: 23-hour cache to reduce API calls
- **Automatic Retry**: Handles CSRF token expiry gracefully
- **State-Changing Requests**: Applied to POST, PUT, PATCH, DELETE
- **Production Only**: CSRF protection is disabled in development for simplicity

### 3. Token Lifecycle Management

- **Access Token**: 15-minute expiry (short-lived)
- **Refresh Token**: 7-day expiry (secure rotation)
- **Automatic Refresh**: Tokens refresh 1 minute before expiry
- **Graceful Degradation**: Falls back to re-authentication on failure

## Integration with Auth Store

### AuthStore Token Management

The auth store (`src/features/auth/model/auth.store.ts`) integrates seamlessly with the token management system:

```typescript
// Automatic token refresh scheduling
private scheduleTokenRefresh() {
  const expiresIn = this.getTokenExpiry()
  if (expiresIn > 0) {
    // Refresh 1 minute before expiry
    const refreshTime = Math.max(0, expiresIn - 60 * 1000)

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken()
      } catch (error) {
        // Handle refresh failure
        this.handleAuthError(error)
      }
    }, refreshTime)
  }
}

// Centralized error handling
private handleAuthError(error: any) {
  if (error.response?.status === 401) {
    // Clear tokens and redirect to login
    this.logout()
  }
}
```

### Token Lifecycle Events

1. **Login**: Sets tokens and schedules refresh
2. **Refresh**: Updates tokens before expiry
3. **Logout**: Clears all tokens and cancels refresh
4. **Error**: Handles token failures gracefully

## Implementation Details

### SecureTokenManager

The main entry point for token management:

```typescript
import { tokenManager } from '@/shared/lib/auth/token-manager'

// Check authentication status
const hasTokens = await tokenManager.hasTokens()

// Get access token (returns 'cookie-auth' in production)
const token = await tokenManager.getAccessToken()

// Clear tokens on logout
await tokenManager.clearTokens()
```

### API Integration

The API client automatically handles token management:

```typescript
// Request interceptor adds auth headers and CSRF tokens
api.interceptors.request.use(async config => {
  // Auth token handling
  const token = await tokenManager.getAccessToken()
  if (token && token !== 'cookie-auth') {
    // Development: Add bearer token
    config.headers.Authorization = `Bearer ${token}`
  }
  // Production: Cookies sent automatically

  // CSRF token for state-changing requests (production only)
  if (process.env.NODE_ENV === 'production' && csrfManager.requiresCsrfToken(config.method)) {
    const csrfToken = await csrfManager.getCsrfToken()
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
  }

  return config
})
```

### Backend Requirements

The backend must implement the following endpoints:

1. **Auth Endpoints**:
   - `POST /auth/login` - Set httpOnly cookies on successful login
   - `POST /auth/register` - Set httpOnly cookies on registration
   - `POST /auth/logout` - Clear httpOnly cookies
   - `POST /auth/refresh` - Refresh tokens using refresh cookie

2. **Token Management**:
   - `GET /auth/status` - Validate current auth cookies
   - `GET /auth/refresh-status` - Check if refresh token is valid
   - `GET /auth/csrf-token` - Get CSRF token for requests

3. **Cookie Configuration**:
   ```javascript
   // Example Express.js cookie settings
   res.cookie('access_token', token, {
     httpOnly: true,
     secure: true, // HTTPS only
     sameSite: 'strict',
     path: '/api',
     maxAge: 15 * 60 * 1000, // 15 minutes
   })
   ```

## Security Best Practices

### 1. Token Storage

- ✅ **DO**: Use httpOnly cookies in production
- ✅ **DO**: Implement CSRF protection for all state-changing requests
- ✅ **DO**: Use short-lived access tokens (15 minutes)
- ❌ **DON'T**: Store sensitive tokens in localStorage in production
- ❌ **DON'T**: Include tokens in URL parameters

### 2. Token Transmission

- ✅ **DO**: Use HTTPS for all API communications
- ✅ **DO**: Include CSRF tokens in request headers
- ✅ **DO**: Validate token expiry before requests
- ❌ **DON'T**: Send tokens in query parameters
- ❌ **DON'T**: Log or display tokens in console

### 3. Error Handling

- ✅ **DO**: Clear tokens on authentication errors
- ✅ **DO**: Implement automatic token refresh
- ✅ **DO**: Handle CSRF errors with retry logic
- ❌ **DON'T**: Expose detailed error messages to users
- ❌ **DON'T**: Retry indefinitely on auth failures

## Development vs Production

### Development Environment

- Uses localStorage for easier debugging
- No CSRF protection required
- Tokens visible in DevTools for inspection
- Simplified error messages

### Production Environment

- HttpOnly cookies prevent token access
- CSRF protection on all mutations
- Tokens not visible to JavaScript
- Generic error messages for security

## Migration Guide

### From TokenManager to SecureTokenManager

1. **Update imports**:

   ```typescript
   // Old
   // New
   import { secureTokenManager } from '@/shared/lib/auth/secure-token-manager'
   import { tokenManager } from '@/shared/lib/auth/token-manager'
   ```

2. **Update method calls** (now async):

   ```typescript
   // Old (synchronous)
   const hasTokens = tokenManager.hasTokens()
   const token = tokenManager.getAccessToken()

   // New (async with strategy pattern)
   const hasTokens = await tokenManager.hasTokens()
   const token = await tokenManager.getAccessToken()
   ```

3. **Handle production differences**:

   ```typescript
   // Token is 'cookie-auth' in production when using httpOnly cookies
   const token = await tokenManager.getAccessToken()

   if (token === 'cookie-auth') {
     // Production: cookies are sent automatically by browser
     // No need to add Authorization header
   } else if (token) {
     // Development: manually add bearer token
     headers.Authorization = `Bearer ${token}`
   }
   ```

## Testing

### Unit Tests

Test token storage strategies independently:

```typescript
import { CookieStorageStrategy } from '@/shared/lib/auth/strategies/cookie-storage.strategy'
import { LocalStorageStrategy } from '@/shared/lib/auth/strategies/local-storage.strategy'
import { SecureTokenManager } from '@/shared/lib/auth/token-manager'

describe('SecureTokenManager', () => {
  it('should use cookies in production', () => {
    process.env.NODE_ENV = 'production'
    const manager = new SecureTokenManager(new CookieStorageStrategy())
    expect(manager.isUsingSecureCookies()).toBe(true)
  })

  it('should use localStorage in development', () => {
    process.env.NODE_ENV = 'development'
    const manager = new SecureTokenManager(new LocalStorageStrategy())
    expect(manager.isUsingSecureCookies()).toBe(false)
  })
})
```

### Integration Tests

Test the complete auth flow:

```typescript
describe('Auth Flow', () => {
  it('should handle login with CSRF protection', async () => {
    const response = await api.post('/auth/login', credentials)

    // Verify CSRF token is fetched
    expect(csrfManager.getCsrfToken).toHaveBeenCalled()

    // Verify auth state is updated
    expect(authStore.isAuthenticated).toBe(true)
  })
})
```

## Monitoring & Debugging

### Development Tools

1. **Browser DevTools**:
   - Application tab → Local Storage (development)
   - Application tab → Cookies (production)
   - Network tab → Request headers for tokens

2. **Debug Logging**:
   ```typescript
   // Enable debug mode
   localStorage.setItem('debug_auth', 'true')
   ```

### Production Monitoring

1. **Security Events**:
   - Track CSRF token failures
   - Monitor token refresh rates
   - Alert on unusual auth patterns

2. **Performance Metrics**:
   - Token refresh latency
   - CSRF token cache hit rate
   - Auth request success rate

## Troubleshooting

### Common Issues

1. **"CSRF token missing" error**:
   - Ensure backend returns CSRF token
   - Check cookie settings allow reading
   - Verify X-CSRF-Token header is sent

2. **"Token expired" errors**:
   - Check token refresh mechanism
   - Verify backend refresh endpoint
   - Ensure time sync between client/server

3. **Cookies not being set**:
   - Verify HTTPS in production
   - Check SameSite settings
   - Ensure domain matches

## Future Enhancements

1. **Refresh Token Rotation**: Implement rotating refresh tokens for enhanced security
2. **Device Management**: Track and revoke device sessions
3. **Biometric Auth**: Add WebAuthn support for passwordless authentication
4. **Session Monitoring**: Real-time session security alerts and anomaly detection
5. **Zero-Trust**: Implement per-request authentication and continuous verification
6. **Multi-Factor Authentication**: Add TOTP/SMS second factor support
7. **OAuth Integration**: Support for social login providers
8. **Encrypted Token Storage**: Additional encryption layer for stored tokens

## References

- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [HttpOnly Cookie Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
