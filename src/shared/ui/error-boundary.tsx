import React, { Component, ErrorInfo, type ReactNode } from 'react'

import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react'

import { Alert, AlertDescription } from './alert'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  level?: 'page' | 'feature' | 'component'
  featureName?: string
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  showErrorDetails?: boolean
  enableRetry?: boolean
  enableReporting?: boolean
}

interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  errorId: string
  level: 'page' | 'feature' | 'component'
  featureName?: string
  onRetry: () => void
  onReport: () => void
  onNavigateHome: () => void
  showErrorDetails: boolean
  enableRetry: boolean
  enableReporting: boolean
}

function ErrorFallback({
  error,
  errorInfo,
  errorId,
  level,
  featureName,
  onRetry,
  onReport,
  onNavigateHome,
  showErrorDetails,
  enableRetry,
  enableReporting,
}: ErrorFallbackProps) {
  const getErrorTitle = () => {
    switch (level) {
      case 'page':
        return 'Page Error'
      case 'feature':
        return `${featureName || 'Feature'} Error`
      case 'component':
        return 'Component Error'
      default:
        return 'Something went wrong'
    }
  }

  const getErrorMessage = () => {
    switch (level) {
      case 'page':
        return 'This page encountered an error and cannot be displayed.'
      case 'feature':
        return `The ${featureName || 'feature'} encountered an error. Other parts of the application should still work.`
      case 'component':
        return 'A component on this page encountered an error.'
      default:
        return 'An unexpected error occurred.'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-2xl font-bold text-destructive">{getErrorTitle()}</CardTitle>
        <CardDescription className="text-lg">{getErrorMessage()}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error ID for support */}
        <Alert>
          <AlertDescription>
            <span className="font-medium">Error ID:</span> {errorId}
            <br />
            <span className="text-sm text-muted-foreground">
              Please include this ID when reporting the issue.
            </span>
          </AlertDescription>
        </Alert>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {enableRetry && (
            <Button onClick={onRetry} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}

          {level === 'page' && (
            <Button onClick={onNavigateHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          )}

          {enableReporting && (
            <Button onClick={onReport} variant="outline">
              <Bug className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          )}
        </div>

        {/* Error details (development only or when explicitly enabled) */}
        {showErrorDetails && (import.meta.env.DEV || showErrorDetails) && (
          <details className="mt-6">
            <summary className="cursor-pointer font-medium text-sm mb-2">
              Technical Details (for developers)
            </summary>
            <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-auto">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              <div className="mb-2">
                <strong>Stack:</strong>
                <pre className="mt-1 whitespace-pre-wrap text-xs">{error.stack}</pre>
              </div>
              {errorInfo && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs">{errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate a unique error ID
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler
    if (this.props.onError && this.state.errorId) {
      this.props.onError(error, errorInfo, this.state.errorId)
    }

    // Report to Sentry (if available)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.withScope(scope => {
        scope.setTag('errorBoundary', true)
        scope.setTag('errorBoundaryLevel', this.props.level || 'unknown')
        if (this.props.featureName) {
          scope.setTag('featureName', this.props.featureName)
        }
        scope.setContext('errorInfo', errorInfo)
        scope.setContext('errorId', this.state.errorId)
        window.Sentry.captureException(error)
      })
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }

    // Reset error state after a short delay to allow for cleanup
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      })
    }, 100) as unknown as number
  }

  handleReport = () => {
    const { error, errorInfo, errorId } = this.state
    const { level, featureName } = this.props

    // Create a detailed error report
    const report = {
      errorId,
      level,
      featureName,
      error: {
        message: error?.message,
        stack: error?.stack,
      },
      errorInfo: {
        componentStack: errorInfo?.componentStack,
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }

    // In a real app, you might send this to your error reporting service
    console.log('Error Report:', report)

    // For now, just copy to clipboard
    navigator.clipboard
      .writeText(JSON.stringify(report, null, 2))
      .then(() => {
        alert('Error report copied to clipboard!')
      })
      .catch(() => {
        alert('Failed to copy error report to clipboard')
      })
  }

  handleNavigateHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Use default fallback UI
      return (
        <ErrorFallback
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId!}
          level={this.props.level || 'component'}
          featureName={this.props.featureName}
          onRetry={this.handleRetry}
          onReport={this.handleReport}
          onNavigateHome={this.handleNavigateHome}
          showErrorDetails={this.props.showErrorDetails || false}
          enableRetry={this.props.enableRetry !== false}
          enableReporting={this.props.enableReporting !== false}
        />
      )
    }

    return this.props.children
  }
}

// Convenience hooks and utilities
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    // Manual error reporting
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.withScope(scope => {
        scope.setTag('manualError', true)
        if (errorInfo) {
          scope.setContext('errorInfo', errorInfo)
        }
        window.Sentry.captureException(error)
      })
    }

    // Re-throw the error to be caught by error boundary
    throw error
  }
}

// Higher-order component for wrapping features
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return ComponentWithErrorBoundary
}

// Type declarations for Sentry (if not already available)
declare global {
  interface Window {
    Sentry?: {
      withScope: (callback: (scope: any) => void) => void
      captureException: (error: Error) => void
    }
  }
}
