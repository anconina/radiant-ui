import { ImgHTMLAttributes, useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  fallbackSrc?: string
  placeholderSrc?: string
  threshold?: number
  rootMargin?: string
  showSkeleton?: boolean
  aspectRatio?: string
  onLoadStart?: () => void
  onLoadComplete?: () => void
  onError?: (error: Error) => void
}

export function LazyImage({
  src,
  fallbackSrc = '/images/placeholder.jpg',
  placeholderSrc,
  alt = '',
  className,
  threshold = 0.1,
  rootMargin = '50px',
  showSkeleton = true,
  aspectRatio,
  onLoadStart,
  onLoadComplete,
  onError,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || '')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsIntersecting(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  // Load image when in viewport
  useEffect(() => {
    if (!isIntersecting) return

    setIsLoading(true)
    setHasError(false)
    onLoadStart?.()

    // Create a new image element to preload
    const img = new Image()

    img.onload = () => {
      setImageSrc(src)
      setIsLoading(false)
      onLoadComplete?.()
    }

    img.onerror = () => {
      setHasError(true)
      setIsLoading(false)
      setImageSrc(fallbackSrc)
      onError?.(new Error(`Failed to load image: ${src}`))
    }

    // Start loading the image
    img.src = src
  }, [isIntersecting, src, fallbackSrc, onLoadStart, onLoadComplete, onError])

  // Determine the current source to display
  const currentSrc = hasError ? fallbackSrc : imageSrc

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton loader */}
      {isLoading && showSkeleton && <Skeleton className="absolute inset-0 w-full h-full" />}

      {/* Placeholder blur effect */}
      {placeholderSrc && isLoading && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        loading="lazy"
        decoding="async"
        {...props}
      />

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto text-muted-foreground mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-muted-foreground">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Optimized picture element for responsive images
interface ResponsiveImageProps extends LazyImageProps {
  sources?: Array<{
    srcSet: string
    media?: string
    type?: string
  }>
}

export function ResponsiveImage({
  sources = [],
  src,
  alt,
  className,
  ...props
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <picture>
      {/* WebP and AVIF sources for better compression */}
      {sources.map((source, index) => (
        <source key={index} srcSet={source.srcSet} media={source.media} type={source.type} />
      ))}

      {/* Default image with lazy loading */}
      <LazyImage
        src={src}
        alt={alt}
        className={className}
        onLoadStart={() => setIsLoading(true)}
        onLoadComplete={() => setIsLoading(false)}
        {...props}
      />
    </picture>
  )
}

// Utility hook for generating responsive image sources
export function useResponsiveImageSources(
  baseSrc: string,
  options: {
    sizes?: number[]
    formats?: string[]
    quality?: number
  } = {}
) {
  const {
    sizes = [320, 640, 768, 1024, 1280, 1920],
    formats = ['avif', 'webp', 'jpg'],
    quality = 85,
  } = options

  const sources = formats.flatMap(format =>
    sizes.map(size => ({
      srcSet: `${baseSrc}?w=${size}&q=${quality}&fm=${format} ${size}w`,
      type: `image/${format}`,
      media: `(max-width: ${size}px)`,
    }))
  )

  return sources
}
