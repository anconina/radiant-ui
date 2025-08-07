// Additional loading components (placeholder implementations)
import { ReactNode } from 'react'

import { Spinner } from './Spinner'

/**
 * Loading UI components public API
 * Provides loading states, spinners, and skeleton components
 */

// Loading components
export { LoadingState } from './LoadingState'
export { PageLoader } from './PageLoader'
export { Spinner }

// Skeleton components
export { SkeletonCard } from './SkeletonCard'
export { SkeletonForm } from './SkeletonForm'
export { SkeletonList } from './SkeletonList'
export { SkeletonTable } from './SkeletonTable'

export const LoadingList = ({ children }: { children?: ReactNode }) => (
  <div className="space-y-2">{children || <div>Loading list...</div>}</div>
)

export const ProgressLoader = ({ isLoading }: { isLoading: boolean }) =>
  isLoading ? <div className="fixed top-0 left-0 w-full h-1 bg-primary animate-pulse" /> : null

export const SpinnerOverlay = ({ show = true }: { show?: boolean }) =>
  show ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Spinner size="xl" />
    </div>
  ) : null
