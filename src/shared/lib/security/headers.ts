// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.example.com wss://api.example.com https://vitals.vercel-insights.com",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
    "worker-src 'self' blob:",
    "form-action 'self'",
    "base-uri 'self'",
    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ].join('; '),

  // Other security headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': ['camera=()', 'microphone=()', 'geolocation=(self)', 'payment=()'].join(
    ', '
  ),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

// Development CSP (more permissive for HMR and dev tools)
export const devSecurityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' ws: wss: http: https:",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'self'",
    "worker-src 'self' blob:",
    "form-action 'self'",
    "base-uri 'self'",
    "manifest-src 'self'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

// CORS configuration
export const corsConfig = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com', 'https://www.yourdomain.com']
      : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
}

// Helper to generate meta tags for CSP
export function generateCSPMetaTag(isDevelopment = false): string {
  const headers = isDevelopment ? devSecurityHeaders : securityHeaders
  return headers['Content-Security-Policy']
}

// Helper to generate nonce for inline scripts
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}
