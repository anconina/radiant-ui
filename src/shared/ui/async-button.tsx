import { useState } from 'react'

import { cn } from '@/shared/lib/utils'

import { Button } from './button'
import { Spinner } from './loading'

interface AsyncButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  onClick?: () => void | Promise<void>
  loadingText?: string
  successText?: string
  errorText?: string
  showSuccessState?: boolean
  successDuration?: number
}

export function AsyncButton({
  children,
  onClick,
  loadingText,
  successText,
  errorText,
  showSuccessState = true,
  successDuration = 2000,
  disabled,
  className,
  ...props
}: AsyncButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleClick = async () => {
    if (!onClick || state === 'loading') return

    setState('loading')
    try {
      await onClick()
      if (showSuccessState && successText) {
        setState('success')
        setTimeout(() => setState('idle'), successDuration)
      } else {
        setState('idle')
      }
    } catch (error) {
      setState('error')
      setTimeout(() => setState('idle'), successDuration)
    }
  }

  const getContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <Spinner size="sm" className="me-2" />
            {loadingText || children}
          </>
        )
      case 'success':
        return successText || children
      case 'error':
        return errorText || 'Error'
      default:
        return children
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || state === 'loading'}
      className={cn(
        state === 'success' && 'bg-green-600 hover:bg-green-700',
        state === 'error' && 'bg-destructive hover:bg-destructive/90',
        className
      )}
      {...props}
    >
      {getContent()}
    </Button>
  )
}
