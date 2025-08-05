import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

interface SkeletonTableProps {
  className?: string
  rows?: number
  columns?: number
  showHeader?: boolean
}

export function SkeletonTable({
  className,
  rows = 5,
  columns = 4,
  showHeader = true,
}: SkeletonTableProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="rounded-md border">
        {showHeader && (
          <div className="border-b p-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }, (_, i) => (
                <Skeleton key={i} className="h-5 flex-1" />
              ))}
            </div>
          </div>
        )}
        <div className="divide-y">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="p-4">
              <div className="flex space-x-4">
                {Array.from({ length: columns }, (_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className="h-4 flex-1"
                    style={{ width: `${Math.random() * 30 + 70}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
