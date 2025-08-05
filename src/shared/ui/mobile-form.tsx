import * as React from 'react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

// Mobile-optimized form wrapper
interface MobileFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  spacing?: 'compact' | 'normal' | 'relaxed'
}

export function MobileForm({ className, spacing = 'normal', children, ...props }: MobileFormProps) {
  const spacingClasses = {
    compact: 'space-y-3',
    normal: 'space-y-4 sm:space-y-6',
    relaxed: 'space-y-6 sm:space-y-8',
  }

  return (
    <form
      className={cn('w-full', spacingClasses[spacing], className)}
      noValidate // Use custom validation for better mobile UX
      {...props}
    >
      {children}
    </form>
  )
}

// Mobile-optimized form field wrapper
interface MobileFormFieldProps {
  children: React.ReactNode
  className?: string
}

export function MobileFormField({ children, className }: MobileFormFieldProps) {
  return <div className={cn('space-y-2', className)}>{children}</div>
}

// Mobile-optimized input with floating label
interface MobileFloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function MobileFloatingInput({
  label,
  error,
  className,
  id,
  ...props
}: MobileFloatingInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)
  const inputId = id || React.useId()

  return (
    <div className="relative">
      <Input
        id={inputId}
        className={cn(
          'peer pt-6 pb-2 h-auto min-h-[56px]',
          error && 'border-destructive focus:ring-destructive',
          className
        )}
        placeholder=" "
        onFocus={() => setIsFocused(true)}
        onBlur={e => {
          setIsFocused(false)
          setHasValue(!!e.target.value)
        }}
        {...props}
      />
      <Label
        htmlFor={inputId}
        className={cn(
          'absolute left-3 transition-all duration-200 pointer-events-none',
          'peer-placeholder-shown:top-4 peer-placeholder-shown:text-base',
          'peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary',
          'top-2 text-xs text-muted-foreground',
          (isFocused || hasValue) && 'top-2 text-xs'
        )}
      >
        {label}
      </Label>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

// Mobile-optimized select with better touch targets
interface MobileSelectProps {
  label: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
  error?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function MobileSelect({
  label,
  placeholder = 'Select an option',
  options,
  error,
  value,
  onValueChange,
  className,
}: MobileSelectProps) {
  const id = React.useId()

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={cn(
            'min-h-[56px] text-base sm:text-sm',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-[44px] text-base sm:text-sm"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// Mobile-optimized checkbox with larger touch target
interface MobileCheckboxProps {
  label: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  error?: string
  className?: string
}

export function MobileCheckbox({
  label,
  checked,
  onCheckedChange,
  error,
  className,
}: MobileCheckboxProps) {
  const id = React.useId()

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className={cn(
          'flex items-center space-x-3 cursor-pointer',
          'p-3 -m-3 rounded-lg hover:bg-accent/50 transition-colors',
          className
        )}
      >
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={e => onCheckedChange?.(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-sm font-medium select-none">{label}</span>
      </label>
      {error && <p className="text-xs text-destructive ml-8">{error}</p>}
    </div>
  )
}

// Mobile-optimized form actions with sticky positioning
interface MobileFormActionsProps {
  children: React.ReactNode
  sticky?: boolean
  className?: string
}

export function MobileFormActions({ children, sticky = true, className }: MobileFormActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:justify-end',
        sticky && [
          'sticky bottom-0 -mx-4 px-4 py-4 bg-background/95',
          'backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'border-t shadow-lg sm:relative sm:bottom-auto',
          'sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent',
          'sm:backdrop-blur-none sm:border-0 sm:shadow-none',
        ],
        className
      )}
    >
      {children}
    </div>
  )
}

// Example usage
export function MobileFormExample() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    role: '',
    notifications: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <MobileForm onSubmit={handleSubmit} spacing="normal">
      <MobileFormField>
        <MobileFloatingInput
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </MobileFormField>

      <MobileFormField>
        <MobileFloatingInput
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </MobileFormField>

      <MobileFormField>
        <MobileSelect
          label="Role"
          placeholder="Select your role"
          value={formData.role}
          onValueChange={value => setFormData({ ...formData, role: value })}
          options={[
            { value: 'admin', label: 'Administrator' },
            { value: 'user', label: 'Regular User' },
            { value: 'editor', label: 'Content Editor' },
          ]}
        />
      </MobileFormField>

      <MobileFormField>
        <MobileCheckbox
          label="Send me email notifications"
          checked={formData.notifications}
          onCheckedChange={checked => setFormData({ ...formData, notifications: checked })}
        />
      </MobileFormField>

      <MobileFormActions>
        <Button type="button" variant="outline" fullWidth className="sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" fullWidth className="sm:w-auto">
          Save Changes
        </Button>
      </MobileFormActions>
    </MobileForm>
  )
}
