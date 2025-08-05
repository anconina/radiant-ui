import React from 'react'

import { type LucideIcon } from 'lucide-react'

import { useDirectionalStyles } from '@/shared/lib/i18n'
import { cn } from '@/shared/lib/utils'

type IconComponent = React.ComponentType<{ className?: string; size?: number | string }>

// Icons that should be mirrored in RTL
const MIRROR_ICONS = [
  'ArrowLeft',
  'ArrowRight',
  'ChevronLeft',
  'ChevronRight',
  'ArrowBack',
  'ArrowForward',
  'NavigateBefore',
  'NavigateNext',
  'Send',
  'Reply',
  'Forward',
  'Undo',
  'Redo',
  'PanelLeft',
  'LogOut',
  'ExternalLink',
]

interface DirectionalIconProps {
  ltrIcon: IconComponent
  rtlIcon: IconComponent
  className?: string
  size?: number | string
}

export function DirectionalIcon({
  ltrIcon: LtrIcon,
  rtlIcon: RtlIcon,
  className,
  size,
}: DirectionalIconProps) {
  const { isRTL } = useDirectionalStyles()
  const Icon = isRTL ? RtlIcon : LtrIcon

  return <Icon className={className} size={size} />
}

// Wrapper for icons that should flip in RTL
interface FlippableIconProps {
  icon: IconComponent
  className?: string
  size?: number | string
  shouldFlip?: boolean
}

export function FlippableIcon({
  icon: Icon,
  className,
  size,
  shouldFlip = true,
}: FlippableIconProps) {
  const { isRTL } = useDirectionalStyles()

  return <Icon className={cn(isRTL && shouldFlip && '-scale-x-100', className)} size={size} />
}

// HOC to make any Lucide icon RTL-aware
export function withRTL<P extends { className?: string }>(
  Icon: LucideIcon,
  shouldMirror = true
): React.FC<P> {
  return function RTLIcon(props: P) {
    const { isRTL } = useDirectionalStyles()
    const iconName = Icon.displayName || Icon.name || ''

    // Check if this icon should be mirrored
    const shouldApplyMirror =
      shouldMirror &&
      (MIRROR_ICONS.includes(iconName) ||
        iconName.includes('Arrow') ||
        iconName.includes('Chevron'))

    return (
      <Icon
        {...props}
        className={cn(props.className, shouldApplyMirror && isRTL && '-scale-x-100')}
      />
    )
  }
}
