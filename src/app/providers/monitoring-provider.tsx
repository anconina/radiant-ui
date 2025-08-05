/**
 * Monitoring provider for initializing error tracking and analytics
 */
import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { useLocation } from 'react-router-dom'

import { useAuthStore } from '@/features/auth'

import {
  ErrorBoundary,
  analytics,
  initPerformanceMonitoring,
  initSentry,
} from '@/shared/lib/monitoring'

interface MonitoringProviderProps {
  children: ReactNode
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  const location = useLocation()
  const user = useAuthStore(state => state.user)

  // Initialize monitoring services
  useEffect(() => {
    // Initialize Sentry
    initSentry()

    // Initialize performance monitoring
    initPerformanceMonitoring()

    // Initialize analytics
    analytics.initialize()
  }, [])

  // Track page views
  useEffect(() => {
    analytics.trackPageView(location.pathname + location.search)
  }, [location])

  // Update user context when authentication changes
  useEffect(() => {
    if (user) {
      // Update Sentry user context
      import('@/shared/lib/monitoring').then(({ identifyUser }) => {
        identifyUser({
          id: user.id,
          email: user.email,
          username: user.name,
        })
      })

      // Update analytics user
      analytics.identifyUser(user.id, {
        email: user.email,
        plan: user.role,
      })
    } else {
      // Clear user context
      import('@/shared/lib/monitoring').then(({ clearUser }) => {
        clearUser()
      })
      analytics.reset()
    }
  }, [user])

  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => <ErrorFallback error={error} resetError={resetError} />}
      showDialog={false}
    >
      {children}
    </ErrorBoundary>
  )
}

// Error fallback component
function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  useEffect(() => {
    // Log error details
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            An unexpected error occurred. Please try refreshing the page or contact support if the
            problem persists.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Error details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Refresh Page
            </button>

            <button
              onClick={resetError}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
