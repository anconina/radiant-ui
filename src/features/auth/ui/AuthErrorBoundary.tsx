import React from 'react'

import { AlertCircle, LogIn, RefreshCw } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorBoundary } from '@/shared/ui/error-boundary'

interface AuthErrorFallbackProps {
  onRetry: () => void
  onNavigateToLogin: () => void
}

function AuthErrorFallback({ onRetry, onNavigateToLogin }: AuthErrorFallbackProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-xl font-bold text-destructive">Authentication Error</CardTitle>
        <CardDescription>
          There was an issue with the authentication system. This might be a temporary problem.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <Button onClick={onRetry} variant="default" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button onClick={onNavigateToLogin} variant="outline" className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Go to Login
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          If the problem persists, please try refreshing the page or contact support.
        </div>
      </CardContent>
    </Card>
  )
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const handleNavigateToLogin = () => {
    window.location.href = '/auth/login'
  }

  return (
    <ErrorBoundary
      level="feature"
      featureName="Authentication"
      fallback={
        <AuthErrorFallback
          onRetry={() => window.location.reload()}
          onNavigateToLogin={handleNavigateToLogin}
        />
      }
      onError={(error, errorInfo, errorId) => {
        // Custom auth error handling
        console.error('Auth Feature Error:', { error, errorInfo, errorId })

        // Clear potentially corrupted auth state
        try {
          localStorage.removeItem('auth-storage')
          sessionStorage.removeItem('auth-storage')
        } catch (e) {
          console.warn('Failed to clear auth storage:', e)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
