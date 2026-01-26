'use client'

import { ReactNode, useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface PageWrapperProps {
  children: ReactNode
  minLoadingTime?: number
  loadingMessage?: string
}

/**
 * PageWrapper - Now delegates loading to global LoadingContext
 * No longer shows its own loading overlay (handled by LoadingProvider)
 */
export default function PageWrapper({
  children,
  minLoadingTime = 300,
  loadingMessage = 'Đang tải...'
}: PageWrapperProps) {
  // Just render children - loading is handled globally
  return <>{children}</>
}

/**
 * usePageLoading - Hook for pages that need local loading control
 * Now returns immediately (no delay) since global loading handles transitions
 */
export function usePageLoading(initialLoading = false, minTime = 0) {
  // Always return false - global loading handles page transitions
  const [loading, setLoading] = useState(false)

  const finishLoading = useCallback(() => {
    setLoading(false)
  }, [])

  return { loading, setLoading, finishLoading }
}

