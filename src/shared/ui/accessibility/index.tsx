import * as React from 'react'

import { cn } from '@/shared/lib/utils'

// Skip to main content link for keyboard navigation
export function SkipToContent({
  href = '#main-content',
  children = 'Skip to main content',
}: {
  href?: string
  children?: React.ReactNode
}) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'fixed top-4 left-4 z-50',
        'bg-background text-foreground',
        'px-4 py-2 rounded-md',
        'border-2 border-primary',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'transition-all duration-200'
      )}
    >
      {children}
    </a>
  )
}

// Announce component for screen reader announcements
interface AnnounceProps {
  message: string
  priority?: 'polite' | 'assertive'
  className?: string
}

export function Announce({ message, priority = 'polite', className }: AnnounceProps) {
  return (
    <div role="status" aria-live={priority} aria-atomic="true" className={cn('sr-only', className)}>
      {message}
    </div>
  )
}

// Focus trap component for modals and overlays
interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  className?: string
}

export function FocusTrap({ children, active = true, className }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus first element
    firstFocusable?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Touch-friendly tooltip with accessibility
interface AccessibleTooltipProps {
  content: string
  children: React.ReactElement
  side?: 'top' | 'bottom' | 'left' | 'right'
  delayDuration?: number
}

export function AccessibleTooltip({
  content,
  children,
  side = 'top',
  delayDuration = 700,
}: AccessibleTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const handleInteractionStart = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, delayDuration)
  }

  const handleInteractionEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(false)
  }

  return (
    <>
      {React.cloneElement(children, {
        'aria-describedby': isOpen ? 'tooltip' : undefined,
        onMouseEnter: handleInteractionStart,
        onMouseLeave: handleInteractionEnd,
        onTouchStart: handleInteractionStart,
        onTouchEnd: handleInteractionEnd,
        onFocus: handleInteractionStart,
        onBlur: handleInteractionEnd,
      })}
      {isOpen && (
        <div
          id="tooltip"
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2',
            'bg-popover text-popover-foreground',
            'rounded-md shadow-md',
            'text-sm',
            'animate-in fade-in-0 zoom-in-95',
            side === 'top' && 'bottom-full mb-2',
            side === 'bottom' && 'top-full mt-2',
            side === 'left' && 'right-full mr-2',
            side === 'right' && 'left-full ml-2'
          )}
        >
          {content}
        </div>
      )}
    </>
  )
}

// Loading state with screen reader announcement
interface LoadingStateProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingState({
  isLoading,
  loadingText = 'Loading...',
  children,
}: LoadingStateProps) {
  return (
    <>
      {isLoading && <Announce message={loadingText} priority="polite" />}
      <div aria-busy={isLoading} aria-live="polite">
        {children}
      </div>
    </>
  )
}

// Accessible icon button with proper labeling
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  icon: React.ReactNode
  showTooltip?: boolean
}

export function IconButton({
  label,
  icon,
  showTooltip = true,
  className,
  ...props
}: IconButtonProps) {
  const button = (
    <button
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center',
        'min-h-[44px] min-w-[44px]',
        'rounded-md',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'transition-colors',
        className
      )}
      {...props}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  )

  if (showTooltip) {
    return <AccessibleTooltip content={label}>{button}</AccessibleTooltip>
  }

  return button
}

// Accessible form field with error handling
interface AccessibleFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactElement
}

export function AccessibleField({ label, error, required, children }: AccessibleFieldProps) {
  const id = React.useId()
  const errorId = `${id}-error`
  const descriptionId = `${id}-description`

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      {React.cloneElement(children, {
        id,
        'aria-invalid': !!error,
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required,
      })}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Screen reader only text
export function VisuallyHidden({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <span className={cn('sr-only', className)}>{children}</span>
}

// Touch target size validator (development only)
export function TouchTargetValidator({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>
  }

  React.useEffect(() => {
    const checkTouchTargets = () => {
      const interactiveElements = document.querySelectorAll(
        'button, a, input, select, textarea, [role="button"], [role="link"]'
      )

      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        if (width < 44 || height < 44) {
          console.warn(
            `Touch target too small (${width}x${height}px):`,
            element,
            'Minimum recommended size is 44x44px'
          )
        }
      })
    }

    // Check on mount and after updates
    checkTouchTargets()
    const observer = new MutationObserver(checkTouchTargets)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return <>{children}</>
}
