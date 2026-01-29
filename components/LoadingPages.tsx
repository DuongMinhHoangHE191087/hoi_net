'use client'

import UniversalLoading from '@/components/UniversalLoading'
import { LOADING_CONFIG } from '@/lib/loading-config'

/**
 * ✅ Client-side Loading Component Wrapper
 * 
 * Used by loading.tsx files (which must be Server Components in Next.js App Router)
 * This wrapper allows Server Components to render Client Components safely
 * 
 * All loading pages enforce MINIMUM_PAGE_LOAD_MS for smooth UX
 */

export function LoadingPage({ message }: { message?: string }) {
  return (
    <UniversalLoading 
      fullScreen 
      message={message} 
      variant="default"
      minDurationMs={LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS}
    />
  )
}

export function AdminLoadingPage() {
  return (
    <UniversalLoading 
      fullScreen 
      message="Đang tải Admin Panel..." 
      variant="default"
      minDurationMs={LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS}
    />
  )
}

export function BlogLoadingPage() {
  return (
    <UniversalLoading 
      fullScreen 
      message="Đang tải blog..." 
      variant="default"
      minDurationMs={LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS}
    />
  )
}

export function DashboardLoadingPage() {
  return (
    <UniversalLoading 
      fullScreen 
      message="Đang tải dashboard..." 
      variant="default"
      minDurationMs={LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS}
    />
  )
}

export function ProfileLoadingPage() {
  return (
    <UniversalLoading 
      fullScreen 
      message="Đang tải hồ sơ..." 
      variant="default"
      minDurationMs={LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS}
    />
  )
}

export function RequestsLoadingPage() {
  return (
    <UniversalLoading 
      fullScreen 
      message="Đang tải yêu cầu..." 
      variant="default"
      minDurationMs={LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS}
    />
  )
}
