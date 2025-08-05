import { useCallback, useEffect, useRef, useState } from 'react'

// Hook for managing focus visibility (keyboard vs touch)
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false)
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    // Track if user is using keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    const handleTouchStart = () => {
      setIsKeyboardUser(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('touchstart', handleTouchStart)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  const onFocus = useCallback(() => {
    if (isKeyboardUser) {
      setIsFocusVisible(true)
    }
  }, [isKeyboardUser])

  const onBlur = useCallback(() => {
    setIsFocusVisible(false)
  }, [])

  return {
    isFocusVisible,
    focusVisibleProps: {
      onFocus,
      onBlur,
    },
  }
}

// Hook for managing ARIA live regions
export function useLiveRegion(
  defaultMessage = '',
  options: {
    priority?: 'polite' | 'assertive'
    clearDelay?: number
  } = {}
) {
  const { priority = 'polite', clearDelay = 5000 } = options
  const [message, setMessage] = useState(defaultMessage)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const announce = useCallback(
    (newMessage: string) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set the new message
      setMessage(newMessage)

      // Clear after delay if specified
      if (clearDelay > 0) {
        timeoutRef.current = setTimeout(() => {
          setMessage('')
        }, clearDelay)
      }
    },
    [clearDelay]
  )

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setMessage('')
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    message,
    announce,
    clear,
    liveRegionProps: {
      role: 'status',
      'aria-live': priority,
      'aria-atomic': true,
    },
  }
}

// Hook for managing touch-friendly interactions
export function useTouchInteraction(
  onInteract?: () => void,
  options: {
    longPressDelay?: number
    doubleTapDelay?: number
  } = {}
) {
  const { longPressDelay = 500, doubleTapDelay = 300 } = options
  const [isPressed, setIsPressed] = useState(false)
  const [isLongPress, setIsLongPress] = useState(false)
  const longPressTimerRef = useRef<NodeJS.Timeout>()
  const lastTapRef = useRef<number>(0)
  const doubleTapTimerRef = useRef<NodeJS.Timeout>()

  const handleTouchStart = useCallback(() => {
    setIsPressed(true)

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true)
      // Haptic feedback for long press
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, longPressDelay)
  }, [longPressDelay])

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false)

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    // Handle double tap
    const now = Date.now()
    if (now - lastTapRef.current < doubleTapDelay) {
      // Double tap detected
      if (doubleTapTimerRef.current) {
        clearTimeout(doubleTapTimerRef.current)
      }
      onInteract?.()
    } else {
      // Single tap - wait to see if it becomes a double tap
      doubleTapTimerRef.current = setTimeout(() => {
        onInteract?.()
      }, doubleTapDelay)
    }
    lastTapRef.current = now

    setIsLongPress(false)
  }, [doubleTapDelay, onInteract])

  const handleTouchCancel = useCallback(() => {
    setIsPressed(false)
    setIsLongPress(false)
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
      if (doubleTapTimerRef.current) {
        clearTimeout(doubleTapTimerRef.current)
      }
    }
  }, [])

  return {
    isPressed,
    isLongPress,
    touchProps: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  }
}

// Hook for reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Hook for high contrast mode detection
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersHighContrast
}

// Hook for voice over detection (iOS)
export function useVoiceOver() {
  const [isVoiceOver, setIsVoiceOver] = useState(false)

  useEffect(() => {
    // Check for VoiceOver on iOS
    const checkVoiceOver = () => {
      // This is a heuristic approach - there's no direct API
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        // VoiceOver users often have different interaction patterns
        // This is a simplified check - in production you might want more sophisticated detection
        const hasTouchPoints = navigator.maxTouchPoints > 0
        const hasAccessibilityFeatures =
          document.body.getAttribute('role') === 'application' ||
          document.documentElement.getAttribute('aria-busy') === 'true'

        setIsVoiceOver(hasTouchPoints && hasAccessibilityFeatures)
      }
    }

    checkVoiceOver()
  }, [])

  return isVoiceOver
}

// Hook for managing focus within a container
export function useFocusManager(containerRef: React.RefObject<HTMLElement>) {
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    return Array.from(containerRef.current.querySelectorAll(selector)) as HTMLElement[]
  }, [containerRef])

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements()
    elements[0]?.focus()
  }, [getFocusableElements])

  const focusLast = useCallback(() => {
    const elements = getFocusableElements()
    elements[elements.length - 1]?.focus()
  }, [getFocusableElements])

  const focusNext = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.findIndex(el => el === document.activeElement)

    if (currentIndex === -1 || currentIndex === elements.length - 1) {
      focusFirst()
    } else {
      elements[currentIndex + 1]?.focus()
    }
  }, [getFocusableElements, focusFirst])

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.findIndex(el => el === document.activeElement)

    if (currentIndex === -1 || currentIndex === 0) {
      focusLast()
    } else {
      elements[currentIndex - 1]?.focus()
    }
  }, [getFocusableElements, focusLast])

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements,
  }
}
