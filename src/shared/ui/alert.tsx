'use client'

import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:start-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:ps-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        warning:
          'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-900/10 dark:text-orange-200 [&>svg]:text-orange-600 dark:[&>svg]:text-orange-400',
        success:
          'border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-900/10 dark:text-green-200 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  ref?: React.Ref<HTMLDivElement>
}

function Alert({ className, variant, ref, ...props }: AlertProps) {
  return (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  )
}
Alert.displayName = 'Alert'

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  ref?: React.Ref<HTMLParagraphElement>
}

function AlertTitle({ className, ref, ...props }: AlertTitleProps) {
  return (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
}
AlertTitle.displayName = 'AlertTitle'

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  ref?: React.Ref<HTMLParagraphElement>
}

function AlertDescription({ className, ref, ...props }: AlertDescriptionProps) {
  return <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
}
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
