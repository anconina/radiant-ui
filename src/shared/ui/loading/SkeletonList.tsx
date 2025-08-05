import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

interface SkeletonListProps {
  className?: string
  items?: number
  showAvatar?: boolean
  showDescription?: boolean
}

export function SkeletonList({
  className,
  items = 5,
  showAvatar = false,
  showDescription = true,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-start space-x-4">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            {showDescription && <Skeleton className="h-4 w-full" />}
          </div>
        </div>
      ))}
    </div>
  )
}
