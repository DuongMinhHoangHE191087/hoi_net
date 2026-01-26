'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Upload, X, Image as ImageIcon, FileText, ArrowLeft,
  Loader2, CheckCircle, AlertCircle, Camera, Sparkles, Send
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { sanitizeInput } from '@/lib/security'
import { createClient } from '@/lib/supabase/client'
import { checkProfileComplete } from '@/lib/profile-check'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FullScreenLoading } from '@/components/UniversalLoading'

const REQUEST_TYPES = [
  {
    value: 'restore' as const,
    label: 'Phục Hồi Ảnh Cũ',
    description: 'Khôi phục ảnh cũ, phai màu, hư hỏng bằng AI',
    icon: ImageIcon,
    gradient: 'from-primary/10 to-secondary/10',
    aiAction: 'restore' as const
  },
  {
    value: 'family' as const,
    label: 'Ảnh Gia Đình',
    description: 'Chỉnh sửa, ghép ảnh gia đình chuyên nghiệp',
    icon: Camera,
    gradient: 'from-blue-50 to-purple-50',
    aiAction: 'enhance' as const
  }
]

export default function NewRequestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  // Create supabase client
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    type: 'restore' as 'restore' | 'family',
    description: '',
    useAI: true,
    sendToAdmin: true
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/requests/new')
    }
  }, [authLoading, user, router])

  // Check profile completeness
  useEffect(() => {
    const checkProfile = async () => {
      if (user?.id) {
        const result = await checkProfileComplete(user.id)
        setProfileComplete(result.complete)
      }
    }
    checkProfile()
  }, [user?.id])

  // Show loading screen
  if (authLoading) {
    return <FullScreenLoading message="Đang chuẩn bị..." />
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validate file count
    if (selectedFiles.length + files.length > 5) {
      toast.error('Tối đa 5 ảnh')
      return
    }

    // Validate each file
    const validFiles: File[] = []
    const validPreviews: string[] = []

    files.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là ảnh`)
        return
      }

      // Check file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} vượt quá 50MB`)
        return
      }

      validFiles.push(file)
      validPreviews.push(URL.createObjectURL(file))
    })

    setSelectedFiles([...selectedFiles, ...validFiles])
    setPreviewUrls([...previewUrls, ...validPreviews])
    setUploadedUrls([]) // Reset uploaded URLs when new files selected
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)

    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index])

    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)
    setUploadedUrls([]) // Reset uploaded URLs when files change
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploadedImageUrls: string[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]

      try {
        const formData = new FormData()
        formData.append('file', file)

        toast.loading(`Đang tải ảnh ${i + 1}/${selectedFiles.length}...`, { id: `upload-${i}` })

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Upload failed' }))
          throw new Error(error.message || `Upload failed for ${file.name}`)
        }

        const data = await response.json()
        uploadedImageUrls.push(data.url)

        toast.success(`Tải ảnh ${i + 1}/${selectedFiles.length} thành công`, { id: `upload-${i}` })
      } catch (error: any) {
        console.error('Upload error:', error)
        toast.error(`Không thể tải ${file.name}: ${error.message}`, { id: `upload-${i}` })
        throw error
      }
    }

    return uploadedImageUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Check profile completeness
    if (profileComplete === false) {
      toast.error('Vui lòng cập nhật hồ sơ trước khi gửi yêu cầu')
      router.push('/profile?required=contact')
      return
    }

    // Validate files
    if (selectedFiles.length === 0) {
      setErrors({ images: 'Vui lòng chọn ít nhất 1 ảnh' })
      toast.error('Vui lòng chọn ít nhất 1 ảnh')
      return
    }

    if (selectedFiles.length > 5) {
      setErrors({ images: 'Tối đa 5 ảnh' })
      toast.error('Tối đa 5 ảnh')
      return
    }

    // Validate description
    const description = sanitizeInput(formData.description, 1000)
    if (description.length < 10) {
      setErrors({ description: 'Mô tả phải có ít nhất 10 ký tự' })
      toast.error('Mô tả phải có ít nhất 10 ký tự')
      return
    }

    setLoading(true)
    setUploading(true)

    try {
      // Upload images to storage
      const imageUrls = await uploadImages()
      setUploadedUrls(imageUrls)
      setUploading(false)

      // Create request via API (uses server-side supabaseAdmin to bypass RLS)
      console.log('[NewRequest] Creating request via API...', {
        user_id: user?.id,
        type: formData.type,
        status: formData.sendToAdmin ? 'pending' : 'processing',
        images_count: imageUrls.length
      })
      
      const createResponse = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: formData.type,
          description: description,
          original_images: imageUrls,
          status: formData.sendToAdmin ? 'pending' : 'processing',
          use_ai: formData.useAI
        })
      })

      const createResult = await createResponse.json()

      if (!createResponse.ok) {
        console.error('[NewRequest] API error:', createResult)
        throw new Error(createResult.message || 'Không thể tạo yêu cầu')
      }

      const insertedRequest = createResult.request

      console.log('[NewRequest] Request created successfully:', {
        id: insertedRequest.id,
        status: insertedRequest.status,
        user_id: insertedRequest.user_id
      })

      toast.success('Gửi yêu cầu thành công!')

      // Admins are notified automatically by the API

      // If AI processing is enabled, trigger it
      if (formData.useAI && insertedRequest) {
        const aiProcessingToast = toast.loading('Đang xử lý với AI...', { duration: Infinity })

        try {
          const selectedType = REQUEST_TYPES.find(t => t.value === formData.type)
          const aiAction = selectedType?.aiAction || 'restore'

          const aiResponse = await fetch(`/api/admin/requests/${insertedRequest.id}/process-ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              action: aiAction,
              prompt: `Professional ${aiAction} for this image`
            })
          })

          const aiData = await aiResponse.json()

          if (aiResponse.ok) {
            toast.success(
              `AI đã xử lý ${aiData.summary.successful}/${aiData.summary.total} ảnh thành công!`,
              { id: aiProcessingToast }
            )
          } else {
            // ✅ FIX: Handle errors properly
            toast.error(
              `AI không xử lý được: ${aiData.message || 'Lỗi không xác định'}. Admin sẽ xử lý thủ công.`,
              { id: aiProcessingToast, duration: 5000 }
            )
            
            // Update request status back to pending for admin review
            await supabase
              .from('user_requests')
              .update({
                status: 'pending',
                admin_notes: `AI tự động thất bại: ${aiData.message || 'Unknown error'}. Cần xử lý thủ công.`
              })
              .eq('id', insertedRequest.id)
          }
        } catch (aiError: any) {
          console.error('AI processing error:', aiError)
          toast.error(
            'AI không xử lý được. Admin sẽ xử lý thủ công cho bạn.',
            { id: aiProcessingToast, duration: 5000 }
          )
          
          // Update request status for manual processing
          try {
            await supabase
              .from('user_requests')
              .update({
                status: 'pending',
                admin_notes: `AI tự động thất bại: ${aiError.message}. Cần xử lý thủ công.`
              })
              .eq('id', insertedRequest.id)
          } catch (updateError) {
            console.error('Failed to update request status:', updateError)
          }
        }
      }

      // Redirect to requests page
      setTimeout(() => {
        router.push('/requests')
      }, 2000) // ✅ Increased delay to show AI result

    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error.message || 'Không thể gửi yêu cầu')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <h1 className="text-4xl font-bold gradient-text mb-2">Gửi Yêu Cầu Mới</h1>
          <p className="text-gray-600">Phục hồi ảnh cũ bằng AI tự động hoặc thủ công</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glassmorphism-strong p-8"
        >
          {/* Profile Warning */}
          {profileComplete === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 mb-1">
                    Cần thông tin liên hệ
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    Để nhận ảnh đã xử lý, vui lòng cập nhật số điện thoại hoặc Facebook.
                  </p>
                  <Link
                    href="/contact-setup?redirect=/requests/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    Cập nhật ngay
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Loại Yêu Cầu <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REQUEST_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <motion.div
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        formData.type === type.value
                          ? 'bg-gradient-primary text-white shadow-glow-pink'
                          : `bg-gradient-to-br ${type.gradient} hover:shadow-lg`
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 ${formData.type === type.value ? 'text-white' : 'text-primary'}`} />
                        <div>
                          <h3 className={`font-semibold mb-1 ${formData.type === type.value ? 'text-white' : 'text-gray-800'}`}>
                            {type.label}
                          </h3>
                          <p className={`text-sm ${formData.type === type.value ? 'text-white/90' : 'text-gray-600'}`}>
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô Tả <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  placeholder="Mô tả chi tiết về ảnh và yêu cầu của bạn..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className={`input-glass pl-12 resize-none ${errors.description ? 'border-2 border-red-500' : ''}`}
                  required
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Tối thiểu 10 ký tự, tối đa 1000 ký tự
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ảnh <span className="text-red-500">*</span>
              </label>

              {/* Upload Button */}
              <label
                className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  errors.images
                    ? 'border-red-500 bg-red-50/50'
                    : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={selectedFiles.length >= 5}
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">
                  Click để chọn ảnh hoặc kéo thả vào đây
                </p>
                <p className="text-sm text-gray-500">
                  Hỗ trợ: JPG, PNG, WEBP (Tối đa 5 ảnh, mỗi ảnh 10MB)
                </p>
              </label>

              {errors.images && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.images}
                </p>
              )}

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {previewUrls.map((url, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {(selectedFiles[index].size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Đã chọn {selectedFiles.length}/5 ảnh
                </p>
              )}
            </div>

            {/* AI & Admin Options */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Tùy Chọn Xử Lý
              </h3>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useAI}
                  onChange={(e) => setFormData({ ...formData, useAI: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
                <div>
                  <p className="font-medium text-gray-800">Xử lý tự động với AI</p>
                  <p className="text-sm text-gray-600">AI sẽ tự động phân tích và đề xuất cải thiện</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sendToAdmin}
                  onChange={(e) => setFormData({ ...formData, sendToAdmin: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
                <div>
                  <p className="font-medium text-gray-800">Gửi cho Admin xem xét</p>
                  <p className="text-sm text-gray-600">Admin sẽ kiểm tra và gửi kết quả cuối cùng</p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-glass-primary flex-1 py-3"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {uploading ? 'Đang tải ảnh lên...' : 'Đang gửi...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Gửi Yêu Cầu
                    </>
                  )}
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="btn-glass-secondary px-8 py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Hủy
              </motion.button>
            </div>
          </form>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Lưu ý</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>AI sẽ tự động xử lý ngay sau khi gửi (nếu được chọn)</li>
                  <li>Admin sẽ kiểm tra và gửi kết quả cuối trong 1-3 ngày</li>
                  <li>Bạn sẽ nhận thông báo qua email khi hoàn thành</li>
                  <li>Xem trạng thái tại trang "Yêu Cầu"</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

