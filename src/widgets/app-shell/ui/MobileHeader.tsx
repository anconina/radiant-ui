import { useEffect, useRef, useState } from 'react'

import { Link } from 'react-router-dom'

import { Bell, Menu, Search, User } from 'lucide-react'

import { useAuth } from '@/features/auth'

import { useSwipeGesture } from '@/shared/interactions'
import { useTranslation } from '@/shared/lib/i18n'
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'

import { SidebarTrigger, useSidebar } from './Sidebar'

interface MobileHeaderProps {
  className?: string
  showSearch?: boolean
  showNotifications?: boolean
}

export function MobileHeader({
  className,
  showSearch = true,
  showNotifications = true,
}: MobileHeaderProps) {
  const { t } = useTranslation('common')
  const { user } = useAuth()
  const { toggleSidebar } = useSidebar()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount] = useState(3) // Mock notification count
  const searchInputRef = useRef<HTMLInputElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollY = useRef(0)

  // Hide/show header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Update scrolled state for shadow
      setIsScrolled(currentScrollY > 10)

      // Hide/show logic
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsHidden(true)
      } else {
        // Scrolling up
        setIsHidden(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Swipe down gesture to reveal header when hidden
  const swipeHandlers = useSwipeGesture({
    onSwipeDown: () => {
      if (isHidden && window.scrollY > 100) {
        setIsHidden(false)
      }
    },
    threshold: 0.1,
    velocity: 0.3,
  })

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log('Search:', searchQuery)
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'transition-all duration-300 ease-in-out',
          isScrolled && 'shadow-sm border-b',
          isHidden && '-translate-y-full',
          'safe-area-top',
          className
        )}
        data-testid="mobile-header"
        {...swipeHandlers.handlers}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left side - Menu trigger */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mobile-only" />

            {/* Logo/Brand */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">R</span>
              </div>
              <span className="font-semibold text-lg desktop-only">RadiantUI</span>
            </Link>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {showSearch && (
              <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="touch-target-sm"
                    aria-label={t('common.search')}
                    data-testid="mobile-search-trigger"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto safe-area-top">
                  <SheetHeader>
                    <SheetTitle>{t('common.search')}</SheetTitle>
                    <SheetDescription>{t('common.searchPlaceholder')}</SheetDescription>
                  </SheetHeader>
                  <form onSubmit={handleSearchSubmit} className="pt-4">
                    <Input
                      ref={searchInputRef}
                      type="search"
                      placeholder={t('common.searchPlaceholder')}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full text-lg"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                    <div className="mt-4 flex gap-2">
                      <Button type="submit" className="flex-1">
                        {t('common.search')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsSearchOpen(false)
                          setSearchQuery('')
                        }}
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </form>

                  {/* Recent searches or suggestions */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {t('common.recentSearches')}
                    </h3>
                    <div className="space-y-2">
                      {['Dashboard', 'Settings', 'Users'].map(item => (
                        <button
                          key={item}
                          onClick={() => {
                            setSearchQuery(item)
                            searchInputRef.current?.focus()
                          }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Notifications */}
            {showNotifications && (
              <Button
                variant="ghost"
                size="icon"
                className="touch-target-sm relative"
                aria-label={t('common.notifications')}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* User avatar */}
            {user && (
              <Button variant="ghost" size="icon" className="touch-target-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback>{user.fullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            )}
          </div>
        </div>

        {/* Search bar for tablets */}
        <div className="hidden sm:block md:hidden px-4 pb-2">
          <form onSubmit={handleSearchSubmit}>
            <Input
              type="search"
              placeholder={t('common.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </form>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div
        className={cn(
          'h-14 safe-area-top',
          'sm:h-[4.5rem] md:h-14' // Adjust for tablet search bar
        )}
      />
    </>
  )
}
