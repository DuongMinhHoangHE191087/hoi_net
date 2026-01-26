'use client'

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

// Default fallback avatar - Hồi Nét logo
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png'

// Default user avatar (simple user icon placeholder)
const DEFAULT_USER_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
  fallbackType?: 'logo' | 'avatar' | 'placeholder'
  showPlaceholder?: boolean
}

/**
 * SafeImage Component
 * 
 * An image component that gracefully handles 404 errors
 * by falling back to a default image.
 * 
 * @example
 * <SafeImage 
 *   src={member.avatar} 
 *   alt={member.name}
 *   fallbackType="avatar"
 *   width={64}
 *   height={64}
 * />
 */
export default function SafeImage({
  src,
  alt,
  fallbackSrc,
  fallbackType = 'logo',
  showPlaceholder = true,
  className,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined)
  const [hasError, setHasError] = useState(false)

  // Get appropriate fallback based on type
  const getFallback = () => {
    if (fallbackSrc) return fallbackSrc
    switch (fallbackType) {
      case 'avatar':
        return DEFAULT_USER_AVATAR
      case 'placeholder':
        return `https://placehold.co/${props.width || 100}x${props.height || 100}/f3f4f6/9ca3af?text=${encodeURIComponent(alt?.charAt(0) || '?')}`
      case 'logo':
      default:
        return DEFAULT_AVATAR
    }
  }

  useEffect(() => {
    // Reset error state when src changes
    setHasError(false)
    if (src && typeof src === 'string' && src.trim()) {
      setImgSrc(src)
    } else {
      setImgSrc(getFallback())
    }
  }, [src])

  const handleError = () => {
    if (!hasError) {
      console.warn(`[SafeImage] Image failed to load: ${src}`)
      setHasError(true)
      setImgSrc(getFallback())
    }
  }

  // If no src and showPlaceholder is false, don't render
  if (!src && !showPlaceholder) {
    return null
  }

  return (
    <Image
      {...props}
      src={imgSrc || getFallback()}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}

/**
 * SafeAvatar - Specialized SafeImage for avatars
 */
interface SafeAvatarProps {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackSrc?: string
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96
}

export function SafeAvatar({
  src,
  alt,
  size = 'md',
  className = '',
  fallbackSrc
}: SafeAvatarProps) {
  const [imgSrc, setImgSrc] = useState<string>(DEFAULT_USER_AVATAR)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const dimension = sizeMap[size]
  const MAX_RETRIES = 2

  useEffect(() => {
    setHasError(false)
    setRetryCount(0)
    if (src && src.trim()) {
      // Handle Google avatar URLs - add referrerPolicy hint
      setImgSrc(src)
    } else {
      // Generate avatar from name
      setImgSrc(`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(alt || 'user')}`)
    }
  }, [src, alt])

  const handleError = () => {
    // Retry logic for transient failures (especially Google avatars)
    if (retryCount < MAX_RETRIES && src?.includes('googleusercontent.com')) {
      setRetryCount(prev => prev + 1)
      // Add timestamp to bust cache and retry
      setImgSrc(`${src}${src.includes('?') ? '&' : '?'}retry=${Date.now()}`)
      return
    }
    
    if (!hasError) {
      // Only log once per src, not on retries
      if (retryCount === 0) {
        console.warn(`[SafeAvatar] Avatar failed to load: ${src}`)
      }
      setHasError(true)
      setImgSrc(fallbackSrc || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(alt || 'user')}`)
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={dimension}
      height={dimension}
      className={`rounded-full object-cover ${className}`}
      onError={handleError}
      style={{ width: dimension, height: dimension }}
    />
  )
}

