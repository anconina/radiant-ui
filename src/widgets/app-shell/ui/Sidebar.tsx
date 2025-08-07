'use client'

import * as React from 'react'

import { useLocation } from 'react-router-dom'

import { Slot } from '@radix-ui/react-slot'

import { PanelLeft, PanelRight } from 'lucide-react'

import { type VariantProps, cva } from 'class-variance-authority'

import { useSwipeGesture } from '@/shared/interactions'
import { useDirectionalStyles } from '@/shared/lib/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useIsMobile } from '@/shared/ui/responsive'
import { Separator } from '@/shared/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

type SidebarContextProps = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }

  return context
}

interface SidebarProviderProps extends React.ComponentProps<'div'> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  ref?: React.Ref<HTMLDivElement>
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ref,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile()
  const location = useLocation()
  const [openMobile, setOpenMobile] = React.useState(false)
  const { isRTL } = useDirectionalStyles()

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  // Prevent body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (isMobile && openMobile) {
      // Save current body overflow
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isMobile, openMobile])

  // Auto-close mobile sidebar on navigation
  const prevPathnameRef = React.useRef(location.pathname)
  React.useEffect(() => {
    if (isMobile && openMobile && location.pathname !== prevPathnameRef.current) {
      setOpenMobile(false)
    }
    prevPathnameRef.current = location.pathname
  }, [location.pathname, isMobile, openMobile, setOpenMobile])

  // Edge swipe detection for opening sidebar on mobile
  React.useEffect(() => {
    if (!isMobile || openMobile) return

    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartX = touch.clientX
      touchStartY = touch.clientY
      touchStartTime = Date.now()
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartTime) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartX
      const deltaY = touch.clientY - touchStartY
      const deltaTime = Date.now() - touchStartTime

      // Check if it's an edge swipe (within 20px of edge)
      const isLeftEdge = touchStartX <= 20
      const isRightEdge = touchStartX >= window.innerWidth - 20

      // Check if it's a horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && (isLeftEdge || isRightEdge) && deltaTime < 500) {
        // Open sidebar on edge swipe based on RTL mode
        const shouldOpenFromLeft = !isRTL && isLeftEdge && deltaX > 50
        const shouldOpenFromRight = isRTL && isRightEdge && deltaX < -50

        if (shouldOpenFromLeft || shouldOpenFromRight) {
          setOpenMobile(true)
          touchStartTime = 0 // Reset to prevent multiple triggers
        }
      }
    }

    const handleTouchEnd = () => {
      touchStartTime = 0
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, openMobile, setOpenMobile, isRTL])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed'

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  // Show edge swipe hint on first use or after inactivity
  const [showEdgeHint, setShowEdgeHint] = React.useState(false)

  React.useEffect(() => {
    if (!isMobile || openMobile) {
      setShowEdgeHint(false)
      return
    }

    // Show hint after 3 seconds of inactivity
    const timer = setTimeout(() => {
      setShowEdgeHint(true)
    }, 3000)

    // Hide hint after animation completes
    const hideTimer = setTimeout(() => {
      setShowEdgeHint(false)
    }, 9000) // 3s delay + 6s animation (3 pulses * 2s)

    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [isMobile, openMobile])

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          ref={ref}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'group/sidebar-wrapper flex min-h-screen w-full has-[[data-variant=inset]]:bg-sidebar',
            className
          )}
          {...props}
        >
          {children}
          {/* Edge swipe indicator for mobile */}
          {isMobile && !openMobile && (
            <div
              className={cn('edge-swipe-indicator', showEdgeHint && 'visible')}
              data-side={isRTL ? 'right' : 'left'}
              data-show-hint={showEdgeHint}
              aria-hidden="true"
            />
          )}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}
SidebarProvider.displayName = 'SidebarProvider'

interface SidebarProps extends React.ComponentProps<'div'> {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
  ref?: React.Ref<HTMLDivElement>
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ref,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
  const { isRTL } = useDirectionalStyles()

  // Compute effective side for RTL mode in mobile
  const effectiveSide = React.useMemo(() => {
    if (!isRTL) return side
    // In RTL mode, flip the side
    return side === 'left' ? 'right' : 'left'
  }, [side, isRTL])

