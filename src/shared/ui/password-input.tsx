'use client'

import * as React from 'react'

import { Check, Eye, EyeOff, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

import { Button } from './button'
import { Input } from './input'
import { Progress } from './progress'

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrength?: boolean
  showRequirements?: boolean
  onStrengthChange?: (strength: number) => void
  ref?: React.Ref<HTMLInputElement>
}

function PasswordInput({
  className,
  showStrength = true,
  showRequirements = true,
  onStrengthChange,
  ref,
  ...props
}: PasswordInputProps) {
  const { t } = useTranslation('auth')
  const [showPassword, setShowPassword] = React.useState(false)
  const [password, setPassword] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)

  // Password strength calculation
  const calculateStrength = React.useCallback((pass: string): number => {
    let strength = 0

    // Length check
    if (pass.length >= 8) strength += 20
    if (pass.length >= 12) strength += 10

    // Character variety checks
    if (/[a-z]/.test(pass)) strength += 15
    if (/[A-Z]/.test(pass)) strength += 15
    if (/[0-9]/.test(pass)) strength += 15
    if (/[^A-Za-z0-9]/.test(pass)) strength += 15

    // Pattern checks
    if (/(.)\1{2,}/.test(pass)) strength -= 10 // Repeated characters
    if (/^[a-zA-Z]+$/.test(pass)) strength -= 5 // Only letters
    if (/^[0-9]+$/.test(pass)) strength -= 5 // Only numbers

    // Bonus for mixed characters
    if (
      /[a-z]/.test(pass) &&
      /[A-Z]/.test(pass) &&
      /[0-9]/.test(pass) &&
      /[^A-Za-z0-9]/.test(pass)
    ) {
      strength += 10
    }

    return Math.max(0, Math.min(100, strength))
  }, [])

  const strength = React.useMemo(() => calculateStrength(password), [password, calculateStrength])

  const requirements = React.useMemo(
    () => ({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  )

  const getStrengthVariant = (
    strength: number
  ): 'destructive' | 'warning' | 'default' | 'success' => {
    if (strength < 30) return 'destructive'
    if (strength < 60) return 'warning'
    if (strength < 80) return 'default'
    return 'success'
  }

  const getStrengthText = (strength: number) => {
    if (strength < 30) return t('register.passwordStrength.weak')
    if (strength < 60) return t('register.passwordStrength.fair')
    if (strength < 80) return t('register.passwordStrength.good')
    return t('register.passwordStrength.strong')
  }

  React.useEffect(() => {
    onStrengthChange?.(strength)
  }, [strength, onStrengthChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    props.onChange?.(e)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn('pe-10', className)}
          onChange={handleChange}
          onFocus={e => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={e => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {showStrength && password && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t('register.passwordStrength.label')}</span>
            <span
              className={cn(
                'text-xs font-medium',
                strength < 30 && 'text-destructive',
                strength >= 30 && strength < 60 && 'text-orange-500',
                strength >= 60 && strength < 80 && 'text-yellow-500',
                strength >= 80 && 'text-green-500'
              )}
            >
              {getStrengthText(strength)}
            </span>
          </div>
          <Progress
            value={strength}
            className="h-1.5"
            variant={getStrengthVariant(strength)}
            animated
          />
        </div>
      )}

      {showRequirements && password && isFocused && (
        <div className="rounded-md border bg-muted/50 p-3 text-xs space-y-1">
          <p className="font-medium text-muted-foreground mb-1">{t('register.passwordValidation.title')}</p>
          <RequirementItem met={requirements.length} text={t('register.passwordValidation.minLength')} />
          <RequirementItem met={requirements.lowercase} text={t('register.passwordValidation.hasLowercase')} />
          <RequirementItem met={requirements.uppercase} text={t('register.passwordValidation.hasUppercase')} />
          <RequirementItem met={requirements.number} text={t('register.passwordValidation.hasNumber')} />
          <RequirementItem met={requirements.special} text={t('register.passwordValidation.hasSpecial')} />
        </div>
      )}
    </div>
  )
}
PasswordInput.displayName = 'PasswordInput'

interface RequirementItemProps {
  met: boolean
  text: string
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground" />
      )}
      <span
        className={cn(
          'text-xs',
          met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        )}
      >
        {text}
      </span>
    </div>
  )
}

export { PasswordInput }
