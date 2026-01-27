'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Camera, User, Check } from 'lucide-react'
import Button from './Button'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onUploadSuccess: (url: string) => void
  onRemove?: () => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
  required?: boolean
  uploading?: boolean
  setUploading?: (uploading: boolean) => void
  /** User ID to upload avatar for (admin use - uploads to that user's folder) */
  uploadForUserId?: string
}

export default function AvatarUpload({
  currentAvatar,
  onUploadSuccess,
  onRemove,
  size = 'md',
  label = 'Avatar',
  required = false,
  uploading: externalUploading,
  setUploading: externalSetUploading,
  uploadForUserId
}: AvatarUploadProps) {
  const [internalUploading, setInternalUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploading = externalUploading !== undefined ? externalUploading : internalUploading
  const setUploading = externalSetUploading || setInternalUploading

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh')
      return
    }

    // Validate file size (50MB max for testing)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File không được vượt quá 50MB')
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    // If admin is uploading for another user, include their userId
    if (uploadForUserId) {
      formData.append('userId', uploadForUserId)
    }

    try {
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload thất bại')
      }

      const data = await response.json()
      onUploadSuccess(data.url)
      setPreviewUrl(data.url)
      toast.success('Tải lên avatar thành công!')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Không thể tải lên avatar')
      setPreviewUrl(currentAvatar || null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    if (onRemove) {
      onRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center group`}>
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              <AnimatePresence>
                {!uploading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <User className="w-1/2 h-1/2 text-gray-400" />
          )}

          {/* Loading Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClick}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {previewUrl ? 'Thay đổi' : 'Tải lên'}
                </>
              )}
            </Button>

            {previewUrl && !uploading && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemove}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Xóa
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            JPG, PNG hoặc WEBP. Tối đa 50MB.
          </p>
        </div>
      </div>
    </div>
  )
}

