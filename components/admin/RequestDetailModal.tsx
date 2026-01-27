'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, User, Mail, Phone, Facebook, Calendar, FileText,
  Image as ImageIcon, Download, Sparkles, Loader2,
  CheckCircle, XCircle, Clock, Send, AlertCircle, History,
  ExternalLink, Copy, Info
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { SafeAvatar } from '@/components/ui/SafeImage'
import { authFetch } from '@/lib/auth-fetch'
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

interface Props {
  isOpen: boolean
  onClose: () => void
  request: UserRequest
  onUpdate: () => void
}

export default function RequestDetailModal({ isOpen, onClose, request, onUpdate }: Props) {
  const [processing, setProcessing] = useState(false)
  const [aiAction, setAiAction] = useState<'restore' | 'enhance' | 'colorize'>('restore')
  const [showHistory, setShowHistory] = useState(false)

  const handleAIProcess = async () => {
    setProcessing(true)

    try {
      const response = await authFetch.post(
        `/api/admin/requests/${request.id}/process-ai`,
        {
          action: aiAction,
          prompt: `Professional ${aiAction} for this image`
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'AI processing failed')
      }

      const data = await response.json()

      toast.success(`AI processed ${data.summary.successful}/${data.summary.total} images`)
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to process with AI')
    } finally {
      setProcessing(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await authFetch.patch(
        `/api/admin/requests/${request.id}/deliver`,
        { status: newStatus }
      )

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success('Status updated successfully')
      onUpdate()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã copy ${label}`)
  }

  const getStatusBadge = () => {
    const badges = {
      pending: { icon: Clock, text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      processing: { icon: Loader2, text: 'Đang xử lý', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      completed: { icon: CheckCircle, text: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200' },
      rejected: { icon: XCircle, text: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200' }
    }

    const badge = badges[request.status]
    const Icon = badge.icon

    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border ${badge.color}`}>
        <Icon className={`w-4 h-4 ${request.status === 'processing' ? 'animate-spin' : ''}`} />
        {badge.text}
      </span>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Chi Tiết Yêu Cầu</h2>
                <p className="text-sm text-white/80">ID: {request.id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6 space-y-6">
            {/* User Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Thông Tin Khách Hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <SafeAvatar
                    src={request.user_profiles?.avatar_url}
                    alt={request.user_profiles?.full_name || 'User'}
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {request.user_profiles?.full_name || 'Không có tên'}
                    </p>
                    <p className="text-sm text-gray-500">Khách hàng</p>
                  </div>
                </div>
                {request.user_profiles?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${request.user_profiles.phone}`} className="text-primary hover:underline">
                      {request.user_profiles.phone}
                    </a>
                    <button
                      onClick={() => copyToClipboard(request.user_profiles!.phone!, 'SĐT')}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )}
                {request.user_profiles?.facebook_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Facebook className="w-4 h-4 text-gray-400" />
                    <a
                      href={request.user_profiles.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Facebook Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(request.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Request Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Nội Dung Yêu Cầu
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {request.type === 'restore' ? 'Khôi phục ảnh' : 'Ghép ảnh gia đình'}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
              </div>
            </div>

            {/* Original Images */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Ảnh Gốc ({request.original_images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {request.original_images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Original ${i + 1}`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <a
                      href={url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Processing Section */}
            {request.status !== 'completed' && request.status !== 'rejected' && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Processing
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {(['restore', 'enhance', 'colorize'] as const).map((action) => (
                      <button
                        key={action}
                        onClick={() => setAiAction(action)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          aiAction === action
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {action === 'restore' && 'Khôi phục'}
                        {action === 'enhance' && 'Nâng cao'}
                        {action === 'colorize' && 'Tô màu'}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleAIProcess}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Đang xử lý với AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Xử lý với AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {request.admin_notes && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Lịch Sử Xử Lý
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="ml-auto text-sm text-primary hover:underline"
                  >
                    {showHistory ? 'Thu gọn' : 'Xem chi tiết'}
                  </button>
                </h3>
                {showHistory && (
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 max-h-60 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {request.admin_notes}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Delivered/Restored Images - DELIVERY HISTORY */}
            {request.restored_images && request.restored_images.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Ảnh Đã Gửi Trả ({request.restored_images.length})
                  {request.completed_at && (
                    <span className="ml-auto text-sm font-normal text-green-600">
                      Giao lúc: {new Date(request.completed_at).toLocaleString('vi-VN')}
                    </span>
                  )}
                </h3>
                
                {/* Delivery Info Banner */}
                <div className="mb-4 p-3 bg-white/80 rounded-lg border border-green-300 flex items-center gap-2">
                  <Info className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-800">
                    Kết quả đã được gửi cho khách hàng. Họ có thể tải về từ trang yêu cầu.
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {request.restored_images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt={`Restored ${i + 1}`}
                        className="w-full h-48 object-cover rounded-lg border-2 border-green-300 shadow-md"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-xs font-medium">Ảnh #{i + 1}</span>
                          <a
                            href={url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4 text-white" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Download All Button */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      request.restored_images?.forEach((url, i) => {
                        setTimeout(() => {
                          const link = document.createElement('a')
                          link.href = url
                          link.download = `restored_${request.id.slice(0,8)}_${i+1}.jpg`
                          link.target = '_blank'
                          link.click()
                        }, i * 300)
                      })
                      toast.success('Đang tải tất cả ảnh...')
                    }}
                    className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Tải Tất Cả ({request.restored_images.length} ảnh)
                  </button>
                  <button
                    onClick={() => {
                      const urls = request.restored_images?.join('\n') || ''
                      navigator.clipboard.writeText(urls)
                      toast.success('Đã copy tất cả URL')
                    }}
                    className="py-2.5 px-4 bg-white border-2 border-green-300 hover:bg-green-50 text-green-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy URLs
                  </button>
                </div>
              </div>
            )}

            {/* No Restored Images Yet (for completed status without images) */}
            {request.status === 'completed' && (!request.restored_images || request.restored_images.length === 0) && (
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span>Yêu cầu đã hoàn thành nhưng chưa có ảnh được gửi trả.</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {request.status === 'pending' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate('processing')}
                  className="flex-1"
                >
                  <Loader2 className="w-5 h-5 mr-2" />
                  Bắt Đầu Xử Lý
                </Button>
              )}
              {request.status === 'processing' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate('completed')}
                  className="flex-1"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Đánh Dấu Hoàn Thành
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={onClose}
                className="px-8"
              >
                Đóng
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

