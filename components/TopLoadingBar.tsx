'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Inner component that uses useSearchParams
 */
function TopLoadingBarInner() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Start IMMEDIATELY
    setIsLoading(true)
    setProgress(20)

    // Fast progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 80) // Very fast: 80ms

    // Complete quickly
    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 150)
    }, 150)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [pathname, searchParams])

  if (!isLoading && progress === 0) return null

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-1 z-[10000] transition-opacity duration-100"
        style={{
          opacity: isLoading ? 1 : 0,
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-500 transition-all duration-100 ease-out shadow-lg"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(255, 107, 157, 0.8)',
          }}
        />
      </div>

      {/* Glowing dot at the end */}
      <div
        className="fixed top-0 h-1 w-3 z-[10001] transition-all duration-100"
        style={{
          left: `${progress}%`,
          opacity: isLoading ? 1 : 0,
        }}
      >
        <div className="w-3 h-3 -mt-1 bg-pink-500 rounded-full shadow-glow animate-pulse" />
      </div>
    </>
  )
}

/**
 * ⚡ Top Loading Bar - INSTANT FEEDBACK
 * Shows IMMEDIATELY when user clicks a link
 * Pure CSS, no dependencies, super lightweight
 * Wrapped in Suspense for Next.js 14 compatibility
 */
export default function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarInner />
    </Suspense>
  )
}
