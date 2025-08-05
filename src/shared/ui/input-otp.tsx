'use client'

import * as React from 'react'

import { Minus } from 'lucide-react'

import { OTPInput, OTPInputContext } from 'input-otp'

import { cn } from '@/shared/lib/utils'

interface InputOTPProps extends React.ComponentPropsWithoutRef<typeof OTPInput> {
  ref?: React.Ref<React.ElementRef<typeof OTPInput>>
}

function InputOTP({ className, containerClassName, ref, ...props }: InputOTPProps) {
  return (
    <OTPInput
      ref={ref}
      containerClassName={cn(
        'flex items-center gap-2 has-[input:disabled]:opacity-50',
        containerClassName
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}
InputOTP.displayName = 'InputOTP'

interface InputOTPGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  ref?: React.Ref<React.ElementRef<'div'>>
}

function InputOTPGroup({ className, ref, ...props }: InputOTPGroupProps) {
  return <div ref={ref} className={cn('flex items-center', className)} {...props} />
}
InputOTPGroup.displayName = 'InputOTPGroup'

interface InputOTPSlotProps extends React.ComponentPropsWithoutRef<'div'> {
  index: number
  ref?: React.Ref<React.ElementRef<'div'>>
}

function InputOTPSlot({ index, className, ref, ...props }: InputOTPSlotProps) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center border-y border-e border-input text-sm transition-all first:rounded-s-md first:border-s last:rounded-e-md',
        isActive && 'z-10 ring-2 ring-ring ring-offset-background',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}
InputOTPSlot.displayName = 'InputOTPSlot'

interface InputOTPSeparatorProps extends React.ComponentPropsWithoutRef<'div'> {
  ref?: React.Ref<React.ElementRef<'div'>>
}

function InputOTPSeparator({ ref, ...props }: InputOTPSeparatorProps) {
  return (
    <div ref={ref} role="separator" {...props}>
      <Minus className="h-4 w-4" />
    </div>
  )
}
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
