/**
 * i18n provider component
 */
import { ReactNode, useEffect, useState } from 'react'

import { I18nextProvider } from 'react-i18next'

import { getCurrentLanguage, getLanguageDirection, i18n, initI18n } from '@/shared/lib/i18n'

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize i18n (handles StrictMode double render internally)
    initI18n().then(() => {
      setIsInitialized(true)

      // Update document attributes after initialization
      const language = getCurrentLanguage()
      const direction = getLanguageDirection(language)

      document.documentElement.lang = language
      document.documentElement.dir = direction

      if (direction === 'rtl') {
        document.documentElement.classList.add('rtl')
      } else {
        document.documentElement.classList.remove('rtl')
      }
    })
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    // Update document direction and language
    const updateDocumentAttributes = () => {
      const language = getCurrentLanguage()
      const direction = getLanguageDirection(language)

      document.documentElement.lang = language
      document.documentElement.dir = direction

      // Add RTL class for styling
      if (direction === 'rtl') {
        document.documentElement.classList.add('rtl')
      } else {
        document.documentElement.classList.remove('rtl')
      }
    }

    // Listen for language changes
    i18n.on('languageChanged', updateDocumentAttributes)

    return () => {
      i18n.off('languageChanged', updateDocumentAttributes)
    }
  }, [isInitialized])

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
