import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'

import type { UserProfile } from '@/features/profile/hooks/use-profile-data'

import { config } from '@/shared/lib/environment'

// Store profile data in memory
let userProfile: UserProfile = {
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  avatar: faker.image.avatar(),
  phone: faker.phone.number(),
  bio: faker.lorem.paragraph(),
  location: `${faker.location.city()}, ${faker.location.state()}`,
  website: faker.internet.url(),
  company: faker.company.name(),
  position: faker.person.jobTitle(),
  department: faker.helpers.arrayElement([
    'Engineering',
    'Design',
    'Marketing',
    'Sales',
    'Support',
  ]),
  language: 'en',
  timezone: 'America/Los_Angeles',
  role: 'User',
  status: 'active',
  createdAt: faker.date.past({ years: 2 }).toISOString(),
  lastActive: faker.date.recent({ days: 1 }).toISOString(),
}

export const profileHandlers = [
  // Get user profile
  http.get(`${config.api.baseUrl}/profile`, () => {
    return HttpResponse.json(userProfile)
  }),

  // Update user profile
  http.put(`${config.api.baseUrl}/profile`, async ({ request }) => {
    const updates = (await request.json()) as Partial<UserProfile>

    // Update profile with new data
    userProfile = {
      ...userProfile,
      ...updates,
      lastActive: new Date().toISOString(),
    }

    // Simulate a slight delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return HttpResponse.json(userProfile)
  }),

  // Upload avatar
  http.post(`${config.api.baseUrl}/profile/avatar`, async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return new HttpResponse('No file provided', { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new HttpResponse('Invalid file type', { status: 400 })
    }

    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate a fake avatar URL
    const newAvatarUrl = faker.image.avatar()
    userProfile.avatar = newAvatarUrl

    return HttpResponse.json({ avatar: newAvatarUrl })
  }),

  // Change password
  http.post(`${config.api.baseUrl}/profile/change-password`, async ({ request }) => {
    const { currentPassword, newPassword, confirmPassword } = (await request.json()) as {
      currentPassword: string
      newPassword: string
      confirmPassword: string
    }

    // Simulate password validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return new HttpResponse('All fields are required', { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return new HttpResponse('Passwords do not match', { status: 400 })
    }

    if (newPassword.length < 8) {
      return new HttpResponse('Password must be at least 8 characters', { status: 400 })
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return HttpResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  }),

  // Enable two-factor authentication
  http.post(`${config.api.baseUrl}/profile/2fa/enable`, async () => {
    // Generate a fake QR code and secret
    const secret = faker.string.alphanumeric({ length: 32 }).toUpperCase()
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/RadiantUI:${userProfile.email}?secret=${secret}&issuer=RadiantUI`

    return HttpResponse.json({
      secret,
      qrCode,
      backupCodes: Array.from({ length: 8 }, () =>
        faker.string.alphanumeric({ length: 8 }).toUpperCase()
      ),
    })
  }),

  // Disable two-factor authentication
  http.post(`${config.api.baseUrl}/profile/2fa/disable`, async ({ request }) => {
    const { password } = (await request.json()) as { password: string }

    if (!password) {
      return new HttpResponse('Password is required', { status: 400 })
    }

    return HttpResponse.json({
      success: true,
      message: 'Two-factor authentication disabled',
    })
  }),

  // Get active sessions
  http.get(`${config.api.baseUrl}/profile/sessions`, () => {
    const sessions = [
      {
        id: faker.string.uuid(),
        device: 'Chrome on MacOS',
        location: 'San Francisco, CA',
        ipAddress: faker.internet.ip(),
        lastActive: faker.date.recent({ days: 0 }).toISOString(),
        current: true,
      },
      {
        id: faker.string.uuid(),
        device: 'Safari on iPhone',
        location: 'San Francisco, CA',
        ipAddress: faker.internet.ip(),
        lastActive: faker.date.recent({ days: 2 }).toISOString(),
        current: false,
      },
    ]

    return HttpResponse.json(sessions)
  }),

  // Delete session
  http.delete(`${config.api.baseUrl}/profile/sessions/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'Session terminated',
      sessionId: params.id,
    })
  }),
]
