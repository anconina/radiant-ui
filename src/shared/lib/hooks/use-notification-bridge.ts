import { useEffect, useRef } from 'react'

import { toast } from '@/shared/lib/toast'
import { useAppStore } from '@/shared/stores'

/**
 * Hook that bridges app store notifications to the toast system
 * This allows existing code using addNotification to automatically show toasts
 */
export function useNotificationBridge() {
  const notifications = useAppStore(state => state.notifications)
  const processedIds = useRef(new Set<string>())

  useEffect(() => {
    // Process new notifications
    notifications.forEach(notification => {
      if (!processedIds.current.has(notification.id)) {
        // Mark as processed
        processedIds.current.add(notification.id)

        // Show toast based on notification type
        const toastFn = toast[notification.type] || toast.info
        toastFn(notification.title, {
          description: notification.message,
          duration: notification.duration,
        })
      }
    })

    // Clean up processed IDs for notifications that have been removed
    const currentIds = new Set(notifications.map(n => n.id))
    processedIds.current.forEach(id => {
      if (!currentIds.has(id)) {
        processedIds.current.delete(id)
      }
    })
  }, [notifications])
}
