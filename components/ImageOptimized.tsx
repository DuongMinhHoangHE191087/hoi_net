'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ImageOptimizedProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * Optimized Image Component
 *
 * Features:
 * - Uses next/image for automatic optimization
 * - Lazy loading by default
 * - Blur placeholder
 * - Responsive sizing
 * - Error handling with fallback
 * - Loading state
 *
 * Performance Benefits:
 * - Automatic WebP/AVIF format conversion
 * - Responsive images (serves correct size)
 * - Lazy loading (loads when in viewport)
 * - Blur placeholder for better perceived performance
 * - ~40-60% smaller file sizes
 */
export default function ImageOptimized({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  objectFit = 'cover',
  blurDataURL,
  onLoad,
  onError
}: ImageOptimizedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Fallback image for errors
  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-500">Không thể tải ảnh</p>
        </div>
      </div>
    )
  }

  // Generate simple blur placeholder if not provided
  const placeholder = blurDataURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4='

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${fill ? `object-${objectFit}` : ''}`}
        style={fill ? undefined : { objectFit }}
        priority={priority}
        placeholder="blur"
        blurDataURL={placeholder}
        onLoad={handleLoad}
        onError={handleError}
        sizes={fill ? '100vw' : undefined}
      />
    </div>
  )
}

/**
 * Usage Examples:
 *
 * // Basic usage
 * <ImageOptimized
 *   src="/images/photo.jpg"
 *   alt="Photo"
 *   width={800}
 *   height={600}
 * />
 *
 * // Fill container (responsive)
 * <div className="relative w-full h-64">
 *   <ImageOptimized
 *     src="/images/photo.jpg"
 *     alt="Photo"
 *     fill
 *     objectFit="cover"
 *   />
 * </div>
 *
 * // Priority loading (above fold)
 * <ImageOptimized
 *   src="/images/hero.jpg"
 *   alt="Hero"
 *   width={1920}
 *   height={1080}
 *   priority
 * />
 *
 * // With custom blur placeholder
 * <ImageOptimized
 *   src="/images/photo.jpg"
 *   alt="Photo"
 *   width={800}
 *   height={600}
 *   blurDataURL="data:image/jpeg;base64,..."
 * />
 */
