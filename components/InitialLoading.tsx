'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * 🎨 INITIAL LOADING COMPONENT (Optimized for Next.js 16)
 * 
 * Hiển thị loading overlay khi:
 * - Trang load lần đầu
 * - User reload trang (F5)
 * - Hydration đang diễn ra
 * 
 * Features:
 * - Hiển thị ngay lập tức (inline CSS)
 * - Logo từ Cloudinary
 * - Fade out mượt mà khi content ready
 * - GPU-accelerated animations
 * - SSR-safe (no hydration mismatch)
 * - Memoized for performance
 */

// Logo URL mặc định
const HOINET_LOGO_URL = 'https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png'

interface InitialLoadingProps {
  brandName?: string
  logoUrl?: string
  minDuration?: number // Minimum display time in ms
}

function InitialLoadingComponent({
  brandName = 'Hồi Nét',
  logoUrl = HOINET_LOGO_URL,
  minDuration = 300,
}: InitialLoadingProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const handleFadeOut = useCallback(() => {
    setIsFadingOut(true)
    // Remove from DOM after animation completes
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let isMounted = true
    let loadTimeout: ReturnType<typeof setTimeout>
    let fadeTimeout: ReturnType<typeof setTimeout>

    const startFadeOut = () => {
      if (!isMounted) return
      handleFadeOut()
    }

    // Wait for minimum duration + DOM ready
    const checkReady = () => {
      if (document.readyState === 'complete') {
        loadTimeout = setTimeout(startFadeOut, minDuration)
      } else {
        window.addEventListener('load', () => {
          loadTimeout = setTimeout(startFadeOut, minDuration)
        }, { once: true })
        
        // Fallback timeout in case load event doesn't fire
        fadeTimeout = setTimeout(startFadeOut, minDuration + 2000)
      }
    }

    // Use requestAnimationFrame for smoother timing
    requestAnimationFrame(checkReady)

    return () => {
      isMounted = false
      clearTimeout(loadTimeout)
      clearTimeout(fadeTimeout)
    }
  }, [minDuration, handleFadeOut])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        pointerEvents: isFadingOut ? 'none' : 'all',
        willChange: 'opacity', // Hint for GPU acceleration
      }}
      aria-live="polite"
      aria-busy={!isFadingOut}
      role="status"
    >
      {/* Gradient Background - GPU accelerated */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE4E1 50%, #E8E4F0 100%)',
          willChange: 'transform',
        }}
      >
        {/* Animated overlay */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)',
            animation: 'gradient-shift 8s ease-in-out infinite',
          }}
        />

        {/* Radial glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-96 h-96 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 70%)',
              animation: 'pulse-slow 3s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Glass card */}
        <div 
          className="p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Logo */}
          <div className="mb-6 relative">
            <div className="relative inline-block">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={brandName}
                  className="w-16 h-16 object-contain mx-auto mb-2"
                  style={{ animation: 'scale-pulse 2s ease-in-out infinite' }}
                />
              ) : (
                <div 
                  className="text-5xl font-bold mb-2"
                  style={{ animation: 'scale-pulse 2s ease-in-out infinite' }}
                >
                  📸
                </div>
              )}
              <h2 
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #6366f1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {brandName}
              </h2>
            </div>
          </div>

          {/* Spinner */}
          <div className="relative mb-6 flex items-center justify-center">
            {/* Outer glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #6366f1 100%)',
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
            </div>

            {/* Spinner icon */}
            <Loader2 
              className="w-16 h-16 text-amber-500 relative z-10"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </div>

          {/* Message */}
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Đang tải...
          </h3>
          <p className="text-gray-600 text-sm">
            Vui lòng chờ trong giây lát
          </p>

          {/* Progress shimmer */}
          <div className="mt-6 w-full">
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  width: '60%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #6366f1 100%)',
                  animation: 'progress-grow 2s ease-out infinite',
                }}
              >
                {/* Shimmer */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                    animation: 'shimmer 1.5s infinite',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Security badge */}
          <p className="text-xs text-gray-500 mt-6 opacity-60 flex items-center justify-center gap-1">
            <span className="text-green-600">🔒</span>
            Kết nối được bảo vệ
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }

        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes progress-grow {
          0% { width: 10%; }
          50% { width: 70%; }
          100% { width: 90%; }
        }
      `}</style>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
const InitialLoading = memo(InitialLoadingComponent)
InitialLoading.displayName = 'InitialLoading'

export default InitialLoading
