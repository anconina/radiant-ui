import { HttpResponse, http } from 'msw'

import { config } from '@/shared/lib/environment'

export const miscHandlers = [
  // Health check
  http.get(`${config.api.baseUrl}/health`, async () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'healthy',
        cache: 'healthy',
        queue: 'healthy',
      },
    })
  }),

  // File upload
  http.post(`${config.api.baseUrl}/upload`, async ({ request }) => {
    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return HttpResponse.json({ message: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return HttpResponse.json({ message: 'File size exceeds 5MB limit' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return HttpResponse.json(
        { message: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      url: `https://cdn.example.com/uploads/${Date.now()}-${file.name}`,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  }),

  // Search
  http.get(`${config.api.baseUrl}/search`, async ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const type = url.searchParams.get('type') || 'all'

    if (!query) {
      return HttpResponse.json({
        results: [],
        suggestions: [],
      })
    }

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Mock search results
    const results = []

    if (type === 'all' || type === 'users') {
      results.push({
        type: 'user',
        id: '1',
        title: 'John Doe',
        description: 'john@example.com',
        url: '/users/1',
      })
    }

    if (type === 'all' || type === 'posts') {
      results.push({
        type: 'post',
        id: '1',
        title: 'Getting Started with React 19',
        description: 'React 19 brings exciting new features...',
        url: '/posts/getting-started-react-19',
      })
    }

    return HttpResponse.json({
      results,
      suggestions: ['React hooks', 'TypeScript best practices', 'Node.js tutorials'].filter(s =>
        s.toLowerCase().includes(query.toLowerCase())
      ),
    })
  }),

  // Analytics event
  http.post(`${config.api.baseUrl}/analytics/event`, async ({ request }) => {
    const body = (await request.json()) as any

    // In a real app, we would save this event
    console.log('Analytics event:', body)

    return HttpResponse.json({ success: true })
  }),

  // Contact form
  http.post(`${config.api.baseUrl}/contact`, async ({ request }) => {
    const body = (await request.json()) as any

    if (!body.email || !body.message) {
      return HttpResponse.json({ message: 'Email and message are required' }, { status: 400 })
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    return HttpResponse.json({
      message: "Thank you for your message. We'll get back to you soon!",
    })
  }),

  // Subscribe to newsletter
  http.post(`${config.api.baseUrl}/newsletter/subscribe`, async ({ request }) => {
    const body = (await request.json()) as any

    if (!body.email) {
      return HttpResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return HttpResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    return HttpResponse.json({
      message: 'Successfully subscribed to newsletter!',
    })
  }),

  // Get app config
  http.get(`${config.api.baseUrl}/config`, async () => {
    return HttpResponse.json({
      features: {
        darkMode: true,
        rtl: true,
        notifications: true,
        search: true,
        analytics: true,
      },
      limits: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxPostLength: 10000,
        maxTagsPerPost: 10,
      },
      social: {
        twitter: 'https://twitter.com/radiantui',
        github: 'https://github.com/radiantui',
        discord: 'https://discord.gg/radiantui',
      },
    })
  }),
]
