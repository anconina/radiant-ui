/**
 * i18n React hooks
 */
import { useEffect, useState } from 'react'

import { useTranslation as useI18NextTranslation } from 'react-i18next'

import {
  type Namespace,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  changeLanguage as changeI18nLanguage,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  getCurrentLanguage,
  getLanguageDirection,
  isRTL,
} from './config'

// Re-export useTranslation with proper typing
export function useTranslation(namespace?: Namespace) {
  return useI18NextTranslation(namespace)
}

// Hook to get current language
export function useLanguage() {
  const { i18n } = useI18NextTranslation()
  const [language, setLanguage] = useState<SupportedLanguage>(getCurrentLanguage())
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(getLanguageDirection())

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const lang = lng as SupportedLanguage
      setLanguage(lang)
      setDirection(getLanguageDirection(lang))
    }

    i18n.on('languageChanged', handleLanguageChange)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    await changeI18nLanguage(newLanguage)
  }

  return {
    language,
    direction,
    isRTL: direction === 'rtl',
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
  }
}

// Hook for locale-aware formatting
export function useLocaleFormat() {
  const { i18n } = useI18NextTranslation()
  const [locale, setLocale] = useState(i18n.language)

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLocale(lng)
    }

    i18n.on('languageChanged', handleLanguageChange)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  return {
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, options),

    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, options),

    formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) =>
      formatRelativeTime(value, unit),

    formatCurrency: (value: number, currency: string, options?: Intl.NumberFormatOptions) =>
      formatCurrency(value, currency, options),

    formatPercentage: (value: number, options?: Intl.NumberFormatOptions) =>
      formatPercentage(value, options),

    locale,
  }
}

// Hook for direction-aware styles
export function useDirectionalStyles() {
  const { direction } = useLanguage()

  const getDirectionalStyle = (ltrValue: string | number, rtlValue?: string | number) => {
    if (rtlValue === undefined) {
      return ltrValue
    }
    return direction === 'rtl' ? rtlValue : ltrValue
  }

  return {
    direction,
    isRTL: direction === 'rtl',
    start: direction === 'rtl' ? 'right' : 'left',
    end: direction === 'rtl' ? 'left' : 'right',
    marginStart: (value: string | number) => ({
      [direction === 'rtl' ? 'marginRight' : 'marginLeft']: value,
    }),
    marginEnd: (value: string | number) => ({
      [direction === 'rtl' ? 'marginLeft' : 'marginRight']: value,
    }),
    paddingStart: (value: string | number) => ({
      [direction === 'rtl' ? 'paddingRight' : 'paddingLeft']: value,
    }),
    paddingEnd: (value: string | number) => ({
      [direction === 'rtl' ? 'paddingLeft' : 'paddingRight']: value,
    }),
    textAlign: (align: 'start' | 'end') => {
      if (align === 'start') return direction === 'rtl' ? 'right' : 'left'
      if (align === 'end') return direction === 'rtl' ? 'left' : 'right'
      return align
    },
    transform: (transform: string) => {
      if (direction === 'rtl' && transform.includes('translateX')) {
        return transform.replace(/translateX\(([-\d.]+)/, (match, value) => {
          return `translateX(${-parseFloat(value)}`
        })
      }
      return transform
    },
    getDirectionalStyle,
  }
}

// Hook for translated routes
export function useTranslatedRoutes() {
  const { t, i18n } = useI18NextTranslation('common')
  const language = i18n.language as SupportedLanguage

  const getLocalizedPath = (path: string) => {
    // Don't localize the default language
    if (language === 'en') {
      return path
    }

    // Add language prefix
    return `/${language}${path}`
  }

  const removeLanguagePrefix = (path: string) => {
    // Remove language prefix if present
    const prefix = `/${language}`
    if (path.startsWith(prefix)) {
      return path.slice(prefix.length) || '/'
    }
    return path
  }

  return {
    getLocalizedPath,
    removeLanguagePrefix,
    language,
  }
}

// Hook for language switcher
export function useLanguageSwitcher() {
  const { language, changeLanguage, languages } = useLanguage()
  const [isChanging, setIsChanging] = useState(false)

  const switchLanguage = async (newLanguage: SupportedLanguage) => {
    if (newLanguage === language || isChanging) {
      return
    }

    setIsChanging(true)

    try {
      await changeLanguage(newLanguage)
    } finally {
      setIsChanging(false)
    }
  }

  return {
    currentLanguage: language,
    languages,
    switchLanguage,
    isChanging,
  }
}

// Hook for translation with loading state
export function useTranslationWithLoading(namespace?: Namespace) {
  const { t, i18n, ready } = useI18NextTranslation(namespace)
  const [isLoading, setIsLoading] = useState(!ready)

  useEffect(() => {
    setIsLoading(!ready)
  }, [ready])

  return {
    t,
    i18n,
    isLoading,
    ready,
  }
}

// Hook for namespace preloading
export function usePreloadNamespaces(namespaces: Namespace[]) {
  const { i18n } = useI18NextTranslation()
  const [isPreloading, setIsPreloading] = useState(true)

  useEffect(() => {
    const preload = async () => {
      setIsPreloading(true)

      try {
        await Promise.all(namespaces.map(ns => i18n.loadNamespaces(ns)))
      } finally {
        setIsPreloading(false)
      }
    }

    preload()
  }, [i18n, namespaces])

  return { isPreloading }
}
