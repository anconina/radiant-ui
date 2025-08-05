import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { config } from '@/shared/lib/environment'

interface NotificationPreferences {
  email: {
    marketing: boolean
    updates: boolean
    security: boolean
    newsletter: boolean
  }
  push: {
    enabled: boolean
    sound: boolean
    vibrate: boolean
  }
  sms: {
    enabled: boolean
    marketing: boolean
    security: boolean
  }
}

interface PreferencesState {
  // UI Preferences
  sidebarCollapsed: boolean
  sidebarPosition: 'left' | 'right'
  compactMode: boolean

  // Localization
  language: string
  timezone: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'

  // Notifications
  notifications: NotificationPreferences

  // Accessibility
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'

  // Actions
  toggleSidebar: () => void
  setSidebarPosition: (position: 'left' | 'right') => void
  setCompactMode: (enabled: boolean) => void
  setLanguage: (language: string) => void
  setTimezone: (timezone: string) => void
  setDateFormat: (format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => void
  setTimeFormat: (format: '12h' | '24h') => void
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void
  setReducedMotion: (enabled: boolean) => void
  setHighContrast: (enabled: boolean) => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  resetToDefaults: () => void
}

const defaultPreferences: Omit<
  PreferencesState,
  | 'toggleSidebar'
  | 'setSidebarPosition'
  | 'setCompactMode'
  | 'setLanguage'
  | 'setTimezone'
  | 'setDateFormat'
  | 'setTimeFormat'
  | 'updateNotificationPreferences'
  | 'setReducedMotion'
  | 'setHighContrast'
  | 'setFontSize'
  | 'resetToDefaults'
> = {
  sidebarCollapsed: false,
  sidebarPosition: 'left',
  compactMode: false,
  language: config.i18n.defaultLocale,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  notifications: {
    email: {
      marketing: true,
      updates: true,
      security: true,
      newsletter: false,
    },
    push: {
      enabled: false,
      sound: true,
      vibrate: true,
    },
    sms: {
      enabled: false,
      marketing: false,
      security: true,
    },
  },
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
}

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      set => ({
        ...defaultPreferences,

        toggleSidebar: () => {
          set(state => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          }))
        },

        setSidebarPosition: position => {
          set({ sidebarPosition: position })
        },

        setCompactMode: enabled => {
          set({ compactMode: enabled })
        },

        setLanguage: language => {
          set({ language })
          // In a real app, you'd also update i18n here
        },

        setTimezone: timezone => {
          set({ timezone })
        },

        setDateFormat: format => {
          set({ dateFormat: format })
        },

        setTimeFormat: format => {
          set({ timeFormat: format })
        },

        updateNotificationPreferences: preferences => {
          set(state => ({
            notifications: {
              email: { ...state.notifications.email, ...preferences.email },
              push: { ...state.notifications.push, ...preferences.push },
              sms: { ...state.notifications.sms, ...preferences.sms },
            },
          }))
        },

        setReducedMotion: enabled => {
          set({ reducedMotion: enabled })
          // Apply CSS class to document
          if (enabled) {
            document.documentElement.classList.add('reduce-motion')
          } else {
            document.documentElement.classList.remove('reduce-motion')
          }
        },

        setHighContrast: enabled => {
          set({ highContrast: enabled })
          // Apply CSS class to document
          if (enabled) {
            document.documentElement.classList.add('high-contrast')
          } else {
            document.documentElement.classList.remove('high-contrast')
          }
        },

        setFontSize: size => {
          set({ fontSize: size })
          // Apply CSS class to document
          document.documentElement.classList.remove('font-small', 'font-medium', 'font-large')
          document.documentElement.classList.add(`font-${size}`)
        },

        resetToDefaults: () => {
          set(defaultPreferences)
        },
      }),
      {
        name: 'preferences-storage',
        partialize: state => ({
          sidebarCollapsed: state.sidebarCollapsed,
          sidebarPosition: state.sidebarPosition,
          compactMode: state.compactMode,
          language: state.language,
          timezone: state.timezone,
          dateFormat: state.dateFormat,
          timeFormat: state.timeFormat,
          notifications: state.notifications,
          reducedMotion: state.reducedMotion,
          highContrast: state.highContrast,
          fontSize: state.fontSize,
        }),
      }
    ),
    {
      name: 'PreferencesStore',
    }
  )
)
