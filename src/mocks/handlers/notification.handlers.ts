import { HttpResponse, http } from 'msw'

import { config } from '@/shared/lib/environment'

import { mockNotifications } from '../data'

export const notificationHandlers = [
  // Get notifications
  http.get(`${config.api.baseUrl}/notifications`, async ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'

    // Filter notifications
    let filteredNotifications = [...mockNotifications]

    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.read)
    }

    // Sort by date (newest first)
    filteredNotifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Paginate
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedNotifications = filteredNotifications.slice(start, end)

    return HttpResponse.json({
      data: paginatedNotifications,
      meta: {
        total: filteredNotifications.length,
        page,
        limit,
        totalPages: Math.ceil(filteredNotifications.length / limit),
        unreadCount: mockNotifications.filter(n => !n.read).length,
      },
    })
  }),

  // Mark notification as read
  http.patch(`${config.api.baseUrl}/notifications/:id/read`, async ({ params }) => {
    const { id } = params
    const notification = mockNotifications.find(n => n.id === id)

    if (!notification) {
      return HttpResponse.json({ message: 'Notification not found' }, { status: 404 })
    }

    notification.read = true

    return HttpResponse.json(notification)
  }),

  // Mark all notifications as read
  http.post(`${config.api.baseUrl}/notifications/read-all`, async () => {
    mockNotifications.forEach(n => {
      n.read = true
    })

    return HttpResponse.json({
      message: 'All notifications marked as read',
    })
  }),

  // Delete notification
  http.delete(`${config.api.baseUrl}/notifications/:id`, async ({ params }) => {
    const { id } = params
    const index = mockNotifications.findIndex(n => n.id === id)

    if (index === -1) {
      return HttpResponse.json({ message: 'Notification not found' }, { status: 404 })
    }

    mockNotifications.splice(index, 1)

    return HttpResponse.json({
      message: 'Notification deleted successfully',
    })
  }),

  // Get notification settings
  http.get(`${config.api.baseUrl}/notifications/settings`, async () => {
    return HttpResponse.json({
      email: true,
      push: false,
      sms: false,
      marketing: true,
      security: true,
      updates: true,
    })
  }),

  // Update notification settings
  http.patch(`${config.api.baseUrl}/notifications/settings`, async ({ request }) => {
    const body = (await request.json()) as any

    // In a real app, we would save these settings
    await new Promise(resolve => setTimeout(resolve, 500))

    return HttpResponse.json({
      ...body,
      message: 'Notification settings updated',
    })
  }),
]
