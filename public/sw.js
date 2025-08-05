/**
 * Service Worker for Radiant UI PWA
 */

const CACHE_NAME = 'radiant-ui-v1'
const urlsToCache = ['/', '/index.html', '/manifest.json']

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets')
      return cache.addAll(urlsToCache)
    })
  )

  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )

  // Take control of all pages
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response for caching
          const responseToCache = response.clone()

          // Cache successful API responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          // Try to get from cache
          return caches.match(event.request)
        })
    )
    return
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached version if available
      if (cachedResponse) {
        // Update cache in background
        fetch(event.request).then(response => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response)
            })
          }
        })

        return cachedResponse
      }

      // Fetch from network
      return fetch(event.request).then(response => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Clone response for caching
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification('Radiant UI', options))
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(clients.openWindow('/'))
  }
})

// Handle background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

// Sync data function
async function syncData() {
  try {
    const cache = await caches.open(CACHE_NAME)
    const requests = await cache.keys()

    // Filter for pending sync requests
    const syncRequests = requests.filter(
      request => request.url.includes('/api/') && request.method === 'POST'
    )

    // Process each sync request
    for (const request of syncRequests) {
      try {
        const response = await fetch(request)
        if (response.ok) {
          // Remove from cache if successful
          await cache.delete(request)
        }
      } catch {
        console.error('[SW] Sync failed for:', request.url)
      }
    }
  } catch (_error) {
    console.error('[SW] Sync error:', _error)
  }
}

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(event.data.urls)
    })
  }
})
