import { useCallback, useEffect, useRef } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipeMove?: (distance: number, direction: 'left' | 'right' | 'up' | 'down') => void
  onSwipeEnd?: () => void
  threshold?: number // Percentage of screen width/height (0-1)
  velocity?: number // Minimum velocity in pixels/ms
  preventScroll?: boolean
  edgeSwipeThreshold?: number // Pixels from edge to detect edge swipe
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
  currentX: number
  currentY: number
  isDragging: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipeMove,
  onSwipeEnd,
  threshold = 0.3,
  velocity = 0.5,
  preventScroll = true,
  edgeSwipeThreshold = 20,
}: SwipeGestureOptions = {}) {
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    direction: null,
  })

  const elementRef = useRef<HTMLElement | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return

    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true,
      direction: null,
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchState.current.isDragging) return

      const touch = e.touches[0]
      if (!touch) return

      const deltaX = touch.clientX - touchState.current.startX
      const deltaY = touch.clientY - touchState.current.startY

      // Determine primary direction
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      if (!touchState.current.direction) {
        if (absDeltaX > absDeltaY) {
          touchState.current.direction = deltaX > 0 ? 'right' : 'left'
        } else if (absDeltaY > absDeltaX) {
          touchState.current.direction = deltaY > 0 ? 'down' : 'up'
        }
      }

      // Prevent scroll if moving horizontally
      if (
        preventScroll &&
        touchState.current.direction &&
        ['left', 'right'].includes(touchState.current.direction)
      ) {
        e.preventDefault()
      }

      touchState.current.currentX = touch.clientX
      touchState.current.currentY = touch.clientY

      // Call onSwipeMove callback
      if (onSwipeMove && touchState.current.direction) {
        const distance =
          touchState.current.direction === 'left' || touchState.current.direction === 'right'
            ? deltaX
            : deltaY
        onSwipeMove(Math.abs(distance), touchState.current.direction)
      }
    },
    [onSwipeMove, preventScroll]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchState.current.isDragging) return

      const { startX, startY, startTime, currentX, currentY, direction } = touchState.current
      const deltaX = currentX - startX
      const deltaY = currentY - startY
      const deltaTime = Date.now() - startTime

      // Calculate velocity
      const velocityX = Math.abs(deltaX) / deltaTime
      const velocityY = Math.abs(deltaY) / deltaTime

      // Get screen dimensions
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight

      // Calculate threshold distances
      const thresholdX = screenWidth * threshold
      const thresholdY = screenHeight * threshold

      // Check if swipe meets criteria
      if (direction === 'left' || direction === 'right') {
        if (Math.abs(deltaX) > thresholdX || velocityX > velocity) {
          if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft()
          } else if (deltaX > 0 && onSwipeRight) {
            onSwipeRight()
          }
        }
      } else if (direction === 'up' || direction === 'down') {
        if (Math.abs(deltaY) > thresholdY || velocityY > velocity) {
          if (deltaY < 0 && onSwipeUp) {
            onSwipeUp()
          } else if (deltaY > 0 && onSwipeDown) {
            onSwipeDown()
          }
        }
      }

      // Reset state
      touchState.current.isDragging = false
      touchState.current.direction = null

      // Call onSwipeEnd callback
      if (onSwipeEnd) {
        onSwipeEnd()
      }
    },
    [threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd]
  )

  const handleTouchCancel = useCallback(() => {
    touchState.current.isDragging = false
    touchState.current.direction = null
    if (onSwipeEnd) {
      onSwipeEnd()
    }
  }, [onSwipeEnd])

  // Set up event listeners
  const setRef = useCallback(
    (element: HTMLElement | null) => {
      // Clean up old listeners
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart)
        elementRef.current.removeEventListener('touchmove', handleTouchMove)
        elementRef.current.removeEventListener('touchend', handleTouchEnd)
        elementRef.current.removeEventListener('touchcancel', handleTouchCancel)
      }

      // Set new ref and add listeners
      elementRef.current = element
      if (element) {
        // Use passive listeners for better performance, except for touchmove when preventing scroll
        element.addEventListener('touchstart', handleTouchStart, { passive: true })
        element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
        element.addEventListener('touchend', handleTouchEnd, { passive: true })
        element.addEventListener('touchcancel', handleTouchCancel, { passive: true })
      }
    },
    [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, preventScroll]
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart)
        elementRef.current.removeEventListener('touchmove', handleTouchMove)
        elementRef.current.removeEventListener('touchend', handleTouchEnd)
        elementRef.current.removeEventListener('touchcancel', handleTouchCancel)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel])

  // Edge swipe detection helper
  const isEdgeSwipe = useCallback(
    (x: number, side: 'left' | 'right' = 'left') => {
      if (side === 'left') {
        return x <= edgeSwipeThreshold
      } else {
        return x >= window.innerWidth - edgeSwipeThreshold
      }
    },
    [edgeSwipeThreshold]
  )

  return {
    ref: setRef,
    isEdgeSwipe,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  }
}
