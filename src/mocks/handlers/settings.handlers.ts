import { HttpResponse, http } from 'msw'

import { config } from '@/shared/lib/environment'

// Mock settings data that matches the Settings interface from use-settings-data.ts
const mockSettings = {
  // Appearance
  theme: 'system' as const,
  fontSize: 100,
  reducedMotion: false,
  highContrast: false,

  // Language & Region
  language: 'en',
  region: 'US',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h' as const,
  firstDayOfWeek: 'sunday' as const,

  // Notifications
  notifications: {
    updates: {
      email: true,
      push: true,
      sms: false,
    },
    security: {
      email: true,
      push: true,
      sms: true,
    },
    marketing: {
      email: false,
      push: false,
      sms: false,
    },
    reminders: {
      email: true,
      push: true,
      sms: false,
    },
  },

  // Privacy
  privacy: {
    profileVisibility: 'public' as const,
    showEmail: false,
    showPhone: false,
    allowIndexing: true,
    dataCollection: true,
  },

  // Other settings
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
}

export const settingsHandlers = [
  // Get all settings
  http.get(`${config.api.baseUrl}/settings`, async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return HttpResponse.json(mockSettings)
  }),

  // Update settings (PUT for full update)
  http.put(`${config.api.baseUrl}/settings`, async ({ request }) => {
    const body = (await request.json()) as any

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Update mock settings with new values
    Object.assign(mockSettings, body)

    return HttpResponse.json({
      ...mockSettings,
      message: 'Settings updated successfully',
    })
  }),

  // Export user data
  http.post(`${config.api.baseUrl}/settings/export-data`, async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))

    return HttpResponse.json({
      message: "Your data export has been initiated. You will receive an email when it's ready.",
    })
  }),

  // Delete account
  http.post(`${config.api.baseUrl}/settings/delete-account`, async ({ request }) => {
    const body = (await request.json()) as any

    if (!body.password) {
      return HttpResponse.json(
        { message: 'Password is required to delete account' },
        { status: 400 }
      )
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    return HttpResponse.json({
      message: 'Account deletion scheduled. You will receive a confirmation email.',
    })
  }),
]
