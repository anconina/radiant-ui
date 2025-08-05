'use client'

import * as React from 'react'

import { ChevronDown, Phone } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import { Button } from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export interface Country {
  code: string
  name: string
  flag: string
  dialCode: string
  format?: string
}

// Common countries - in production, this would be imported from a comprehensive list
const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', format: '(###) ###-####' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', format: '#### ### ####' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', format: '(###) ###-####' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', format: '### ### ###' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', format: '### #######' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', format: '# ## ## ## ##' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34', format: '### ## ## ##' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39', format: '### ### ####' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', format: '##-####-####' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86', format: '### #### ####' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', format: '##### #####' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', format: '(##) #####-####' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52', format: '## #### ####' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7', format: '(###) ###-##-##' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27', format: '## ### ####' },
]

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
  defaultCountry?: string
  countries?: Country[]
  placeholder?: string
  formatOnBlur?: boolean
  showFlags?: boolean
  showDialCode?: boolean
  ref?: React.Ref<HTMLInputElement>
}

function PhoneInput({
  className,
  value = '',
  onChange,
  defaultCountry = 'US',
  countries: customCountries,
  placeholder,
  formatOnBlur = true,
  showFlags = true,
  showDialCode = true,
  disabled,
  ref,
  ...props
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(
    (customCountries || countries).find(c => c.code === defaultCountry) || countries[0]
  )
  const [phoneNumber, setPhoneNumber] = React.useState(value)
  const [focused, setFocused] = React.useState(false)

  const countryList = customCountries || countries

  // Format phone number based on country format
  const formatPhoneNumber = React.useCallback((input: string, country: Country): string => {
    if (!country.format) return input

    // Remove all non-digits
    const digits = input.replace(/\D/g, '')
    let formatted = ''
    let digitIndex = 0

    for (let i = 0; i < country.format.length && digitIndex < digits.length; i++) {
      if (country.format[i] === '#') {
        formatted += digits[digitIndex]
        digitIndex++
      } else {
        formatted += country.format[i]
      }
    }

    return formatted
  }, [])

  // Parse phone number to extract country and number
  const parsePhoneNumber = React.useCallback(
    (input: string): { country?: Country; number: string } => {
      if (input.startsWith('+')) {
        // Try to match country by dial code
        for (const country of countryList) {
          if (input.startsWith(country.dialCode)) {
            return {
              country,
              number: input.slice(country.dialCode.length).trim(),
            }
          }
        }
      }
      return { number: input }
    },
    [countryList]
  )

  // Handle input change
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      const { country, number } = parsePhoneNumber(input)

      if (country && country.code !== selectedCountry.code) {
        setSelectedCountry(country)
      }

      setPhoneNumber(number)

      // Call onChange with full international format
      const fullNumber = country
        ? `${country.dialCode} ${number}`
        : `${selectedCountry.dialCode} ${number}`
      onChange?.(fullNumber)
    },
    [selectedCountry, parsePhoneNumber, onChange]
  )

  // Handle country change
  const handleCountryChange = React.useCallback(
    (country: Country) => {
      setSelectedCountry(country)
      setOpen(false)

      // Update the full phone number
      const fullNumber = `${country.dialCode} ${phoneNumber}`
      onChange?.(fullNumber)
    },
    [phoneNumber, onChange]
  )

  // Format on blur if enabled
  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      if (formatOnBlur && phoneNumber) {
        const formatted = formatPhoneNumber(phoneNumber, selectedCountry)
        setPhoneNumber(formatted)
        const fullNumber = `${selectedCountry.dialCode} ${formatted}`
        onChange?.(fullNumber)
      }
      props.onBlur?.(e)
    },
    [formatOnBlur, phoneNumber, selectedCountry, formatPhoneNumber, onChange, props]
  )

  React.useEffect(() => {
    if (value) {
      const { country, number } = parsePhoneNumber(value)
      if (country) {
        setSelectedCountry(country)
        setPhoneNumber(number)
      } else {
        setPhoneNumber(value)
      }
    }
  }, [value, parsePhoneNumber])

  return (
    <div className="relative flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select country"
            disabled={disabled}
            className={cn(
              'w-auto justify-between gap-1 rounded-e-none border-e-0 px-3',
              'hover:bg-background focus:z-10',
              disabled && 'opacity-50'
            )}
          >
            {showFlags && <span className="text-base">{selectedCountry.flag}</span>}
            {showDialCode && <span className="text-sm">{selectedCountry.dialCode}</span>}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(country => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code} ${country.dialCode}`}
                    onSelect={() => handleCountryChange(country)}
                  >
                    <span className="me-2 text-base">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="relative flex-1">
        <Input
          {...props}
          ref={ref}
          type="tel"
          value={phoneNumber}
          onChange={handleInputChange}
          onFocus={e => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={handleBlur}
          placeholder={placeholder || selectedCountry.format?.replace(/#/g, '•') || 'Phone number'}
          className={cn('rounded-s-none ps-3', focused && 'z-10', className)}
          disabled={disabled}
        />
        <Phone className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  )
}
PhoneInput.displayName = 'PhoneInput'

export { PhoneInput, countries as defaultCountries }
