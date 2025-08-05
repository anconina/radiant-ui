'use client'

import { Link, useLocation } from 'react-router-dom'

import { Folder, type LucideIcon, MoreHorizontal, Share, Trash2 } from 'lucide-react'

import { useDirectionalStyles, useTranslation } from '@/shared/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { DropdownMenuContentNoPortal } from '@/shared/ui/dropdown-menu-no-portal'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../Sidebar'

export interface ProjectItem {
  id: string
  name: string
  url?: string
  icon: LucideIcon
  badge?: number
  actions?: boolean
}

interface NavProjectsProps {
  projects: ProjectItem[]
  label?: string
}

export function NavProjects({ projects, label }: NavProjectsProps) {
  const { t } = useTranslation('common')
  const { isMobile } = useSidebar()
  const { isRTL } = useDirectionalStyles()
  const location = useLocation()
  const defaultLabel = label || t('navigation.projects')

  const isActiveRoute = (url?: string) => {
    if (!url) return false
    return location.pathname === url || location.pathname.startsWith(url + '/')
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{defaultLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map(item => {
          const isActive = isActiveRoute(item.url)

          return (
            <SidebarMenuItem key={item.id} className="flex items-center gap-1">
              <SidebarMenuButton asChild isActive={isActive} className="flex-1">
                <Link to={item.url || '#'}>
                  <item.icon />
                  <span>{item.name}</span>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </Link>
              </SidebarMenuButton>
              {item.actions !== false && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4"
                      type="button"
                    >
                      <MoreHorizontal />
                      <span className="sr-only">{t('actions.more')}</span>
                    </button>
                  </DropdownMenuTrigger>
                  {isMobile ? (
                    <DropdownMenuContentNoPortal
                      className="w-48 z-[200]"
                      side="bottom"
                      align="end"
                      sideOffset={4}
                      collisionPadding={20}
                      avoidCollisions={true}
                    >
                      <DropdownMenuItem>
                        <Folder className="me-2 h-4 w-4 text-muted-foreground" />
                        <span>{t('actions.viewDetails')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="me-2 h-4 w-4 text-muted-foreground" />
                        <span>{t('actions.share')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="me-2 h-4 w-4" />
                        <span>{t('actions.delete')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContentNoPortal>
                  ) : (
                    <DropdownMenuContent
                      className="w-48"
                      side={isRTL ? 'left' : 'right'}
                      align="start"
                    >
                      <DropdownMenuItem>
                        <Folder className="me-2 h-4 w-4 text-muted-foreground" />
                        <span>{t('actions.viewDetails')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="me-2 h-4 w-4 text-muted-foreground" />
                        <span>{t('actions.share')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="me-2 h-4 w-4" />
                        <span>{t('actions.delete')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
