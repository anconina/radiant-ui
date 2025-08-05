/**
 * Internationalization configuration
 */
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import { logger } from '../monitoring/logger'

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
  de: { name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  ja: { name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  zh: { name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  he: { name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
} as const

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES

// Default language
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

// Namespaces
export const NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'profile',
  'settings',
  'help',
  'errors',
  'validation',
  'users',
] as const

export type Namespace = (typeof NAMESPACES)[number]

// Default namespace
export const DEFAULT_NAMESPACE: Namespace = 'common'

// Global flag to track initialization
let initPromise: Promise<typeof i18n> | null = null

// Initialize i18n
export function initI18n() {
  // Return existing promise if already initializing or initialized
  if (initPromise) {
    return initPromise
  }

  // Check if already initialized
  if (i18n.isInitialized) {
    return Promise.resolve(i18n)
  }

  // Store the initialization promise
  initPromise = i18n
    // Load translations from backend
    .use(Backend)
    // Detect user language
    .use(LanguageDetector)
    // Pass i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize
    .init({
      // Debug mode
      debug: process.env.NODE_ENV === 'development',

      // Fallback language
      fallbackLng: DEFAULT_LANGUAGE,

      // Supported languages
      supportedLngs: Object.keys(SUPPORTED_LANGUAGES),

      // Namespaces
      ns: NAMESPACES,
      defaultNS: DEFAULT_NAMESPACE,

      // Backend options
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        addPath: '/locales/add/{{lng}}/{{ns}}',
      },

      // Detection options
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18n_language',
      },

      // Interpolation options
      interpolation: {
        escapeValue: false, // React already escapes values
      },

      // React options
      react: {
        useSuspense: true,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
        transEmptyNodeValue: '',
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
      },

      // Missing key handler
      saveMissing: process.env.NODE_ENV === 'development',
      missingKeyHandler: (languages, namespace, key, fallbackValue) => {
        logger.warn('Missing translation', {
          languages,
          namespace,
          key,
          fallbackValue,
        })
      },

      // Load on init
      load: 'languageOnly',

      // Keyseparator
      keySeparator: '.',

      // Nesting
      nsSeparator: ':',

      // Plural separator
      pluralSeparator: '_',

      // Context separator
      contextSeparator: '_',
    })
    .then(() => {
      // Log initialization
      logger.info('i18n initialized', {
        language: i18n.language,
        languages: i18n.languages,
      })

      return i18n
    })

  return initPromise
}

// Change language
export async function changeLanguage(language: SupportedLanguage) {
  try {
    await i18n.changeLanguage(language)

    // Update document direction
    document.documentElement.dir = SUPPORTED_LANGUAGES[language].dir
    document.documentElement.lang = language

    logger.info('Language changed', { language })
  } catch (error) {
    logger.error('Failed to change language', error as Error)
    throw error
  }
}

// Get current language
export function getCurrentLanguage(): SupportedLanguage {
  return i18n.language as SupportedLanguage
}

// Get language direction
export function getLanguageDirection(language?: SupportedLanguage): 'ltr' | 'rtl' {
  const lang = language || getCurrentLanguage()
  return SUPPORTED_LANGUAGES[lang]?.dir || 'ltr'
}

// Format number based on locale
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(i18n.language, options).format(value)
}

// Format date based on locale
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(i18n.language, options).format(dateObj)
}

// Format relative time
export function formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
  const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' })
  return rtf.format(value, unit)
}

// Format currency
export function formatCurrency(
  value: number,
  currency: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
    ...options,
  }).format(value)
}

// Format percentage
export function formatPercentage(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    ...options,
  }).format(value)
}

// Pluralization helper
export function pluralize(count: number, key: string, options?: Record<string, any>): string {
  return i18n.t(key, { count, ...options })
}

// Get all translations for a namespace
export function getNamespaceTranslations(
  namespace: Namespace,
  language?: SupportedLanguage
): Record<string, any> {
  const lang = language || getCurrentLanguage()
  return i18n.getResourceBundle(lang, namespace) || {}
}

// Check if language is RTL
export function isRTL(language?: SupportedLanguage): boolean {
  return getLanguageDirection(language) === 'rtl'
}

// Export i18n instance
export { i18n }
