'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { FullScreenLoading } from '@/components/UniversalLoading'

interface PageWrapperProps {
  children: ReactNode
  minLoadingTime?: number
  loadingVariant?: 'spinner' | 'dots' | 'pulse' | 'sparkle'
  loadingMessage?: string
}

export default function PageWrapper({
  children,
  minLoadingTime = 300,
  loadingVariant = 'spinner',
  loadingMessage = 'Đang tải...'
}: PageWrapperProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Show loading immediately
    setIsLoading(true)
    const startTime = Date.now()

    const finishLoading = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minLoadingTime - elapsed)

      setTimeout(() => {
        setIsLoading(false)
      }, remaining)
    }

    // Finish loading ASAP
    finishLoading()

    return () => {
      setIsLoading(false)
    }
  }, [pathname, minLoadingTime])

  // NO ANIMATIONS - INSTANT SWITCH
  if (isLoading) {
    return (
      <FullScreenLoading message={loadingMessage} />
    )
  }

  return <>{children}</>
}

// Hook for programmatic loading control
export function usePageLoading(initialLoading = true, minTime = 1000) {
  const [loading, setLoading] = useState(initialLoading)
  const [startTime] = useState(Date.now())

  const finishLoading = () => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, minTime - elapsed)

    setTimeout(() => {
      setLoading(false)
    }, remaining)
  }

  return { loading, setLoading, finishLoading }
}
