import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

interface SkeletonFormProps {
  className?: string
  fields?: number
  showButton?: boolean
}

export function SkeletonForm({ className, fields = 4, showButton = true }: SkeletonFormProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      {showButton && <Skeleton className="h-10 w-32" />}
    </div>
  )
}
