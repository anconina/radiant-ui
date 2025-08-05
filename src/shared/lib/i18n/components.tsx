/**
 * i18n components
 */
import { ReactNode, Suspense } from 'react'
import { Fragment } from 'react'

import { Check, ChevronDown, Globe } from 'lucide-react'

import { Menu, Transition } from '@headlessui/react'
import { Trans as I18NextTrans } from 'react-i18next'

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from './config'
import { useDirectionalStyles, useLanguage, useLanguageSwitcher } from './hooks'

// Re-export Trans component with proper typing
export const Trans = I18NextTrans

// Language switcher component
export function LanguageSwitcher({
  className = '',
  showNativeName = true,
  showFlag = false,
}: {
  className?: string
  showNativeName?: boolean
  showFlag?: boolean
}) {
  const { currentLanguage, languages, switchLanguage, isChanging } = useLanguageSwitcher()

  return (
    <Menu as="div" className={`relative ${className}`}>
      <Menu.Button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <Globe className="w-4 h-4" />
        <span>
          {showNativeName ? languages[currentLanguage].nativeName : languages[currentLanguage].name}
        </span>
        <ChevronDown className="w-4 h-4" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute end-0 mt-2 w-56 origin-top-end bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {(
              Object.entries(languages) as Array<
                [SupportedLanguage, (typeof languages)[SupportedLanguage]]
              >
            ).map(([code, lang]) => (
              <Menu.Item key={code}>
                {({ active }) => (
                  <button
                    onClick={() => switchLanguage(code)}
                    disabled={isChanging}
                    className={`
                        ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                        ${currentLanguage === code ? 'font-medium' : ''}
                        group flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    dir={lang.dir}
                  >
                    <span className="flex items-center gap-3">
                      {showFlag && <span className="text-lg">{getFlagEmoji(code)}</span>}
                      <span>
                        {showNativeName ? lang.nativeName : lang.name}
                        {!showNativeName && lang.nativeName !== lang.name && (
                          <span className="ms-2 text-gray-500 dark:text-gray-400">
                            ({lang.nativeName})
                          </span>
                        )}
                      </span>
                    </span>
                    {currentLanguage === code && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

// Directional box component
export function DirectionalBox({
  children,
  className = '',
  paddingStart,
  paddingEnd,
  marginStart,
  marginEnd,
  style = {},
}: {
  children: ReactNode
  className?: string
  paddingStart?: string | number
  paddingEnd?: string | number
  marginStart?: string | number
  marginEnd?: string | number
  style?: React.CSSProperties
}) {
  const styles = useDirectionalStyles()

  const directionalStyles = {
    ...style,
    ...(paddingStart && styles.paddingStart(paddingStart)),
    ...(paddingEnd && styles.paddingEnd(paddingEnd)),
    ...(marginStart && styles.marginStart(marginStart)),
    ...(marginEnd && styles.marginEnd(marginEnd)),
  }

  return (
    <div className={className} style={directionalStyles}>
      {children}
    </div>
  )
}

// Translation loading fallback
export function TranslationLoader({ message = 'Loading translations...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}

// Translation boundary with fallback
export function TranslationBoundary({
  children,
  fallback = <TranslationLoader />,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

// Helper function to get flag emoji
function getFlagEmoji(languageCode: SupportedLanguage): string {
  const flags: Record<SupportedLanguage, string> = {
    en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    ja: '🇯🇵',
    zh: '🇨🇳',
    ar: '🇸🇦',
    he: '🇮🇱',
  }

  return flags[languageCode] || '🌐'
}

// Missing translation component
export function MissingTranslation({
  translationKey,
  namespace,
}: {
  translationKey: string
  namespace?: string
}) {
  if (process.env.NODE_ENV === 'development') {
    return (
      <span className="text-red-500 dark:text-red-400 text-xs">
        [Missing: {namespace ? `${namespace}:` : ''}
        {translationKey}]
      </span>
    )
  }

  return null
}

// Language-specific content component
export function LanguageContent({
  children,
  only,
  except,
}: {
  children: ReactNode
  only?: SupportedLanguage[]
  except?: SupportedLanguage[]
}) {
  const { language } = useLanguage()

  // Check if content should be shown
  if (only && !only.includes(language)) {
    return null
  }

  if (except && except.includes(language)) {
    return null
  }

  return <>{children}</>
}
