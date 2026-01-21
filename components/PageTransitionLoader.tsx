'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import UniversalLoading from './UniversalLoading'

/**
 * Inner component that uses useSearchParams
 */
function PageTransitionLoaderInner() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Show loading IMMEDIATELY on route change
    setIsLoading(true)
    setProgress(0)

    // Fast progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 20
      })
    }, 100) // Faster interval: 100ms instead of 150ms

    // Hide quickly after navigation complete
    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200) // Faster fade: 200ms instead of 400ms
    }, 200) // Show for minimum 200ms instead of 300ms

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div
      className="fixed inset-0 z-[9999] transition-opacity duration-150"
      style={{
        opacity: isLoading ? 1 : 0,
        pointerEvents: isLoading ? 'all' : 'none',
      }}
    >
      <UniversalLoading
        fullScreen
        message="Đang chuyển trang..."
        showProgress
        progress={progress}
        variant="default"
      />
    </div>
  )
}

/**
 * ✅ Page Transition Loader
 * Sử dụng UniversalLoading component
 * Chặn interaction khi chuyển trang
 * Wrapped in Suspense for Next.js 14 compatibility
 */
export default function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <PageTransitionLoaderInner />
    </Suspense>
  )
}
