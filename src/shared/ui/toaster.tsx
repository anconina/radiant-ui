'use client'

import { Toaster as Sonner } from 'sonner'

import { useTheme } from '@/shared/providers/ThemeProvider'

export function Toaster() {
  const { theme } = useTheme()

  // Determine the actual theme for Sonner
  const getActualTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }

  return (
    <Sonner
      theme={getActualTheme() as 'light' | 'dark'}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          error:
            'group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive',
          success: 'group-[.toaster]:text-foreground',
          warning: 'group-[.toaster]:text-foreground',
          info: 'group-[.toaster]:text-foreground',
        },
      }}
      expand={false}
      richColors
      closeButton
    />
  )
}
