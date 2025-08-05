# Security Configuration

This document outlines the comprehensive security measures implemented in Radiant UI, including authentication, API security, content protection, and deployment configurations.

## 🔐 Authentication Security

### Token Management Strategy

Radiant UI implements a **dual-strategy token management system** that adapts based on the environment:

#### Development Mode

- **Storage**: localStorage for convenient debugging
- **Features**: Easy token inspection, simplified testing
- **Location**: `src/shared/lib/auth/strategies/local-storage.strategy.ts`

#### Production Mode

- **Storage**: httpOnly cookies for maximum security
- **Features**: XSS protection, CSRF protection, secure transmission
- **Location**: `src/shared/lib/auth/strategies/cookie-storage.strategy.ts`

### Token Security Features

```typescript
// Automatic token refresh before expiry
const REFRESH_BUFFER = 60 * 1000 // 1 minute before expiry

// Token storage with strategy pattern
const tokenManager = new SecureTokenManager(
  process.env.NODE_ENV === 'production' ? new CookieStorageStrategy() : new LocalStorageStrategy()
)
```

### CSRF Protection

**Production-only CSRF protection** with automatic token management:

```typescript
// src/shared/lib/auth/csrf/csrf-manager.ts
- Automatic CSRF token fetching for state-changing requests
- 23-hour token caching to reduce API calls
- Seamless integration with HTTP client
- Validation for POST, PUT, PATCH, DELETE requests
```

### Session Security

- **Automatic logout** on token expiry
- **Activity tracking** for session management
- **Secure session persistence** across browser tabs
- **Cross-tab synchronization** for authentication state

## 🛡️ Security Headers

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: blob:;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://api.example.com wss://api.example.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**Production Recommendations**:

- Remove `'unsafe-inline'` and use nonces/hashes
- Remove `'unsafe-eval'` unless absolutely necessary
- Restrict `connect-src` to specific API endpoints

### Essential Security Headers

```typescript
// src/shared/config/security-headers.ts
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
}
```

## 🔒 API Security

### HTTP Client Security

The HTTP client (`src/shared/lib/http-client`) includes:

- **Automatic token injection** in Authorization header
- **CSRF token injection** for state-changing requests
- **Request/response interceptors** for security validation
- **Error sanitization** to prevent information leakage
- **Automatic token refresh** on 401 responses

### API Request Security

```typescript
// All API requests are automatically secured
const response = await httpClient.post('/api/users', userData)
// Automatically includes:
// - Authorization: Bearer <token>
// - X-CSRF-Token: <csrf-token> (production only)
```

### CORS Configuration

```typescript
// Configure allowed origins per environment
const corsOptions = {
  origin: process.env.VITE_API_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}
```

## 🔍 Input Validation & Sanitization

### Zod Schema Validation

All user inputs are validated using Zod schemas:

```typescript
// Example: Login validation
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
})

// API response validation
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user']),
})
```

### XSS Prevention

- **React's built-in escaping** for all rendered content
- **Avoid `dangerouslySetInnerHTML`** unless absolutely necessary
- **Content sanitization** for user-generated content
- **Strict CSP** to prevent inline script execution

## 🚨 Error Handling Security

### Secure Error Messages

```typescript
// Never expose sensitive information
try {
  await sensitiveOperation()
} catch (error) {
  // Log full error details (server-side only)
  logger.error('Operation failed', { error, userId, context })

  // Return generic message to client
  throw new Error('Operation failed. Please try again.')
}
```

### Error Logging

- **Sentry integration** for production error tracking
- **Sanitized error messages** for users
- **Detailed logging** for developers (dev mode only)
- **No stack traces** in production responses

## 🏗️ FSD Architecture Security

### Layer-Based Security

The Feature-Sliced Design architecture enhances security through:

1. **Clear boundaries** between layers prevent security leaks
2. **Isolated features** limit the blast radius of vulnerabilities
3. **Centralized security** in shared layer for consistency
4. **Type-safe APIs** between layers prevent injection attacks

### Security Layer Organization

