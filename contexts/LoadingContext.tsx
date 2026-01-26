'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import UniversalLoading from '@/components/UniversalLoading'

/**
 * 🎨 UNIFIED LOADING SYSTEM
 * 
 * Hệ thống loading thống nhất duy nhất cho toàn app
 * Sử dụng UniversalLoading component đẹp
 * 
 * Sử dụng:
 * - const { startLoading, stopLoading } = useGlobalLoading()
 * - startLoading('Đang xử lý...') 
 * - stopLoading()
 */

// ============================================
// CONTEXT TYPES
// ============================================

interface LoadingContextType {
  isLoading: boolean
  progress: number
  startLoading: (message?: string) => void
  stopLoading: () => void
  setProgress: (progress: number) => void
  message: string
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useGlobalLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    // Fallback nếu không có provider
    return {
      isLoading: false,
      progress: 0,
      message: '',
      startLoading: () => {},
      stopLoading: () => {},
      setProgress: () => {},
    }
  }
  return context
}

// Alias ngắn gọn hơn
export const useAppLoading = useGlobalLoading

// ============================================
// PROVIDER
// ============================================

interface LoadingProviderProps {
  children: ReactNode
  brandName?: string
  logoUrl?: string
}

export function LoadingProvider({ children, brandName, logoUrl }: LoadingProviderProps) {
  const pathname = usePathname()
  // Start with loading OFF - let individual navigations trigger it
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgressState] = useState(0)
  const [message, setMessage] = useState('Đang tải...')
  const [prevPathname, setPrevPathname] = useState(pathname)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback((msg = 'Đang tải...') => {
    setIsLoading(true)
    setMessage(msg)
    setProgressState(30)
  }, [])

  const stopLoading = useCallback(() => {
    setProgressState(100)
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
    // Fade out quickly
    setTimeout(() => {
      setIsLoading(false)
      setProgressState(0)
    }, 150)
  }, [])

  const setProgress = useCallback((value: number) => {
    setProgressState(Math.min(100, Math.max(0, value)))
  }, [])

  // 🚀 Auto loading on route changes - detect link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement | null
      
      if (link) {
        const href = link.getAttribute('href')
        // Only for internal navigation links
        if (
          href && 
          href.startsWith('/') && 
          !href.startsWith('//') && 
          href !== pathname && 
          !href.startsWith('#')
        ) {
          startLoading('Đang tải...')
        }
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [pathname, startLoading])

  // 🚀 Stop loading when route changes complete
  useEffect(() => {
    // Route has changed, stop loading immediately
    if (pathname !== prevPathname) {
      setPrevPathname(pathname)
      // Force stop loading immediately when pathname changes
      setIsLoading(false)
      setProgressState(0)
      // Clear timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [pathname, prevPathname])
  
  // ✅ Safety timeout: Force stop loading after 3 seconds
  useEffect(() => {
    if (isLoading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      
      // Set new timeout
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('[Loading] Safety timeout: Force stopping loading after 3s')
        setIsLoading(false)
        setProgressState(0)
        loadingTimeoutRef.current = null
      }, 3000)
      
      return () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
      }
    }
  }, [isLoading])

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        progress,
        startLoading,
        stopLoading,
        setProgress,
        message,
      }}
    >
      {/* Loading overlay - doesn't block content */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <UniversalLoading
            message={message}
            showProgress
            progress={progress}
            fullScreen
            brandName={brandName}
            logoUrl={logoUrl}
          />
        </div>
      )}
      {/* Content always visible and interactive */}
      {children}
    </LoadingContext.Provider>
  )
}

// ============================================
// PAGE LOADING - Dùng cho loading.tsx files
// ============================================

export function PageLoading({ message = 'Đang tải...' }: { message?: string }) {
  return <UniversalLoading message={message} fullScreen />
}

// ============================================
// INLINE LOADING - Dùng trong components
// ============================================

export function InlineLoading({ message = 'Đang tải...' }: { message?: string }) {
  return <UniversalLoading message={message} variant="minimal" />
}

// ============================================
// SKELETON - Placeholder loading
// ============================================

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
}

