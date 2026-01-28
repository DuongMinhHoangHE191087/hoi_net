'use client'

import { ReactNode, useState, useEffect } from 'react'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { useSiteSettings, DEFAULT_SITE_SETTINGS, HOINET_LOGO_URL } from '@/hooks/useSiteSettings'
import UniversalLoading from '@/components/UniversalLoading'
import { ViewTransitionsStyles, TransitionProgressBar } from '@/hooks/usePageTransitions'

/**
 * LoadingWrapper - Connects LoadingProvider with SiteSettings
 * Must be used inside SiteSettingsProvider
 * Always defaults to Hồi Nét branding
 * 
 * ✅ OPTIMIZED: 
 * - CLS prevention with fixed height loading space
 * - Initial loading on page reload/first visit using UniversalLoading
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
    let isMounted = true
    
    const hideLoading = () => {
      if (!isMounted) return
      
      // Đợi DOM ready và minimum 1 giây
      const minDuration = 1000
      const startTime = Date.now()
      
      const checkReady = () => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, minDuration - elapsed)
        
        if (document.readyState === 'complete' && elapsed >= minDuration) {
          setTimeout(() => {
            if (isMounted) {
              setShowInitialLoading(false)
            }
          }, 150) // Fade out time
        } else {
          setTimeout(checkReady, remaining || 100)
        }
      }
      
      if (document.readyState === 'complete') {
        setTimeout(() => {
          if (isMounted) checkReady()
        }, minDuration)
      } else {
        window.addEventListener('load', checkReady, { once: true })
        // Fallback timeout
        setTimeout(checkReady, minDuration + 1000)
      }
    }

    if (!isSettingsLoading) {
      requestAnimationFrame(hideLoading)
    } else {
      // If settings still loading, wait a bit longer
      setTimeout(hideLoading, 500)
    }

    return () => {
      isMounted = false
    }
  }, [isSettingsLoading])

  return (
    <LoadingProvider brandName={brandName} logoUrl={logoUrl}>
      {/* 🎨 View Transitions CSS */}
      <ViewTransitionsStyles />
      
      {/* 📊 Progress Bar cho navigation */}
      <TransitionProgressBar />
      
      {/* 🚀 Initial Loading - dùng UniversalLoading khi page reload */}
      {showInitialLoading && (
        <div className="fixed inset-0 z-[10000]">
          <UniversalLoading
            message="Đang tải..."
            showProgress={false}
            fullScreen
            brandName={brandName}
            logoUrl={logoUrl}
            variant="default"
          />
        </div>
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

