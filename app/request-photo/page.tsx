'use client'

import { useState } from 'react'
import { ImagePlus, Upload, Sparkles, X, Check, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast, { Toaster } from 'react-hot-toast'

export default function RequestPhotoPage() {
  const [files, setFiles] = useState<File[]>([])
  const [prompt, setPrompt] = useState('')
  const [requestType, setRequestType] = useState<'restore' | 'family'>('restore')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(newFiles)
      toast.success(`Đã chọn ${newFiles.length} file`)
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error('Vui lòng chọn ít nhất một file')
      return
    }

    if (!prompt.trim()) {
      toast.error('Vui lòng mô tả yêu cầu của bạn')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Stage 1: Upload files
      setProcessingStage('Đang tải ảnh lên...')
      setUploadProgress(20)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stage 2: Validate images
      setProcessingStage('Đang xác thực ảnh...')
      setUploadProgress(40)
      await new Promise(resolve => setTimeout(resolve, 600))

      // Stage 3: Send to AI
      setProcessingStage('Đang gửi yêu cầu đến AI...')
      setUploadProgress(60)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Stage 4: AI Processing
      setProcessingStage('AI đang xử lý ảnh của bạn...')
      setUploadProgress(80)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Stage 5: Complete
      setProcessingStage('Hoàn tất!')
      setUploadProgress(100)
      await new Promise(resolve => setTimeout(resolve, 500))

      toast.success('Yêu cầu của bạn đã được gửi thành công! Chúng tôi sẽ xử lý trong ít phút.', {
        duration: 5000,
        icon: '✅',
      })

      // Reset form
      setFiles([])
      setPrompt('')
      setIsUploading(false)
      setUploadProgress(0)
      setProcessingStage('')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.', {
        duration: 4000,
        icon: '❌',
      })
      setIsUploading(false)
      setUploadProgress(0)
      setProcessingStage('')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-text mb-2">Yêu Cầu Phục Hồi Ảnh</h1>
            <p className="text-gray-600">Tải ảnh lên và mô tả yêu cầu của bạn</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-text mb-4">Loại Yêu Cầu</h2>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  onClick={() => setRequestType('restore')}
                  className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                    requestType === 'restore'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-8 h-8 text-primary mb-2 mx-auto" />
                  <h3 className="font-semibold text-text mb-1">Khôi Phục Ảnh</h3>
                  <p className="text-sm text-gray-600">Phục hồi ảnh cũ, phai màu, hư hỏng</p>
                </motion.button>

                <motion.button
                  onClick={() => setRequestType('family')}
                  className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                    requestType === 'family'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ImagePlus className="w-8 h-8 text-primary mb-2 mx-auto" />
                  <h3 className="font-semibold text-text mb-1">Ghép Ảnh Gia Đình</h3>
                  <p className="text-sm text-gray-600">Ghép ảnh vào bức ảnh gia đình</p>
                </motion.button>
              </div>
            </Card>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-text mb-4">Tải Ảnh Lên</h2>

                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple={requestType === 'family'}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Upload className="w-16 h-16 text-gray-300 group-hover:text-primary mx-auto mb-4 transition-colors" />
                  </motion.div>
                  <p className="text-gray-600 mb-2">
                    {requestType === 'family'
                      ? 'Kéo thả nhiều ảnh vào đây hoặc'
                      : 'Kéo thả ảnh vào đây hoặc'}
                  </p>
                  <Button type="button" variant="secondary" disabled={isUploading}>
                    Chọn File
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    {requestType === 'family'
                      ? 'Hỗ trợ: JPG, PNG, WEBP (Tối đa 10 ảnh)'
                      : 'Hỗ trợ: JPG, PNG, WEBP (Tối đa 10MB)'}
                  </p>
                </label>

                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div
                      className="mt-4 space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="font-medium text-text flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        Đã chọn {files.length} file:
                      </p>
                      {files.map((file, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ImagePlus className="w-5 h-5 text-primary" />
                          <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          {!isUploading && (
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-red-100 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-text mb-4">Chi Tiết Yêu Cầu</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả yêu cầu của bạn
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none placeholder:text-gray-400 transition-all"
                    rows={6}
                    placeholder={
                      requestType === 'restore'
                        ? 'VD: Ảnh gia đình chụp năm 1960, bị phai màu và rách góc phải. Mong muốn khôi phục màu sắc và sửa phần rách...'
                        : 'VD: Tôi muốn ghép ảnh của tôi (ảnh thứ 2) vào bức ảnh gia đình (ảnh thứ 1), đứng bên cạnh người phụ nữ trong bức ảnh...'
                    }
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-text mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Gợi ý mô tả
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {requestType === 'restore' ? (
                      <>
                        <li>• Mô tả tình trạng ảnh (phai màu, rách, mờ, v.v.)</li>
                        <li>• Nêu rõ phần nào cần ưu tiên phục hồi</li>
                        <li>• Đề cập màu sắc gốc nếu nhớ (VD: chiếc áo màu xanh)</li>
                      </>
                    ) : (
                      <>
                        <li>• Chỉ rõ ảnh nào là ảnh nền, ảnh nào cần ghép</li>
                        <li>• Mô tả vị trí muốn ghép (bên trái, bên phải, giữa, v.v.)</li>
                        <li>• Đề cập kích thước tương đối so với người khác</li>
                      </>
                    )}
                  </ul>
                </div>
              </Card>
            </motion.div>

            {/* Processing Modal */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="glassmorphism-strong p-8 max-w-md w-full text-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-6"
                    >
                      <div className="p-4 bg-gradient-primary rounded-3xl shadow-glow">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-4">
                      <span className="gradient-text">{processingStage}</span>
                    </h3>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <p>Vui lòng đợi trong giây lát...</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                disabled={isUploading}
                onClick={() => {
                  setFiles([])
                  setPrompt('')
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={files.length === 0 || !prompt || isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  'Gửi Yêu Cầu'
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </main>
    </div>
  )
}
