/**
 * i18n module exports
 */

// Config exports
export {
  initI18n,
  i18n,
  changeLanguage,
  getCurrentLanguage,
  getLanguageDirection,
  formatNumber,
  formatDate,
  formatRelativeTime,
  formatCurrency,
  formatPercentage,
  pluralize,
  getNamespaceTranslations,
  isRTL,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  NAMESPACES,
  DEFAULT_NAMESPACE,
  type SupportedLanguage,
  type Namespace,
} from './config'

// Hooks exports
export {
  useTranslation,
  useLanguage,
  useLocaleFormat,
  useDirectionalStyles,
  useTranslatedRoutes,
  useLanguageSwitcher,
  useTranslationWithLoading,
  usePreloadNamespaces,
} from './hooks'

// Components exports
export {
  Trans,
  LanguageSwitcher,
  DirectionalBox,
  TranslationLoader,
  TranslationBoundary,
  MissingTranslation,
  LanguageContent,
} from './components'
