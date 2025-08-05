import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { FetchClient, FetchError } from '../fetch-client'

// Create MSW server
const server = setupServer()

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())

describe('FetchClient Integration Tests', () => {
  const baseURL = 'https://api.example.com'
  let client: FetchClient

  beforeEach(() => {
    client = new FetchClient({
      baseURL,
      timeout: 5000,
    })
  })

  describe('HTTP Methods', () => {
    it('should make successful GET requests', async () => {
      const mockData = { id: 1, name: 'Test User' }

      server.use(
        http.get(`${baseURL}/users/1`, () => {
          return HttpResponse.json(mockData)
        })
      )

      const result = await client.get('/users/1')
      expect(result).toEqual(mockData)
    })

    it('should make successful POST requests', async () => {
      const postData = { name: 'New User', email: 'test@example.com' }
      const mockResponse = { id: 2, ...postData }

      server.use(
        http.post(`${baseURL}/users`, async ({ request }) => {
          const body = await request.json()
          expect(body).toEqual(postData)
          return HttpResponse.json(mockResponse)
        })
      )

      const result = await client.post('/users', postData)
      expect(result).toEqual(mockResponse)
    })

    it('should make successful PUT requests', async () => {
      const updateData = { name: 'Updated User' }
      const mockResponse = { id: 1, ...updateData }

      server.use(
        http.put(`${baseURL}/users/1`, async ({ request }) => {
          const body = await request.json()
          expect(body).toEqual(updateData)
          return HttpResponse.json(mockResponse)
        })
      )

      const result = await client.put('/users/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should make successful PATCH requests', async () => {
      const patchData = { email: 'newemail@example.com' }
      const mockResponse = { id: 1, name: 'Test User', ...patchData }

      server.use(
        http.patch(`${baseURL}/users/1`, async ({ request }) => {
          const body = await request.json()
          expect(body).toEqual(patchData)
          return HttpResponse.json(mockResponse)
        })
      )

      const result = await client.patch('/users/1', patchData)
      expect(result).toEqual(mockResponse)
    })

    it('should make successful DELETE requests', async () => {
      server.use(
        http.delete(`${baseURL}/users/1`, () => {
          return new HttpResponse(null, { status: 204 })
        })
      )

      const result = await client.delete('/users/1')
      expect(result).toBeUndefined()
    })
  })

  describe('Query Parameters', () => {
    it('should handle query parameters correctly', async () => {
      const mockData = { users: [], total: 0 }

      server.use(
        http.get(`${baseURL}/users`, ({ request }) => {
          const url = new URL(request.url)
          expect(url.searchParams.get('page')).toBe('2')
          expect(url.searchParams.get('limit')).toBe('10')
          expect(url.searchParams.get('active')).toBe('true')
          return HttpResponse.json(mockData)
        })
      )

      const result = await client.get('/users', {
        params: {
          page: 2,
          limit: 10,
          active: true,
        },
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      server.use(
        http.get(`${baseURL}/not-found`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 })
        })
      )

      await expect(client.get('/not-found')).rejects.toThrow(FetchError)

      try {
        await client.get('/not-found')
      } catch (error) {
        expect(error).toBeInstanceOf(FetchError)
        expect((error as FetchError).status).toBe(404)
        expect((error as FetchError).data).toEqual({ error: 'Not found' })
      }
    })

    it('should handle 500 errors', async () => {
      server.use(
        http.get(`${baseURL}/server-error`, () => {
          return HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
        })
      )

      await expect(client.get('/server-error')).rejects.toThrow(FetchError)

      try {
        await client.get('/server-error')
      } catch (error) {
        expect(error).toBeInstanceOf(FetchError)
        expect((error as FetchError).status).toBe(500)
        expect((error as FetchError).data).toEqual({ error: 'Internal server error' })
      }
    })

    it('should handle network errors', async () => {
      server.use(
        http.get(`${baseURL}/network-error`, () => {
          return HttpResponse.error()
        })
      )

      await expect(client.get('/network-error')).rejects.toThrow(FetchError)
    })
  })

  describe('Request Interceptors', () => {
    it('should execute request interceptors', async () => {
      const mockData = { success: true }
      let interceptorCalled = false

      // Add request interceptor
      client.addRequestInterceptor(config => {
        interceptorCalled = true
        config.headers = new Headers({
          ...Object.fromEntries(config.headers?.entries() || []),
          'X-Custom-Header': 'test-value',
        })
        return config
      })

      server.use(
        http.get(`${baseURL}/test`, ({ request }) => {
          expect(request.headers.get('X-Custom-Header')).toBe('test-value')
          return HttpResponse.json(mockData)
        })
      )

      const result = await client.get('/test')
      expect(interceptorCalled).toBe(true)
      expect(result).toEqual(mockData)
    })

    it('should execute multiple request interceptors in order', async () => {
      const mockData = { success: true }
      const callOrder: number[] = []

      // Add multiple interceptors
      client.addRequestInterceptor(config => {
        callOrder.push(1)
        config.headers?.set('X-Header-1', 'value1')
        return config
      })

      client.addRequestInterceptor(config => {
        callOrder.push(2)
        config.headers?.set('X-Header-2', 'value2')
        return config
      })

      server.use(
        http.get(`${baseURL}/test`, ({ request }) => {
          expect(request.headers.get('X-Header-1')).toBe('value1')
          expect(request.headers.get('X-Header-2')).toBe('value2')
          return HttpResponse.json(mockData)
        })
      )

      await client.get('/test')
      expect(callOrder).toEqual([1, 2])
    })
  })

  describe('Response Interceptors', () => {
    it('should execute response interceptors', async () => {
      const mockData = { original: true }
      let interceptorCalled = false

      // Add response interceptor
      client.addResponseInterceptor({
        onFulfilled: response => {
          interceptorCalled = true
          return response
        },
      })

      server.use(
        http.get(`${baseURL}/test`, () => {
          return HttpResponse.json(mockData)
        })
      )

      const result = await client.get('/test')
      expect(interceptorCalled).toBe(true)
      expect(result).toEqual(mockData)
    })

    it('should execute error interceptors', async () => {
      let errorInterceptorCalled = false

      // Add error interceptor
      client.addResponseInterceptor({
        onRejected: error => {
          errorInterceptorCalled = true
          throw error
        },
      })

      server.use(
        http.get(`${baseURL}/error`, () => {
          return HttpResponse.json({ error: 'Bad request' }, { status: 400 })
        })
      )

      await expect(client.get('/error')).rejects.toThrow()
      expect(errorInterceptorCalled).toBe(true)
    })
  })

  describe('Timeout Handling', () => {
    it('should timeout long requests', async () => {
      // Create client with very short timeout
      const timeoutClient = new FetchClient({
        baseURL,
        timeout: 100,
      })

      server.use(
        http.get(`${baseURL}/slow`, async () => {
          // Delay longer than timeout
          await new Promise(resolve => setTimeout(resolve, 200))
          return HttpResponse.json({ data: 'too late' })
        })
      )

      await expect(timeoutClient.get('/slow')).rejects.toThrow('Request timeout')
    })
  })

  describe('Headers', () => {
    it('should send default headers', async () => {
      server.use(
        http.get(`${baseURL}/test`, ({ request }) => {
          expect(request.headers.get('Content-Type')).toBe('application/json')
          return HttpResponse.json({ success: true })
        })
      )

      await client.get('/test')
    })

    it('should allow custom headers', async () => {
      server.use(
        http.get(`${baseURL}/test`, ({ request }) => {
          expect(request.headers.get('Authorization')).toBe('Bearer token123')
          expect(request.headers.get('X-Custom')).toBe('value')
          return HttpResponse.json({ success: true })
        })
      )

      await client.get('/test', {
        headers: {
          Authorization: 'Bearer token123',
          'X-Custom': 'value',
        },
      })
    })
  })
})
