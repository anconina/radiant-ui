// User avatar component
import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

import type { User } from '../model'

interface UserAvatarProps {
  user: Pick<User, 'avatar' | 'fullName'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user.avatar} alt={user.fullName} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
