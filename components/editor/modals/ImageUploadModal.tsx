'use client'

import { useState, useCallback } from 'react'
import { X, Upload, Link2, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (url: string, alt?: string) => void
}

export default function ImageUploadModal({ isOpen, onClose, onInsert }: ImageUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File không được vượt quá 50MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setPreviewUrl(data.url)
      setImageUrl(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Lỗi khi upload ảnh. Vui lòng thử lại.')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [handleFileUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }, [handleFileUpload])

  const handleInsert = () => {
    if (imageUrl) {
      onInsert(imageUrl, altText || undefined)
      handleClose()
    }
  }

  const handleClose = () => {
    setImageUrl('')
    setAltText('')
    setPreviewUrl(null)
    setActiveTab('upload')
    onClose()
  }

  const handleUrlPreview = () => {
    if (imageUrl) {
      setPreviewUrl(imageUrl)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Chèn hình ảnh</h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Tải lên
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'url'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Link2 className="w-4 h-4 inline mr-2" />
              URL
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {activeTab === 'upload' ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 hover:border-primary/50'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-gray-600">Đang tải lên...</p>
                  </div>
                ) : previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                    <button
                      onClick={() => {
                        setPreviewUrl(null)
                        setImageUrl('')
                      }}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Xóa và chọn ảnh khác
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">
                      Kéo thả ảnh vào đây hoặc
                    </p>
                    <label className="inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
                      Chọn file
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">
                      Hỗ trợ: JPG, PNG, GIF, WEBP (tối đa 10MB)
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL hình ảnh
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    />
                    <button
                      onClick={handleUrlPreview}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Xem
                    </button>
                  </div>
                </div>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                    onError={() => {
                      setPreviewUrl(null)
                      toast.error('Không thể tải ảnh từ URL này')
                    }}
                  />
                )}
              </div>
            )}

            {/* Alt text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả ảnh (Alt text)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Mô tả ngắn gọn về hình ảnh"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Alt text giúp SEO và hỗ trợ người dùng khiếm thị
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleInsert}
              disabled={!imageUrl}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Chèn ảnh
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

