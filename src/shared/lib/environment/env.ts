/**
 * Environment configuration with type safety and validation
 */

interface EnvConfig {
  // API Configuration
  apiUrl: string
  apiTimeout: number

  // Authentication
  authDomain: string
  authClientId: string
  authRedirectUri: string

  // Feature Flags
  enableAnalytics: boolean
  enableSentry: boolean
  enablePWA: boolean

  // Third-party Services
  sentryDsn?: string
  gaTrackingId?: string
  plausibleDomain?: string

  // Environment
  appEnv: 'development' | 'staging' | 'production'
  appVersion: string

  // Build Info
  buildTimestamp?: string
  commitSha?: string

  // Public URLs
  publicUrl: string
  cdnUrl?: string

  // Derived
  isDevelopment: boolean
  isStaging: boolean
  isProduction: boolean
  isTest: boolean
}

// Validate and parse environment variables
function parseEnv(): EnvConfig {
  const appEnv = (import.meta.env.VITE_APP_ENV || 'development') as EnvConfig['appEnv']

  return {
    // API Configuration
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),

    // Authentication
    authDomain: import.meta.env.VITE_AUTH_DOMAIN || '',
    authClientId: import.meta.env.VITE_AUTH_CLIENT_ID || '',
    authRedirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI || window.location.origin + '/callback',

    // Feature Flags
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableSentry: import.meta.env.VITE_ENABLE_SENTRY === 'true',
    enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true',

    // Third-party Services
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID,
    plausibleDomain: import.meta.env.VITE_PLAUSIBLE_DOMAIN,

    // Environment
    appEnv,
    appVersion: import.meta.env.VITE_APP_VERSION || '0.0.0',

    // Build Info
    buildTimestamp: import.meta.env.VITE_BUILD_TIMESTAMP,
    commitSha: import.meta.env.VITE_COMMIT_SHA,

    // Public URLs
    publicUrl: import.meta.env.VITE_PUBLIC_URL || window.location.origin,
    cdnUrl: import.meta.env.VITE_CDN_URL,

    // Derived
    isDevelopment: appEnv === 'development',
    isStaging: appEnv === 'staging',
    isProduction: appEnv === 'production',
    isTest: import.meta.env.MODE === 'test',
  }
}

// Singleton instance
export const env = parseEnv()

// Log configuration in development
if (env.isDevelopment && !env.isTest) {
  console.group('🔧 Environment Configuration')
  console.log('Environment:', env.appEnv)
  console.log('API URL:', env.apiUrl)
  console.log('Version:', env.appVersion)
  console.log('Features:', {
    analytics: env.enableAnalytics,
    sentry: env.enableSentry,
    pwa: env.enablePWA,
  })
  console.groupEnd()
}

// Validate required configuration
export function validateEnv(): void {
  const errors: string[] = []

  // Required in production
  if (env.isProduction) {
    if (!env.apiUrl) errors.push('API URL is required in production')
    if (env.enableSentry && !env.sentryDsn)
      errors.push('Sentry DSN is required when Sentry is enabled')
    if (env.enableAnalytics && !env.gaTrackingId && !env.plausibleDomain) {
      errors.push('Analytics tracking ID is required when analytics is enabled')
    }
  }

  // Authentication validation
  if (env.authDomain && !env.authClientId) {
    errors.push('Auth client ID is required when auth domain is set')
  }

  if (errors.length > 0) {
    console.error('❌ Environment configuration errors:', errors)
    if (env.isProduction) {
      throw new Error('Invalid environment configuration')
    }
  }
}

// Helper to get asset URL (respects CDN configuration)
export function getAssetUrl(path: string): string {
  if (env.cdnUrl && env.isProduction) {
    return `${env.cdnUrl}${path.startsWith('/') ? path : '/' + path}`
  }
  return path
}

// Helper to check if feature is enabled
export function isFeatureEnabled(
  feature: keyof Pick<EnvConfig, 'enableAnalytics' | 'enableSentry' | 'enablePWA'>
): boolean {
  return env[feature]
}

// Export type for use in other files
export type { EnvConfig }
