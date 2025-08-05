import { ReactNode, useEffect, useState } from 'react'

import { I18nextProvider } from 'react-i18next'

import { i18n } from './i18n-test-setup'

interface TestI18nProviderProps {
  children: ReactNode
}

export function TestI18nProvider({ children }: TestI18nProviderProps) {
  const [isReady, setIsReady] = useState(i18n.isInitialized)

  useEffect(() => {
    if (!i18n.isInitialized) {
      // Force initialization if not already done
      i18n.init().then(() => {
        setIsReady(true)
      })
    }
  }, [])

  if (!isReady) {
    return null // Or a loading spinner if needed
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
