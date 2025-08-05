import { Link } from 'react-router-dom'

import { Bell, Search } from 'lucide-react'

import { useAuth } from '@/features/auth'

import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/routes'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DirectionToggle } from '@/shared/ui/direction-toggle'
import { Input } from '@/shared/ui/input'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { isAuthenticated } = useAuth()

  return (
    <nav className={cn('flex items-center justify-between', className)}>
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full ps-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        {isAuthenticated && (
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to={ROUTES.notifications}>
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -end-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
              <span className="sr-only">3 new notifications</span>
            </Link>
          </Button>
        )}

        {/* Direction Toggle */}
        <DirectionToggle />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Sign In Button - Only show when not authenticated */}
        {!isAuthenticated && (
          <Button asChild variant="default" size="sm">
            <Link to={ROUTES.login}>Sign in</Link>
          </Button>
        )}
      </div>
    </nav>
  )
}
