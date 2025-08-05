import { HttpResponse, http } from 'msw'

import { config } from '@/shared/lib/environment'

import { mockUsers } from '../data'

export const userHandlers = [
  // Get all users
  http.get(`${config.api.baseUrl}/users`, async ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const role = url.searchParams.get('role') || ''

    // Filter users
    let filteredUsers = [...mockUsers]

    if (search) {
      filteredUsers = filteredUsers.filter(
        user =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.fullName.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    // Paginate
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedUsers = filteredUsers.slice(start, end)

    return HttpResponse.json({
      data: paginatedUsers,
      meta: {
        total: filteredUsers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    })
  }),

  // Get user by ID
  http.get(`${config.api.baseUrl}/users/:id`, async ({ params }) => {
    const { id } = params
    const user = mockUsers.find(u => u.id === id)

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return HttpResponse.json(user)
  }),

  // Create user
  http.post(`${config.api.baseUrl}/users`, async ({ request }) => {
    const body = (await request.json()) as any

    // Check if user already exists
    if (mockUsers.find(u => u.email === body.email)) {
      return HttpResponse.json({ message: 'User with this email already exists' }, { status: 409 })
    }

    const newUser = {
      id: String(mockUsers.length + 1),
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      fullName: `${body.firstName} ${body.lastName}`,
      role: body.role || 'user',
      permissions: body.permissions || ['user:view'],
      emailVerified: false,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${body.email}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    return HttpResponse.json(newUser, { status: 201 })
  }),

  // Update user
  http.put(`${config.api.baseUrl}/users/:id`, async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as any
    const userIndex = mockUsers.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...body,
      fullName:
        body.firstName && body.lastName
          ? `${body.firstName} ${body.lastName}`
          : mockUsers[userIndex].fullName,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json(mockUsers[userIndex])
  }),

  // Delete user
  http.delete(`${config.api.baseUrl}/users/:id`, async ({ params }) => {
    const { id } = params
    const userIndex = mockUsers.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }

    mockUsers.splice(userIndex, 1)

    return HttpResponse.json({ message: 'User deleted successfully' })
  }),

  // Upload avatar
  http.post(`${config.api.baseUrl}/users/:id/avatar`, async ({ params, request }) => {
    const { id } = params
    const userIndex = mockUsers.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000))

    mockUsers[userIndex].avatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${Date.now()}`
    mockUsers[userIndex].updatedAt = new Date().toISOString()

    return HttpResponse.json({
      avatar: mockUsers[userIndex].avatar,
    })
  }),

  // Update profile
  http.patch(`${config.api.baseUrl}/users/profile`, async ({ request }) => {
    const body = (await request.json()) as any
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Simulate updating current user
    const currentUser = mockUsers[0]
    Object.assign(currentUser, body)
    currentUser.updatedAt = new Date().toISOString()

    return HttpResponse.json(currentUser)
  }),
]
