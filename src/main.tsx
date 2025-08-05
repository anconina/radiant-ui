import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import { Providers } from '@/app/providers'

import { config } from '@/shared/lib/environment'
import { useAppStore } from '@/shared/stores'

import App from './App.tsx'
import './index.css'

// Start MSW in development
async function enableMocking() {
  if (!config.features.msw || import.meta.env.PROD) {
    return
  }

  const { worker } = await import('./mocks/browser')

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

async function initializeApp() {
  // Initialize app store
  useAppStore.getState().initializeApp()

  // Wait for MSW to be ready before initializing auth
  await enableMocking()

  // Initialize auth system (sets up token provider)
  const { initializeAuth } = await import('@/features/auth/lib/init-auth')
  initializeAuth()

  // Now initialize auth after MSW is ready
  if (config.features.msw && !import.meta.env.PROD) {
    const { useAuthStore } = await import('@/features/auth')
    useAuthStore.getState().checkAuth()
  }
}

initializeApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>
  )
})
