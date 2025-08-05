import { useEffect, useState } from 'react'

import { Link, useLocation } from 'react-router-dom'

import { Calendar, Home, Plus, Settings, Users } from 'lucide-react'

import { useTranslation } from '@/shared/lib/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

interface MobileBottomNavProps {
  className?: string
  showFab?: boolean
  onFabClick?: () => void
}

export function MobileBottomNav({ className, showFab = true, onFabClick }: MobileBottomNavProps) {
  const { t } = useTranslation('common')
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: t('navigation.home'),
      icon: Home,
      href: '/',
    },
    {
      id: 'users',
      label: t('navigation.users'),
      icon: Users,
      href: '/users',
    },
    {
      id: 'calendar',
      label: t('navigation.calendar'),
      icon: Calendar,
      href: '/calendar',
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: Settings,
      href: '/settings',
    },
  ]

  // Hide/show navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Swipe up gesture to show navigation when hidden
  // Note: This could be implemented if needed for gesture-based navigation reveal
  // const swipeHandlers = useSwipeGesture({
  //   onSwipeUp: () => {
  //     if (!isVisible) {
  //       setIsVisible(true)
  //     }
  //   },
  //   threshold: 0.1,
  //   velocity: 0.3,
  // })

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Floating Action Button */}
      {showFab && (
        <Button
          onClick={onFabClick}
          className={cn(
            'fab bg-primary hover:bg-primary-hover text-primary-foreground',
            'shadow-lg hover:shadow-xl transition-all duration-200',
            'flex items-center justify-center',
            !isVisible && 'translate-y-20',
            'gpu-accelerated'
          )}
          aria-label={t('common.create')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Bottom Navigation */}
      <nav
        className={cn(
          'nav-mobile bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'transition-transform duration-300 ease-in-out',
          !isVisible && 'translate-y-full',
          'safe-area-bottom',
          className
        )}
        data-testid="mobile-bottom-nav"
      >
        <div className="nav-mobile-items">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  'nav-mobile-item relative',
                  'transition-all duration-200',
                  active && 'text-primary'
                )}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute top-0 inset-x-2 h-0.5 bg-primary rounded-full" />
                )}

                {/* Icon with badge */}
                <div className="relative">
                  <Icon
                    className={cn('h-5 w-5 transition-all duration-200', active && 'scale-110')}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-xs mt-1 transition-all duration-200',
                    active ? 'font-medium' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>

                {/* Ripple effect on tap */}
                <span className="ripple absolute inset-0 rounded-md" />
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navigation */}
      <div className="h-14 safe-area-bottom mobile-only" />
    </>
  )
}
