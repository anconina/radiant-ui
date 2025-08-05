/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Application
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'

  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string

  // Authentication
  readonly VITE_AUTH_TOKEN_KEY: string
  readonly VITE_AUTH_REFRESH_TOKEN_KEY: string
  readonly VITE_AUTH_TOKEN_EXPIRY: string
  readonly VITE_AUTH_REFRESH_TOKEN_EXPIRY: string

  // Feature Flags
  readonly VITE_ENABLE_MSW: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_SENTRY: string

  // Third Party Services
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_GA_TRACKING_ID?: string

  // Security
  readonly VITE_ENABLE_HTTPS?: string
  readonly VITE_CSP_REPORT_URI?: string

  // Development
  readonly VITE_DEV_TOOLS: string
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'

  // Internationalization
  readonly VITE_DEFAULT_LOCALE: string
  readonly VITE_SUPPORTED_LOCALES: string

  // Storage
  readonly VITE_LOCAL_STORAGE_PREFIX: string

  // Performance
  readonly VITE_IMAGE_CDN_URL?: string
  readonly VITE_ENABLE_PWA?: string

  // Build Configuration
  readonly VITE_BUILD_TIMESTAMP?: string
  readonly VITE_COMMIT_SHA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}