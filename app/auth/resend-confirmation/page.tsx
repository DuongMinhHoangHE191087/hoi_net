'use client'

import { Suspense, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, RefreshCw, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validateEmailComprehensive } from '@/lib/auth/validation'
import { sanitizeInput } from '@/lib/security'
import toast, { Toaster } from 'react-hot-toast'

function ResendConfirmationContent() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Real-time email validation
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value)
    setEmailError(null)
    setEmailSuggestion(null)

    if (value.length > 0 && value.includes('@')) {
      const validation = validateEmailComprehensive(value)
      if (!validation.valid) {
        if (validation.suggestion) {
          setEmailSuggestion(validation.suggestion)
        } else if (value.length > 5) {
          setEmailError(validation.error || null)
        }
      }
    }
  }, [])

  // Accept email suggestion
  const acceptEmailSuggestion = () => {
    if (emailSuggestion) {
      setEmail(emailSuggestion)
      setEmailSuggestion(null)
      setEmailError(null)
    }
  }

  // Start cooldown timer
  const startCooldown = () => {
    setCooldown(60)
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)

    // Validate email
    const sanitizedEmail = sanitizeInput(email, 254).toLowerCase().trim()
    const emailValidation = validateEmailComprehensive(sanitizedEmail)

    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || 'Email không hợp lệ')
      if (emailValidation.suggestion) {
        setEmailSuggestion(emailValidation.suggestion)
      }
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: sanitizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        }
      })

      if (error) {
        console.error('Resend error:', error)
        
        if (error.message.includes('rate limit')) {
          toast.error('Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một lúc.')
          startCooldown()
        } else if (error.message.includes('already confirmed')) {
          toast.success('Email này đã được xác nhận. Bạn có thể đăng nhập ngay!')
          setSuccess(true)
        } else {
          toast.error('Không thể gửi email. Vui lòng thử lại sau.')
        }
      } else {
        toast.success('Email xác nhận đã được gửi!')
        setSuccess(true)
        startCooldown()
      }
    } catch (err) {
      console.error('Resend error:', err)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12">
        <Toaster position="top-center" />

        <motion.div
          className="glassmorphism-strong w-full max-w-md p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-text mb-3">
              Email Đã Được Gửi!
            </h1>

            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi email xác nhận đến <strong>{email}</strong>.
              Vui lòng kiểm tra hộp thư và thư mục spam.
            </p>

            <div className="space-y-3">
              {cooldown > 0 && (
                <p className="text-sm text-gray-500">
                  Có thể gửi lại sau <strong>{cooldown}s</strong>
                </p>
              )}

              <Link href="/login" className="block">
                <motion.button
                  className="w-full btn-glass-primary py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Đi đến Đăng Nhập
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="glassmorphism-strong w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <RefreshCw className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-text mb-3">
              Gửi Lại Email Xác Nhận
            </h1>
            <p className="text-gray-600">
              Nhập email để nhận lại link xác nhận tài khoản
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`input-glass pl-12 ${emailError ? 'border-red-500 border-2' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              
              {/* Email suggestion */}
              <AnimatePresence>
                {emailSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Bạn có phải muốn nhập{' '}
                      <button
                        type="button"
                        onClick={acceptEmailSuggestion}
                        className="font-semibold underline hover:text-blue-900"
                      >
                        {emailSuggestion}
                      </button>
                      ?
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {emailError && !emailSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-1 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{emailError}</span>
                </motion.div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full btn-glass-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={loading ? {} : { scale: 1.02, y: -2 }}
              whileTap={loading ? {} : { scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang gửi...
                </span>
              ) : cooldown > 0 ? (
                <span className="flex items-center justify-center gap-2">
                  Gửi lại sau {cooldown}s
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  Gửi Email Xác Nhận
                </span>
              )}
            </motion.button>
          </form>

          {/* Back to login */}
          <div className="mt-6">
            <Link href="/login">
              <motion.button
                className="w-full px-6 py-3 glassmorphism-light rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-white/70 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5" />
                Quay về Đăng Nhập
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center">
      <div className="glassmorphism-strong p-8 rounded-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    </div>
  )
}

export default function ResendConfirmationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResendConfirmationContent />
    </Suspense>
  )
}
