/**
 * PWA install prompt component
 */
import { useEffect, useState } from 'react'

import { X } from 'lucide-react'

import { analytics } from '../monitoring/analytics'
import { isInstallPromptAvailable, isRunningAsPWA, showInstallPrompt } from './service-worker'

interface InstallPromptProps {
  onInstall?: () => void
  onDismiss?: () => void
  onClose?: () => void
}

export function InstallPrompt({ onInstall, onDismiss, onClose }: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Check if already running as PWA
    if (isRunningAsPWA()) {
      return
    }

    // Check if install prompt is available
    const checkPrompt = () => {
      if (isInstallPromptAvailable()) {
        setIsVisible(true)
        analytics.trackEvent('pwa_install_prompt_shown')
      }
    }

    // Check immediately and after a delay
    checkPrompt()
    const timer = setTimeout(checkPrompt, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleInstall = async () => {
    analytics.trackEvent('pwa_install_prompt_accepted')

    const installed = await showInstallPrompt()

    if (installed) {
      analytics.trackEvent('pwa_installed')
      onInstall?.()
    } else {
      analytics.trackEvent('pwa_install_cancelled')
    }

    setIsVisible(false)
  }

  const handleDismiss = () => {
    analytics.trackEvent('pwa_install_prompt_dismissed')
    localStorage.setItem('pwa-install-dismissed', 'true')
    setIsDismissed(true)
    setIsVisible(false)
    onDismiss?.()
  }

  const handleClose = () => {
    analytics.trackEvent('pwa_install_prompt_closed')
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-4 start-4 end-4 md:start-auto md:end-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Install Radiant UI
            </h3>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Install our app for a better experience with offline access and push notifications.
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Install
              </button>

              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook to manage install prompt
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setIsInstalled(isRunningAsPWA())

    const checkInstallable = () => {
      setCanInstall(isInstallPromptAvailable())
    }

    checkInstallable()

    // Listen for changes
    const interval = setInterval(checkInstallable, 1000)

    return () => clearInterval(interval)
  }, [])

  const install = async () => {
    if (!canInstall) return false

    const result = await showInstallPrompt()
    if (result) {
      setIsInstalled(true)
      setCanInstall(false)
    }

    return result
  }

  return {
    canInstall,
    isInstalled,
    install,
  }
}

// PWA update prompt component
interface UpdatePromptProps {
  onUpdate?: () => void
  onDismiss?: () => void
}

export function UpdatePrompt({ onUpdate, onDismiss }: UpdatePromptProps) {
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    // Listen for service worker updates
    const handleUpdate = () => {
      setHasUpdate(true)
      analytics.trackEvent('pwa_update_available')
    }

    // Check if service worker is waiting
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          handleUpdate()
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleUpdate()
            }
          })
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    analytics.trackEvent('pwa_update_accepted')
    onUpdate?.()

    // Skip waiting and reload
    import('./service-worker').then(({ skipWaiting }) => {
      skipWaiting()
    })
  }

  const handleDismiss = () => {
    analytics.trackEvent('pwa_update_dismissed')
    setHasUpdate(false)
    onDismiss?.()
  }

  if (!hasUpdate) {
    return null
  }

  return (
    <div className="fixed top-4 start-4 end-4 md:start-auto md:end-4 md:w-96 z-50 animate-slide-down">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Update Available</h3>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              A new version of Radiant UI is available. Update now for the latest features and
              improvements.
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Update Now
              </button>

              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
