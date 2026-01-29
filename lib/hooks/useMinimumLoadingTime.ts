'use client'

import React, { useEffect, useState } from 'react'
import { LOADING_CONFIG } from '@/lib/loading-config'

/**
 * ✅ Hook để quản lý minimum loading time trên client
 * 
 * Đảm bảo:
 * - Loading hiển thị tối thiểu N ms
 * - Content không bị flash/jump
 * - UX mượt mà, chuyên nghiệp
 * 
 * @param initiallyLoading - Có đang loading khi component mount không
 * @param minimumMs - Thời gian tối thiểu (default 1500ms)
 * @returns true nếu nên hiển thị loading, false nếu nên hiển thị content
 */
export function useMinimumLoadingTime(
  initiallyLoading: boolean = true,
  minimumMs: number = LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS
): boolean {
  const [shouldShowLoading, setShouldShowLoading] = useState(initiallyLoading)
  const [startTime] = useState(Date.now())
  const [hideLoading, setHideLoading] = useState(false)

  useEffect(() => {
    if (!hideLoading) {
      return
    }

    // Calculate remaining time
    const elapsedMs = Date.now() - startTime
    const remainingMs = minimumMs - elapsedMs

    if (remainingMs > 0) {
      // Still need to wait
      const timer = setTimeout(() => {
        setShouldShowLoading(false)
      }, remainingMs)

      return () => clearTimeout(timer)
    } else {
      // Already waited enough
      setShouldShowLoading(false)
    }
  }, [hideLoading, minimumMs, startTime])

  // Expose function to trigger hide loading
  useEffect(() => {
    // Set to hide loading after component mounts
    // Caller can trigger earlier by calling setHideLoading(true)
    const timer = setTimeout(() => {
      setHideLoading(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return shouldShowLoading
}
