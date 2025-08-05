/**
 * Monitoring module exports
 */

export {
  initSentry,
  ErrorBoundary,
  captureError,
  captureMessage,
  startTransaction,
  identifyUser,
  clearUser,
  addBreadcrumb,
  profileComponent,
} from './sentry'
export {
  logger,
  apiLogger,
  authLogger,
  perfLogger,
  securityLogger,
  LogLevel,
  type LogEntry,
  type LoggerConfig,
} from './logger'
export { analytics } from './analytics'
export type { AnalyticsEvent, UserProperties, PageViewData } from './analytics'

// Re-export performance monitoring
export * from './performance'
