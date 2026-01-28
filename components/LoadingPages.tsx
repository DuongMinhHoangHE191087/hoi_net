'use client'

import UniversalLoading from '@/components/UniversalLoading'

/**
 * Client-side Loading Component Wrapper
 * Used by loading.tsx files (which must be Server Components in Next.js App Router)
 * 
 * This wrapper allows Server Components to render Client Components safely
 */

export function LoadingPage({ message }: { message?: string }) {
  return <UniversalLoading fullScreen message={message} variant="default" />
}

export function AdminLoadingPage() {
  return <UniversalLoading fullScreen message="Đang tải Admin Panel..." variant="default" />
}

export function BlogLoadingPage() {
  return <UniversalLoading fullScreen message="Đang tải blog..." variant="default" />
}

export function DashboardLoadingPage() {
  return <UniversalLoading fullScreen message="Đang tải dashboard..." variant="default" />
}

export function ProfileLoadingPage() {
  return <UniversalLoading fullScreen message="Đang tải hồ sơ..." variant="default" />
}

export function RequestsLoadingPage() {
  return <UniversalLoading fullScreen message="Đang tải yêu cầu..." variant="default" />
}
