'use client'

import { Globe } from 'lucide-react'

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/shared/lib/i18n'
import { useLanguageSwitcher } from '@/shared/lib/i18n'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

interface LanguageSelectorProps {
  showIcon?: boolean
  showNativeName?: boolean
  className?: string
  onChange?: (language: SupportedLanguage) => void
}

export function LanguageSelector({
  showIcon = true,
  showNativeName = true,
  className,
  onChange,
}: LanguageSelectorProps) {
  const { currentLanguage, switchLanguage, isChanging } = useLanguageSwitcher()

  const handleValueChange = (value: string) => {
    const language = value as SupportedLanguage
    // Call onChange callback if provided
    onChange?.(language)
    // Switch language using the hook
    switchLanguage(language)
  }

  // Always use SUPPORTED_LANGUAGES as the source of truth
  const displayLanguages = SUPPORTED_LANGUAGES
  // Default to 'en' if current language is not yet loaded
  const displayCurrentLanguage = currentLanguage || 'en'

  // Ensure we have a valid current language
  const validCurrentLanguage = displayLanguages[displayCurrentLanguage]
    ? displayCurrentLanguage
    : 'en'

  return (
    <Select value={validCurrentLanguage} onValueChange={handleValueChange} disabled={isChanging}>
      <SelectTrigger className={className} size="sm" data-testid="language-selector">
        <div className="flex items-center gap-2">
          {showIcon && <Globe className="h-4 w-4" />}
          <SelectValue>
            {showNativeName
              ? displayLanguages[validCurrentLanguage].nativeName
              : displayLanguages[validCurrentLanguage].name}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {(
          Object.entries(displayLanguages) as Array<
            [SupportedLanguage, (typeof displayLanguages)[SupportedLanguage]]
          >
        ).map(([code, lang]) => (
          <SelectItem key={code} value={code}>
            <span dir={lang.dir}>
              {showNativeName ? lang.nativeName : lang.name}
              {!showNativeName && lang.nativeName !== lang.name && (
                <span className="ms-2 text-muted-foreground">({lang.nativeName})</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
