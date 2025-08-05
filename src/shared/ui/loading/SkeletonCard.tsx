import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

interface SkeletonCardProps {
  className?: string
  showFooter?: boolean
  showDescription?: boolean
  lines?: number
}

export function SkeletonCard({
  className,
  showFooter = false,
  showDescription = true,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        {showDescription && <Skeleton className="h-4 w-1/2 mt-2" />}
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
      {showFooter && (
        <CardFooter>
          <Skeleton className="h-10 w-28" />
        </CardFooter>
      )}
    </Card>
  )
}
