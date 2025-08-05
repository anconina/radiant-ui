import * as React from 'react'

import { useLoadingStore } from '@/shared/stores/loading.store'
import { LoadingOverlay } from '@/shared/ui/loading-overlay'

interface LoadingProviderProps {
  children: React.ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const { isGlobalLoading, globalMessage } = useLoadingStore()

  return (
    <>
      {children}
      <LoadingOverlay isLoading={isGlobalLoading} message={globalMessage} fullscreen size="lg" />
    </>
  )
}

/**
 * Hook to show/hide global loading with automatic cleanup
 */
export function useGlobalLoading() {
  const { setGlobalLoading } = useLoadingStore()

  const showLoading = React.useCallback(
    (message?: string) => {
      setGlobalLoading(true, message)
    },
    [setGlobalLoading]
  )

  const hideLoading = React.useCallback(() => {
    setGlobalLoading(false)
  }, [setGlobalLoading])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      setGlobalLoading(false)
    }
  }, [setGlobalLoading])

  return { showLoading, hideLoading }
}
