/**
 * Hero Image Component
 * 
 * Optimized for LCP (Largest Contentful Paint)
 * - Uses priority loading
 * - Preloads image
 * - Optimized sizes for different viewports
 */

'use client'

import Image from 'next/image'
import { useState } from 'react'

interface HeroImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
}

export default function HeroImage({
  src,
  alt,
  className = '',
  width,
  height,
  fill = false,
  sizes = '100vw',
}: HeroImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {/* Blur placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-inherit" />
      )}
      
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority // Critical for LCP
          sizes={sizes}
          className={`object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 1200}
          height={height || 630}
          priority // Critical for LCP
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  )
}

/**
 * Lazy Image Component
 * 
 * For below-the-fold images
 * - Uses lazy loading
 * - Skeleton placeholder
 */
export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  fill = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: HeroImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Không thể tải ảnh</span>
      </div>
    )
  }

  return (
    <div className={`relative lazy-image-container ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded-inherit" />
      )}
      
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          loading="lazy"
          sizes={sizes}
          className={`object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 400}
          height={height || 300}
          loading="lazy"
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}