  // State for swipe visual feedback (only used in mobile)
  const [swipeOffset, setSwipeOffset] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragProgress, setDragProgress] = React.useState(0)

  // Enhanced swipe gesture hook with haptic feedback (only used in mobile)
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft:
      effectiveSide === 'left' && isMobile
        ? () => {
            // Haptic feedback on close (if supported)
            if ('vibrate' in navigator) {
              navigator.vibrate(10)
            }
            setOpenMobile(false)
          }
        : undefined,
    onSwipeRight:
      effectiveSide === 'right' && isMobile
        ? () => {
            // Haptic feedback on close (if supported)
            if ('vibrate' in navigator) {
              navigator.vibrate(10)
            }
            setOpenMobile(false)
          }
        : undefined,
    onSwipeMove: (distance, direction) => {
      if (
        isMobile &&
        ((effectiveSide === 'left' && direction === 'left') ||
          (effectiveSide === 'right' && direction === 'right'))
      ) {
        setIsDragging(true)
        // Apply elastic resistance when swiping to close
        const resistance = 0.3
        const offset = Math.min(distance * resistance, 100)
        setSwipeOffset(offset)
        // Calculate drag progress for visual feedback
        const progress = Math.min(distance / (window.innerWidth * 0.3), 1)
        setDragProgress(progress)
      }
    },
    onSwipeEnd: () => {
      if (isMobile) {
        setIsDragging(false)
        setSwipeOffset(0)
        setDragProgress(0)
      }
    },
    threshold: 0.25,
    velocity: 0.4,
    preventScroll: true,
  })

  if (collapsible === 'none') {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    // Separate SidebarFooter from other children for mobile layout
    const childrenArray = React.Children.toArray(children)
    const footerChildren = childrenArray.filter(
      child => React.isValidElement(child) && child.type === SidebarFooter
    )
    const otherChildren = childrenArray.filter(
      child => !React.isValidElement(child) || child.type !== SidebarFooter
    )

    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-testid="sidebar"
          data-mobile="true"
          data-dragging={isDragging ? 'true' : undefined}
          role="navigation"
          className="w-[--sidebar-width] !bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden border-0 overflow-hidden"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
              '--swipe-offset': `${swipeOffset}px`,
              '--drag-progress': dragProgress,
              backgroundColor: 'hsl(var(--sidebar-background))',
              transform: isDragging
                ? effectiveSide === 'left'
                  ? `translateX(-${swipeOffset}px)`
                  : `translateX(${swipeOffset}px)`
                : undefined,
              transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isDragging ? 1 - dragProgress * 0.3 : 1,
            } as React.CSSProperties
          }
          side={effectiveSide}
          {...swipeHandlers.handlers}
          ref={swipeHandlers.ref}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Main navigation for the application</SheetDescription>
          </SheetHeader>
          <div
            className="flex h-full w-full flex-col !bg-sidebar relative"
            style={{ backgroundColor: 'hsl(var(--sidebar-background))' }}
          >
            {/* Enhanced drag handle with visual feedback */}
            <div
              className={cn(
                'absolute top-4 transform -translate-x-1/2 z-10',
                effectiveSide === 'left' ? 'left-1/2' : 'right-1/2'
              )}
            >
              <div
                className="drag-handle bg-muted-foreground/20 transition-all duration-200"
                aria-hidden="true"
                style={{
                  opacity: isDragging ? 1 : 0.6,
                  width: isDragging ? '48px' : '36px',
                  height: isDragging ? '5px' : '4px',
                  borderRadius: '3px',
                }}
              />
            </div>

            {/* Progress indicator */}
            {isDragging && (
              <div
                className={cn(
                  'absolute top-0 h-1 bg-primary transition-transform',
                  effectiveSide === 'left'
                    ? 'left-0 right-0 origin-left'
                    : 'left-0 right-0 origin-right'
                )}
                style={{
                  transform: `scaleX(${dragProgress})`,
                }}
              />
            )}

            {/* Scrollable content area */}
            <div className="flex-1 min-h-0 overflow-auto safe-area-y">{otherChildren}</div>

            {/* Fixed footer at bottom */}
            {footerChildren.length > 0 && (
              <div className="flex-shrink-0 mt-auto border-t border-sidebar-border">
                {footerChildren}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      ref={ref}
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-testid="sidebar-desktop"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          'duration-200 relative w-[--sidebar-width] bg-transparent transition-[width] ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.4))]'
            : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]'
        )}
      />
      <div
        className={cn(
          'duration-200 fixed top-14 bottom-0 z-10 hidden h-[calc(100vh-3.5rem)] w-[--sidebar-width] transition-[inset-inline-start,inset-inline-end,width] ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          // Adjust the padding for floating and inset variants.
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.4)+2px)]'
            : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l',
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
Sidebar.displayName = 'Sidebar'

