'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Image as ImageIcon, Send, Loader2, CheckCircle, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { authFetch } from '@/lib/auth-fetch'

interface DeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  request: {
    id: string
    user_id: string
    type: string
    description: string
    original_images: string[]
    user_profiles?: {
      full_name: string
      phone?: string | null
      facebook_url?: string | null
    } | null
  }
  onDelivered: () => void
}

export default function DeliveryModal({ isOpen, onClose, request, onDelivered }: DeliveryModalProps) {
  const [uploading, setUploading] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [restoredImages, setRestoredImages] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [adminNotes, setAdminNotes] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (selectedFiles.length + files.length > 10) {
      toast.error('Tối đa 10 ảnh')
      return
    }

    const validFiles: File[] = []
    const validPreviews: string[] = []

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là ảnh`)
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} vượt quá 50MB`)
        return
      }
      validFiles.push(file)
      validPreviews.push(URL.createObjectURL(file))
    })

    setSelectedFiles([...selectedFiles, ...validFiles])
    setPreviewUrls([...previewUrls, ...validPreviews])
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
    setPreviewUrls(previewUrls.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const formData = new FormData()
        formData.append('file', file)

        toast.loading(`Đang tải ảnh ${i + 1}/${selectedFiles.length}...`, { id: `upload-${i}` })

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`)
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
        toast.success(`Tải ảnh ${i + 1}/${selectedFiles.length} thành công`, { id: `upload-${i}` })
      }
    } finally {
      setUploading(false)
    }

    return uploadedUrls
  }

  const handleDeliver = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh đã xử lý')
      return
    }

    setDelivering(true)

    try {
      // Upload images to Cloudinary
      const imageUrls = await uploadImages()
      setRestoredImages(imageUrls)

      // Send to API
      const response = await authFetch.post(`/api/admin/requests/${request.id}/deliver`, {
          restored_images: imageUrls,
          admin_notes: adminNotes || undefined
        })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to deliver')
      }

      toast.success('Gửi trả thành công!')
      onDelivered()
      onClose()
    } catch (error: any) {
      console.error('Delivery error:', error)
      toast.error(error.message || 'Không thể gửi trả')
    } finally {
      setDelivering(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900">
              Gửi Trả Yêu Cầu #{request.id.slice(0, 8)}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Request Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Thông tin yêu cầu</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Khách hàng:</span>
                  <p className="font-medium">{request.user_profiles?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Liên hệ:</span>
                  <p className="font-medium">
                    {request.user_profiles?.phone || request.user_profiles?.facebook_url || 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Mô tả:</span>
                  <p className="font-medium">{request.description}</p>
                </div>
              </div>
            </div>

            {/* Original Images */}
            <div>
              <h3 className="font-semibold mb-3">Ảnh gốc ({request.original_images?.length || 0})</h3>
              <div className="grid grid-cols-3 gap-3">
                {request.original_images?.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Original ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                ))}
              </div>
            </div>

            {/* Upload Restored Images */}
            <div>
              <h3 className="font-semibold mb-3">Ảnh đã xử lý</h3>
              
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading || delivering}
                />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Click để chọn ảnh đã xử lý</p>
                <p className="text-sm text-gray-500 mt-1">Tối đa 10 ảnh, mỗi ảnh 10MB</p>
              </label>

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Restored ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                        Đã xử lý
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block font-semibold mb-2">Ghi chú (tùy chọn)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ghi chú cho khách hàng về kết quả xử lý..."
                rows={3}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1" disabled={delivering}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleDeliver}
              className="flex-1"
              disabled={selectedFiles.length === 0 || uploading || delivering}
            >
              {delivering ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Gửi Trả ({selectedFiles.length} ảnh)
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