```
src/
├── shared/
│   └── lib/
│       ├── auth/           # Authentication utilities
│       │   ├── strategies/ # Storage strategies
│       │   ├── csrf/       # CSRF protection
│       │   └── token-manager.ts
│       ├── http-client/    # Secure API client
│       └── security/       # Security utilities
├── features/
│   └── auth/              # Authentication feature
│       ├── model/         # Secure auth store
│       └── api/           # Auth API with validation
└── app/
    └── providers/         # Security providers
```

## 🔧 Environment Security

### Environment Variables

```bash
# .env.local (development)
VITE_API_URL=http://localhost:3000
VITE_ENABLE_MSW=true
VITE_TOKEN_STORAGE=localStorage

# .env.production
VITE_API_URL=https://api.production.com
VITE_ENABLE_MSW=false
VITE_TOKEN_STORAGE=cookie
```

### Environment Validation

```typescript
// src/shared/config/env.ts
const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_ENABLE_MSW: z.enum(['true', 'false']),
  VITE_TOKEN_STORAGE: z.enum(['localStorage', 'cookie']),
})

// Validate on app start
const env = envSchema.parse(import.meta.env)
```

## 📋 Security Checklist

### Development Security

- [ ] Use TypeScript strict mode
- [ ] Enable all ESLint security rules
- [ ] Run `npm audit` regularly
- [ ] Keep dependencies updated
- [ ] Use `.env.local` for secrets
- [ ] Never commit sensitive data

### API Security

- [ ] Always use HTTPS in production
- [ ] Implement rate limiting
- [ ] Validate all inputs with Zod
- [ ] Use parameterized queries
- [ ] Implement request timeouts
- [ ] Add API versioning

### Authentication Security

- [ ] Use httpOnly cookies in production
- [ ] Implement CSRF protection
- [ ] Set secure token expiry (15-30 minutes)
- [ ] Implement refresh token rotation
- [ ] Add brute force protection
- [ ] Log security events

### Deployment Security

- [ ] Configure security headers
- [ ] Enable HTTPS with valid certificates
- [ ] Set up WAF (Web Application Firewall)
- [ ] Configure DDoS protection
- [ ] Implement monitoring and alerting
- [ ] Regular security audits
- [ ] Automated vulnerability scanning

## 🚀 Platform-Specific Configuration

### Vercel

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### Netlify

```
# public/_headers
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
```

### Nginx

```nginx
# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# CSP
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;
```

### Cloudflare Workers

```javascript
// Configure headers in Cloudflare Worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newHeaders = new Headers(response.headers)

  // Add security headers
  newHeaders.set('X-Content-Type-Options', 'nosniff')
  newHeaders.set('X-Frame-Options', 'DENY')
  // ... other headers

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}
```

## 🧪 Security Testing

### Automated Security Testing

```bash
# Dependency vulnerability scanning
npm audit
npm audit fix

# OWASP dependency check
npm install -g @owasp/dependency-check
dependency-check --project "Radiant UI" --scan .

# License compliance
npm install -g license-checker
license-checker --production --summary
```

### Manual Security Testing

1. **CSP Testing**:

   ```bash
   # Check headers
   curl -I https://your-app.com

   # Use CSP Evaluator
   # https://csp-evaluator.withgoogle.com/
   ```

2. **Security Headers Check**:
   - [SecurityHeaders.com](https://securityheaders.com/)
   - [Mozilla Observatory](https://observatory.mozilla.org/)

3. **SSL/TLS Testing**:
   - [SSL Labs](https://www.ssllabs.com/ssltest/)

4. **Penetration Testing**:
   - OWASP ZAP
   - Burp Suite
   - Nikto

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Mozilla Web Security](https://infosec.mozilla.org/guidelines/web_security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers](https://securityheaders.com/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

## 🔮 Future Security Enhancements

### Planned Features

- Two-factor authentication (2FA)
- Biometric authentication support
- OAuth2/OIDC integration
- Hardware token support
- End-to-end encryption for sensitive data
- Audit logging system
- Anomaly detection
- Rate limiting per user/IP

### Continuous Improvement

- Regular security audits
- Automated penetration testing
- Bug bounty program consideration
- Security training for developers
- Incident response planning
- Disaster recovery procedures

---

This security guide is a living document. Regular updates ensure it reflects the latest security best practices and emerging threats. Security is not a feature—it's a continuous process.
