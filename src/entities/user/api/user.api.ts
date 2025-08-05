// User entity API methods
import { apiClient } from '@/shared/lib/http-client'

import type { ChangePasswordRequest, UpdateProfileRequest, User, UserProfile } from '../model'

export const userApi = {
  // Get current user
  getCurrentUser: () => apiClient.get<User>('/users/me'),

  // Get user by ID
  getUserById: (id: string) => apiClient.get<User>(`/users/${id}`),

  // Get user profile
  getUserProfile: (id: string) => apiClient.get<UserProfile>(`/users/${id}/profile`),

  // Update user profile
  updateProfile: (id: string, data: UpdateProfileRequest) =>
    apiClient.patch<UserProfile>(`/users/${id}/profile`, data),

  // Change password
  changePassword: (data: ChangePasswordRequest) => apiClient.post('/users/change-password', data),

  // Upload avatar
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return apiClient.post<{ avatarUrl: string }>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Delete avatar
  deleteAvatar: () => apiClient.delete('/users/avatar'),

  // Get all users (admin only)
  getAllUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<{ users: User[]; total: number }>('/users', { params }),

  // Update user role (admin only)
  updateUserRole: (id: string, role: string) =>
    apiClient.patch<User>(`/users/${id}/role`, { role }),

  // Deactivate user (admin only)
  deactivateUser: (id: string) => apiClient.post(`/users/${id}/deactivate`),

  // Reactivate user (admin only)
  reactivateUser: (id: string) => apiClient.post(`/users/${id}/reactivate`),
}
