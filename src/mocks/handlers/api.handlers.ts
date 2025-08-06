import { HttpResponse, http } from 'msw'

const baseURL = 'https://api.example.com'

export const apiHandlers = [
  // GET /users/:id
  http.get(`${baseURL}/users/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      name: 'Test User',
      email: 'test@example.com',
    })
  }),

  // POST /users
  http.post(`${baseURL}/users`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: 2,
      ...body,
    })
  }),

  // PUT /users/:id
  http.put(`${baseURL}/users/:id`, async ({ request, params }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
    })
  }),

  // PATCH /users/:id
  http.patch(`${baseURL}/users/:id`, async ({ request, params }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: Number(params.id),
      email: body.email || 'updated@example.com',
    })
  }),

  // DELETE /users/:id
  http.delete(`${baseURL}/users/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /users with query params
  http.get(`${baseURL}/users`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page')
    const limit = url.searchParams.get('limit')
    
    return HttpResponse.json({
      data: [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ],
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      total: 100,
    })
  }),

  // 404 Not Found
  http.get(`${baseURL}/not-found`, () => {
    return HttpResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    )
  }),

  // 500 Server Error
  http.get(`${baseURL}/server-error`, () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }),

  // Network error simulation
  http.get(`${baseURL}/network-error`, () => {
    return HttpResponse.error()
  }),

  // Timeout simulation
  http.get(`${baseURL}/timeout`, async () => {
    await new Promise(resolve => setTimeout(resolve, 10000))
    return HttpResponse.json({ data: 'This should timeout' })
  }),

  // Slow endpoint for timeout testing
  http.get(`${baseURL}/slow`, async () => {
    await new Promise(resolve => setTimeout(resolve, 5000))
    return HttpResponse.json({ data: 'too late' })
  }),

  // JSON response
  http.get(`${baseURL}/json`, () => {
    return HttpResponse.json({ type: 'json', data: 'test' })
  }),

  // Text response
  http.get(`${baseURL}/text`, () => {
    return new HttpResponse('This is plain text', {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }),

  // Blob response  
  http.get(`${baseURL}/blob`, () => {
    const blob = new Blob(['binary data'], { type: 'application/octet-stream' })
    return new HttpResponse(blob, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })
  }),

  // 401 Unauthorized
  http.get(`${baseURL}/protected`, () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }),

  // 403 Forbidden
  http.get(`${baseURL}/forbidden`, () => {
    return HttpResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }),

  // 422 Validation Error
  http.post(`${baseURL}/validate`, () => {
    return HttpResponse.json(
      {
        error: 'Validation failed',
        errors: {
          email: ['Email is invalid'],
          name: ['Name is required'],
        },
      },
      { status: 422 }
    )
  }),
]