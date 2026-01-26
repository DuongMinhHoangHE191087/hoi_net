'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Inner component that uses useSearchParams
 */
function TopLoadingBarInner() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const progressIntervalRef = useRef<NodeJS.Timeout>()
  const completionTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Start IMMEDIATELY on route change
    setIsLoading(true)
    setProgress(5)

    // Increment progress gradually
    let currentProgress = 5
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        currentProgress = prev + Math.random() * 10

        // Slow down as we approach completion
        if (currentProgress >= 70 && currentProgress < 90) {
          return prev + Math.random() * 3
        }
        if (currentProgress >= 90) {
          currentProgress = 90
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
          }
          return 90
        }
        return currentProgress
      })
    }, 150)

    // Check if page is ready
    const checkPageReady = () => {
      if (document.readyState === 'complete') {
        // Wait a bit more for React hydration
        completionTimerRef.current = setTimeout(() => {
          setProgress(100)
          setTimeout(() => {
            setIsLoading(false)
            setProgress(0)
          }, 400)
        }, 300)
      } else {
        const handler = () => {
          if (document.readyState === 'complete') {
            completionTimerRef.current = setTimeout(() => {
              setProgress(100)
              setTimeout(() => {
                setIsLoading(false)
                setProgress(0)
              }, 400)
            }, 300)
          }
        }
        document.addEventListener('readystatechange', handler)
        return () => document.removeEventListener('readystatechange', handler)
      }
    }

    // Start checking after a short delay
    const readyCheckTimeout = setTimeout(checkPageReady, 200)

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current)
      clearTimeout(readyCheckTimeout)
    }
  }, [pathname, searchParams])

  if (!isLoading && progress === 0) return null

  return (
    <>
      {/* Top loading bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-[10000] transition-opacity duration-200"
        style={{
          opacity: isLoading ? 1 : 0,
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-500 transition-all duration-300 ease-out shadow-lg"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(255, 107, 157, 0.8)',
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Glowing dot at the end */}
      <div
        className="fixed top-0 h-1 w-3 z-[10001] transition-all duration-300"
        style={{
          left: `${progress}%`,
          opacity: isLoading ? 1 : 0,
        }}
      >
        <div className="w-3 h-3 -mt-1 bg-pink-500 rounded-full shadow-glow animate-pulse" />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }

        .shadow-glow {
          box-shadow: 0 0 8px rgba(236, 72, 153, 0.8),
                      0 0 12px rgba(236, 72, 153, 0.6);
        }
      `}</style>
    </>
  )
}

/**
 * ⚡ Top Loading Bar - INSTANT FEEDBACK
 * - Shows IMMEDIATELY when route changes
 * - Waits for page to be fully ready (DOM + resources)
 * - Smooth progress animation
 * - Pure CSS, lightweight, GPU accelerated
 */
export default function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarInner />
    </Suspense>
  )
}

