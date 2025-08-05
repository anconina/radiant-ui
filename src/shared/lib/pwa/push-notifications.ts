/**
 * Push notification management
 */
import { logger } from '../monitoring/logger'

// Push notification options
export interface PushNotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

// Get notification permission status
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied'
  }

  return Notification.permission
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    logger.warn('Push notifications not supported')
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    logger.info('Notification permission', { permission })
    return permission
  } catch (error) {
    logger.error('Failed to request notification permission', error as Error)
    return 'denied'
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(
  applicationServerKey: string
): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null
  }

  // Check permission
  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    logger.warn('Notification permission denied')
    return null
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
    })

    logger.info('Push subscription created', {
      endpoint: subscription.endpoint,
    })

    return subscription
  } catch (error) {
    logger.error('Failed to subscribe to push notifications', error as Error)
    return null
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      const success = await subscription.unsubscribe()

      if (success) {
        logger.info('Push subscription cancelled')
      } else {
        logger.warn('Failed to cancel push subscription')
      }

      return success
    }

    return true
  } catch (error) {
    logger.error('Failed to unsubscribe from push notifications', error as Error)
    return false
  }
}

// Get current push subscription
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription
  } catch (error) {
    logger.error('Failed to get push subscription', error as Error)
    return null
  }
}

// Show local notification
export async function showNotification(options: PushNotificationOptions): Promise<void> {
  if (!isPushNotificationSupported()) {
    logger.warn('Notifications not supported')
    return
  }

  // Check permission
  if (getNotificationPermission() !== 'granted') {
    logger.warn('Notification permission not granted')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready

    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      image: options.image,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      silent: options.silent,
      vibrate: options.vibrate,
      data: options.data,
      actions: options.actions,
    })

    logger.info('Notification shown', { title: options.title })
  } catch (error) {
    logger.error('Failed to show notification', error as Error)
  }
}

// Send push notification to server
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: any,
  serverEndpoint: string
): Promise<boolean> {
  try {
    const response = await fetch(serverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        payload,
      }),
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }

    logger.info('Push notification sent')
    return true
  } catch (error) {
    logger.error('Failed to send push notification', error as Error)
    return false
  }
}

// Convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

// Notification manager class
export class NotificationManager {
  private applicationServerKey: string
  private serverEndpoint: string

  constructor(applicationServerKey: string, serverEndpoint: string) {
    this.applicationServerKey = applicationServerKey
    this.serverEndpoint = serverEndpoint
  }

  // Initialize notifications
  async initialize(): Promise<boolean> {
    if (!isPushNotificationSupported()) {
      return false
    }

    const permission = await requestNotificationPermission()
    return permission === 'granted'
  }

  // Subscribe user
  async subscribe(): Promise<PushSubscription | null> {
    const subscription = await subscribeToPushNotifications(this.applicationServerKey)

    if (subscription) {
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
    }

    return subscription
  }

  // Unsubscribe user
  async unsubscribe(): Promise<boolean> {
    const subscription = await getCurrentPushSubscription()

    if (subscription) {
      // Remove subscription from server
      await this.removeSubscriptionFromServer(subscription)
    }

    return await unsubscribeFromPushNotifications()
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch(`${this.serverEndpoint}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      logger.info('Subscription sent to server')
    } catch (error) {
      logger.error('Failed to send subscription to server', error as Error)
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch(`${this.serverEndpoint}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      })

      logger.info('Subscription removed from server')
    } catch (error) {
      logger.error('Failed to remove subscription from server', error as Error)
    }
  }

  // Send notification
  async sendNotification(
    options: PushNotificationOptions,
    subscription?: PushSubscription
  ): Promise<boolean> {
    // If subscription provided, send via server
    if (subscription) {
      return await sendPushNotification(subscription, options, `${this.serverEndpoint}/send`)
    }

    // Otherwise show local notification
    await showNotification(options)
    return true
  }
}
