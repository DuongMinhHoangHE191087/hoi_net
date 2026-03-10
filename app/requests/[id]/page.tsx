'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Download, Calendar, FileText, Image as ImageIcon,
  CheckCircle, XCircle, Clock, Loader2, Sparkles, Star, MessageSquare,
  Key, Home, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { useGeminiKey } from '@/hooks/useGeminiKey'
import { geminiClient } from '@/lib/gemini-client'
import ApiKeySetup from '@/components/ui/ApiKeySetup'
import RequestFeedbackModal from '@/components/ui/RequestFeedbackModal'
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider'
import { FullScreenLoading } from '@/components/UniversalLoading'
import toast from 'react-hot-toast'

interface UserRequest {
  id: string
  type: 'restore' | 'family'
  description: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  original_images: string[]
  restored_images: string[] | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

const STATUS_CONFIG = {
  pending: { label: 'Chờ Xử Lý', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  processing: { label: 'Đang Xử Lý', icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  completed: { label: 'Hoàn Thành', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  rejected: { label: 'Từ Chối', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
}

const TYPE_LABELS = {
  restore: 'Phục Hồi Ảnh Cũ',
  family: 'Ảnh Gia Đình',
}

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [request, setRequest] = useState<UserRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // BYOK
  const { hasKey: hasBYOK, maskedKey } = useGeminiKey()
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)
  const [isBYOKProcessing, setIsBYOKProcessing] = useState(false)
  const [byokResult, setBYOKResult] = useState<string | null>(null)

  // Feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [hasFeedback, setHasFeedback] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)

  const requestId = params?.id as string

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/requests/${requestId}`)
    }
  }, [authLoading, user, router, requestId])

  // Fetch request data
  useEffect(() => {
    if (!user || !requestId) return

    const fetchRequest = async () => {
      setLoading(true)
      try {
        const { data, error: fetchError } = await supabase
          .from('user_requests')
          .select('*')
          .eq('id', requestId)
          .eq('user_id', user.id)
          .single()

        if (fetchError || !data) {
          setError('Không tìm thấy yêu cầu hoặc bạn không có quyền truy cập.')
          return
        }

        setRequest(data as UserRequest)
      } catch {
        setError('Lỗi khi tải dữ liệu yêu cầu.')
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [user, requestId, supabase])

  // Realtime subscription — auto-update when request changes
  useEffect(() => {
    if (!user || !requestId) return
    const channel = supabase
      .channel(`request-${requestId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_requests',
        filter: `id=eq.${requestId}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        setRequest(payload.new as UserRequest)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, requestId, supabase])

  // Check feedback
  useEffect(() => {
    if (request?.status === 'completed') {
      checkFeedback()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id, request?.status])

  const checkFeedback = async () => {
    try {
      const response = await fetch(`/api/requests/${requestId}/feedback`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setHasFeedback(data.hasFeedback)
        if (data.feedback) setUserRating(data.feedback.rating)
      }
    } catch (err) {
      console.error('Error checking feedback:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `restored-${Date.now()}.jpg`
    link.click()
  }

  // --- LOADING / ERROR STATES ---

  if (authLoading || loading) {
    return <FullScreenLoading message="Đang tải yêu cầu..." />
  }

  if (error || !request) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
        <div className="glassmorphism-strong p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text mb-2">Không tìm thấy</h2>
          <p className="text-gray-600 mb-6">{error || 'Yêu cầu không tồn tại hoặc đã bị xóa.'}</p>
          <Link
            href="/requests"
            className="btn-glass-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_CONFIG[request.status]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen gradient-mesh py-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" /> Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/requests" className="hover:text-primary transition-colors">
            Yêu cầu
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">{TYPE_LABELS[request.type]}</span>
        </nav>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="glassmorphism-strong p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text-alt mb-2">
                {TYPE_LABELS[request.type]}
              </h1>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.border} border`}>
                <StatusIcon className={`w-5 h-5 ${statusInfo.color} ${request.status === 'processing' ? 'animate-spin' : ''}`} />
                <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
              </div>
            </div>
            <span className="text-xs text-gray-400 font-mono">#{request.id.slice(0, 8)}</span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Mô Tả
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {request.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" /> Ngày Tạo
              </div>
              <p className="font-medium text-text">{formatDate(request.created_at)}</p>
            </div>
            {request.completed_at && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <CheckCircle className="w-4 h-4" /> Hoàn Thành
                </div>
                <p className="font-medium text-text">{formatDate(request.completed_at)}</p>
              </div>
            )}
          </div>

          {/* Original Images */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" /> Ảnh Gốc ({request.original_images.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {request.original_images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img src={imageUrl} alt={`Original ${index + 1}`} className="w-full h-48 object-cover rounded-lg shadow-md" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button onClick={() => handleDownload(imageUrl)} className="btn-glass-primary">
                      <Download className="w-4 h-4 mr-2" /> Tải Về
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Restored Images */}
          {request.restored_images && request.restored_images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Ảnh Đã Khôi Phục ({request.restored_images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {request.restored_images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img src={imageUrl} alt={`Restored ${index + 1}`} className="w-full h-48 object-cover rounded-lg shadow-md ring-2 ring-purple-500" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button onClick={() => handleDownload(imageUrl)} className="btn-glass-primary bg-gradient-primary">
                        <Download className="w-4 h-4 mr-2" /> Tải Về
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Before/After Comparison Slider */}
          {request.restored_images && request.restored_images.length > 0 && request.original_images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> So Sánh Trước / Sau
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.original_images.map((origUrl, index) => {
                  const restoredUrl = request.restored_images?.[index]
                  if (!restoredUrl) return null
                  return (
                    <BeforeAfterSlider
                      key={index}
                      beforeImage={origUrl}
                      afterImage={restoredUrl}
                      beforeLabel={`Gốc #${index + 1}`}
                      afterLabel={`Khôi phục #${index + 1}`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* AI Processing Status Card */}
          {request.admin_notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Trạng Thái Xử Lý AI
              </h3>
              <AIStatusCard adminNotes={request.admin_notes} status={request.status} />
            </div>
          )}

          {/* Processing Timeline */}
          {request.status === 'processing' && !request.admin_notes && (
            <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800">Đang xử lý...</h3>
                  <p className="text-blue-700">AI hoặc admin đang xử lý yêu cầu của bạn</p>
                </div>
              </div>
              <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <p className="text-sm text-blue-600 mt-3">
                Bạn sẽ nhận được thông báo khi hoàn thành. Thời gian xử lý thường từ 1-5 phút.
              </p>
            </div>
          )}

          {/* Completed Success */}
          {request.status === 'completed' && request.restored_images && request.restored_images.length > 0 && (
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">Yêu cầu đã hoàn thành!</h3>
                  <p className="text-green-700">Bạn có {request.restored_images.length} ảnh đã được xử lý</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    request.restored_images?.forEach((url, i) => {
                      setTimeout(() => handleDownload(url), i * 500)
                    })
                    toast.success('Đang tải tất cả ảnh...')
                  }}
                  className="btn-glass-primary bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Tải Tất Cả Ảnh ({request.restored_images.length})
                </button>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className={`btn-glass-secondary flex items-center gap-2 ${
                    hasFeedback
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse'
                  }`}
                >
                  {hasFeedback ? (
                    <>
                      <div className="flex items-center gap-0.5">
                        {[...Array(userRating || 0)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <span>Xem đánh giá</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      <span>Đánh giá kết quả</span>
                    </>
                  )}
                </button>
              </div>
              {!hasFeedback && (
                <div className="mt-4 p-3 bg-white/80 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium">
                      Hãy để lại đánh giá giúp chúng tôi cải thiện dịch vụ!
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rejected */}
          {request.status === 'rejected' && (
            <div className="mb-6 p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800">Yêu cầu bị từ chối</h3>
                  <p className="text-red-700">Vui lòng xem ghi chú từ admin để biết thêm chi tiết</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Processing (pending) */}
          {request.status === 'pending' && (
            <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Xử Lý Bằng AI
              </h3>

              {byokResult && (
                <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Kết quả phân tích AI</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {byokResult}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  {hasBYOK ? (
                    <button
                      onClick={async () => {
                        setIsBYOKProcessing(true)
                        setBYOKResult(null)
                        try {
                          const result = await geminiClient.process(request.original_images[0], 'restore')
                          if (result.success && result.description) {
                            setBYOKResult(result.description)
                            toast.success('Phân tích AI hoàn tất!')
                          } else {
                            toast.error(result.error || 'Lỗi xử lý')
                          }
                        } catch (err: any) {
                          toast.error(err.message || 'Lỗi xử lý')
                        } finally {
                          setIsBYOKProcessing(false)
                        }
                      }}
                      disabled={isBYOKProcessing}
                      className="btn-glass-secondary flex-1 disabled:opacity-50 border-2 border-green-300 hover:bg-green-50"
                    >
                      <Key className="w-4 h-4 mr-2 text-green-600" />
                      {isBYOKProcessing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...</>
                      ) : (
                        <>Xử Lý Với API Key ({maskedKey})</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowApiKeySetup(true)}
                      className="btn-glass-secondary flex-1 border-2 border-blue-300 hover:bg-blue-50"
                    >
                      <Key className="w-4 h-4 mr-2 text-blue-600" />
                      Thêm API Key Gemini
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  💡 Tip: Sử dụng API key riêng để không bị giới hạn lượt.
                </div>
              </div>
            </div>
          )}

          {/* API Key Setup Modal */}
          <ApiKeySetup isOpen={showApiKeySetup} onClose={() => setShowApiKeySetup(false)} />

          {/* Request Feedback Modal */}
          <RequestFeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            requestId={request.id}
            requestType={request.type}
            onFeedbackSubmitted={() => checkFeedback()}
          />

          {/* Footer */}
          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
            <Link href="/requests" className="btn-glass-primary flex-1 text-center">
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// AI Status Card
// ============================================
function AIStatusCard({ adminNotes, status }: { adminNotes: string; status: string }) {
  const totalMatch = adminNotes.match(/Tổng số ảnh:\s*(\d+)/)
  const successMatch = adminNotes.match(/Thành công:\s*(\d+)/)
  const failMatch = adminNotes.match(/Thất bại:\s*(\d+)/)
  const timeMatch = adminNotes.match(/Thời gian[^:]*:\s*([^\n]+)/)

  const totalImages = totalMatch ? parseInt(totalMatch[1]) : 0
  const successCount = successMatch ? parseInt(successMatch[1]) : 0
  const failCount = failMatch ? parseInt(failMatch[1]) : 0
  const processingTime = timeMatch ? timeMatch[1].trim() : ''

  const overallStatus = failCount === 0 && successCount > 0 ? 'success'
    : successCount > 0 && failCount > 0 ? 'partial'
    : failCount > 0 ? 'failed' : 'info'

  const styles = {
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', bar: 'bg-green-500' },
    partial: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', bar: 'bg-yellow-500' },
    failed: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', bar: 'bg-red-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', bar: 'bg-blue-500' },
  }[overallStatus]

  const getMessage = () => {
    if (overallStatus === 'success') return `AI đã xử lý thành công tất cả ${totalImages} ảnh!`
    if (overallStatus === 'partial') return `AI xử lý được ${successCount}/${totalImages} ảnh. Admin đang xem xét ${failCount} ảnh còn lại.`
    if (overallStatus === 'failed') return 'AI gặp khó khăn khi xử lý. Admin sẽ xử lý thủ công sớm nhất.'
    return 'Yêu cầu đang được xem xét bởi admin.'
  }

  return (
    <div className={`p-5 rounded-xl border-2 ${styles.bg} ${styles.border}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          overallStatus === 'success' ? 'bg-green-100' :
          overallStatus === 'partial' ? 'bg-yellow-100' :
          overallStatus === 'failed' ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          {overallStatus === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
          {overallStatus === 'partial' && <Clock className="w-6 h-6 text-yellow-600" />}
          {overallStatus === 'failed' && <Clock className="w-6 h-6 text-red-600" />}
          {overallStatus === 'info' && <Sparkles className="w-6 h-6 text-blue-600" />}
        </div>
        <div>
          <h4 className={`font-bold ${styles.text}`}>
            {overallStatus === 'success' && 'Xử lý thành công!'}
            {overallStatus === 'partial' && 'Đang xử lý tiếp...'}
            {overallStatus === 'failed' && 'Admin đang xử lý'}
            {overallStatus === 'info' && 'Cập nhật từ admin'}
          </h4>
          {processingTime && <p className="text-xs text-gray-500">Thời gian: {processingTime}</p>}
        </div>
      </div>
      {totalImages > 0 && (
        <div className="mb-3">
          <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${styles.bar}`}
              style={{ width: `${(successCount / totalImages) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{successCount}/{totalImages} ảnh hoàn thành</span>
            {failCount > 0 && <span>{failCount} chờ xử lý</span>}
          </div>
        </div>
      )}
      <p className={`text-sm ${styles.text}`}>{getMessage()}</p>
    </div>
  )
}
