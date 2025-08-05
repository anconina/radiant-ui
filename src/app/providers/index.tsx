import type { ReactNode } from 'react'

import { DirectionProvider, ThemeProvider } from '@/shared/providers'
import { Toaster } from '@/shared/ui/toaster'

import { I18nProvider } from './i18n-provider'
import { QueryProvider } from './query-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <DirectionProvider>
        <ThemeProvider defaultTheme="system">
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </DirectionProvider>
    </I18nProvider>
  )
}
