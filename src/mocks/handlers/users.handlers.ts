import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'

import type { DataTableData, User } from '@/features/data-table/hooks/use-data-table-data'

// Generate mock users
function generateUsers(count: number = 100): User[] {
  const roles = ['Admin', 'Manager', 'Developer', 'Designer', 'Support', 'Sales']
  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support', 'HR']
  // Status types are defined inline in weightedArrayElement below

  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    avatar: faker.image.avatar(),
    role: faker.helpers.arrayElement(roles),
    department: faker.helpers.arrayElement(departments),
    status: faker.helpers.weightedArrayElement([
      { value: 'active', weight: 7 },
      { value: 'inactive', weight: 2 },
      { value: 'pending', weight: 1 },
    ]) as 'active' | 'inactive' | 'pending',
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    lastActive: faker.date.recent({ days: 30 }).toISOString(),
  }))
}

// Store users in memory for consistency
let mockUsers = generateUsers(100)

// Simple mock users for UserManagementPage
const simpleUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin' as const,
    status: 'active' as const,
    joinedDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user' as const,
    status: 'active' as const,
    joinedDate: '2024-02-20',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'moderator' as const,
    status: 'inactive' as const,
    joinedDate: '2024-03-10',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'user' as const,
    status: 'pending' as const,
    joinedDate: '2024-03-15',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'user' as const,
    status: 'active' as const,
    joinedDate: '2024-03-20',
  },
]

export const usersHandlers = [
  // Get all users
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const includeDataTable = url.searchParams.get('dataTable') === 'true'
    
    // Simple response for UserManagementPage
    if (!includeDataTable) {
      return HttpResponse.json({
        users: simpleUsers,
        total: simpleUsers.length,
        page: 1,
        pageSize: 10
      })
    }
    
    // Complex response for data table
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status')
    const role = url.searchParams.get('role')
    const sortBy = url.searchParams.get('sortBy')
    const sortOrder = url.searchParams.get('sortOrder') as 'asc' | 'desc' | null

    let filtered = [...mockUsers]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower) ||
          user.department.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      filtered = filtered.filter(user => user.status === status)
    }

    if (role) {
      filtered = filtered.filter(user => user.role === role)
    }

    // Apply sorting
    if (sortBy && sortOrder) {
      filtered.sort((a, b) => {
        const aValue = a[sortBy as keyof User]
        const bValue = b[sortBy as keyof User]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return 0
      })
    }

    // Apply pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedUsers = filtered.slice(start, end)

    const response: DataTableData = {
      users: paginatedUsers,
      total: filtered.length,
      page,
      pageSize,
    }

    return HttpResponse.json(response)
  }),

  // Get single user
  http.get('/api/users/:id', ({ params }) => {
    const user = mockUsers.find(u => u.id === params.id)

    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(user)
  }),

  // Create user
  http.post('/api/users', async ({ request }) => {
    const data = (await request.json()) as Partial<User>

    const newUser: User = {
      id: faker.string.uuid(),
      name: data.name || faker.person.fullName(),
      email: data.email || faker.internet.email().toLowerCase(),
      avatar: data.avatar || faker.image.avatar(),
      role: data.role || 'Developer',
      department: data.department || 'Engineering',
      status: data.status || 'pending',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }

    mockUsers.unshift(newUser)
    return HttpResponse.json(newUser, { status: 201 })
  }),

  // Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    const updates = (await request.json()) as Partial<User>
    const userIndex = mockUsers.findIndex(u => u.id === params.id)

    if (userIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      lastActive: new Date().toISOString(),
    }

    return HttpResponse.json(mockUsers[userIndex])
  }),

  // Delete user
  http.delete('/api/users/:id', ({ params }) => {
    const userIndex = mockUsers.findIndex(u => u.id === params.id)

    if (userIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    mockUsers.splice(userIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Bulk delete users
  http.post('/api/users/bulk-delete', async ({ request }) => {
    const { ids } = (await request.json()) as { ids: string[] }

    mockUsers = mockUsers.filter(user => !ids.includes(user.id))

    return HttpResponse.json({
      deleted: ids.length,
      message: `Successfully deleted ${ids.length} users`,
    })
  }),

  // Bulk update users
  http.post('/api/users/bulk-update', async ({ request }) => {
    const { ids, updates } = (await request.json()) as { ids: string[]; updates: Partial<User> }

    let updated = 0
    mockUsers = mockUsers.map(user => {
      if (ids.includes(user.id)) {
        updated++
        return {
          ...user,
          ...updates,
          lastActive: new Date().toISOString(),
        }
      }
      return user
    })

    return HttpResponse.json({
      updated,
      message: `Successfully updated ${updated} users`,
    })
  }),
]
