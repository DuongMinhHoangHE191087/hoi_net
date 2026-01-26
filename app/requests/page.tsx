'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText, Clock, CheckCircle, XCircle, Image as ImageIcon,
  Plus, ArrowLeft, Loader2, Calendar, Download, Eye, Trash2, Sparkles, Send
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'
import AIConfirmDialog from '@/components/ui/AIConfirmDialog'
import { FullScreenLoading } from '@/components/UniversalLoading'

// ✅ React Query hooks
import {
  useUserRequests,
  useSystemPrompts,
  useDeleteRequest,
  useSendToAdmin,
  useProcessWithAI,
} from '@/hooks/useRequests'

// ✅ Lazy load modal - code splitting!
const RequestDetailModal = lazy(() => import('./RequestDetailModal'))

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
  pending: {
    label: 'Chờ Xử Lý',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  processing: {
    label: 'Đang Xử Lý',
    icon: Loader2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  completed: {
    label: 'Hoàn Thành',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  rejected: {
    label: 'Từ Chối',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
  }
}

const TYPE_LABELS = {
  restore: 'Phục Hồi Ảnh Cũ',
  family: 'Ảnh Gia Đình'
}

export default function RequestsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // ✅ React Query hooks - automatic caching & refetching
  const { data: requests = [], isLoading, error } = useUserRequests(user?.id)
  const { data: systemPrompts = [] } = useSystemPrompts()

  // ✅ Mutations with optimistic updates
  const deleteRequestMutation = useDeleteRequest()
  const sendToAdminMutation = useSendToAdmin()
  const processWithAIMutation = useProcessWithAI()

  // Local state
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all')
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [advancedOptions, setAdvancedOptions] = useState({
    upscale: 2,
    denoise: true,
    enhanceFaces: true,
    colorAccuracy: 0.8,
  })
  const [selectedSystemPromptName, setSelectedSystemPromptName] = useState<string>('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingProcessing, setPendingProcessing] = useState<{
    request: UserRequest
    promptName: string
    useCustom: boolean
  } | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/requests')
    }
  }, [authLoading, user, router])

  // Loading state
  if (isLoading || authLoading) {
    return <FullScreenLoading message="Đang tải yêu cầu..." />
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="glassmorphism-strong p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">Không thể tải danh sách yêu cầu</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-glass-primary"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // Handlers
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa yêu cầu này?')) return
    if (!user) return

    // ✅ Optimistic update - UI updates immediately
    deleteRequestMutation.mutate({ id, userId: user.id })

    // Close modal if deleted request is selected
    if (selectedRequest?.id === id) {
      setSelectedRequest(null)
    }
  }

  const handleSendToAdmin = async (request: UserRequest) => {
    if (!confirm('Gửi yêu cầu này cho Admin xem xét và xử lý thủ công?')) return
    if (!user) return

    // ✅ Optimistic update
    sendToAdminMutation.mutate({ id: request.id, userId: user.id })

    // Update selected request if it's open
    if (selectedRequest?.id === request.id) {
      setSelectedRequest({
        ...request,
        status: 'processing',
        admin_notes: `Được gửi đến admin lúc ${new Date().toLocaleString('vi-VN')}. Đang chờ xử lý thủ công.`
      })
    }
  }

  const initiateAIProcessing = (request: UserRequest, promptName: string, useCustom = false) => {
    setPendingProcessing({ request, promptName, useCustom })
    setShowConfirmDialog(true)
  }

  const handleConfirmProcessing = async () => {
    if (!pendingProcessing) return

    setShowConfirmDialog(false)

    // ✅ Call AI processing mutation
    processWithAIMutation.mutate({
      requestId: pendingProcessing.request.id,
      imageUrls: pendingProcessing.request.original_images,
      systemPromptName: pendingProcessing.promptName,
      customPrompt: pendingProcessing.useCustom ? customPrompt : undefined,
      advancedOptions: advancedOptions,
    })

    setPendingProcessing(null)
  }

  // Filter requests
  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter((req) => req.status === filter)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen gradient-mesh p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="btn-glass-secondary">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </button>
            </Link>
            <h1 className="text-3xl font-bold gradient-text-alt">Yêu Cầu Của Tôi</h1>
          </div>

          <Link href="/requests/new">
            <button className="btn-glass-primary">
              <Plus className="w-5 h-5 mr-2" />
              Tạo yêu cầu mới
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'pending', 'processing', 'completed', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'glassmorphism hover:bg-white/80'
              }`}
            >
              {status === 'all' ? 'Tất cả' : STATUS_CONFIG[status].label}
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                {status === 'all'
                  ? requests.length
                  : requests.filter((r) => r.status === status).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-7xl mx-auto">
        {filteredRequests.length === 0 ? (
          <div className="glassmorphism-strong p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text mb-2">
              {filter === 'all' ? 'Chưa có yêu cầu nào' : `Không có yêu cầu ${STATUS_CONFIG[filter].label.toLowerCase()}`}
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo yêu cầu mới để bắt đầu khôi phục ảnh
            </p>
            <Link href="/requests/new">
              <button className="btn-glass-primary">
                <Plus className="w-5 h-5 mr-2" />
                Tạo yêu cầu đầu tiên
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => {
              const statusInfo = STATUS_CONFIG[request.status]
              const StatusIcon = statusInfo.icon

              return (
                <div
                  key={request.id}
                  className="glassmorphism-strong p-6 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.border} border mb-4`}>
                    <StatusIcon className={`w-4 h-4 ${statusInfo.color} ${request.status === 'processing' ? 'animate-spin' : ''}`} />
                    <span className={`text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Type */}
                  <h3 className="text-lg font-bold text-text mb-2">
                    {TYPE_LABELS[request.type]}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {request.description}
                  </p>

                  {/* Images Count */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <ImageIcon className="w-4 h-4" />
                    <span>{request.original_images.length} ảnh</span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(request.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRequest(request)
                      }}
                      className="flex-1 btn-glass-secondary text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(request.id)
                      }}
                      className="btn-glass-secondary text-sm text-red-600 hover:bg-red-50"
                      disabled={deleteRequestMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ✅ Request Detail Modal - Lazy Loaded for Code Splitting */}
      {selectedRequest && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="glassmorphism-strong p-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-text font-medium">Đang tải...</p>
            </div>
          </div>
        }>
          <RequestDetailModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onDelete={handleDelete}
            onSendToAdmin={handleSendToAdmin}
            onProcessWithAI={initiateAIProcessing}
            systemPrompts={systemPrompts as any}
            isDeleting={deleteRequestMutation.isPending}
            isSending={sendToAdminMutation.isPending}
            isProcessing={processWithAIMutation.isPending}
          />
        </Suspense>
      )}

      {/* AI Confirm Dialog */}
      {showConfirmDialog && pendingProcessing && (
        <AIConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false)
            setPendingProcessing(null)
          }}
          onConfirm={handleConfirmProcessing}
        />
      )}

      {/* Loading Overlay for Mutations */}
      {(deleteRequestMutation.isPending || sendToAdminMutation.isPending || processWithAIMutation.isPending) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="glassmorphism-strong p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-text font-medium">Đang xử lý...</p>
          </div>
        </div>
      )}
    </div>
  )
}

