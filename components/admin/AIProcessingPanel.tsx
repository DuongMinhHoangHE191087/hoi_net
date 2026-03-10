'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, RotateCcw, Palette, ArrowUpCircle, SunMedium,
  Wand2, Loader2, CheckCircle, XCircle, AlertTriangle,
  Clock, ChevronDown, ChevronUp, RefreshCw, Image as ImageIcon,
  FileText, Zap, ShieldAlert, WifiOff, KeyRound, Timer,
  Ban, ServerCrash, CircleAlert, Gauge, FileWarning, Info,
  Copy, MessageSquare
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { authFetch } from '@/lib/auth-fetch'
import toast from 'react-hot-toast'
import type {
  AIErrorCategory,
  AIErrorSeverity,
  ClassifiedAIError,
  AIProcessingLog,
  AIImageResult
} from '@/lib/ai-error-classifier'

// ============================================
// Types
// ============================================

interface UserRequest {
  id: string
  user_id: string
  type: 'restore' | 'family'
  description: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  original_images: string[]
  restored_images: string[] | null
  admin_notes: string | null
  created_at: string
  completed_at: string | null
}

interface AIProcessingPanelProps {
  request: UserRequest
  onUpdate: () => void
}

// ============================================
// Constants
// ============================================

type AIAction = 'restore' | 'enhance' | 'colorize' | 'upscale' | 'harmonize'

const AI_ACTIONS: { id: AIAction; label: string; description: string; icon: typeof Sparkles }[] = [
  { id: 'restore', label: 'Khôi phục', description: 'Sửa hư hỏng, vết xước, phai màu', icon: RotateCcw },
  { id: 'enhance', label: 'Nâng cao', description: 'Tăng độ nét, cân bằng ánh sáng', icon: Zap },
  { id: 'colorize', label: 'Tô màu', description: 'Tô màu thực tế cho ảnh đen trắng', icon: Palette },
  { id: 'upscale', label: 'Phóng to', description: 'Tăng độ phân giải chi tiết', icon: ArrowUpCircle },
  { id: 'harmonize', label: 'Hài hòa', description: 'Cân bằng màu sắc, ánh sáng', icon: SunMedium },
]

const SEVERITY_STYLES: Record<AIErrorSeverity, { bg: string; text: string; border: string; badge: string }> = {
  low: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
  medium: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', badge: 'bg-red-200 text-red-900' },
}

const CATEGORY_ICONS: Record<AIErrorCategory, typeof Sparkles> = {
  quota_exceeded: Gauge,
  rate_limited: Timer,
  safety_filter: ShieldAlert,
  api_key_invalid: KeyRound,
  network_error: WifiOff,
  image_format: ImageIcon,
  image_too_large: FileWarning,
  timeout: Clock,
  model_unavailable: ServerCrash,
  content_blocked: Ban,
  unknown: CircleAlert,
}

// ============================================
// Component
// ============================================

