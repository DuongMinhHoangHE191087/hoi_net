'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, MessageSquare, Upload, X, Star, CheckCircle, Sparkles, AlertCircle, Clock, Shield, ArrowRight, User, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useSiteSettings, DEFAULT_SITE_SETTINGS } from '@/hooks/useSiteSettings'
import { useAuth } from '@/lib/auth'
import toast, { Toaster } from 'react-hot-toast'

// Cooldown key for localStorage
const COOLDOWN_KEY = 'contact_last_submit'
const COOLDOWN_DURATION = 60 * 1000 // 1 phút

// Rate limits
const RATE_LIMITS = {
  anonymous: { max: 1, label: 'Khách' },
  authenticated: { max: 3, label: 'Thành viên' }
}

export default function ContactPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: settings = DEFAULT_SITE_SETTINGS } = useSiteSettings()
  const contactEmail = settings.contact_email || DEFAULT_SITE_SETTINGS.contact_email

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    rating: 0
  })
  // Honeypot field - hidden from users, bots will fill it
  const [honeypot, setHoneypot] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null)

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user && !formData.name && !formData.email) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  // Check cooldown on mount
  useEffect(() => {
    const lastSubmit = localStorage.getItem(COOLDOWN_KEY)
    if (lastSubmit) {
      const remaining = COOLDOWN_DURATION - (Date.now() - parseInt(lastSubmit))
      if (remaining > 0) {
        setCooldownRemaining(Math.ceil(remaining / 1000))
      }
    }
  }, [])

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownRemaining])

  // Redirect countdown after successful submission
  useEffect(() => {
    if (submitted && redirectCountdown > 0) {
      const timer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/requests')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [submitted, redirectCountdown, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles([...files, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const [emailError, setEmailError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check client-side cooldown
    if (cooldownRemaining > 0) {
      toast.error(`Vui lòng đợi ${cooldownRemaining} giây trước khi gửi tiếp`)
      return
    }

    setLoading(true)
    setUploadProgress(0)
    setEmailError(null)

    try {
      // Upload files if any (use public upload endpoint)
      let fileUrls: string[] = []
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)

          try {
            const res = await fetch('/api/public-upload', {
              method: 'POST',
              body: uploadFormData
            })

            if (res.ok) {
              const data = await res.json()
              fileUrls.push(data.url)
              setUploadProgress(((i + 1) / files.length) * 100)
            }
          } catch (uploadError) {
            console.warn('File upload failed, continuing without file:', uploadError)
          }
        }
      }

      // Build message with file URLs
      let fullMessage = formData.message
      if (formData.phone) {
        fullMessage += `\n\nSố điện thoại: ${formData.phone}`
      }
      if (fileUrls.length > 0) {
        fullMessage += `\n\nFile đính kèm: ${fileUrls.join(', ')}`
      }

      // Submit feedback via API (no auth required)
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: fullMessage,
          rating: formData.rating || undefined,
          phone: formData.phone,
          honeypot // Send honeypot for server-side spam detection
        })
      })

      const result = await res.json()

      if (!res.ok) {
        // Handle rate limiting
        if (res.status === 429) {
          const retryAfter = result.retryAfter || 60
          setCooldownRemaining(retryAfter)
          toast.error(result.error || `Vui lòng đợi ${retryAfter} giây`, { 
            icon: '⏳',
            duration: 5000 
          })
          setLoading(false)
          return
        }
        // Check if it's an email validation error
        if (result.error && result.error.includes('Email') || result.error?.includes('.')) {
          setEmailError(result.error)
          toast.error(result.error, { icon: '⚠️' })
        } else {
          toast.error(result.error || 'Có lỗi xảy ra, vui lòng thử lại')
        }
        setLoading(false)
        return
      }

      // Update remaining requests from API response
      if (result.remaining !== undefined) {
        setRemainingRequests(result.remaining)
      }

      // Save cooldown timestamp
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
      setCooldownRemaining(Math.ceil(COOLDOWN_DURATION / 1000))
      
      setSubmitted(true)
      setFormData({ name: user?.user_metadata?.full_name || '', email: user?.email || '', phone: '', message: '', rating: 0 })
      setFiles([])
      setHoneypot('')
      toast.success(result.message || 'Yêu cầu đã được gửi!', {
        icon: '🎉',
        duration: 4000
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      <Toaster position="top-center" />
      
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
            <p className="text-xl text-gray-700 mb-6">
              Gửi phản hồi, câu hỏi hoặc yêu cầu phục hồi ảnh. Chúng tôi sẽ phản hồi sớm nhất! ✨
            </p>

            {/* User Status & Rate Limit Info */}
            <div className="flex justify-center">
              {authLoading ? (
                <div className="glassmorphism-light px-4 py-2 rounded-full animate-pulse">
                  <span className="text-gray-500">Đang kiểm tra...</span>
                </div>
              ) : user ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glassmorphism-light px-6 py-3 rounded-full flex items-center gap-3 border border-green-200"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-green-700">Thành viên</p>
                    <p className="text-xs text-gray-600">3 yêu cầu/ngày</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="glassmorphism-light px-6 py-3 rounded-full flex items-center gap-3 border border-amber-200">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-amber-700">Khách</p>
                      <p className="text-xs text-gray-600">1 yêu cầu/ngày</p>
                    </div>
                  </div>
                  <Link 
                    href="/login?redirect=/contact"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Đăng nhập để gửi thêm
                  </Link>
                </motion.div>
              )}
            </div>
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
                <div className="relative inline-block mb-6">
                  <CheckCircle className="w-20 h-20 text-success mx-auto" />
                  <motion.div
                    className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    {redirectCountdown}
                  </motion.div>
                </div>
                
                <h2 className="text-3xl font-bold text-text mb-4">Yêu cầu đã được gửi!</h2>
                
                <div className="glassmorphism-light p-6 rounded-2xl max-w-md mx-auto mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                    <p className="text-lg font-medium text-gray-800">Đang đợi Admin xử lý</p>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Yêu cầu của bạn đã được tiếp nhận. Admin sẽ xem xét và phản hồi trong thời gian sớm nhất (thường trong 24 giờ).
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Bạn sẽ nhận email thông báo khi có kết quả</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Đang chuyển đến trang theo dõi yêu cầu trong <span className="font-bold text-primary">{redirectCountdown}</span> giây...
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="primary"
                    onClick={() => router.push('/requests')}
                    className="btn-glass-primary"
                  >
                    <span className="flex items-center gap-2">
                      Xem Yêu Cầu Của Tôi
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSubmitted(false)
                      setRedirectCountdown(5)
                    }}
                    className="btn-glass"
                    disabled={cooldownRemaining > 0}
                  >
                    {cooldownRemaining > 0 ? (
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Đợi {cooldownRemaining}s
                      </span>
                    ) : (
                      'Gửi Yêu Cầu Khác'
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-text mb-8 text-center">
                  Gửi Yêu Cầu Của Bạn
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from users, bots will fill it */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Cooldown warning */}
                  {cooldownRemaining > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
                    >
                      <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Chờ {cooldownRemaining} giây để gửi yêu cầu tiếp
                        </p>
                        <p className="text-xs text-amber-600">
                          Để đảm bảo chất lượng dịch vụ, mỗi lần gửi cách nhau 2 phút
                        </p>
                      </div>
                    </motion.div>
                  )}

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
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value })
                            setEmailError(null) // Clear error when typing
                          }}
                          className={`input-glass ${emailError ? 'border-red-500 border-2' : ''}`}
                          placeholder="email@example.com"
                          required
                        />
                        {emailError && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute left-0 top-full mt-1 flex items-center gap-1 text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 shadow-sm"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>{emailError}</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={emailError ? 'mt-8' : ''}>
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
                    disabled={loading || cooldownRemaining > 0}
                    className={`btn-glass-primary w-full ${cooldownRemaining > 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                    whileHover={cooldownRemaining > 0 ? {} : { scale: 1.02, y: -2 }}
                    whileTap={cooldownRemaining > 0 ? {} : { scale: 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent" />
                        Đang gửi...
                      </span>
                    ) : cooldownRemaining > 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5" />
                        Đợi {cooldownRemaining} giây
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
                        Gửi Yêu Cầu
                        <Sparkles className="w-5 h-5" />
                      </span>
                    )}
                  </motion.button>

                  {/* Security notice */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Yêu cầu được bảo vệ chống spam</span>
                  </div>
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

