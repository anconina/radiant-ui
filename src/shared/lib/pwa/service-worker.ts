/**
 * Service Worker registration and management
 */
import { env } from '../environment/env'
import { logger } from '../monitoring/logger'

// Service worker configuration
interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onError?: (error: Error) => void
  onOffline?: () => void
  onOnline?: () => void
}

// Check if service workers are supported
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator && env.enablePWA
}

// Register service worker
export async function registerServiceWorker(config?: ServiceWorkerConfig): Promise<void> {
  if (!isServiceWorkerSupported()) {
    logger.info('Service Worker not supported or disabled')
    return
  }

  try {
    // Wait for load to not impact performance
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        logger.info('Service Worker registered', {
          scope: registration.scope,
        })

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                if (config?.onUpdate && navigator.serviceWorker.controller) {
                  // Existing service worker updated
                  config.onUpdate(registration)
                } else if (config?.onSuccess) {
                  // New service worker activated
                  config.onSuccess(registration)
                }
              }
            })
          }
        })

        // Check for updates periodically
        setInterval(
          () => {
            registration.update()
          },
          60 * 60 * 1000
        ) // Every hour

        // Handle offline/online events
        window.addEventListener('offline', () => {
          logger.info('App is offline')
          config?.onOffline?.()
        })

        window.addEventListener('online', () => {
          logger.info('App is online')
          config?.onOnline?.()
        })
      } catch (error) {
        logger.error('Service Worker registration failed', error as Error)
        config?.onError?.(error as Error)
      }
    })
  } catch (error) {
    logger.error('Service Worker setup failed', error as Error)
    config?.onError?.(error as Error)
  }
}

// Unregister service worker
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()

    for (const registration of registrations) {
      await registration.unregister()
    }

    logger.info('Service Worker unregistered')
    return true
  } catch (error) {
    logger.error('Service Worker unregistration failed', error as Error)
    return false
  }
}

// Skip waiting and activate new service worker
export async function skipWaiting(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return
  }

  const registration = await navigator.serviceWorker.ready

  if (registration.waiting) {
    // Tell the service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Reload the page once the new service worker is active
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  }
}

// Cache specific URLs
export async function cacheUrls(urls: string[]): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return
  }

  const registration = await navigator.serviceWorker.ready

  if (registration.active) {
    registration.active.postMessage({
      type: 'CACHE_URLS',
      urls,
    })
  }
}

// Clear all caches
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys()

    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))

    logger.info('All caches cleared')
  }
}

// Get cache storage estimate
export async function getCacheStorageEstimate(): Promise<{
  usage: number
  quota: number
  percentage: number
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()

      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
      }
    } catch (error) {
      logger.error('Failed to get storage estimate', error as Error)
      return null
    }
  }

  return null
}

// Request persistent storage
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const granted = await navigator.storage.persist()

      if (granted) {
        logger.info('Persistent storage granted')
      } else {
        logger.warn('Persistent storage denied')
      }

      return granted
    } catch (error) {
      logger.error('Failed to request persistent storage', error as Error)
      return false
    }
  }

  return false
}

// Check if app is running as installed PWA
export function isRunningAsPWA(): boolean {
  // Check display mode
  const displayMode =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches

  // Check if launched from home screen (iOS)
  const isStandalone = 'standalone' in window.navigator && (window.navigator as any).standalone

  // Check referrer (Android)
  const referrer = document.referrer.includes('android-app://')

  return displayMode || isStandalone || referrer
}

// Get PWA install prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Listen for install prompt
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent
  logger.info('PWA install prompt ready')
})

// Show install prompt
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    logger.warn('No install prompt available')
    return false
  }

  try {
    // Show the prompt
    await deferredPrompt.prompt()

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice

    logger.info('PWA install prompt result', { outcome })

    // Clear the prompt
    deferredPrompt = null

    return outcome === 'accepted'
  } catch (error) {
    logger.error('Failed to show install prompt', error as Error)
    return false
  }
}

// Check if install prompt is available
export function isInstallPromptAvailable(): boolean {
  return deferredPrompt !== null
}

// Track PWA install
window.addEventListener('appinstalled', () => {
  logger.info('PWA installed')
  deferredPrompt = null
})
