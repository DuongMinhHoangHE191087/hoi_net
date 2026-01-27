'use client'

import Image from 'next/image'
import { useSiteSettingsOptional } from '@/contexts/SiteSettingsContext'
import { HOINET_LOGO_URL } from '@/hooks/useSiteSettings'

type BrandLogoProps = {
  src?: string
  alt?: string
  className?: string
  priority?: boolean
}

export default function BrandLogo({ src, alt, className, priority }: BrandLogoProps) {
  const settings = useSiteSettingsOptional()

  const resolvedSrc =
    src ||
    settings?.siteLogoUrl ||
    settings?.brandLogoUrl ||
    settings?.siteFaviconUrl ||
    HOINET_LOGO_URL

  const resolvedAlt = alt || settings?.siteName || 'Logo'

  return (
    <Image
      src={resolvedSrc}
      alt={resolvedAlt}
      width={128}
      height={128}
      className={className || ''}
      priority={priority}
    />
  )
}
