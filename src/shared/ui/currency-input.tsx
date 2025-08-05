'use client'

import * as React from 'react'

import { ChevronDown } from 'lucide-react'

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

export interface Currency {
  code: string
  symbol: string
  name: string
  symbolPosition: 'before' | 'after'
  thousandSeparator: string
  decimalSeparator: string
  decimalPlaces: number
}

// Common currencies
const currencies: Currency[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    symbolPosition: 'before',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimalPlaces: 2,
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    symbolPosition: 'before',
    thousandSeparator: '.',
    decimalSeparator: ',',
    decimalPlaces: 2,
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    symbolPosition: 'before',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimalPlaces: 2,
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    symbolPosition: 'before',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimalPlaces: 0,
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    symbolPosition: 'before',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimalPlaces: 2,
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    symbolPosition: 'before',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimalPlaces: 2,
  },
  {
    code: 'CHF',
    symbol: 'Fr',
    name: 'Swiss Franc',
    symbolPosition: 'before',
    thousandSeparator: "'",
    decimalSeparator: '.',
    decimalPlaces: 2,
  },
  {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    symbolPosition: 'before',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimalPlaces: 2,
  },
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    symbolPosition: 'before',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimalPlaces: 2,
  },
  {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    symbolPosition: 'before',
    thousandSeparator: '.',
    decimalSeparator: ',',
    decimalPlaces: 2,
  },
]

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value?: number | string
  onChange?: (value: number | undefined) => void
  currency?: string
  onCurrencyChange?: (currency: Currency) => void
  currencies?: Currency[]
  min?: number
  max?: number
  allowNegative?: boolean
  decimalPlaces?: number
  showCurrencySelector?: boolean
  placeholder?: string
  ref?: React.Ref<HTMLInputElement>
}

function CurrencyInput({
  className,
  value,
  onChange,
  currency = 'USD',
  onCurrencyChange,
  currencies: customCurrencies,
  min,
  max,
  allowNegative = true,
  decimalPlaces,
  showCurrencySelector = true,
  placeholder,
  disabled,
  ref,
  ...props
}: CurrencyInputProps) {
  const [open, setOpen] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [displayValue, setDisplayValue] = React.useState('')

  const currencyList = customCurrencies || currencies
  const selectedCurrency = React.useMemo(
    () => currencyList.find(c => c.code === currency) || currencyList[0],
    [currency, currencyList]
  )

  const effectiveDecimalPlaces = decimalPlaces ?? selectedCurrency.decimalPlaces

  // Format number with thousand separators
  const formatNumber = React.useCallback(
    (num: number, currency: Currency): string => {
      const parts = num.toFixed(effectiveDecimalPlaces).split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator)

      if (parts[1] !== undefined && effectiveDecimalPlaces > 0) {
        return parts.join(currency.decimalSeparator)
      }

      return parts[0]
    },
    [effectiveDecimalPlaces]
  )

  // Parse formatted string to number
  const parseNumber = React.useCallback((input: string, currency: Currency): number | undefined => {
    if (!input || input === '-') return undefined

    // Remove currency symbol
    let cleaned = input.replace(currency.symbol, '').trim()

    // Replace currency-specific separators with standard ones
    if (currency.thousandSeparator !== ',') {
      cleaned = cleaned.replace(new RegExp(`\\${currency.thousandSeparator}`, 'g'), '')
    } else {
      cleaned = cleaned.replace(/,/g, '')
    }

    if (currency.decimalSeparator !== '.') {
      cleaned = cleaned.replace(currency.decimalSeparator, '.')
    }

    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : num
  }, [])

  // Format display value
  const formatDisplayValue = React.useCallback(
    (num: number | undefined, currency: Currency): string => {
      if (num === undefined) return ''

      const formatted = formatNumber(num, currency)

      if (currency.symbolPosition === 'before') {
        return `${currency.symbol} ${formatted}`
      } else {
        return `${formatted} ${currency.symbol}`
      }
    },
    [formatNumber]
  )

  // Initialize display value
  React.useEffect(() => {
    if (value !== undefined) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      if (!isNaN(numValue)) {
        if (focused) {
          setDisplayValue(numValue.toString())
        } else {
          setDisplayValue(formatDisplayValue(numValue, selectedCurrency))
        }
      }
    } else {
      setDisplayValue('')
    }
  }, [value, selectedCurrency, focused, formatDisplayValue])

  // Handle input change
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value

      // Allow empty input
      if (!input) {
        setDisplayValue('')
        onChange?.(undefined)
        return
      }

      // Allow negative sign at the beginning
      if (allowNegative && input === '-') {
        setDisplayValue('-')
        return
      }

      // Parse the number
      const parsed = parseNumber(input, selectedCurrency)

      if (parsed !== undefined) {
        // Apply min/max constraints
        let constrained = parsed
        if (min !== undefined && parsed < min) constrained = min
        if (max !== undefined && parsed > max) constrained = max

        setDisplayValue(input)
        onChange?.(constrained)
      }
    },
    [selectedCurrency, parseNumber, onChange, min, max, allowNegative]
  )

  // Handle blur - format the display
  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)

      const parsed = parseNumber(displayValue, selectedCurrency)
      if (parsed !== undefined) {
        setDisplayValue(formatDisplayValue(parsed, selectedCurrency))
      }

      props.onBlur?.(e)
    },
    [displayValue, selectedCurrency, parseNumber, formatDisplayValue, props]
  )

  // Handle focus - show raw number
  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true)

      const parsed = parseNumber(displayValue, selectedCurrency)
      if (parsed !== undefined) {
        setDisplayValue(parsed.toString())
      }

      props.onFocus?.(e)
    },
    [displayValue, selectedCurrency, parseNumber, props]
  )

  // Handle currency change
  const handleCurrencyChange = React.useCallback(
    (newCurrency: Currency) => {
      setOpen(false)
      onCurrencyChange?.(newCurrency)

      // Reformat the current value with new currency
      const parsed = parseNumber(displayValue, selectedCurrency)
      if (parsed !== undefined) {
        setDisplayValue(formatDisplayValue(parsed, newCurrency))
      }
    },
    [displayValue, selectedCurrency, parseNumber, formatDisplayValue, onCurrencyChange]
  )

  return (
    <div className="relative flex">
      {showCurrencySelector && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select currency"
              disabled={disabled}
              className={cn(
                'w-auto justify-between gap-1 rounded-e-none border-e-0 px-3',
                'hover:bg-background focus:z-10',
                disabled && 'opacity-50'
              )}
            >
              <span className="font-medium">{selectedCurrency.code}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search currency..." />
              <CommandList>
                <CommandEmpty>No currency found.</CommandEmpty>
                <CommandGroup>
                  {currencyList.map(curr => (
                    <CommandItem
                      key={curr.code}
                      value={`${curr.code} ${curr.name}`}
                      onSelect={() => handleCurrencyChange(curr)}
                    >
                      <span className="me-2">{curr.symbol}</span>
                      <span className="flex-1">{curr.name}</span>
                      <span className="text-sm text-muted-foreground">{curr.code}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={
          placeholder ||
          `0${effectiveDecimalPlaces > 0 ? `.${selectedCurrency.decimalSeparator}${'0'.repeat(effectiveDecimalPlaces)}` : ''}`
        }
        className={cn(showCurrencySelector && 'rounded-s-none', focused && 'z-10', className)}
        disabled={disabled}
      />
    </div>
  )
}
CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput, currencies as defaultCurrencies }
