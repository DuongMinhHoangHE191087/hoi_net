'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle, XCircle, Loader2, Sparkles,
  Image as ImageIcon, AlertTriangle, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================
// Types
// ============================================
interface AIToastData {
  type: 'processing' | 'success' | 'partial' | 'error'
  title: string
  message: string
  details?: {
    total?: number
    successful?: number
    failed?: number
    errorCategory?: string
  }
  images?: string[]
  requestId?: string
}

// ============================================
// Custom Toast Component
// ============================================
function AIToastContent({ data, toastId }: { data: AIToastData; toastId: string }) {
  const [progress, setProgress] = useState(0)

  // Animate progress bar for processing
  useEffect(() => {
    if (data.type === 'processing') {
      const interval = setInterval(() => {
        setProgress((p) => (p >= 90 ? 90 : p + 10))
      }, 800)
      return () => clearInterval(interval)
    }
    if (data.type === 'success') setProgress(100)
    if (data.type === 'partial') setProgress(data.details?.total ? ((data.details.successful || 0) / data.details.total) * 100 : 60)
  }, [data.type, data.details])

  const Icon = data.type === 'processing' ? Loader2
    : data.type === 'success' ? CheckCircle
    : data.type === 'partial' ? AlertTriangle
    : XCircle

  const iconColor = data.type === 'processing' ? 'text-blue-500'
    : data.type === 'success' ? 'text-green-500'
    : data.type === 'partial' ? 'text-yellow-500'
    : 'text-red-500'

  const barColor = data.type === 'processing' ? 'bg-blue-500'
    : data.type === 'success' ? 'bg-green-500'
    : data.type === 'partial' ? 'bg-yellow-500'
    : 'bg-red-500'

  const borderColor = data.type === 'processing' ? 'border-l-blue-500'
    : data.type === 'success' ? 'border-l-green-500'
    : data.type === 'partial' ? 'border-l-yellow-500'
    : 'border-l-red-500'

  return (
    <div className={`max-w-sm w-full bg-white rounded-xl shadow-2xl border border-gray-100 border-l-4 ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
            <Icon className={`w-5 h-5 ${data.type === 'processing' ? 'animate-spin' : ''}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{data.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{data.message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Image thumbnails */}
        {data.images && data.images.length > 0 && (
          <div className="flex gap-1.5 mt-3">
            {data.images.slice(0, 4).map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                {data.type === 'processing' && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            ))}
            {data.images.length > 4 && (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                +{data.images.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {data.details && data.details.total && data.type !== 'processing' && (
          <div className="flex gap-4 mt-3 text-xs">
            {data.details.successful !== undefined && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" /> {data.details.successful} thành công
              </span>
            )}
            {data.details.failed !== undefined && data.details.failed > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="w-3 h-3" /> {data.details.failed} thất bại
              </span>
            )}
          </div>
        )}

        {/* Error category badge */}
        {data.details?.errorCategory && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
              <AlertTriangle className="w-3 h-3" />
              {data.details.errorCategory}
            </span>
          </div>
        )}

        {/* View request link */}
        {data.requestId && data.type !== 'processing' && (
          <a
            href={`/requests/${data.requestId}`}
            className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Xem chi tiết
          </a>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// Show AI Toast Helper
// ============================================
export function showAIToast(data: AIToastData): string {
  const toastId = data.requestId
    ? `ai-toast-${data.requestId}`
    : `ai-toast-${Date.now()}`

  toast.custom(
    (t) => <AIToastContent data={data} toastId={t.id} />,
    {
      id: toastId,
      duration: data.type === 'processing' ? Infinity : 8000,
      position: 'bottom-right',
    }
  )

  return toastId
}

// Convenience functions
export function showAIProcessingToast(requestId: string, images?: string[]): string {
  return showAIToast({
    type: 'processing',
    title: '🤖 AI đang xử lý...',
    message: 'Đang phân tích và xử lý ảnh của bạn',
    images,
    requestId,
  })
}

export function showAISuccessToast(requestId: string, total: number, images?: string[]): string {
  return showAIToast({
    type: 'success',
    title: '✨ Xử lý thành công!',
    message: `AI đã xử lý thành công ${total} ảnh`,
    details: { total, successful: total, failed: 0 },
    images,
    requestId,
  })
}

export function showAIPartialToast(requestId: string, successful: number, failed: number): string {
  return showAIToast({
    type: 'partial',
    title: '⚠️ Xử lý một phần',
    message: `${successful}/${successful + failed} ảnh thành công. Admin sẽ xử lý phần còn lại.`,
    details: { total: successful + failed, successful, failed },
    requestId,
  })
}

export function showAIErrorToast(requestId: string, errorMessage: string, errorCategory?: string): string {
  return showAIToast({
    type: 'error',
    title: '❌ Lỗi xử lý',
    message: errorMessage,
    details: { errorCategory },
    requestId,
  })
}