interface SidebarTriggerProps extends React.ComponentPropsWithoutRef<typeof Button> {
  ref?: React.Ref<React.ElementRef<typeof Button>>
}

function SidebarTrigger({ className, onClick, ref, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      data-testid="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={event => {
        onClick?.(event)
        toggleSidebar()
      }}
      aria-label="Toggle sidebar menu"
      {...props}
    >
      <PanelLeft className="w-4 h-4 ltr:block rtl:hidden" />
      <PanelRight className="w-4 h-4 ltr:hidden rtl:block" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
SidebarTrigger.displayName = 'SidebarTrigger'

interface SidebarRailProps extends React.ComponentPropsWithoutRef<'button'> {
  ref?: React.Ref<HTMLButtonElement>
}

function SidebarRail({ className, ref, ...props }: SidebarRailProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'absolute top-0 bottom-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex',
        '[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        'group-data-[side=left]:-right-4 group-data-[side=right]:-left-4',
        className
      )}
      {...props}
    />
  )
}
SidebarRail.displayName = 'SidebarRail'

interface SidebarInsetProps extends React.ComponentProps<'main'> {
  ref?: React.Ref<HTMLDivElement>
}

function SidebarInset({ className, ref, ...props }: SidebarInsetProps) {
  return (
    <main
      ref={ref}
      className={cn(
        'relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col bg-background',
        'peer-data-[variant=inset]:min-h-[calc(100vh-3.5rem-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[side=left]:peer-data-[variant=inset]:ml-0 md:peer-data-[side=right]:peer-data-[variant=inset]:mr-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[side=left]:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[side=right]:peer-data-[state=collapsed]:peer-data-[variant=inset]:mr-2',
        className
      )}
      {...props}
    />
  )
}
SidebarInset.displayName = 'SidebarInset'

interface SidebarInputProps extends React.ComponentPropsWithoutRef<typeof Input> {
  ref?: React.Ref<React.ElementRef<typeof Input>>
}

function SidebarInput({ className, ref, ...props }: SidebarInputProps) {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        'h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        className
      )}
      {...props}
    />
  )
}
SidebarInput.displayName = 'SidebarInput'

interface SidebarHeaderProps extends React.ComponentProps<'div'> {
  ref?: React.Ref<HTMLDivElement>
}

function SidebarHeader({ className, ref, ...props }: SidebarHeaderProps) {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
}
SidebarHeader.displayName = 'SidebarHeader'

interface SidebarFooterProps extends React.ComponentProps<'div'> {
  ref?: React.Ref<HTMLDivElement>
}

function SidebarFooter({ className, ref, ...props }: SidebarFooterProps) {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
}
SidebarFooter.displayName = 'SidebarFooter'

interface SidebarSeparatorProps extends React.ComponentPropsWithoutRef<typeof Separator> {
  ref?: React.Ref<React.ElementRef<typeof Separator>>
}

function SidebarSeparator({ className, ref, ...props }: SidebarSeparatorProps) {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn('mx-2 w-auto bg-sidebar-border', className)}
      {...props}
    />
  )
}
SidebarSeparator.displayName = 'SidebarSeparator'

interface SidebarContentProps extends React.ComponentProps<'div'> {
  ref?: React.Ref<HTMLDivElement>
}

function SidebarContent({ className, ref, ...props }: SidebarContentProps) {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className
      )}
      {...props}
    />
  )
}
SidebarContent.displayName = 'SidebarContent'

interface SidebarGroupProps extends React.ComponentProps<'div'> {
  ref?: React.Ref<HTMLDivElement>
}

