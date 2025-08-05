'use client'

import * as React from 'react'

import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/shared/lib/utils'

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer relative data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none absolute top-1/2 -translate-y-1/2 block size-4 rounded-full ring-0 transition-all',
          // LTR positioning
          'ltr:data-[state=checked]:left-[14px] ltr:data-[state=unchecked]:left-[2px]',
          // RTL positioning
          'rtl:data-[state=checked]:right-[14px] rtl:data-[state=unchecked]:right-[2px]'
        )}
      />
    </SwitchPrimitive.Root>
  )
}
