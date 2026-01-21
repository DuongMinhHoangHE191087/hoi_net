'use client'

import { useState, useEffect } from 'react'
import { Star, Trash2, Eye, Archive, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { db, Feedback } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeedback()
  }, [filter])

  const loadFeedback = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await db.getFeedback(filter === 'all' ? undefined : filter)
      setFeedbackList(data)
    } catch (err: any) {
      console.error('Error loading feedback:', err)
      setError('Không thể tải phản hồi. Vui lòng kiểm tra database.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'new' | 'read' | 'archived') => {
    try {
      await db.updateFeedback(id, { status })
      toast.success('Đã cập nhật trạng thái')
      loadFeedback()
    } catch (err) {
      console.error('Error updating feedback:', err)
      toast.error('Lỗi khi cập nhật trạng thái')
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
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text">Quản Lý Phản Hồi</h2>
          <Button variant="secondary" onClick={loadFeedback} size="sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'new', 'read', 'archived'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              onClick={() => setFilter(status)}
              size="sm"
            >
              {status === 'all' ? 'Tất cả' : getStatusLabel(status)}
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
            Chạy file migration <code className="bg-gray-100 px-2 py-1 rounded">011_complete_system_upgrade.sql</code> trong Supabase SQL Editor
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
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-text">{feedback.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {getStatusLabel(feedback.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{feedback.email}</p>
                  <p className="text-sm text-gray-500">{new Date(feedback.created_at).toLocaleString('vi-VN')}</p>
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
