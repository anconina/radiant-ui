/**
 * Offline functionality management
 */
import { logger } from '../monitoring/logger'

// Offline manager configuration
interface OfflineConfig {
  onOnline?: () => void
  onOffline?: () => void
  checkInterval?: number
  endpoints?: string[]
}

// Network status
export interface NetworkStatus {
  online: boolean
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  downlink?: number
  rtt?: number
  saveData?: boolean
}

// Offline queue item
interface QueueItem {
  id: string
  url: string
  method: string
  headers: Record<string, string>
  body?: any
  timestamp: number
  retries: number
}

// Offline manager class
export class OfflineManager {
  private config: OfflineConfig
  private queue: QueueItem[] = []
  private isOnline: boolean = navigator.onLine
  private checkInterval?: NodeJS.Timeout
  private listeners: Array<(online: boolean) => void> = []

  constructor(config: OfflineConfig = {}) {
    this.config = config
    this.initialize()
  }

  // Initialize offline manager
  private initialize() {
    // Load queue from storage
    this.loadQueue()

    // Set up event listeners
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    // Set up periodic connectivity check
    if (this.config.checkInterval) {
      this.checkInterval = setInterval(() => {
        this.checkConnectivity()
      }, this.config.checkInterval)
    }

    // Initial connectivity check
    this.checkConnectivity()
  }

  // Handle online event
  private handleOnline = () => {
    logger.info('Network: online')
    this.isOnline = true
    this.config.onOnline?.()
    this.notifyListeners(true)
    this.processQueue()
  }

  // Handle offline event
  private handleOffline = () => {
    logger.info('Network: offline')
    this.isOnline = false
    this.config.onOffline?.()
    this.notifyListeners(false)
  }

  // Check connectivity
  private async checkConnectivity() {
    if (this.config.endpoints && this.config.endpoints.length > 0) {
      try {
        // Try to reach one of the endpoints
        const promises = this.config.endpoints.map(endpoint =>
          fetch(endpoint, { method: 'HEAD', cache: 'no-cache' })
        )

        await Promise.race(promises)

        if (!this.isOnline) {
          this.handleOnline()
        }
      } catch (error) {
        if (this.isOnline) {
          this.handleOffline()
        }
      }
    }
  }

  // Get network status
  getNetworkStatus(): NetworkStatus {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    return {
      online: this.isOnline,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    }
  }

  // Subscribe to online/offline events
  subscribe(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Notify listeners
  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online))
  }

  // Queue request for offline processing
  async queueRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // If online, make request directly
    if (this.isOnline) {
      try {
        return await fetch(url, options)
      } catch (error) {
        // If request fails, queue it
        logger.warn('Request failed, queueing for retry', { url })
      }
    }

    // Queue the request
    const item: QueueItem = {
      id: generateId(),
      url,
      method: options.method || 'GET',
      headers: (options.headers as Record<string, string>) || {},
      body: options.body,
      timestamp: Date.now(),
      retries: 0,
    }

    this.queue.push(item)
    this.saveQueue()

    logger.info('Request queued for offline processing', { id: item.id, url })

    // Return a synthetic response
    return new Response(
      JSON.stringify({
        queued: true,
        id: item.id,
        message: 'Request queued for processing when online',
      }),
      {
        status: 202,
        statusText: 'Accepted',
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Queue-Id': item.id,
        },
      }
    )
  }

  // Process queued requests
  private async processQueue() {
    if (!this.isOnline || this.queue.length === 0) {
      return
    }

    logger.info('Processing offline queue', { count: this.queue.length })

    const processedIds: string[] = []

    for (const item of this.queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        })

        if (response.ok) {
          processedIds.push(item.id)
          logger.info('Queued request processed', { id: item.id })
        } else {
          item.retries++

          if (item.retries >= 3) {
            processedIds.push(item.id)
            logger.error('Queued request failed after retries', {
              id: item.id,
              status: response.status,
            })
          }
        }
      } catch (error) {
        item.retries++

        if (item.retries >= 3) {
          processedIds.push(item.id)
          logger.error('Queued request failed', {
            id: item.id,
            error: (error as Error).message,
          })
        }
      }
    }

    // Remove processed items
    this.queue = this.queue.filter(item => !processedIds.includes(item.id))
    this.saveQueue()
  }

  // Save queue to storage
  private saveQueue() {
    try {
      localStorage.setItem('offline-queue', JSON.stringify(this.queue))
    } catch (error) {
      logger.error('Failed to save offline queue', error as Error)
    }
  }

  // Load queue from storage
  private loadQueue() {
    try {
      const stored = localStorage.getItem('offline-queue')
      if (stored) {
        this.queue = JSON.parse(stored)
        logger.info('Loaded offline queue', { count: this.queue.length })
      }
    } catch (error) {
      logger.error('Failed to load offline queue', error as Error)
    }
  }

  // Clear queue
  clearQueue() {
    this.queue = []
    this.saveQueue()
    logger.info('Offline queue cleared')
  }

  // Get queue size
  getQueueSize(): number {
    return this.queue.length
  }

  // Get queue items
  getQueueItems(): QueueItem[] {
    return [...this.queue]
  }

  // Remove item from queue
  removeFromQueue(id: string): boolean {
    const initialLength = this.queue.length
    this.queue = this.queue.filter(item => item.id !== id)

    if (this.queue.length < initialLength) {
      this.saveQueue()
      return true
    }

    return false
  }

  // Cleanup
  destroy() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    this.listeners = []
  }
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Create singleton instance
export const offlineManager = new OfflineManager({
  checkInterval: 30000, // 30 seconds
  endpoints: ['/api/health'],
})