function SidebarGroup({ className, ref, ...props }: SidebarGroupProps) {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  )
}
SidebarGroup.displayName = 'SidebarGroup'

interface SidebarGroupLabelProps extends React.ComponentProps<'div'> {
  asChild?: boolean
  ref?: React.Ref<HTMLDivElement>
}

function SidebarGroupLabel({ className, asChild = false, ref, ...props }: SidebarGroupLabelProps) {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        'duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className
      )}
      {...props}
    />
  )
}
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

interface SidebarGroupActionProps extends React.ComponentProps<'button'> {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

function SidebarGroupAction({
  className,
  asChild = false,
  ref,
  ...props
}: SidebarGroupActionProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  )
}
SidebarGroupAction.displayName = 'SidebarGroupAction'

interface SidebarGroupContentProps extends React.ComponentProps<'div'> {
  ref?: React.Ref<HTMLDivElement>
}

function SidebarGroupContent({ className, ref, ...props }: SidebarGroupContentProps) {
  return (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn('w-full text-sm', className)}
      {...props}
    />
  )
}
SidebarGroupContent.displayName = 'SidebarGroupContent'

interface SidebarMenuProps extends React.ComponentProps<'ul'> {
  ref?: React.Ref<HTMLUListElement>
}

function SidebarMenu({ className, ref, ...props }: SidebarMenuProps) {
  return (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  )
}
SidebarMenu.displayName = 'SidebarMenu'

interface SidebarMenuItemProps extends React.ComponentProps<'li'> {
  ref?: React.Ref<HTMLLIElement>
}

function SidebarMenuItem({ className, ref, ...props }: SidebarMenuItemProps) {
  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn('group/menu-item relative min-h-[2rem]', className)}
      {...props}
    />
  )
}
SidebarMenuItem.displayName = 'SidebarMenuItem'

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface SidebarMenuButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
  ref?: React.Ref<HTMLButtonElement>
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ref,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}
SidebarMenuButton.displayName = 'SidebarMenuButton'

interface SidebarMenuActionProps extends React.ComponentProps<'button'> {
  asChild?: boolean
  showOnHover?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ref,
  ...props
}: SidebarMenuActionProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        'absolute ltr:right-1 rtl:left-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
        // Position based on button size
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        // Mobile specific positioning - center vertically
        'max-sm:!top-[50%] max-sm:!-translate-y-1/2',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0',
        className
      )}
      {...props}
    />
  )
}
SidebarMenuAction.displayName = 'SidebarMenuAction'

interface SidebarMenuBadgeProps extends React.ComponentProps<'div'> {
  ref?: React.Ref<HTMLDivElement>
}

function SidebarMenuBadge({ className, ref, ...props }: SidebarMenuBadgeProps) {
  return (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        'pointer-events-none absolute ltr:right-1 rtl:left-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground',
        'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  )
}
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

interface SidebarMenuSkeletonProps extends React.ComponentProps<'div'> {
  showIcon?: boolean
  ref?: React.Ref<HTMLDivElement>
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ref,
  ...props
}: SidebarMenuSkeletonProps) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton'

interface SidebarMenuSubProps extends React.ComponentProps<'ul'> {
  ref?: React.Ref<HTMLUListElement>
}

function SidebarMenuSub({ className, ref, ...props }: SidebarMenuSubProps) {
  return (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        'mx-3.5 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  )
}
SidebarMenuSub.displayName = 'SidebarMenuSub'

interface SidebarMenuSubItemProps extends React.ComponentProps<'li'> {
  ref?: React.Ref<HTMLLIElement>
}

function SidebarMenuSubItem({ className, ref, ...props }: SidebarMenuSubItemProps) {
  return (
    <li
      ref={ref}
      data-sidebar="menu-sub-item"
      className={cn('group/menu-sub-item relative', className)}
      {...props}
    />
  )
}
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

interface SidebarMenuSubButtonProps extends React.ComponentProps<'a'> {
  asChild?: boolean
  size?: 'sm' | 'md'
  isActive?: boolean
  ref?: React.Ref<HTMLAnchorElement>
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ref,
  ...props
}: SidebarMenuSubButtonProps) {
  const Comp = asChild ? Slot : 'a'

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
        'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  )
}
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
