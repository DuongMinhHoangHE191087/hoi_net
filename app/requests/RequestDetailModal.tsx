'use client'

import { useState } from 'react'
import {
  X, Download, Calendar, User, FileText, Image as ImageIcon,
  CheckCircle, XCircle, Clock, Loader2, Sparkles, Send, Key
} from 'lucide-react'
import { useGeminiKey } from '@/hooks/useGeminiKey'
import { geminiClient } from '@/lib/gemini-client'
import ApiKeySetup from '@/components/ui/ApiKeySetup'
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

interface SystemPrompt {
  id: string
  name: string
  description: string
  prompt_text: string
}

interface RequestDetailModalProps {
  request: UserRequest
  onClose: () => void
  onDelete: (id: string) => void
  onSendToAdmin: (request: UserRequest) => void
  onProcessWithAI: (request: UserRequest, promptName: string, useCustom?: boolean) => void
  systemPrompts: SystemPrompt[]
  isDeleting?: boolean
  isSending?: boolean
  isProcessing?: boolean
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

export default function RequestDetailModal({
  request,
  onClose,
  onDelete,
  onSendToAdmin,
  onProcessWithAI,
  systemPrompts,
  isDeleting,
  isSending,
  isProcessing
}: RequestDetailModalProps) {
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const [selectedSystemPromptName, setSelectedSystemPromptName] = useState<string>('')
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)
  const [isBYOKProcessing, setIsBYOKProcessing] = useState(false)
  const [byokResult, setBYOKResult] = useState<string | null>(null)
  
  // BYOK key management
  const { hasKey: hasBYOK, maskedKey } = useGeminiKey()

  const statusInfo = STATUS_CONFIG[request.status]
  const StatusIcon = statusInfo.icon

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `restored-${Date.now()}.jpg`
    link.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="glassmorphism-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold gradient-text-alt mb-2">
              {TYPE_LABELS[request.type]}
            </h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.border} border`}>
              <StatusIcon className={`w-5 h-5 ${statusInfo.color} ${request.status === 'processing' ? 'animate-spin' : ''}`} />
              <span className={`font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Mô Tả
          </h3>
          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
            {request.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              Ngày Tạo
            </div>
            <p className="font-medium text-text">{formatDate(request.created_at)}</p>
          </div>

          {request.completed_at && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                Hoàn Thành
              </div>
              <p className="font-medium text-text">{formatDate(request.completed_at)}</p>
            </div>
          )}
        </div>

        {/* Original Images */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Ảnh Gốc ({request.original_images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {request.original_images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Original ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => handleDownload(imageUrl)}
                    className="btn-glass-primary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải Về
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
              <Sparkles className="w-5 h-5 text-purple-600" />
              Ảnh Đã Khôi Phục ({request.restored_images.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {request.restored_images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Restored ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-md ring-2 ring-purple-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handleDownload(imageUrl)}
                      className="btn-glass-primary bg-gradient-primary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tải Về
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Notes */}
        {request.admin_notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text mb-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              Ghi Chú Từ Admin
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700">{request.admin_notes}</p>
            </div>
          </div>
        )}

        {/* AI Processing Section (Only for pending requests) */}
        {request.status === 'pending' && (
          <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Xử Lý Bằng AI
            </h3>
            
            {/* BYOK Result Display */}
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
              {/* System Prompt Selection */}
              {systemPrompts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn Prompt Hệ Thống
                  </label>
                  <select
                    value={selectedSystemPromptName}
                    onChange={(e) => setSelectedSystemPromptName(e.target.value)}
                    className="input-glass w-full"
                  >
                    <option value="">-- Chọn prompt --</option>
                    {systemPrompts.map((prompt) => (
                      <option key={prompt.id} value={prompt.name}>
                        {prompt.name} - {prompt.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Processing Buttons */}
              <div className="flex flex-col gap-3">
                {/* Server Processing Button */}
                <button
                  onClick={() => {
                    if (!selectedSystemPromptName && systemPrompts.length > 0) {
                      toast.error('Vui lòng chọn một prompt hệ thống')
                      return
                    }
                    onProcessWithAI(request, selectedSystemPromptName || 'restore', false)
                  }}
                  disabled={isProcessing || isBYOKProcessing}
                  className="btn-glass-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Đang Xử Lý...' : 'Xử Lý Với Quota Hệ Thống'}
                </button>
                
                {/* BYOK Processing Button */}
                {hasBYOK ? (
                  <button
                    onClick={async () => {
                      setIsBYOKProcessing(true)
                      setBYOKResult(null)
                      try {
                        const result = await geminiClient.process(
                          request.original_images[0],
                          'restore'
                        )
                        if (result.success && result.description) {
                          setBYOKResult(result.description)
                          toast.success('Phân tích AI hoàn tất!')
                        } else {
                          toast.error(result.error || 'Lỗi xử lý')
                        }
                      } catch (error: any) {
                        toast.error(error.message || 'Lỗi xử lý')
                      } finally {
                        setIsBYOKProcessing(false)
                      }
                    }}
                    disabled={isProcessing || isBYOKProcessing}
                    className="btn-glass-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-300 hover:bg-green-50"
                  >
                    <Key className="w-4 h-4 mr-2 text-green-600" />
                    {isBYOKProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý với API Key...
                      </>
                    ) : (
                      <>Xử Lý Với API Key Của Bạn ({maskedKey})</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowApiKeySetup(true)}
                    className="btn-glass-secondary flex-1 border-2 border-blue-300 hover:bg-blue-50"
                  >
                    <Key className="w-4 h-4 mr-2 text-blue-600" />
                    Thêm API Key Gemini - Dùng Không Giới Hạn
                  </button>
                )}
              </div>
              
              {/* BYOK Info */}
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                💡 Tip: Sử dụng API key riêng để không bị giới hạn lượt. 
                Key được lưu an toàn trên thiết bị của bạn.
              </div>
            </div>
          </div>
        )}
        
        {/* API Key Setup Modal */}
        <ApiKeySetup 
          isOpen={showApiKeySetup} 
          onClose={() => setShowApiKeySetup(false)} 
        />

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          {request.status === 'pending' && (
            <button
              onClick={() => onSendToAdmin(request)}
              disabled={isSending}
              className="btn-glass-secondary flex-1 disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? 'Đang Gửi...' : 'Gửi Cho Admin'}
            </button>
          )}

          <button
            onClick={() => onDelete(request.id)}
            disabled={isDeleting}
            className="btn-glass-secondary text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <X className="w-4 h-4 mr-2" />
            {isDeleting ? 'Đang Xóa...' : 'Xóa Yêu Cầu'}
          </button>

          <button
            onClick={onClose}
            className="btn-glass-primary flex-1"
          >
            Đóng
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
