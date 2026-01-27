'use client'

import { useState, useEffect } from 'react'
import { Star, Trash2, Eye, Archive, Loader2, AlertCircle, RefreshCw, CheckCircle, XCircle, Upload, Home, MessageSquare, Award } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Feedback } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Image from 'next/image'

// Helper to get auth headers
const getAuthHeaders = async () => {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
  }
}

export default function AdminTestimonials() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [filter, setFilter] = useState<'all' | 'testimonials' | 'new' | 'read' | 'archived'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    feedbackId: string | null
  }>({ isOpen: false, feedbackId: null })

  useEffect(() => {
    loadFeedback()
  }, [filter])

  const loadFeedback = async () => {
    setLoading(true)
    setError(null)

    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/admin/feedback', { headers })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load feedback')
      }

      const data = result.feedback || []

      // Filter based on selection
      let filtered = data
      if (filter === 'testimonials') {
        filtered = data.filter((f: Feedback) => f.is_testimonial)
      } else if (filter === 'new') {
        filtered = data.filter((f: Feedback) => f.status === 'new')
      } else if (filter === 'read') {
        filtered = data.filter((f: Feedback) => f.status === 'read')
      } else if (filter === 'archived') {
        filtered = data.filter((f: Feedback) => f.status === 'archived')
      }

      setFeedbackList(filtered)
    } catch (err: any) {
      console.error('Error loading feedback:', err)
      setError('Không thể tải phản hồi. Vui lòng kiểm tra database.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'new' | 'read' | 'archived') => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update')
      }

      toast.success('Đã cập nhật trạng thái')
      loadFeedback()
    } catch (err) {
      console.error('Error updating feedback:', err)
      toast.error('Lỗi khi cập nhật trạng thái')
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmDialog({ isOpen: true, feedbackId: id })
  }

  const confirmDelete = async () => {
    const id = confirmDialog.feedbackId
    if (!id) return
    
    setConfirmDialog({ isOpen: false, feedbackId: null })
    setDeletingId(id)
    
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete')
      }

      toast.success('Đã xoá phản hồi')
      loadFeedback()
    } catch (err) {
      console.error('Error deleting feedback:', err)
      toast.error('Lỗi khi xoá phản hồi')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleTestimonial = async (feedback: Feedback) => {
    try {
      const headers = await getAuthHeaders()
      await fetch(`/api/admin/feedback/${feedback.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          is_testimonial: !feedback.is_testimonial,
          display_on_homepage: feedback.is_testimonial ? false : feedback.display_on_homepage,
        })
      })
      toast.success(feedback.is_testimonial ? 'Đã gỡ khỏi testimonials' : 'Đã thêm vào testimonials')
      loadFeedback()
    } catch (err) {
      console.error('Error toggling testimonial:', err)
      toast.error('Lỗi khi cập nhật testimonial')
    }
  }

  const handleToggleHomepage = async (feedback: Feedback) => {
    try {
      const headers = await getAuthHeaders()
      await fetch(`/api/admin/feedback/${feedback.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          display_on_homepage: !feedback.display_on_homepage,
        })
      })
      toast.success(feedback.display_on_homepage ? 'Đã ẩn khỏi trang chủ' : 'Đã hiển thị trên trang chủ')
      loadFeedback()
    } catch (err) {
      console.error('Error toggling homepage display:', err)
      toast.error('Lỗi khi cập nhật hiển thị')
    }
  }

  const handleToggleFeatured = async (feedback: Feedback) => {
    try {
      const headers = await getAuthHeaders()
      await fetch(`/api/admin/feedback/${feedback.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          is_featured: !feedback.is_featured,
        })
      })
      toast.success(feedback.is_featured ? 'Đã gỡ khỏi nổi bật' : 'Đã đánh dấu nổi bật')
      loadFeedback()
    } catch (err) {
      console.error('Error toggling featured:', err)
      toast.error('Lỗi khi cập nhật nổi bật')
    }
  }

  const handleUpdateOrder = async (feedback: Feedback, order: number) => {
    try {
      const headers = await getAuthHeaders()
      await fetch(`/api/admin/feedback/${feedback.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          display_order: order,
        })
      })
      toast.success('Đã cập nhật thứ tự hiển thị')
      loadFeedback()
    } catch (err) {
      console.error('Error updating order:', err)
      toast.error('Lỗi khi cập nhật thứ tự')
    }
  }

  const handleUpdateDetails = async (
    feedback: Feedback,
    updates: {
      position_title?: string
      company_name?: string
      testimonial_image_url?: string
    }
  ) => {
    try {
      const headers = await getAuthHeaders()
      await fetch(`/api/admin/feedback/${feedback.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      })
      toast.success('Đã cập nhật thông tin')
      loadFeedback()
    } catch (err) {
      console.error('Error updating details:', err)
      toast.error('Lỗi khi cập nhật thông tin')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-primary/10 text-primary'
      case 'read': return 'bg-green-100 text-green-700'
      case 'archived': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Mới'
      case 'read': return 'Đã đọc'
      case 'archived': return 'Đã lưu trữ'
      default: return status
    }
  }

  return (
    <>
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, feedbackId: null })}
        onConfirm={confirmDelete}
        title="Xoá phản hồi"
        message="Bạn có chắc chắn muốn xoá phản hồi này? Hành động này không thể hoàn tác."
        variant="danger"
        confirmText="Xoá"
        cancelText="Huỷ"
      />
      
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-text flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Quản Lý Phản Hồi & Testimonials
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tổng: {feedbackList.length} phản hồi | Testimonials: {feedbackList.filter(f => f.is_testimonial).length}
            </p>
          </div>
          <Button variant="secondary" onClick={loadFeedback} size="sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'testimonials', 'new', 'read', 'archived'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              onClick={() => setFilter(status)}
              size="sm"
            >
              {status === 'all' ? 'Tất cả' : 
               status === 'testimonials' ? '⭐ Testimonials' : 
               status === 'new' ? '🆕 Mới' :
               status === 'read' ? '✓ Đã đọc' : '📦 Lưu trữ'}
            </Button>
          ))}
        </div>
      </div>

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
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Chạy file migration <code className="bg-gray-100 px-2 py-1 rounded">017_add_testimonials_support.sql</code> trong Supabase SQL Editor
          </p>
          <Button onClick={loadFeedback}>Thử lại</Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && feedbackList.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có phản hồi</h3>
            <p className="text-gray-500">Chưa có phản hồi nào trong mục này</p>
          </div>
        </Card>
      )}

      {/* Feedback List */}
      {!loading && !error && feedbackList.length > 0 && (
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <Card key={feedback.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-text">{feedback.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {getStatusLabel(feedback.status)}
                    </span>
                    {feedback.is_testimonial && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Testimonial
                      </span>
                    )}
                    {feedback.display_on_homepage && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        Hiển thị trang chủ
                      </span>
                    )}
                    {feedback.is_featured && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        ⭐ Nổi bật
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{feedback.email}</p>
                  <p className="text-sm text-gray-500">{new Date(feedback.created_at).toLocaleString('vi-VN')}</p>

                  {/* Additional testimonial info */}
                  {feedback.is_testimonial && (
                    <div className="mt-2 space-y-1">
                      {feedback.position_title && (
                        <p className="text-sm text-gray-600">
                          <strong>Chức vụ:</strong> {feedback.position_title}
                        </p>
                      )}
                      {feedback.company_name && (
                        <p className="text-sm text-gray-600">
                          <strong>Công ty:</strong> {feedback.company_name}
                        </p>
                      )}
                      {feedback.display_order !== undefined && (
                        <p className="text-sm text-gray-600">
                          <strong>Thứ tự:</strong> {feedback.display_order}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {feedback.rating && (
                  <div className="flex gap-1">
                    {Array.from({ length: feedback.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-4">{feedback.message}</p>

              {/* Testimonial Controls */}
              <div className="space-y-3">
                {/* Status & Quick Actions */}
                <div className="flex gap-2 flex-wrap">
                  {feedback.status === 'new' && (
                    <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(feedback.id, 'read')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Đánh dấu đã đọc
                    </Button>
                  )}
                  {feedback.status !== 'archived' && (
                    <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(feedback.id, 'archived')}>
                      <Archive className="w-4 h-4 mr-2" />
                      Lưu trữ
                    </Button>
                  )}
                  {feedback.status === 'archived' && (
                    <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(feedback.id, 'read')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Khôi phục
                    </Button>
                  )}
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(feedback.id)}
                    disabled={deletingId === feedback.id}
                  >
                    {deletingId === feedback.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Xoá
                  </Button>
                </div>

                {/* Testimonial Actions */}
                <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-100">
                  <Button
                    variant={feedback.is_testimonial ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleTestimonial(feedback)}
                  >
                    {feedback.is_testimonial ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Gỡ Testimonial
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Thêm vào Testimonials
                      </>
                    )}
                  </Button>

                  {feedback.is_testimonial && (
                    <>
                      <Button
                        variant={feedback.display_on_homepage ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleHomepage(feedback)}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        {feedback.display_on_homepage ? 'Ẩn khỏi trang chủ' : 'Hiển thị trang chủ'}
                      </Button>

                      <Button
                        variant={feedback.is_featured ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleFeatured(feedback)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {feedback.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                      </Button>
                    </>
                  )}
                </div>

                {/* Edit testimonial details */}
                {feedback.is_testimonial && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Chức vụ</label>
                      <input
                        type="text"
                        placeholder="VD: Giám đốc"
                        value={feedback.position_title || ''}
                        onChange={(e) => handleUpdateDetails(feedback, { position_title: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Công ty</label>
                      <input
                        type="text"
                        placeholder="VD: ABC Company"
                        value={feedback.company_name || ''}
                        onChange={(e) => handleUpdateDetails(feedback, { company_name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Thứ tự hiển thị</label>
                      <input
                        type="number"
                        placeholder="VD: 1"
                        value={feedback.display_order || 0}
                        onChange={(e) => handleUpdateOrder(feedback, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </>
  )
}

