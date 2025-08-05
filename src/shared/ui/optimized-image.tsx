'use client'

import * as React from 'react'

import { cn } from '@/shared/lib/utils'

interface ImageSource {
  src: string
  type?: string
  media?: string
}

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  sources?: ImageSource[]
  width?: number | string
  height?: number | string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  fallbackSrc?: string
  sizes?: string
  quality?: number
  ref?: React.Ref<HTMLImageElement>
}

function OptimizedImage({
  src,
  alt,
  sources = [],
  width,
  height,
  loading = 'lazy',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  fallbackSrc,
  sizes,
  quality = 75,
  className,
  style,
  ref,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const [isInView, setIsInView] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const observerRef = React.useRef<IntersectionObserver | null>(null)

  // Merge refs
  React.useImperativeHandle(ref, () => imgRef.current!)

  // Setup Intersection Observer for lazy loading
  React.useEffect(() => {
    if (priority || loading !== 'lazy') {
      setIsInView(true)
      return
    }

    const element = imgRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      {
        rootMargin: '50px',
      }
    )

    observerRef.current.observe(element)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [loading, priority])

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = React.useCallback(() => {
    setIsError(true)
    if (fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc
    }
  }, [fallbackSrc])

  // Generate srcset for responsive images
  const generateSrcSet = React.useCallback((baseSrc: string) => {
    const widths = [640, 768, 1024, 1280, 1536]
    return widths
      .map(w => {
        // This assumes you have an image optimization service
        // You would replace this with your actual image URL pattern
        const optimizedSrc = baseSrc.replace(/(\.[^.]+)$/, `_${w}w$1`)
        return `${optimizedSrc} ${w}w`
      })
      .join(', ')
  }, [])

  const shouldRender = priority || isInView

  // Generate optimized sources
  const optimizedSources = React.useMemo(() => {
    const defaultSources: ImageSource[] = []

    // Add AVIF version if supported
    if (src && !src.endsWith('.svg')) {
      defaultSources.push({
        src: src.replace(/\.[^.]+$/, '.avif'),
        type: 'image/avif',
      })

      // Add WebP version
      defaultSources.push({
        src: src.replace(/\.[^.]+$/, '.webp'),
        type: 'image/webp',
      })
    }

    return [...defaultSources, ...sources]
  }, [src, sources])

  const imageStyle: React.CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width,
    height,
    backgroundColor: placeholder === 'blur' && blurDataURL ? undefined : '#f3f4f6',
  }

  return (
    <div style={containerStyle} className={cn('image-container', className)}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            objectFit: 'cover',
          }}
        />
      )}

      {shouldRender && (
        <picture>
          {/* Optimized sources */}
          {optimizedSources.map((source, index) => (
            <source
              key={index}
              srcSet={generateSrcSet(source.src)}
              type={source.type}
              media={source.media}
              sizes={sizes}
            />
          ))}

          {/* Main image */}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            onLoad={handleLoad}
            onError={handleError}
            style={imageStyle}
            sizes={sizes}
            {...props}
          />
        </picture>
      )}

      {/* Loading skeleton */}
      {!isLoaded && placeholder === 'empty' && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
    </div>
  )
}

OptimizedImage.displayName = 'OptimizedImage'

// Hook for preloading images
export function useImagePreload(src: string | string[]) {
  React.useEffect(() => {
    const sources = Array.isArray(src) ? src : [src]

    sources.forEach(source => {
      const img = new Image()
      img.src = source
    })
  }, [src])
}

// Component for responsive images with art direction
export interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'sources'> {
  desktop?: string
  tablet?: string
  mobile?: string
}

export function ResponsiveImage({ desktop, tablet, mobile, src, ...props }: ResponsiveImageProps) {
  const sources: ImageSource[] = []

  if (desktop) {
    sources.push({
      src: desktop,
      media: '(min-width: 1024px)',
    })
  }

  if (tablet) {
    sources.push({
      src: tablet,
      media: '(min-width: 768px)',
    })
  }

  if (mobile) {
    sources.push({
      src: mobile,
      media: '(max-width: 767px)',
    })
  }

  return <OptimizedImage src={src} sources={sources} {...props} />
}

export { OptimizedImage }
