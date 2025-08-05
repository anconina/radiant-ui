'use client'

import { Link, useNavigate } from 'react-router-dom'

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
  Sparkles,
  User,
} from 'lucide-react'

import { useTranslation } from '@/shared/lib/i18n'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { DropdownMenuContentNoPortal } from '@/shared/ui/dropdown-menu-no-portal'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '../Sidebar'

interface UserData {
  name: string
  email: string
  avatar?: string
  role?: string
}

interface NavUserProps {
  user?: UserData
  onLogout?: () => void
}

export function NavUser({ user, onLogout }: NavUserProps) {
  const { t } = useTranslation('common')
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const userData = user || {
    name: t('sidebar.guest'),
    email: t('sidebar.guestEmail'),
    role: 'guest',
  }

  const initials = userData.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    navigate('/auth/login')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight">
                <span className="truncate font-medium">{userData.name}</span>
                <span className="truncate text-xs text-muted-foreground">{userData.email}</span>
              </div>
              <ChevronsUpDown className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {isMobile ? (
            <DropdownMenuContentNoPortal
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="top"
              align="end"
              sideOffset={4}
              collisionPadding={20}
              avoidCollisions={true}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-sm leading-tight">
                    <span className="truncate font-medium">{userData.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{userData.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userData.role === 'guest' && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/auth/register">
                        <Sparkles className="me-2 h-4 w-4" />
                        {t('navigation.signUp')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="me-2 h-4 w-4" />
                    {t('navigation.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="me-2 h-4 w-4" />
                    {t('navigation.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications">
                    <Bell className="me-2 h-4 w-4" />
                    {t('navigation.notifications')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck className="me-2 h-4 w-4" />
                  {t('navigation.accountStatus')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="me-2 h-4 w-4" />
                  {t('navigation.billing')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="me-2 h-4 w-4" />
                {t('navigation.logout')}
              </DropdownMenuItem>
            </DropdownMenuContentNoPortal>
          ) : (
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="right"
              align="end"
              sideOffset={4}
              collisionPadding={8}
              avoidCollisions={true}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-sm leading-tight">
                    <span className="truncate font-medium">{userData.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{userData.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userData.role === 'guest' && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/auth/register">
                        <Sparkles className="me-2 h-4 w-4" />
                        {t('navigation.signUp')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="me-2 h-4 w-4" />
                    {t('navigation.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="me-2 h-4 w-4" />
                    {t('navigation.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications">
                    <Bell className="me-2 h-4 w-4" />
                    {t('navigation.notifications')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck className="me-2 h-4 w-4" />
                  {t('navigation.accountStatus')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="me-2 h-4 w-4" />
                  {t('navigation.billing')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="me-2 h-4 w-4" />
                {t('navigation.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
