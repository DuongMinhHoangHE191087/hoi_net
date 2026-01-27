'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Image as ImageIcon, Send, Loader2, CheckCircle, Trash2, AlertCircle, FileImage } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { authFetch } from '@/lib/auth-fetch'

// Allowed image types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff'
]

// Max file size: 50MB (in bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

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
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (selectedFiles.length + files.length > 10) {
      toast.error('Tối đa 10 ảnh')
      return
    }

    const validFiles: File[] = []
    const validPreviews: string[] = []
    const errors: string[] = []

    files.forEach(file => {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Định dạng không hỗ trợ (${file.type || 'unknown'})`)
        return
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File quá lớn (${formatFileSize(file.size)} > 50MB)`)
        return
      }
      
      validFiles.push(file)
      validPreviews.push(URL.createObjectURL(file))
    })

    // Show errors if any
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err, { duration: 4000 }))
    }

    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles])
      setPreviewUrls([...previewUrls, ...validPreviews])
      toast.success(`Đã thêm ${validFiles.length} ảnh`)
    }
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
    setPreviewUrls(previewUrls.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    setUploading(true)
    setUploadProgress(0)
    const uploadedUrls: string[] = []
    const totalFiles = selectedFiles.length

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const formData = new FormData()
        formData.append('file', file)

        toast.loading(`Đang tải ảnh ${i + 1}/${totalFiles} (${formatFileSize(file.size)})...`, { id: `upload-${i}` })

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          // Handle specific errors
          if (response.status === 413) {
            throw new Error(`${file.name}: File quá lớn - vui lòng nén ảnh`)
          }
          throw new Error(data.message || `Upload failed for ${file.name}`)
        }

        uploadedUrls.push(data.url)
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
        toast.success(`Tải ảnh ${i + 1}/${totalFiles} thành công`, { id: `upload-${i}` })
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(`Lỗi tải ảnh: ${error.message}`)
      throw error
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
      // Upload images to Cloudinary (NOT using AI/Gemini)
      const imageUrls = await uploadImages()
      setRestoredImages(imageUrls)

      // Send to delivery API (this does NOT call Gemini)
      const response = await authFetch.post(`/api/admin/requests/${request.id}/deliver`, {
        restored_images: imageUrls,
        admin_notes: adminNotes || undefined,
        notify_user: true
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || error.message || 'Failed to deliver')
      }

      toast.success('🎉 Gửi trả thành công! Người dùng đã được thông báo.')
      onDelivered()
      onClose()
    } catch (error: any) {
      console.error('Delivery error:', error)
      toast.error(`Lỗi: ${error.message}`)
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
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileImage className="w-5 h-5 text-green-600" />
                Ảnh đã xử lý
              </h3>
              
              {/* File requirements info */}
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold">Yêu cầu file:</p>
                    <ul className="mt-1 space-y-0.5">
                      <li>• Định dạng: JPEG, PNG, GIF, WebP, BMP, TIFF</li>
                      <li>• Kích thước tối đa: 50MB mỗi file</li>
                      <li>• Số lượng: Tối đa 10 ảnh</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading || delivering}
                />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Click để chọn ảnh đã xử lý</p>
                <p className="text-sm text-gray-500 mt-1">JPEG, PNG, GIF, WebP • Tối đa 50MB/ảnh</p>
              </label>

              {/* Upload Progress */}
              {uploading && uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Đang tải lên...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Đã chọn {selectedFiles.length} ảnh ({selectedFiles.reduce((acc, f) => acc + f.size, 0) > 0 ? formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0)) : '0 B'})
                    </span>
                    {selectedFiles.length > 0 && (
                      <button
                        onClick={() => {
                          previewUrls.forEach(url => URL.revokeObjectURL(url))
                          setSelectedFiles([])
                          setPreviewUrls([])
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
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
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                            Đã xử lý
                          </span>
                          <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                            {formatFileSize(selectedFiles[index]?.size || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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

