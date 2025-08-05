'use client'

import * as React from 'react'

import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'

import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'

import { Controller, FormProvider, useFormContext, useFormState } from 'react-hook-form'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'

import { cn } from '@/shared/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Label } from '@/shared/ui/label'

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    isLoading: formState.isSubmitting,
    isValid: formState.isValid,
    isSubmitted: formState.isSubmitted,
    isSubmitSuccessful: formState.isSubmitSuccessful,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

interface FormItemProps extends React.ComponentProps<'div'> {
  showSuccessState?: boolean
}

function FormItem({ className, showSuccessState = false, ...props }: FormItemProps) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn('grid gap-2 transition-all duration-200', className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ className, ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId, isTouched, isSubmitted } =
    useFormField()

  return (
    <Slot
      data-slot="form-control"
      data-error={!!error}
      data-touched={isTouched}
      data-submitted={isSubmitted}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      className={cn(
        'data-[error=true]:ring-2 data-[error=true]:ring-destructive/20',
        'data-[error=true]:border-destructive',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

interface FormMessageProps extends React.ComponentProps<'p'> {
  showIcon?: boolean
}

function FormMessage({ className, showIcon = true, ...props }: FormMessageProps) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? '') : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn(
        'text-destructive text-sm flex items-start gap-1.5',
        'animate-in fade-in-0 slide-in-from-top-1',
        className
      )}
      {...props}
    >
      {showIcon && error && <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
      <span>{body}</span>
    </p>
  )
}

// FormSection component for grouping related form fields
interface FormSectionProps extends React.ComponentProps<'div'> {
  title?: string
  description?: string
}

function FormSection({ className, title, description, children, ...props }: FormSectionProps) {
  return (
    <div data-slot="form-section" className={cn('space-y-4', className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium leading-6">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

// FormAlert component for form-level messages
interface FormAlertProps {
  type?: 'error' | 'warning' | 'info' | 'success'
  title?: string
  message: string
  className?: string
}

function FormAlert({ type = 'error', title, message, className }: FormAlertProps) {
  const icons = {
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
    success: CheckCircle2,
  }

  const Icon = icons[type]

  const alertVariants = {
    error: 'destructive',
    warning: 'warning',
    info: 'default',
    success: 'success',
  } as const

  return (
    <Alert variant={alertVariants[type]} className={cn('mb-4', className)}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

// FormLoadingOverlay component for loading states
interface FormLoadingOverlayProps {
  isLoading?: boolean
  message?: string
}

function FormLoadingOverlay({ isLoading, message = 'Processing...' }: FormLoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-md">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormSection,
  FormAlert,
  FormLoadingOverlay,
}
