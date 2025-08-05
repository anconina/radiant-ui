import { useEffect, useRef, useState } from 'react'

interface ContainerQueryOptions {
  width?: number
  height?: number
  orientation?: 'portrait' | 'landscape'
  aspectRatio?: string
}

interface ContainerDimensions {
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  aspectRatio: number
}

export function useContainerQuery<T extends HTMLElement = HTMLDivElement>(
  query?: ContainerQueryOptions
): [React.RefObject<T>, boolean, ContainerDimensions | null] {
  const ref = useRef<T>(null)
  const [matches, setMatches] = useState(false)
  const [dimensions, setDimensions] = useState<ContainerDimensions | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const container = ref.current

    // Check if ResizeObserver is supported
    if (!window.ResizeObserver) {
      console.warn('ResizeObserver is not supported in this browser')
      return
    }

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        const orientation = width > height ? 'landscape' : 'portrait'
        const aspectRatio = width / height

        const newDimensions: ContainerDimensions = {
          width,
          height,
          orientation,
          aspectRatio,
        }

        setDimensions(newDimensions)

        // Check if query matches
        if (query) {
          let isMatch = true

          if (query.width !== undefined && width < query.width) {
            isMatch = false
          }

          if (query.height !== undefined && height < query.height) {
            isMatch = false
          }

          if (query.orientation && orientation !== query.orientation) {
            isMatch = false
          }

          if (query.aspectRatio) {
            const [widthRatio, heightRatio] = query.aspectRatio.split('/').map(Number)
            const targetRatio = widthRatio / heightRatio
            const tolerance = 0.1
            if (Math.abs(aspectRatio - targetRatio) > tolerance) {
              isMatch = false
            }
          }

          setMatches(isMatch)
        }
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [query])

  return [ref, matches, dimensions]
}

// Preset container query hooks
export function useIsContainerSmall<T extends HTMLElement = HTMLDivElement>() {
  const [ref, matches] = useContainerQuery<T>({ width: 640 })
  return [ref, !matches] as const
}

export function useIsContainerMedium<T extends HTMLElement = HTMLDivElement>() {
  const [ref, matches] = useContainerQuery<T>({ width: 768 })
  return [ref, matches] as const
}

export function useIsContainerLarge<T extends HTMLElement = HTMLDivElement>() {
  const [ref, matches] = useContainerQuery<T>({ width: 1024 })
  return [ref, matches] as const
}

// Container aspect ratio hooks
export function useIsContainerSquare<T extends HTMLElement = HTMLDivElement>() {
  const [ref, matches] = useContainerQuery<T>({ aspectRatio: '1/1' })
  return [ref, matches] as const
}

export function useIsContainerWide<T extends HTMLElement = HTMLDivElement>() {
  const [ref, matches] = useContainerQuery<T>({ aspectRatio: '16/9' })
  return [ref, matches] as const
}

export function useIsContainerPortrait<T extends HTMLElement = HTMLDivElement>() {
  const [ref, matches] = useContainerQuery<T>({ orientation: 'portrait' })
  return [ref, matches] as const
}

export function useIsContainerLandscape<T extends HTMLElement = HTMLDivElement>() {
  const [ref, matches] = useContainerQuery<T>({ orientation: 'landscape' })
  return [ref, matches] as const
}
