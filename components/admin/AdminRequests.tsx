'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, CheckCircle, Clock, XCircle, Eye, Send, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DeliveryModal from './DeliveryModal'
import RequestDetailModal from './RequestDetailModal'
import { SafeAvatar } from '@/components/ui/SafeImage'
import { authFetch } from '@/lib/auth-fetch'
import { useDebounce } from '@/hooks/useDebounce'
import toast from 'react-hot-toast'

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
  updated_at?: string
  admin_id?: string
  user_profiles: {
    full_name: string
    phone: string | null
    facebook_url: string | null
    avatar_url: string | null
  } | null
}

export default function AdminRequests() {
  // ✅ OPTIMIZED: Trust AdminPage parent - no auth check needed
  // If this component rendered, user IS authenticated and admin
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [hasFetched, setHasFetched] = useState(false) // Track if initial fetch completed
  
  // AI Process confirmation
  const [aiConfirm, setAiConfirm] = useState<{ isOpen: boolean; request: UserRequest | null }>({
    isOpen: false,
    request: null
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 20

  // Fetch requests from API
  const fetchRequests = async (retryCount = 0) => {
    setLoading(true)
    setError(null)

    try {
      // Add cache-busting timestamp to ensure fresh data
      const timestamp = Date.now()
      console.log('[AdminRequests] Fetching requests with filter:', filter, 'page:', currentPage, 'retry:', retryCount)
      const response = await authFetch.get(
        `/api/admin/requests?status=${filter}&page=${currentPage}&limit=${ITEMS_PER_PAGE}&_t=${timestamp}`
      )

      console.log('[AdminRequests] Response status:', response.status)

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        console.error('[AdminRequests] API Error:', errData)

        // Retry on 401 (auth might not be ready yet)
        if (response.status === 401 && retryCount < 2) {
          console.log('[AdminRequests] Auth error, retrying in 1s... (attempt', retryCount + 1, ')')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchRequests(retryCount + 1)
        }

        if (response.status === 401) {
          const errorMsg = 'Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản admin.'
          setError(errorMsg)
          toast.error(errorMsg)
        } else {
          const errorMsg = errData.error || errData.message || 'Failed to fetch requests'
          setError(errorMsg)
          toast.error(`Không thể tải danh sách yêu cầu: ${errorMsg}`)
        }
        throw new Error(errData.error || 'Failed to fetch requests')
      }

      const responseData = await response.json()
      
      // DEBUG: Log full response to see actual format
      console.log('[AdminRequests] FULL RAW RESPONSE:', JSON.stringify(responseData, null, 2))
      
      // API returns: { success, data: { requests }, meta: { total, page, limit } }
      const requests = responseData.data?.requests || responseData.requests || []
      const total = responseData.meta?.total || responseData.pagination?.total || 0
      const page = responseData.meta?.page || responseData.pagination?.page || 1
      
      console.log('[AdminRequests] Parsed data:', {
        count: requests.length,
        total: total,
        page: page,
        filter,
        hasDataWrapper: !!responseData.data,
        hasMeta: !!responseData.meta,
        dataKeys: responseData.data ? Object.keys(responseData.data) : [],
        topLevelKeys: Object.keys(responseData)
      })

      setRequests(requests)
      setTotalCount(total)
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE))
      setHasFetched(true)

      if (requests.length > 0) {
        toast.success(`Đã tải ${requests.length} yêu cầu (trang ${currentPage}/${Math.ceil(total / ITEMS_PER_PAGE)})`)
      }
    } catch (err: any) {
      console.error('[AdminRequests] Fetch error:', err)
      // Error already handled above
    } finally {
      setLoading(false)
    }
  }

  // Use ref to prevent double-fetch in React StrictMode
  const didFetch = useRef(false)

  useEffect(() => {
    // Prevent double-fetch on mount (React StrictMode)
    if (didFetch.current && process.env.NODE_ENV === 'development') {
      console.log('[AdminRequests] Skipping duplicate fetch (StrictMode)')
      return
    }
    didFetch.current = true
    
    console.log('[AdminRequests] Fetching requests with filter:', filter, 'page:', currentPage)
    fetchRequests()
  }, [filter, currentPage])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  // Update request status
  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await authFetch.patch(`/api/admin/requests/${requestId}/deliver`, { status: newStatus })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success(`Cập nhật trạng thái thành công`)
      fetchRequests()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'processing': return Loader2
      case 'completed': return CheckCircle
      case 'rejected': return XCircle
      default: return AlertCircle
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý'
      case 'processing': return 'Đang xử lý'
      case 'completed': return 'Hoàn thành'
      case 'rejected': return 'Từ chối'
      default: return status
    }
  }

  const getTypeLabel = (type: string) => {
    return type === 'restore' ? 'Khôi phục ảnh' : 'Ghép ảnh gia đình'
  }

  // Debounce search query để tránh filter quá nhiều lần
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const filteredRequests = requests.filter(
    (req) => {
      const matchesSearch =
        req.user_profiles?.full_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      return matchesSearch
    }
  )

  const handleDelivery = (request: UserRequest) => {
    setSelectedRequest(request)
    setShowDeliveryModal(true)
  }

  const handleViewDetail = (request: UserRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  // Handle AI Processing
  const handleAIProcess = (request: UserRequest) => {
    setAiConfirm({ isOpen: true, request })
  }

  const confirmAIProcess = async () => {
    const request = aiConfirm.request
    if (!request) return
    
    setAiConfirm({ isOpen: false, request: null })

    const loadingToast = toast.loading('🤖 Đang xử lý với AI...')
    
    try {
      const response = await authFetch.post(`/api/admin/requests/${request.id}/process-ai`, {
        action: request.type === 'restore' ? 'restore' : 'enhance',
        prompt: `Professional ${request.type} for high quality result`
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'AI processing failed')
      }

      toast.dismiss(loadingToast)

      if (data.success) {
        toast.success(`✅ AI đã xử lý thành công ${data.summary.successful}/${data.summary.total} ảnh!`)
      } else {
        toast.success(`⚠️ AI đã xử lý ${data.summary.successful}/${data.summary.total} ảnh. Cần hoàn tất thủ công.`, {
          duration: 5000
        })
      }

      // Refresh list
      fetchRequests()

    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(`AI xử lý thất bại: ${error.message}`)
    }
  }

  // Handle Reject
  const handleReject = async (requestId: string) => {
    const reason = window.prompt('Nhập lý do từ chối (tùy chọn):')
    
    if (reason === null) return // User cancelled

    try {
      const response = await authFetch.patch(`/api/admin/requests/${requestId}/deliver`, {
        status: 'rejected',
        rejection_reason: reason || 'Không thể xử lý yêu cầu này',
        notify_user: true
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject')
      }

      toast.success('Đã từ chối yêu cầu')
      fetchRequests()

    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`)
    }
  }

  return (
    <>
      <ConfirmDialog
        isOpen={aiConfirm.isOpen}
        onClose={() => setAiConfirm({ isOpen: false, request: null })}
        onConfirm={confirmAIProcess}
        title="Xử lý với AI"
        message={`Bạn có muốn sử dụng AI để xử lý yêu cầu này?\n\nLoại: ${aiConfirm.request ? getTypeLabel(aiConfirm.request.type) : ''}\nSố ảnh: ${aiConfirm.request?.original_images?.length || 0}`}
        variant="info"
        confirmText="Xử lý"
        cancelText="Huỷ"
      />
      
      <div>
        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, mô tả, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'processing', 'completed', 'rejected'].map((status) => (
                <Button 
                  key={status}
                  variant={filter === status ? 'primary' : 'secondary'} 
                  onClick={() => setFilter(status as any)}
                  size="sm"
                >
                  {status === 'all' ? 'Tất cả' : getStatusLabel(status)}
                </Button>
              ))}
              <Button variant="secondary" onClick={() => fetchRequests()} size="sm">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchRequests()}>Thử lại</Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRequests.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có yêu cầu nào</h3>
          <p className="text-gray-500">Các yêu cầu từ người dùng sẽ xuất hiện ở đây</p>
        </Card>
      )}

      {/* Request List */}
      {!loading && !error && filteredRequests.length > 0 && (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status)
            const createdDate = new Date(request.created_at).toLocaleString('vi-VN')

            return (
              <div key={request.id}>
                <Card hover className="relative overflow-hidden">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${getStatusColor(request.status)}`}>
                      <StatusIcon className={`w-3 h-3 ${request.status === 'processing' ? 'animate-spin' : ''}`} />
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <SafeAvatar
                        src={request.user_profiles?.avatar_url}
                        alt={request.user_profiles?.full_name || 'User'}
                        size="md"
                      />
                      <div>
                        <h3 className="font-bold text-text">
                          {request.user_profiles?.full_name || 'Không có tên'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {request.user_profiles?.phone || request.user_profiles?.facebook_url || 'Chưa có liên hệ'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      ID: {request.id.slice(0, 8)}... | {createdDate}
                    </p>
                  </div>

                  {/* Type Badge */}
                  <div className="mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                      {getTypeLabel(request.type)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 line-clamp-2">{request.description}</p>

                  {/* Images Preview */}
                  {request.original_images && request.original_images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {request.original_images.slice(0, 4).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Original ${i + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                        />
                      ))}
                      {request.original_images.length > 4 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-gray-500">+{request.original_images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateStatus(request.id, 'processing')}
                        >
                          <Loader2 className="w-4 h-4 mr-1" />
                          Tiếp nhận
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAIProcess(request)}
                          className="bg-purple-50 text-purple-700 hover:bg-purple-100"
                        >
                          🤖 AI Xử lý
                        </Button>
                      </>
                    )}

                    {request.status === 'processing' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDelivery(request)}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Gửi trả kết quả
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAIProcess(request)}
                          className="bg-purple-50 text-purple-700 hover:bg-purple-100"
                        >
                          🤖 AI Xử lý
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Từ chối
                        </Button>
                      </>
                    )}

                    {request.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        {request.restored_images && request.restored_images.length > 0 ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              Đã gửi {request.restored_images.length} ảnh
                            </span>
                            {request.completed_at && (
                              <span className="text-xs text-green-600 ml-1">
                                ({new Date(request.completed_at).toLocaleDateString('vi-VN')})
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-yellow-700">Hoàn thành - chưa gửi ảnh</span>
                          </div>
                        )}
                      </div>
                    )}

                    {request.status === 'rejected' && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">Đã từ chối</span>
                      </div>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewDetail(request)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                    </Button>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredRequests.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6"
        />
      )}

      {/* Results info */}
      {!loading && filteredRequests.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Hiển thị {filteredRequests.length} / {totalCount} yêu cầu
        </div>
      )}

      {/* Delivery Modal */}
      {selectedRequest && (
        <>
          <DeliveryModal
            isOpen={showDeliveryModal}
            onClose={() => {
              setShowDeliveryModal(false)
              setSelectedRequest(null)
            }}
            request={selectedRequest}
            onDelivered={fetchRequests}
          />

          <RequestDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedRequest(null)
            }}
            request={selectedRequest}
            onUpdate={fetchRequests}
          />
        </>
      )}
      </div>
    </>
  )
}

