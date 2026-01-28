'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  showLoader?: boolean
  fallbackSrc?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 85,
  sizes,
  objectFit = 'cover',
  showLoader = true,
  fallbackSrc = '/images/placeholder.jpg',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imgSrc, setImgSrc] = useState(src)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading Skeleton - CSS only */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer">
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="w-8 h-8 text-gray-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Không thể tải ảnh</p>
          </div>
        </div>
      )}

      {/* Optimized Image */}
      {fill ? (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className={`${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          quality={quality}
          priority={priority}
          sizes={sizes || '100vw'}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          width={width || 800}
          height={height || 600}
          className={`${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          quality={quality}
          priority={priority}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}

// ============ Variants ============

// Avatar Image with circular crop
export function AvatarImage({
  src,
  alt,
  size = 48,
  className = '',
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) {
  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        objectFit="cover"
        quality={90}
        fallbackSrc="/images/avatar-placeholder.png"
      />
    </div>
  )
}

// Thumbnail Image with aspect ratio
export function ThumbnailImage({
  src,
  alt,
  aspectRatio = '16/9',
  className = '',
}: {
  src: string
  alt: string
  aspectRatio?: string
  className?: string
}) {
  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio }}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        objectFit="cover"
        quality={80}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

// Hero Image with blur placeholder
export function HeroImage({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        objectFit="cover"
        quality={90}
        priority
        sizes="100vw"
      />
    </div>
  )
}

