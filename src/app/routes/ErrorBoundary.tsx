import { Link, useRouteError } from 'react-router-dom'

import { AlertTriangle, Home } from 'lucide-react'

import { ROUTES } from '@/shared/routes'
import { Button } from '@/shared/ui/button'

export function ErrorBoundary() {
  const error = useRouteError() as Error & { status?: number; statusText?: string }

  // Log error in development
  if (import.meta.env.DEV) {
    console.error('Route Error:', error)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="h-20 w-20 text-destructive mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">
            {error.status === 404 ? 'Page Not Found' : 'Oops! Something went wrong'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {error.status === 404
              ? "The page you're looking for doesn't exist."
              : error.statusText || error.message || 'An unexpected error occurred.'}
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full sm:w-auto">
            <Link to={ROUTES.home}>
              <Home className="me-2 h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>

          {error.status !== 404 && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">Error Details:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(
                  {
                    message: error.message,
                    status: error.status,
                    statusText: error.statusText,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
