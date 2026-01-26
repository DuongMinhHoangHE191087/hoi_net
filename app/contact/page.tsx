'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, MessageSquare, Upload, X, Star, CheckCircle, Sparkles } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { db } from '@/lib/supabase'
import { useSiteSettings, DEFAULT_SITE_SETTINGS } from '@/hooks/useSiteSettings'

export default function ContactPage() {
  const { data: settings = DEFAULT_SITE_SETTINGS } = useSiteSettings()
  const contactEmail = settings.contact_email || DEFAULT_SITE_SETTINGS.contact_email

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    rating: 0
  })
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles([...files, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setUploadProgress(0)

    try {
      // Upload files if any
      let fileUrls: string[] = []
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const formData = new FormData()
          formData.append('file', file)

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          if (res.ok) {
            const data = await res.json()
            fileUrls.push(data.url)
            setUploadProgress(((i + 1) / files.length) * 100)
          }
        }
      }

      // Create feedback with file URLs
      await db.createFeedback({
        name: formData.name,
        email: formData.email,
        message: `${formData.message}\n\nSố điện thoại: ${formData.phone}\n\nFile đính kèm: ${fileUrls.join(', ')}`,
        rating: formData.rating || undefined
      })

      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', message: '', rating: 0 })
      setFiles([])
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-40 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <Navbar />

      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text-alt">Liên Hệ Với Chúng Tôi</span>
            </h1>
            <p className="text-xl text-gray-700">
              Gửi phản hồi, câu hỏi hoặc yêu cầu phục hồi ảnh. Chúng tôi sẽ phản hồi sớm nhất! ✨
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glassmorphism-strong p-8 text-center card-hover shadow-glow-pink"
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-pink">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">Email</h3>
              <p className="text-gray-700 font-medium">{contactEmail}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glassmorphism-strong p-8 text-center card-hover shadow-glow"
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">Chat</h3>
              <p className="text-gray-700 font-medium">Trò chuyện trực tiếp</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glassmorphism-strong p-8 text-center card-hover shadow-glow-yellow"
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-yellow">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">Phản Hồi</h3>
              <p className="text-gray-700 font-medium">Gửi phản hồi trực tiếp</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glassmorphism-strong p-8 md:p-12"
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-text mb-4">Cảm ơn bạn!</h2>
                <p className="text-xl text-gray-700 mb-8">
                  Chúng tôi đã nhận được yêu cầu của bạn và sẽ liên hệ sớm nhất.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setSubmitted(false)}
                  className="btn-glass-primary"
                >
                  Gửi Yêu Cầu Khác
                </Button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-text mb-8 text-center">
                  Gửi Yêu Cầu Của Bạn
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Tên của bạn *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-glass"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-glass"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-glass"
                      placeholder="0123 456 789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Mô tả yêu cầu *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="textarea-glass"
                      rows={6}
                      placeholder="Mô tả chi tiết yêu cầu của bạn..."
                      required
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Tải ảnh lên (tùy chọn)
                    </label>
                    <div className="glassmorphism-light p-6 border-2 border-dashed border-white/50 hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        multiple
                        accept="image/*"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <Upload className="w-12 h-12 text-gray-600 mb-3" />
                        <p className="text-gray-700 font-medium mb-1">
                          Kéo thả ảnh vào đây hoặc click để chọn
                        </p>
                        <p className="text-sm text-gray-600">
                          Hỗ trợ: JPG, PNG, WEBP (Tối đa 10MB/file)
                        </p>
                      </label>
                    </div>

                    {/* File Preview */}
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="glassmorphism-light p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Upload className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                <p className="text-xs text-gray-600">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-error hover:text-error/80 transition"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="bg-white/30 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-700 mt-2 text-center">
                          Đang tải lên... {Math.round(uploadProgress)}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Đánh giá trải nghiệm (tùy chọn)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 transition ${
                              star <= formData.rating
                                ? 'fill-primary text-primary'
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="btn-glass-primary w-full"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent" />
                        Đang gửi...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
                        Gửi Yêu Cầu
                        <Sparkles className="w-5 h-5" />
                      </span>
                    )}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

