import { Link } from 'react-router-dom'

import { Home } from 'lucide-react'

import { ROUTES } from '@/shared/routes'
import { Button } from '@/shared/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-bold mt-4 mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild>
          <Link to={ROUTES.home}>
            <Home className="me-2 h-4 w-4" />
            Go to Homepage
          </Link>
        </Button>
      </div>
    </div>
  )
}
