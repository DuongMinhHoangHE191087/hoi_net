'use client'

import { ReactNode, useState, useEffect } from 'react'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { useSiteSettings, DEFAULT_SITE_SETTINGS, HOINET_LOGO_URL } from '@/hooks/useSiteSettings'
import InitialLoading from '@/components/InitialLoading'
import { ViewTransitionsStyles, TransitionProgressBar } from '@/hooks/usePageTransitions'

/**
 * LoadingWrapper - Connects LoadingProvider with SiteSettings
 * Must be used inside SiteSettingsProvider
 * Always defaults to Hồi Nét branding
 * 
 * ✅ OPTIMIZED: 
 * - CLS prevention with fixed height loading space
 * - Initial loading on page reload/first visit
 * - Smooth transitions between pages
 * - Progress bar for navigation feedback
 */
export default function LoadingWrapper({ children }: { children: ReactNode }) {
  const { data: settings, isLoading: isSettingsLoading } = useSiteSettings()
  const [showInitialLoading, setShowInitialLoading] = useState(true)

  // Get branding from settings - always default to Hồi Nét
  const brandName = settings?.brand_name || settings?.site_name || DEFAULT_SITE_SETTINGS.brand_name
  const logoUrl = settings?.site_logo_url || settings?.brand_logo_url || HOINET_LOGO_URL

  // Hide initial loading after settings loaded and content ready
  useEffect(() => {
    // If settings loaded or timeout, hide initial loading
    const timer = setTimeout(() => {
      setShowInitialLoading(false)
    }, isSettingsLoading ? 2000 : 500)

    if (!isSettingsLoading) {
      // Cho content render xong
      requestAnimationFrame(() => {
        setTimeout(() => setShowInitialLoading(false), 300)
      })
    }

    return () => clearTimeout(timer)
  }, [isSettingsLoading])

  return (
    <LoadingProvider brandName={brandName} logoUrl={logoUrl}>
      {/* 🎨 View Transitions CSS */}
      <ViewTransitionsStyles />
      
      {/* 📊 Progress Bar cho navigation */}
      <TransitionProgressBar />
      
      {/* 🚀 Initial Loading - hiển thị khi page reload */}
      {showInitialLoading && (
        <InitialLoading 
          brandName={brandName} 
          logoUrl={logoUrl}
          minDuration={400}
        />
      )}
      
      <style>{`
        /* ✅ CLS Prevention: Reserve fixed height for loading indicator */
        .loading-overlay {
          min-height: 80px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
        }
        
        /* Prevent layout shift when loading appears/disappears */
        html {
          scroll-behavior: smooth;
        }
        
        /* Smooth page transitions */
        .page-transition-enter {
          opacity: 0;
          transform: translateY(10px);
        }
        .page-transition-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 200ms ease-out, transform 200ms ease-out;
        }
      `}</style>
      {children}
    </LoadingProvider>
  )
}

