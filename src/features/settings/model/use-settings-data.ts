import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/lib/http-client'

export interface Settings {
  // Appearance
  theme: 'light' | 'dark' | 'system'
  fontSize: number
  reducedMotion: boolean
  highContrast: boolean

  // Language & Region
  language: string
  region: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  firstDayOfWeek: 'sunday' | 'monday' | 'saturday'

  // Notifications
  notifications: {
    [key: string]: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }

  // Privacy
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    showEmail: boolean
    showPhone: boolean
    allowIndexing: boolean
    dataCollection: boolean
  }

  // Other settings
  quietHours?: {
    enabled: boolean
    startTime: string
    endTime: string
  }
}

async function fetchSettings(): Promise<Settings> {
  const response = await api.get<Settings>('/settings')
  return response
}

async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const response = await api.put<Settings>('/settings', settings)
  return response
}

export function useSettingsData() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: updatedSettings => {
      queryClient.setQueryData(['settings'], updatedSettings)
    },
  })

  return {
    settings: data,
    loading: isLoading,
    error,
    updateSettings: mutation.mutate,
    updating: mutation.isPending,
  }
}
