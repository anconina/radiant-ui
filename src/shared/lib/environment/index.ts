export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Radiant UI',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: import.meta.env.VITE_APP_ENV || 'development',
    isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
    isStaging: import.meta.env.VITE_APP_ENV === 'staging',
    isProduction: import.meta.env.VITE_APP_ENV === 'production',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  },
  auth: {
    tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'radiant_auth_token',
    refreshTokenKey: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'radiant_refresh_token',
    tokenExpiry: parseInt(import.meta.env.VITE_AUTH_TOKEN_EXPIRY || '3600000', 10),
    refreshTokenExpiry: parseInt(import.meta.env.VITE_AUTH_REFRESH_TOKEN_EXPIRY || '604800000', 10),
  },
  features: {
    msw: import.meta.env.VITE_ENABLE_MSW === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    sentry: import.meta.env.VITE_ENABLE_SENTRY === 'true',
    pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
  },
  services: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
  },
  security: {
    enableHttps: import.meta.env.VITE_ENABLE_HTTPS === 'true',
    cspReportUri: import.meta.env.VITE_CSP_REPORT_URI || '',
  },
  development: {
    devTools: import.meta.env.VITE_DEV_TOOLS === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'debug',
  },
  i18n: {
    defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE || 'en',
    supportedLocales: (import.meta.env.VITE_SUPPORTED_LOCALES || 'en,es,fr,de').split(','),
  },
  storage: {
    prefix: import.meta.env.VITE_LOCAL_STORAGE_PREFIX || 'radiant_',
  },
  performance: {
    imageCdnUrl: import.meta.env.VITE_IMAGE_CDN_URL || '',
  },
  build: {
    timestamp: import.meta.env.VITE_BUILD_TIMESTAMP || new Date().toISOString(),
    commitSha: import.meta.env.VITE_COMMIT_SHA || 'development',
  },
} as const

export type Config = typeof config