export default function AIProcessingPanel({ request, onUpdate }: AIProcessingPanelProps) {
  const [selectedAction, setSelectedAction] = useState<AIAction>(
    request.type === 'restore' ? 'restore' : 'enhance'
  )
  const [customPrompt, setCustomPrompt] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingLog, setProcessingLog] = useState<AIProcessingLog | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // ============================================
  // Handle AI Processing
  // ============================================
  const handleProcess = async () => {
    setProcessing(true)
    setProcessingLog(null)

    const loadingToast = toast.loading(
      `🤖 Đang ${AI_ACTIONS.find(a => a.id === selectedAction)?.label.toLowerCase() || 'xử lý'} ${request.original_images.length} ảnh...`,
      { duration: 60000 }
    )

    try {
      const response = await authFetch.post(
        `/api/admin/requests/${request.id}/process-ai`,
        {
          action: selectedAction,
          prompt: customPrompt || `Professional ${selectedAction} for high quality result`
        }
      )

      const data = await response.json()
      toast.dismiss(loadingToast)

      if (!response.ok) {
        const errorMsg = data.classified_error?.adminMessage || data.message || 'AI processing failed'
        toast.error(`❌ ${errorMsg}`, { duration: 5000 })
        return
      }

      // Store processing log for UI display
      if (data.processing_log) {
        setProcessingLog(data.processing_log)
      }

      if (data.success) {
        toast.success(
          `✅ AI đã xử lý thành công ${data.summary.successful}/${data.summary.total} ảnh! (${data.summary.processing_time})`,
          { duration: 5000 }
        )
      } else if (data.summary.successful > 0) {
        toast.success(
          `⚠️ ${data.summary.successful}/${data.summary.total} ảnh thành công. ${data.summary.failed} ảnh gặp lỗi.`,
          { duration: 7000, icon: '⚠️' }
        )
      } else {
        toast.error(
          `❌ AI không thể xử lý ảnh. ${data.error_summary?.main_error?.adminMessage || 'Vui lòng thử lại.'}`,
          { duration: 7000 }
        )
      }

      onUpdate()
    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(`Lỗi: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">AI Processing Studio</h3>
          <p className="text-xs text-gray-500">{request.original_images.length} ảnh sẵn sàng xử lý</p>
        </div>
      </div>

      {/* Action Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {AI_ACTIONS.map((action) => {
          const Icon = action.icon
          const isSelected = selectedAction === action.id
          return (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              disabled={processing}
              className={`relative p-3 rounded-xl text-left transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200 scale-[1.02]'
                  : 'bg-white border-2 border-gray-100 hover:border-purple-200 hover:shadow-md text-gray-700'
              } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-white' : 'text-purple-500'}`} />
              <p className={`text-sm font-semibold ${isSelected ? 'text-white' : ''}`}>
                {action.label}
              </p>
              <p className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                {action.description}
              </p>
              {isSelected && (
                <motion.div
                  layoutId="action-indicator"
                  className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md"
                >
                  <CheckCircle className="w-3 h-3 text-purple-600" />
                </motion.div>
              )}
            </button>
          )
        })}
      </div>

      {/* Custom Prompt Toggle */}
      <div>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          {showPrompt ? 'Ẩn' : 'Thêm'} hướng dẫn tùy chỉnh
          {showPrompt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="VD: Làm sáng hơn, giữ nguyên tông màu ấm, focus vào khuôn mặt..."
                className="w-full mt-2 p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none resize-none transition-all"
                rows={2}
                disabled={processing}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Preview */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {request.original_images.map((url, i) => (
          <div key={i} className="relative flex-shrink-0 group">
            <img
              src={url}
              alt={`Image ${i + 1}`}
              className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 group-hover:border-purple-300 transition-colors"
            />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {i + 1}
            </span>
            {/* Show result status if processing log exists */}
            {processingLog?.results?.[i] && (
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                processingLog.results[i].success ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {processingLog.results[i].success
                  ? <CheckCircle className="w-3 h-3 text-white" />
                  : <XCircle className="w-3 h-3 text-white" />
                }
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Process Button */}
      <Button
        variant="primary"
        onClick={handleProcess}
        disabled={processing}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 transition-all"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang xử lý với AI...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Wand2 className="w-5 h-5" />
            Xử lý {request.original_images.length} ảnh với AI
          </span>
        )}
      </Button>

      {/* ============================================ */}
      {/* Processing Results */}
      {/* ============================================ */}
      <AnimatePresence>
        {processingLog && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary Bar */}
            <div className={`p-4 rounded-xl border-2 ${
              processingLog.overallStatus === 'success'
                ? 'bg-green-50 border-green-200'
                : processingLog.overallStatus === 'partial'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {processingLog.overallStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {processingLog.overallStatus === 'partial' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                  {processingLog.overallStatus === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
                  <span className="font-bold text-gray-800">
                    {processingLog.overallStatus === 'success' && 'Xử lý thành công!'}
                    {processingLog.overallStatus === 'partial' && 'Xử lý một phần'}
                    {processingLog.overallStatus === 'failed' && 'Xử lý thất bại'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {(processingLog.processingTimeMs / 1000).toFixed(1)}s
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    processingLog.overallStatus === 'success' ? 'bg-green-500' :
                    processingLog.overallStatus === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${(processingLog.results.filter(r => r.success).length / processingLog.totalImages) * 100}%`
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-green-700">
                  ✅ {processingLog.results.filter(r => r.success).length} thành công
                </span>
                {processingLog.results.filter(r => !r.success).length > 0 && (
                  <span className="text-red-700">
                    ❌ {processingLog.results.filter(r => !r.success).length} thất bại
                  </span>
                )}
              </div>
            </div>

            {/* Per-Image Results */}
            <div className="space-y-2">
              {processingLog.results.map((result, i) => (
                <ImageResultCard key={i} result={result} />
              ))}
            </div>

            {/* Error Details Toggle */}
            {processingLog.results.some(r => !r.success && r.error) && (
              <div>
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                  {showErrorDetails ? 'Ẩn' : 'Xem'} chi tiết lỗi AI
                  {showErrorDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <AnimatePresence>
                  {showErrorDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2 space-y-3"
                    >
                      {processingLog.results
                        .filter(r => !r.success && r.error)
                        .map((result, i) => (
                          <ErrorDetailCard key={i} error={result.error!} imageIndex={result.index} />
                        ))
                      }
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Retry Button for Retryable Errors */}
            {processingLog.results.some(r => !r.success && r.error?.retryable) && (
              <Button
                variant="secondary"
                onClick={handleProcess}
                disabled={processing}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                Thử lại {processingLog.results.filter(r => !r.success && r.error?.retryable).length} ảnh lỗi
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* Processing History (from admin_notes) */}
      {/* ============================================ */}
      {request.admin_notes && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            {showHistory ? 'Ẩn' : 'Xem'} lịch sử xử lý
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Admin Notes</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(request.admin_notes || '')
                        toast.success('Đã copy admin notes')
                      }}
                      className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {request.admin_notes}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// ============================================
// Sub-Components
// ============================================

function ImageResultCard({ result }: { result: AIImageResult }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      result.success
        ? 'bg-green-50/50 border-green-200'
        : 'bg-red-50/50 border-red-200'
    }`}>
      {/* Thumbnail */}
      <img
        src={result.success && result.processedUrl ? result.processedUrl : result.originalUrl}
        alt={`Image ${result.index + 1}`}
        className="w-12 h-12 object-cover rounded-lg border"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {result.success
            ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          }
          <span className="text-sm font-medium text-gray-800">
            Ảnh {result.index + 1}
          </span>
          {result.processingTimeMs && (
            <span className="text-[10px] text-gray-400 ml-auto">
              {(result.processingTimeMs / 1000).toFixed(1)}s
            </span>
          )}
        </div>

        {result.success && result.analysis?.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {result.analysis.description}
          </p>
        )}

        {!result.success && result.error && (
          <p className="text-xs text-red-600 mt-0.5">
            {result.error.adminMessage}
          </p>
        )}
      </div>

      {/* Error Category Badge */}
      {!result.success && result.error && (
        <ErrorCategoryBadge category={result.error.category} severity={result.error.severity} />
      )}
    </div>
  )
}

function ErrorDetailCard({ error, imageIndex }: { error: ClassifiedAIError; imageIndex: number }) {
  const styles = SEVERITY_STYLES[error.severity]
  const CategoryIcon = CATEGORY_ICONS[error.category] || CircleAlert

  return (
    <div className={`p-4 rounded-xl border-2 ${styles.bg} ${styles.border}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${styles.badge}`}>
          <CategoryIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-800">Ảnh {imageIndex + 1}</span>
            <ErrorCategoryBadge category={error.category} severity={error.severity} />
          </div>
          <p className={`text-sm font-medium ${styles.text}`}>{error.adminMessage}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-medium min-w-[80px]">Chi tiết:</span>
          <span className="text-gray-700 break-all">{error.adminDetails}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-medium min-w-[80px]">Retry:</span>
          <span className={error.retryable ? 'text-green-700' : 'text-red-700'}>
            {error.retryable ? `Có (sau ${(error.retryAfterMs || 0) / 1000}s)` : 'Không - cần xử lý thủ công'}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-medium min-w-[80px]">Đề xuất:</span>
          <div className="flex flex-wrap gap-1">
            {error.suggestedActions.map((action, i) => (
              <span key={i} className="px-2 py-0.5 bg-white/80 rounded text-gray-600">
                {action}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-medium min-w-[80px]">Thời gian:</span>
          <span className="text-gray-600">
            {new Date(error.timestamp).toLocaleString('vi-VN')}
          </span>
        </div>
      </div>
    </div>
  )
}

function ErrorCategoryBadge({ category, severity }: { category: AIErrorCategory; severity: AIErrorSeverity }) {
  const styles = SEVERITY_STYLES[severity]
  const CATEGORY_LABELS: Record<AIErrorCategory, string> = {
    quota_exceeded: 'Hết quota',
    rate_limited: 'Rate limit',
    safety_filter: 'Safety',
    api_key_invalid: 'API key',
    network_error: 'Mạng',
    image_format: 'Định dạng',
    image_too_large: 'Quá lớn',
    timeout: 'Timeout',
    model_unavailable: 'Model',
    content_blocked: 'Nội dung',
    unknown: 'Không rõ',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles.badge}`}>
      {CATEGORY_LABELS[category]}
    </span>
  )
}
