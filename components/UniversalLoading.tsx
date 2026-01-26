'use client'

import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

// ✅ Fixed positions to prevent hydration mismatch
const PARTICLE_POSITIONS = [
  { left: 15, top: 8 },
  { left: 78, top: 22 },
  { left: 42, top: 65 },
  { left: 88, top: 45 },
  { left: 25, top: 85 },
  { left: 55, top: 12 },
  { left: 92, top: 78 },
  { left: 8, top: 55 },
  { left: 65, top: 92 },
  { left: 35, top: 38 },
  { left: 72, top: 5 },
  { left: 18, top: 72 },
  { left: 48, top: 28 },
  { left: 82, top: 62 },
  { left: 5, top: 95 },
]

/**
 * 🎨 UNIVERSAL LOADING COMPONENT
 *
 * Component loading TOÀN CỤC duy nhất cho toàn bộ app
 *
 * Features:
 * - Gradient đẹp khớp theme app
 * - Logo app
 * - Animated spinner
 * - Progress bar
 * - Floating particles
 * - Mượt mà 60 FPS
 * - Đồng bộ toàn app
 *
 * Dùng cho:
 * - Page transitions
 * - Data loading
 * - Form submissions
 * - File uploads
 * - Authentication
 */

interface UniversalLoadingProps {
  message?: string
  showProgress?: boolean
  progress?: number
  fullScreen?: boolean
  variant?: 'default' | 'minimal'
  // Dynamic branding from database
  brandName?: string
  logoUrl?: string
}

// Default Hồi Nét logo
const HOINET_LOGO_URL = 'https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png'

export default function UniversalLoading({
  message = 'Đang tải...',
  showProgress = false,
  progress = 0,
  fullScreen = false,
  variant = 'default',
  brandName = 'Hồi Nét',
  logoUrl = HOINET_LOGO_URL,
}: UniversalLoadingProps) {
  // ✅ Fix hydration mismatch - only render particles on client
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const containerClass = fullScreen
    ? 'fixed inset-0 z-[9999] flex items-center justify-center'
    : 'flex items-center justify-center min-h-[400px]'

  return (
    <div className={`${containerClass} transition-opacity duration-300`}>
      {/* ✅ Gradient Background - Khớp theme app */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-indigo-100">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 via-pink-200/30 to-blue-200/30 animate-gradient-shift" />
        </div>

        {variant === 'default' && (
          <>
            {/* Floating particles - only render on client to prevent hydration mismatch */}
            {isMounted && (
              <div className="absolute inset-0 overflow-hidden">
                {PARTICLE_POSITIONS.map((pos, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                    style={{
                      left: `${pos.left}%`,
                      top: `${pos.top}%`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: `${3 + (i % 3)}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Radial glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-radial from-amber-200/30 via-pink-200/20 to-transparent rounded-full blur-3xl animate-pulse-slow" />
            </div>
          </>
        )}
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {/* Glass card */}
        <div className="glassmorphism-strong p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center backdrop-blur-xl">
          {/* Logo - Dynamic from database */}
          <div className="mb-6 relative">
            <div className="relative inline-block">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={brandName}
                  className="w-16 h-16 object-contain mx-auto mb-2 animate-scale-pulse"
                />
              ) : (
                <div className="text-5xl font-bold gradient-text mb-2 animate-scale-pulse">
                  📸
                </div>
              )}
              <h2 className="text-2xl font-bold gradient-text-alt">
                {brandName}
              </h2>
            </div>
          </div>

          {/* Spinner with glow */}
          <div className="relative mb-6 flex items-center justify-center">
            {/* Outer glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full opacity-20 animate-ping" />
            </div>

            {/* Middle glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full opacity-30 blur-md animate-pulse" />
            </div>

            {/* Spinner */}
            <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
          </div>

          {/* Message */}
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {message}
          </h3>
          <p className="text-gray-600 text-sm">
            Vui lòng chờ trong giây lát
          </p>

          {/* Progress bar */}
          {showProgress && (
            <div className="mt-6 w-full">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-500 ease-out rounded-full relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{Math.round(progress)}%</p>
            </div>
          )}

          {/* Security badge */}
          <p className="text-xs text-gray-500 mt-6 opacity-60 flex items-center justify-center gap-1">
            <span className="text-green-600">🔒</span>
            Kết nối được bảo vệ
          </p>
        </div>
      </div>

      {/* ✅ CSS Animations - GPU Accelerated */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-30%, -30%) rotate(180deg) scale(1.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.5;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes scale-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-scale-pulse {
          animation: scale-pulse 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        /* Gradient text */
        .gradient-text-alt {
          background: linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  )
}

/**
 * Variants cho các trường hợp khác nhau
 */

// Full screen loading (page transitions)
export function FullScreenLoading({ message }: { message?: string }) {
  return <UniversalLoading fullScreen message={message} variant="default" />
}

// Minimal loading (trong components)
export function MinimalLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{message || 'Đang tải...'}</p>
      </div>
    </div>
  )
}

// Loading với progress
export function ProgressLoading({
  message,
  progress,
}: {
  message?: string
  progress: number
}) {
  return (
    <UniversalLoading
      fullScreen
      message={message}
      showProgress
      progress={progress}
      variant="default"
    />
  )
}

/**
 * Hook để dùng loading
 */
export function useLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Đang tải...')

  const showLoading = (msg?: string) => {
    setIsLoading(true)
    setMessage(msg || 'Đang tải...')
    setProgress(0)
  }

  const hideLoading = () => {
    setProgress(100)
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 300)
  }

  const updateProgress = (value: number) => {
    setProgress(Math.min(100, Math.max(0, value)))
  }

  return {
    isLoading,
    progress,
    message,
    showLoading,
    hideLoading,
    updateProgress,
    LoadingComponent: () =>
      isLoading ? (
        <UniversalLoading
          fullScreen
          message={message}
          showProgress={progress > 0}
          progress={progress}
        />
      ) : null,
  }
}

