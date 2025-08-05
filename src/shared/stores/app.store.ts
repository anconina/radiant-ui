import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
  timestamp: number
}

interface AppState {
  // App-wide state
  isOnline: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean

  // Loading states
  globalLoading: boolean
  loadingMessage: string | null

  // Notifications
  notifications: Notification[]

  // Feature flags
  features: {
    [key: string]: boolean
  }

  // Actions
  setOnlineStatus: (isOnline: boolean) => void
  setDeviceType: (type: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }) => void
  setGlobalLoading: (loading: boolean, message?: string) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setFeatureFlag: (flag: string, enabled: boolean) => void
  initializeApp: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isOnline: navigator.onLine,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      globalLoading: false,
      loadingMessage: null,
      notifications: [],
      features: {
        darkMode: true,
        analytics: false,
        newUI: true,
        betaFeatures: false,
      },

      // Actions
      setOnlineStatus: isOnline => {
        set({ isOnline })
      },

      setDeviceType: ({ isMobile, isTablet, isDesktop }) => {
        set({ isMobile, isTablet, isDesktop })
      },

      setGlobalLoading: (loading, message = null) => {
        set({
          globalLoading: loading,
          loadingMessage: loading ? message : null,
        })
      },

      addNotification: notification => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          duration: notification.duration ?? 5000,
        }

        set(state => ({
          notifications: [...state.notifications, newNotification],
        }))

        // Auto-remove notification after duration
        if (newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }
      },

      removeNotification: id => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      setFeatureFlag: (flag, enabled) => {
        set(state => ({
          features: {
            ...state.features,
            [flag]: enabled,
          },
        }))
      },

      initializeApp: () => {
        // Set up online/offline listeners
        window.addEventListener('online', () => {
          get().setOnlineStatus(true)
          get().addNotification({
            type: 'success',
            title: 'Connection restored',
            message: 'You are back online',
          })
        })

        window.addEventListener('offline', () => {
          get().setOnlineStatus(false)
          get().addNotification({
            type: 'warning',
            title: 'Connection lost',
            message: 'You are offline. Some features may not work.',
            duration: 0, // Don't auto-remove
          })
        })

        // Set up device type detection
        const checkDeviceType = () => {
          const width = window.innerWidth
          get().setDeviceType({
            isMobile: width < 768,
            isTablet: width >= 768 && width < 1024,
            isDesktop: width >= 1024,
          })
        }

        checkDeviceType()
        window.addEventListener('resize', checkDeviceType)

        // Initialize feature flags from environment or API
        // This is where you'd fetch feature flags from a service
      },
    }),
    {
      name: 'AppStore',
    }
  )
)
