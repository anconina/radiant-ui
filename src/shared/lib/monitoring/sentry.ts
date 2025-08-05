/**
 * Sentry error monitoring configuration
 */
import * as Sentry from '@sentry/react'

import { env } from '../environment/env'

// Initialize Sentry
export function initSentry() {
  if (!env.enableSentry || !env.sentryDsn) {
    console.log('🔕 Sentry disabled')
    return
  }

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    release: env.appVersion,

    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration({
        // Set sampling to 100% for development, lower for production
        tracePropagationTargets: ['localhost', env.apiUrl, /^\//],
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(window.history),
      }),
    ],

    // Performance sampling
    tracesSampleRate: env.isProduction ? 0.1 : 1.0,

    // Release tracking
    autoSessionTracking: true,

    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-errors
      const error = hint.originalException

      // Ignore network errors in development
      if (
        !env.isProduction &&
        error instanceof TypeError &&
        error.message.includes('Failed to fetch')
      ) {
        return null
      }

      // Ignore browser extension errors
      if (
        event.exception?.values?.[0]?.stacktrace?.frames?.some(frame =>
          frame.filename?.includes('extension://')
        )
      ) {
        return null
      }

      // Ignore ResizeObserver errors
      if (error instanceof Error && error.message.includes('ResizeObserver loop limit exceeded')) {
        return null
      }

      // Add user context
      if (event.user === undefined) {
        event.user = {
          id: getUserId(),
          email: getUserEmail(),
        }
      }

      // Add custom context
      event.contexts = {
        ...event.contexts,
        app: {
          version: env.appVersion,
          build: env.buildTimestamp,
          commit: env.commitSha,
        },
      }

      return event
    },

    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null
      }

      // Enhance navigation breadcrumbs
      if (breadcrumb.category === 'navigation') {
        breadcrumb.data = {
          ...breadcrumb.data,
          timestamp: new Date().toISOString(),
        }
      }

      return breadcrumb
    },
  })

  console.log('🚨 Sentry initialized')
}

// Error boundary component
export const ErrorBoundary = Sentry.ErrorBoundary

// Manual error capture
export function captureError(error: Error, context?: Record<string, any>) {
  if (!env.enableSentry) {
    console.error('Error:', error, context)
    return
  }

  Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  })
}

// Capture message
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) {
  if (!env.enableSentry) {
    console.log(`[${level}] ${message}`, context)
    return
  }

  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context || {},
    },
  })
}

// Performance monitoring
export function startTransaction(name: string, op: string) {
  if (!env.enableSentry) {
    return null
  }

  return Sentry.startTransaction({
    name,
    op,
  })
}

// User identification
export function identifyUser(user: { id: string; email?: string; username?: string }) {
  if (!env.enableSentry) {
    return
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

// Clear user
export function clearUser() {
  if (!env.enableSentry) {
    return
  }

  Sentry.setUser(null)
}

// Add breadcrumb
export function addBreadcrumb(breadcrumb: {
  message: string
  category?: string
  level?: Sentry.SeverityLevel
  data?: Record<string, any>
}) {
  if (!env.enableSentry) {
    return
  }

  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category || 'custom',
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
    timestamp: Date.now() / 1000,
  })
}

// Profiling wrapper
export function profileComponent<T extends React.ComponentType<any>>(
  Component: T,
  name: string
): T {
  if (!env.enableSentry) {
    return Component
  }

  return Sentry.withProfiler(Component, { name })
}

// Helper functions (implement based on your auth system)
function getUserId(): string | undefined {
  // TODO: Implement based on your auth system
  return undefined
}

function getUserEmail(): string | undefined {
  // TODO: Implement based on your auth system
  return undefined
}
