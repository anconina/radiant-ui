import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/lib/http-client'
// import { toast } from '@/shared/lib/toast' // Reserved for future notifications

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  company?: string
  position?: string
  department?: string
  language?: string
  timezone?: string
  role: string
  status: 'active' | 'inactive'
  createdAt: string
  lastActive: string
}

interface ProfileUpdateData {
  name?: string
  email?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  company?: string
  position?: string
  department?: string
  language?: string
  timezone?: string
}

async function fetchProfile(): Promise<UserProfile> {
  const response = await api.get<UserProfile>('/profile')
  return response
}

async function updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
  const response = await api.put<UserProfile>('/profile', data)
  return response
}

async function uploadAvatar(file: File): Promise<{ avatar: string }> {
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await api.post<{ avatar: string }>('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response
}

export function useProfileData() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: updatedProfile => {
      queryClient.setQueryData(['profile'], updatedProfile)
    },
    onError: () => {
      // Error will be handled by the component
    },
  })

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: response => {
      // Update the profile data with new avatar
      queryClient.setQueryData(['profile'], (old: UserProfile | undefined) => {
        if (!old) return old
        return { ...old, avatar: response.avatar }
      })
    },
    onError: () => {
      // Error will be handled by the component
    },
  })

  return {
    data,
    loading: isLoading,
    error,
    updateProfile: updateMutation.mutate,
    updating: updateMutation.isPending,
    uploadAvatar: avatarMutation.mutate,
    uploading: avatarMutation.isPending,
  }
}
