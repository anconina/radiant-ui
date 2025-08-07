'use client'

import React from 'react'

import { Link, useLocation } from 'react-router-dom'

import { ChevronRight, type LucideIcon } from 'lucide-react'

import { useTranslation } from '@/shared/lib/i18n'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { withRTL } from '@/shared/ui/rtl'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../Sidebar'

export interface NavItem {
  id: string
  title: string
  url?: string
  icon: LucideIcon
  isActive?: boolean
  badge?: number
  items?: {
    id: string
    title: string
    url?: string
    badge?: number
  }[]
}

interface NavMainProps {
  items: NavItem[]
  label?: string
}

export function NavMain({ items, label }: NavMainProps) {
  const { t } = useTranslation('common')
  const location = useLocation()
  const defaultLabel = label || t('navigation.platform')

  const isActiveRoute = (url?: string) => {
    if (!url) return false
    return location.pathname === url || location.pathname.startsWith(url + '/')
  }

  // Track open state for each collapsible item
  const [openItems, setOpenItems] = React.useState<string[]>(() => {
    return items.filter(item => isActiveRoute(item.url) || item.isActive).map(item => item.id)
  })

  const handleOpenChange = (itemId: string, isOpen: boolean) => {
    setOpenItems(prev => (isOpen ? [...prev, itemId] : prev.filter(id => id !== itemId)))
  }

  return (
    <SidebarGroup>
      {defaultLabel && <SidebarGroupLabel>{defaultLabel}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map(item => {
          const isActive = isActiveRoute(item.url)
          const hasChildren = item.items && item.items.length > 0
          const isOpen = openItems.includes(item.id)

          return (
            <Collapsible
              key={item.id}
              asChild
              open={isOpen}
              onOpenChange={open => handleOpenChange(item.id, open)}
            >
              <SidebarMenuItem>
                {hasChildren ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className="group justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.badge && (
                            <SidebarMenuBadge className="position-static">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                          <div
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                          >
                            {React.createElement(withRTL(ChevronRight), { className: 'h-4 w-4' })}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                      <SidebarMenuSub>
                        {item.items?.map(subItem => (
                          <SidebarMenuSubItem key={subItem.id}>
                            <SidebarMenuSubButton asChild isActive={isActiveRoute(subItem.url)}>
                              <Link to={subItem.url || '#'}>
                                <span>{subItem.title}</span>
                                {subItem.badge && (
                                  <SidebarMenuBadge className="ms-auto">
                                    {subItem.badge}
                                  </SidebarMenuBadge>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link to={item.url || '#'}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
