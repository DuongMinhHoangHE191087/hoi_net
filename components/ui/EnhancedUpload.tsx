'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, X, Image as ImageIcon, CheckCircle, AlertCircle,
  Loader2, Eye, Download, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadedImage {
  file: File
  preview: string
  url?: string
  uploading?: boolean
  uploaded?: boolean
  error?: string
}

interface EnhancedUploadProps {
  maxFiles?: number
  maxSize?: number // in MB
  onUploadComplete: (urls: string[]) => void
  allowAIPreview?: boolean
  label?: string
  required?: boolean
}

export default function EnhancedUpload({
  maxFiles = 5,
  maxSize = 10,
  onUploadComplete,
  allowAIPreview = false,
  label = 'Upload Images',
  required = false
}: EnhancedUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [globalUploading, setGlobalUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)

    // Validate total count
    if (images.length + fileArray.length > maxFiles) {
      toast.error(`Tối đa ${maxFiles} ảnh`)
      return
    }

    const newImages: UploadedImage[] = []

    fileArray.forEach((file) => {
      // Validate type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là ảnh`)
        return
      }

      // Validate size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} vượt quá ${maxSize}MB`)
        return
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        uploaded: false
      })
    })

    setImages([...images, ...newImages])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    URL.revokeObjectURL(images[index].preview)
    setImages(newImages)
  }

  const uploadAllImages = async () => {
    setGlobalUploading(true)
    const uploadedUrls: string[] = []

    for (let i = 0; i < images.length; i++) {
      if (images[i].uploaded && images[i].url) {
        uploadedUrls.push(images[i].url!)
        continue
      }

      try {
        // Update state: uploading
        setImages(prev => prev.map((img, idx) =>
          idx === i ? { ...img, uploading: true, error: undefined } : img
        ))

        // Upload to Cloudinary
        const formData = new FormData()
        formData.append('file', images[i].file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Upload failed')
        }

        const data = await response.json()
        uploadedUrls.push(data.url)

        // Update state: uploaded
        setImages(prev => prev.map((img, idx) =>
          idx === i ? { ...img, uploading: false, uploaded: true, url: data.url } : img
        ))

        toast.success(`Uploaded ${i + 1}/${images.length}`)
      } catch (error: any) {
        console.error('Upload error:', error)

        // Update state: error
        setImages(prev => prev.map((img, idx) =>
          idx === i ? { ...img, uploading: false, error: error.message } : img
        ))

        toast.error(`Failed to upload ${images[i].file.name}`)
      }
    }

    setGlobalUploading(false)

    if (uploadedUrls.length > 0) {
      onUploadComplete(uploadedUrls)
    }

    return uploadedUrls
  }

  const hasUploadedAll = images.length > 0 && images.every(img => img.uploaded)
  const hasErrors = images.some(img => img.error)

  return (
    <div className="space-y-4">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 scale-105'
            : images.length >= maxFiles
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
        }`}
        onClick={() => {
          if (images.length < maxFiles) {
            fileInputRef.current?.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={images.length >= maxFiles}
        />

        <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-primary animate-bounce' : 'text-gray-400'}`} />

        <p className="text-gray-700 font-medium mb-1">
          {isDragging ? 'Thả ảnh vào đây' : 'Click để chọn ảnh hoặc kéo thả vào đây'}
        </p>

        <p className="text-sm text-gray-500">
          Hỗ trợ: JPG, PNG, WEBP (Tối đa {maxFiles} ảnh, mỗi ảnh {maxSize}MB)
        </p>

        {images.length > 0 && (
          <p className="text-sm text-primary mt-2 font-medium">
            Đã chọn {images.length}/{maxFiles} ảnh
          </p>
        )}
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <div className={`relative rounded-lg overflow-hidden border-2 ${
                    image.uploaded ? 'border-green-300' :
                    image.error ? 'border-red-300' :
                    image.uploading ? 'border-blue-300' :
                    'border-gray-200'
                  }`}>
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 text-white text-xs">
                        {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>

                    {/* Status Icons */}
                    {image.uploading && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      </div>
                    )}

                    {image.uploaded && (
                      <div className="absolute top-2 left-2">
                        <CheckCircle className="w-6 h-6 text-green-600 bg-white rounded-full" />
                      </div>
                    )}

                    {image.error && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      </div>
                    )}

                    {/* Remove Button */}
                    {!image.uploading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(index)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Error Message */}
                  {image.error && (
                    <p className="text-xs text-red-600 mt-1 line-clamp-2">
                      {image.error}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Upload All Button */}
          {!hasUploadedAll && (
            <button
              type="button"
              onClick={uploadAllImages}
              disabled={globalUploading || images.length === 0}
              className="w-full btn-glass-primary py-3 flex items-center justify-center gap-2"
            >
              {globalUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Tải lên tất cả ({images.filter(i => !i.uploaded).length})
                </>
              )}
            </button>
          )}

          {/* Success Message */}
          {hasUploadedAll && (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <CheckCircle className="w-5 h-5" />
              <span>Đã tải lên {images.length} ảnh thành công!</span>
            </div>
          )}

          {/* Retry Upload */}
          {hasErrors && !globalUploading && (
            <button
              type="button"
              onClick={uploadAllImages}
              className="w-full btn-glass-secondary py-3 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              Thử lại các ảnh lỗi
            </button>
          )}
        </div>
      )}
    </div>
  )
}
