// User card component
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'

import type { User } from '../model'
import { UserAvatar } from './UserAvatar'

interface UserCardProps {
  user: User
  onClick?: () => void
}

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{user.fullName}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant={user.emailVerified ? 'default' : 'secondary'}>{user.role}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
          {!user.emailVerified && (
            <Badge variant="destructive" className="text-xs">
              Email not verified
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
