import { Link } from 'react-router-dom'

import { ArrowRight, Shield, Sparkles, Zap } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/routes'
import { Button } from '@/shared/ui/button'
import { useIsMobile } from '@/shared/ui/responsive'

export default function HomePage() {
  const isMobile = useIsMobile()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-primary">Radiant UI</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A modern React template with TypeScript, Vite, and shadcn/ui. Build beautiful, fast, and
          type-safe applications.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className={cn(isMobile && 'btn-mobile ripple')}>
            <Link to={ROUTES.dashboard}>
              Get Started <ArrowRight className="ms-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className={cn(isMobile && 'btn-mobile ripple')}
          >
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className={cn('text-center space-y-4', isMobile && 'card-mobile')}>
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Modern Stack</h3>
          <p className="text-muted-foreground">
            Built with React 19, TypeScript 5, and Vite 7 for the best developer experience.
          </p>
        </div>

        <div className={cn('text-center space-y-4', isMobile && 'card-mobile')}>
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Type Safe</h3>
          <p className="text-muted-foreground">
            Full TypeScript support with strict mode enabled and comprehensive type definitions.
          </p>
        </div>

        <div className={cn('text-center space-y-4', isMobile && 'card-mobile')}>
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Lightning Fast</h3>
          <p className="text-muted-foreground">
            Optimized build configuration with code splitting and lazy loading for best performance.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 bg-muted rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to build something amazing?</h2>
        <p className="text-muted-foreground mb-6">
          Start building your next project with Radiant UI today.
        </p>
        <Button asChild className={cn(isMobile && 'btn-mobile ripple')}>
          <Link to={ROUTES.register}>Create Account</Link>
        </Button>
      </section>
    </div>
  )
}
