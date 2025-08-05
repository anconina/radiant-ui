import { HttpResponse, http } from 'msw'

import { config } from '@/shared/lib/environment'

import { mockPosts, mockUsers } from '../data'

export const postHandlers = [
  // Get all posts
  http.get(`${config.api.baseUrl}/posts`, async ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || ''
    const authorId = url.searchParams.get('authorId') || ''
    const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || []

    // Filter posts
    let filteredPosts = [...mockPosts]

    if (search) {
      filteredPosts = filteredPosts.filter(
        post =>
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.content.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status) {
      filteredPosts = filteredPosts.filter(post => post.status === status)
    }

    if (authorId) {
      filteredPosts = filteredPosts.filter(post => post.authorId === authorId)
    }

    if (tags.length > 0) {
      filteredPosts = filteredPosts.filter(post => tags.some(tag => post.tags.includes(tag)))
    }

    // Sort by date
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Paginate
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedPosts = filteredPosts.slice(start, end)

    return HttpResponse.json({
      data: paginatedPosts,
      meta: {
        total: filteredPosts.length,
        page,
        limit,
        totalPages: Math.ceil(filteredPosts.length / limit),
      },
    })
  }),

  // Get post by ID or slug
  http.get(`${config.api.baseUrl}/posts/:idOrSlug`, async ({ params }) => {
    const { idOrSlug } = params
    const post = mockPosts.find(p => p.id === idOrSlug || p.slug === idOrSlug)

    if (!post) {
      return HttpResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    // Increment view count
    post.viewCount++

    return HttpResponse.json(post)
  }),

  // Create post
  http.post(`${config.api.baseUrl}/posts`, async ({ request }) => {
    const body = (await request.json()) as any
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const newPost = {
      id: String(mockPosts.length + 1),
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
      content: body.content,
      excerpt: body.excerpt || body.content.substring(0, 150) + '...',
      authorId: '1', // Current user
      author: mockUsers[0],
      tags: body.tags || [],
      status: body.status || 'draft',
      publishedAt: body.status === 'published' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      likeCount: 0,
    }

    mockPosts.push(newPost)

    return HttpResponse.json(newPost, { status: 201 })
  }),

  // Update post
  http.put(`${config.api.baseUrl}/posts/:id`, async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as any
    const postIndex = mockPosts.findIndex(p => p.id === id)

    if (postIndex === -1) {
      return HttpResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    const updatedPost = {
      ...mockPosts[postIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    if (body.status === 'published' && mockPosts[postIndex].status !== 'published') {
      updatedPost.publishedAt = new Date().toISOString()
    }

    mockPosts[postIndex] = updatedPost

    return HttpResponse.json(updatedPost)
  }),

  // Delete post
  http.delete(`${config.api.baseUrl}/posts/:id`, async ({ params }) => {
    const { id } = params
    const postIndex = mockPosts.findIndex(p => p.id === id)

    if (postIndex === -1) {
      return HttpResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    mockPosts.splice(postIndex, 1)

    return HttpResponse.json({ message: 'Post deleted successfully' })
  }),

  // Like post
  http.post(`${config.api.baseUrl}/posts/:id/like`, async ({ params }) => {
    const { id } = params
    const post = mockPosts.find(p => p.id === id)

    if (!post) {
      return HttpResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    post.likeCount++

    return HttpResponse.json({ likeCount: post.likeCount })
  }),

  // Unlike post
  http.delete(`${config.api.baseUrl}/posts/:id/like`, async ({ params }) => {
    const { id } = params
    const post = mockPosts.find(p => p.id === id)

    if (!post) {
      return HttpResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    post.likeCount = Math.max(0, post.likeCount - 1)

    return HttpResponse.json({ likeCount: post.likeCount })
  }),
]
