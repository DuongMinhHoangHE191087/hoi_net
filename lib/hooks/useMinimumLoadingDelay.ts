'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 🎯 Hook để đảm bảo loading hiển thị tối thiểu N giây
 * 
 * Tạo cảm giác app đang:
 * - Chuẩn bị dữ liệu tốt
 * - Không quá nhanh (người dùng không cảm nhận)
 * - Mượt mà, chuyên nghiệp
 * 
 * @param isLoading - Trạng thái loading hiện tại
 * @param minimumMs - Thời gian tối thiểu (mặc định 1500ms)
 * @returns Có nên hiển thị loading hay không
 */
export function useMinimumLoadingDelay(
  isLoading: boolean,
  minimumMs: number = 1500
): boolean {
  const [shouldShow, setShouldShow] = useState(isLoading)
  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isLoading) {
      // Bắt đầu loading
      startTimeRef.current = Date.now()
      setShouldShow(true)
    } else if (shouldShow) {
      // Ngừng loading nhưng kiểm tra đã đủ thời gian chưa
      if (startTimeRef.current) {
        const elapsedMs = Date.now() - startTimeRef.current
        const remainingMs = minimumMs - elapsedMs

        if (remainingMs > 0) {
          // Còn cần chờ, set timer
          timerRef.current = setTimeout(() => {
            setShouldShow(false)
            startTimeRef.current = null
          }, remainingMs)
        } else {
          // Đã đủ thời gian, có thể ẩn ngay
          setShouldShow(false)
          startTimeRef.current = null
        }
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isLoading, minimumMs, shouldShow])

  return shouldShow
}

/**
 * ✅ Cách sử dụng:
 * 
 * const shouldShowLoading = useMinimumLoadingDelay(isLoading, 1500)
 * 
 * if (shouldShowLoading) {
 *   return <UniversalLoading message="Chuẩn bị dữ liệu..." />
 * }
 * 
 * return <PageContent />
 */
