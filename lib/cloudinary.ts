// ============================================
// Cloudinary Image Optimization Helper
// ============================================

export interface CloudinaryTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop' | 'limit' | 'pad'
  quality?: number | 'auto'
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif'
  dpr?: number | 'auto'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
  effect?: string
  blur?: number
}

/**
 * Builds a Cloudinary URL with transformations
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined')
    return publicId
  }

  // Remove existing Cloudinary URL if present
  const cleanPublicId = publicId
    .replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, '')
    .replace(/^v\d+\//, '')

  const transformations: string[] = []

  // Width and Height
  if (options.width) transformations.push(`w_${options.width}`)
  if (options.height) transformations.push(`h_${options.height}`)

  // Crop mode
  if (options.crop) transformations.push(`c_${options.crop}`)

  // Quality (auto is recommended for best automatic optimization)
  const quality = options.quality ?? 'auto'
  transformations.push(`q_${quality}`)

  // Format (auto will choose best format - WebP for Chrome, AVIF for newer browsers)
  const format = options.format ?? 'auto'
  transformations.push(`f_${format}`)

  // DPR (Device Pixel Ratio) - auto is recommended
  const dpr = options.dpr ?? 'auto'
  transformations.push(`dpr_${dpr}`)

  // Gravity (for intelligent cropping)
  if (options.gravity) transformations.push(`g_${options.gravity}`)

  // Effects
  if (options.effect) transformations.push(`e_${options.effect}`)
  if (options.blur) transformations.push(`e_blur:${options.blur}`)

  const transformString = transformations.join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${cleanPublicId}`
}

// ============ Preset Configurations ============

/**
 * Thumbnail - Small, optimized for lists and grids
 */
export function getThumbnailUrl(publicId: string, size = 200): string {
  return buildCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Preview - Medium size for previews and cards
 */
export function getPreviewUrl(publicId: string, width = 600): string {
  return buildCloudinaryUrl(publicId, {
    width,
    crop: 'limit',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Full Size - Large, high quality for viewing
 */
export function getFullSizeUrl(publicId: string, maxWidth = 1920): string {
  return buildCloudinaryUrl(publicId, {
    width: maxWidth,
    crop: 'limit',
    quality: 85,
    format: 'auto',
  })
}

/**
 * Avatar - Circular crop with face detection
 */
export function getAvatarUrl(publicId: string, size = 150): string {
  return buildCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Blur Placeholder - Tiny, blurred version for placeholder
 */
export function getBlurPlaceholder(publicId: string): string {
  return buildCloudinaryUrl(publicId, {
    width: 40,
    quality: 30,
    blur: 1000,
    format: 'auto',
  })
}

/**
 * Responsive - Returns srcset for responsive images
 */
export function getResponsiveSrcSet(
  publicId: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return widths
    .map(width => {
      const url = buildCloudinaryUrl(publicId, {
        width,
        crop: 'limit',
        quality: 'auto',
        format: 'auto',
      })
      return `${url} ${width}w`
    })
    .join(', ')
}

// ============ React Hook ============

import { useMemo } from 'react'

export interface UseCloudinaryImageOptions extends CloudinaryTransformOptions {
  generateSrcSet?: boolean
  srcSetWidths?: number[]
}

export function useCloudinaryImage(
  publicId: string | undefined | null,
  options: UseCloudinaryImageOptions = {}
) {
  return useMemo(() => {
    if (!publicId) {
      return {
        src: '',
        srcSet: '',
        blurDataUrl: '',
      }
    }

    const src = buildCloudinaryUrl(publicId, options)
    const srcSet = options.generateSrcSet
      ? getResponsiveSrcSet(publicId, options.srcSetWidths)
      : ''
    const blurDataUrl = getBlurPlaceholder(publicId)

    return {
      src,
      srcSet,
      blurDataUrl,
    }
  }, [publicId, options])
}

// ============ Next.js Image Loader ============

export const cloudinaryLoader = ({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) => {
  return buildCloudinaryUrl(src, {
    width,
    quality: quality || 'auto',
    format: 'auto',
    crop: 'limit',
  })
}

// ============ Example Usage ============

/*
// In Next.js config (next.config.js):
module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudinary.ts',
  },
}

// In components:
import { useCloudinaryImage, getThumbnailUrl } from '@/lib/cloudinary'

// Option 1: Direct URL
<img src={getThumbnailUrl('sample-image', 300)} alt="Sample" />

// Option 2: With hook
const { src, srcSet, blurDataUrl } = useCloudinaryImage('sample-image', {
  width: 800,
  quality: 'auto',
  generateSrcSet: true,
})

<img
  src={src}
  srcSet={srcSet}
  alt="Sample"
  style={{ backgroundImage: `url(${blurDataUrl})` }}
/>

// Option 3: With Next.js Image
import Image from 'next/image'

<Image
  src="sample-image"
  width={800}
  height={600}
  alt="Sample"
  loader={cloudinaryLoader}
/>
*/
