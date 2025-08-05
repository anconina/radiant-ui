import { useEffect } from 'react'

import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction'

import { useDirectionalStyles, useLanguage } from '@/shared/lib/i18n'

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { direction } = useDirectionalStyles()
  const { language } = useLanguage()

  useEffect(() => {
    // Set dir attribute on html element for global CSS rules
    document.documentElement.dir = direction

    // Also set lang attribute for proper browser behavior
    document.documentElement.lang = language
  }, [direction, language])

  return <RadixDirectionProvider dir={direction}>{children}</RadixDirectionProvider>
}
