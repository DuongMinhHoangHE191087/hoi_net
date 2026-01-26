'use client'

import { ReactNode } from 'react'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { useSiteSettings, DEFAULT_SITE_SETTINGS, HOINET_LOGO_URL } from '@/hooks/useSiteSettings'

/**
 * LoadingWrapper - Connects LoadingProvider with SiteSettings
 * Must be used inside SiteSettingsProvider
 * Always defaults to Hồi Nét branding
 * 
 * ✅ OPTIMIZED: CLS prevention with fixed height loading space
 */
export default function LoadingWrapper({ children }: { children: ReactNode }) {
  const { data: settings } = useSiteSettings()

  // Get branding from settings - always default to Hồi Nét
  const brandName = settings?.brand_name || settings?.site_name || DEFAULT_SITE_SETTINGS.brand_name
  const logoUrl = settings?.site_logo_url || settings?.brand_logo_url || HOINET_LOGO_URL

  return (
    <LoadingProvider brandName={brandName} logoUrl={logoUrl}>
      <style>{`
        /* ✅ CLS Prevention: Reserve fixed height for loading indicator */
        .loading-overlay {
          min-height: 80px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          pointer-events: none;
        }
        
        /* Prevent layout shift when loading appears/disappears */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      {children}
    </LoadingProvider>
  )
}

