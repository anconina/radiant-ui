'use client'

import React from 'react'

import { Link, useLocation } from 'react-router-dom'

import { Languages } from 'lucide-react'

import { useDirectionalStyles, useTranslation } from '@/shared/lib/i18n'
import { useLanguage } from '@/shared/lib/i18n'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'

import { SidebarTrigger } from '../Sidebar'
import { SearchForm } from './search-form'

interface BreadcrumbSegment {
  label: string
  href?: string
}

// Map routes to translation keys
const getRouteLabelMap = (t: any): Record<string, string> => ({
  '/': t('navigation.home'),
  '/dashboard': t('navigation.dashboard'),
  '/profile': t('navigation.profile'),
  '/settings': t('navigation.settings'),
  '/users': t('navigation.users'),
  '/notifications': t('navigation.notifications'),
  '/help': t('navigation.helpSupport'),
  '/admin': t('navigation.adminDashboard'),
  '/components': t('navigation.components'),
  '/components/ui': t('navigation.uiComponents'),
  '/components/forms': t('navigation.forms'),
  '/components/data': t('navigation.dataDisplay'),
  '/examples': t('navigation.examples'),
  '/examples/url-state': t('navigation.urlState'),
  '/examples/responsive': t('navigation.responsiveDesign'),
  '/examples/loading-states': t('navigation.loadingStates'),
  '/examples/rtl': t('navigation.rtlSupport'),
  '/examples/data-table': t('navigation.dataTable'),
})

function generateBreadcrumbs(
  pathname: string,
  routeLabelMap: Record<string, string>,
  homeLabel: string
): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbSegment[] = []

  // Always add home
  breadcrumbs.push({ label: homeLabel, href: '/' })

  // Build up the path
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const label = routeLabelMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)

    if (index === segments.length - 1) {
      // Last segment is the current page
      breadcrumbs.push({ label })
    } else {
      breadcrumbs.push({ label, href: currentPath })
    }
  })

  return breadcrumbs
}

export function SiteHeader() {
  const { t } = useTranslation('common')
  const { direction } = useDirectionalStyles()
  const { changeLanguage, language } = useLanguage()
  const location = useLocation()
  const routeLabelMap = getRouteLabelMap(t)
  const breadcrumbs = generateBreadcrumbs(location.pathname, routeLabelMap, t('navigation.home'))

  const toggleDirection = () => {
    // Toggle between English (LTR) and Hebrew (RTL)
    changeLanguage(language === 'he' ? 'en' : 'he')
  }

  return (
    <header className="sticky top-0 z-30 flex w-full items-center border-b bg-background">
      <div className="flex h-14 w-full items-center gap-2 px-4">
        <SidebarTrigger className="h-8 w-8" />
        <Separator orientation="vertical" className="me-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.href || '#'}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ms-auto sm:w-auto" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-8 w-8"
                variant="ghost"
                size="icon"
                onClick={toggleDirection}
                aria-label={
                  direction === 'ltr' ? t('sidebar.switchToRtl') : t('sidebar.switchToLtr')
                }
              >
                <Languages className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{direction === 'ltr' ? t('sidebar.switchToRtl') : t('sidebar.switchToLtr')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}
