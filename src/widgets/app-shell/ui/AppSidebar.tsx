import {
  Beaker,
  Briefcase,
  Calendar,
  Frame,
  HelpCircle,
  Home,
  Inbox,
  Presentation,
  Settings,
  Users,
} from 'lucide-react'

import { useAuth } from '@/features/auth'

import { useDirectionalStyles, useTranslation } from '@/shared/lib/i18n'

import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from './Sidebar'
import { NavMain } from './sidebar/nav-main'
import { NavProjects } from './sidebar/nav-projects'
import { NavSecondary } from './sidebar/nav-secondary'
import { NavUser } from './sidebar/nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation('common')
  const { user, logout } = useAuth()
  const { isRTL } = useDirectionalStyles()

  const navMainData = [
    {
      id: 'dashboard',
      title: t('navigation.dashboard'),
      url: '/dashboard',
      icon: Home,
      isActive: true,
    },
    {
      id: 'users',
      title: t('navigation.users'),
      url: '/users',
      icon: Users,
    },
    {
      id: 'calendar',
      title: t('navigation.calendar'),
      url: '#',
      icon: Calendar,
    },
    {
      id: 'settings',
      title: t('navigation.settings'),
      url: '/settings',
      icon: Settings,
    },
    {
      id: 'help',
      title: t('navigation.help'),
      url: '/help',
      icon: HelpCircle,
    },
    {
      id: 'examples',
      title: t('navigation.examples'),
      url: '/examples',
      icon: Beaker,
      items: [
        {
          id: 'url-state',
          title: t('navigation.urlState'),
          url: '/examples/url-state',
        },
        {
          id: 'responsive-design',
          title: t('navigation.responsiveDesign'),
          url: '/examples/responsive',
        },
        {
          id: 'loading-states',
          title: t('navigation.loadingStates'),
          url: '/examples/loading-states',
        },
      ],
    },
  ]

  const navSecondaryData = [
    {
      id: 'support',
      title: t('navigation.support'),
      url: '#',
      icon: Inbox,
    },
  ]

  const projectsData = [
    {
      id: 'design-engineering',
      name: t('projects.designEngineering'),
      url: '#',
      icon: Frame,
    },
    {
      id: 'sales-marketing',
      name: t('projects.salesMarketing'),
      url: '#',
      icon: Presentation,
    },
    {
      id: 'travel',
      name: t('projects.travel'),
      url: '#',
      icon: Briefcase,
    },
  ]

  const userData = user
    ? {
        name: user.fullName || 'User',
        email: user.email || 'user@example.com',
        avatar: user.avatar,
        role: user.role || 'user',
      }
    : undefined

  return (
    <Sidebar variant="inset" side={isRTL ? 'right' : 'left'} {...props}>
      <SidebarContent>
        <NavMain items={navMainData} />
        <NavProjects projects={projectsData} />
        <NavSecondary items={navSecondaryData} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onLogout={logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
