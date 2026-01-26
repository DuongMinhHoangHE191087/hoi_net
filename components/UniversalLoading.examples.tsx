/**
 * 📚 HƯỚNG DẪN SỬ DỤNG UNIVERSAL LOADING
 *
 * Component loading TOÀN CỤC duy nhất cho app
 * Thay thế TẤT CẢ loading components cũ
 */

import UniversalLoading, {
  FullScreenLoading,
  MinimalLoading,
  ProgressLoading,
  useLoading,
} from './UniversalLoading'

// ==========================================
// CÁC CÁCH SỬ DỤNG
// ==========================================

/**
 * 1. FULL SCREEN LOADING (Page transitions, Auth, etc.)
 */
export function Example1_FullScreen() {
  return <FullScreenLoading message="Đang đăng nhập..." />
}

/**
 * 2. MINIMAL LOADING (Trong component, card, section)
 */
export function Example2_Minimal() {
  return (
    <div className="container">
      <MinimalLoading message="Đang tải dữ liệu..." />
    </div>
  )
}

/**
 * 3. PROGRESS LOADING (Upload files, processing)
 */
export function Example3_Progress() {
  const [progress, setProgress] = React.useState(0)

  return <ProgressLoading message="Đang upload..." progress={progress} />
}

/**
 * 4. CUSTOM LOADING (Tùy chỉnh)
 */
export function Example4_Custom() {
  return (
    <UniversalLoading
      message="Đang xử lý..."
      showProgress={true}
      progress={50}
      fullScreen={false}
      variant="default"
    />
  )
}

/**
 * 5. SỬ DỤNG HOOK (Recommended)
 */
export function Example5_Hook() {
  const { isLoading, showLoading, hideLoading, updateProgress, LoadingComponent } =
    useLoading()

  const handleSubmit = async () => {
    showLoading('Đang xử lý...')

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } finally {
      hideLoading()
    }
  }

  return (
    <>
      <LoadingComponent />
      <button onClick={handleSubmit}>Submit</button>
    </>
  )
}

/**
 * 6. TRONG PAGE COMPONENT
 */
export function Example6_Page() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Load data
    setTimeout(() => setLoading(false), 2000)
  }, [])

  if (loading) {
    return <FullScreenLoading message="Đang tải trang..." />
  }

  return <div>Page content</div>
}

/**
 * 7. API CALL VỚI PROGRESS
 */
export function Example7_Upload() {
  const { showLoading, hideLoading, updateProgress, LoadingComponent } = useLoading()

  const uploadFile = async (file: File) => {
    showLoading('Đang upload...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      // NOTE: Native fetch doesn't support onUploadProgress
      // For progress tracking, use XMLHttpRequest or a library like axios
    } finally {
      hideLoading()
    }
  }

  return <LoadingComponent />
}

// ==========================================
// THAY THẾ LOADING CŨ
// ==========================================

/**
 * Thay vì:
 */
// import PageLoading from '@/components/ui/PageLoading'
// import EnhancedLoading from '@/components/ui/EnhancedLoading'
// import LoadingSpinner from '@/components/ui/LoadingSpinner'

/**
 * Dùng:
 */
// import { FullScreenLoading, MinimalLoading } from '@/components/UniversalLoading'

/**
 * TRƯỚC:
 * if (loading) return <PageLoading />
 *
 * SAU:
 * if (loading) return <FullScreenLoading />
 */

/**
 * TRƯỚC:
 * <div>{loading && <LoadingSpinner />}</div>
 *
 * SAU:
 * <div>{loading && <MinimalLoading />}</div>
 */

// ==========================================
// VARIANTS
// ==========================================

/**
 * default: Full với gradient, logo, particles (đẹp nhất)
 * minimal: Chỉ spinner + text (nhẹ nhất)
 */

// ==========================================
// PROPS
// ==========================================

/**
 * message?: string - Thông báo hiển thị
 * showProgress?: boolean - Hiển thị progress bar
 * progress?: number - Giá trị progress (0-100)
 * fullScreen?: boolean - Toàn màn hình hay không
 * variant?: 'default' | 'minimal' - Kiểu hiển thị
 */

import React from 'react'

export default {
  FullScreenLoading,
  MinimalLoading,
  ProgressLoading,
  useLoading,
}

