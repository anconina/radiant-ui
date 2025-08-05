import { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import { useIsMobile } from '@/shared/ui/responsive'

import { AppSidebar } from './AppSidebar'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileBottomNav } from './MobileBottomNav'
import { MobileHeader } from './MobileHeader'
import { SidebarInset, SidebarProvider } from './Sidebar'
import { SiteHeader } from './sidebar/site-header'

interface LayoutProps {
  children: ReactNode
  className?: string
  showSidebar?: boolean
  sidebarDefaultOpen?: boolean
}

export function Layout({
  children,
  className,
  showSidebar = true,
  sidebarDefaultOpen = true,
}: LayoutProps) {
  const isMobile = useIsMobile()

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-background flex flex-col" data-testid="layout-no-sidebar">
        {isMobile ? <MobileHeader /> : <Header />}
        <main className={cn('flex-1', className)} data-testid="main-content" id="main-content">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
        <Footer />
        {isMobile && <MobileBottomNav />}
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <div className="flex min-h-screen w-full flex-col" data-testid="layout-with-sidebar">
        {isMobile ? <MobileHeader /> : <SiteHeader />}
        <div className="flex flex-1" data-testid="app-shell">
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <main className={cn('flex-1', className)} data-testid="main-content" id="main-content">
              <div
                className={cn(
                  'container mx-auto px-4 py-6 sm:px-6 lg:px-8',
                  isMobile && 'pb-20' // Add padding for mobile bottom nav
                )}
              >
                {children}
              </div>
            </main>
            {!isMobile && <Footer />}
          </SidebarInset>
        </div>
        {isMobile && <MobileBottomNav />}
      </div>
    </SidebarProvider>
  )
}
