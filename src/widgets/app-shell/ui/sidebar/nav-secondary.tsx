import * as React from 'react'

import { Link, useLocation } from 'react-router-dom'

import { type LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../Sidebar'

export interface SecondaryItem {
  id: string
  title: string
  url?: string
  icon: LucideIcon
  badge?: number
}

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: SecondaryItem[]
  label?: string
}

export function NavSecondary({ items, label, ...props }: NavSecondaryProps) {
  const location = useLocation()

  const isActiveRoute = (url?: string) => {
    if (!url) return false
    return location.pathname === url || location.pathname.startsWith(url + '/')
  }

  return (
    <SidebarGroup {...props}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => {
            const isActive = isActiveRoute(item.url)

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild size="sm" isActive={isActive}>
                  <Link to={item.url || '#'}>
                    <item.icon />
                    <span>{item.title}</span>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
