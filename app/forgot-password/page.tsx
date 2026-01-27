'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle, Info, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validateEmailComprehensive } from '@/lib/auth/validation'
import { sanitizeInput } from '@/lib/security'
import toast, { Toaster } from 'react-hot-toast'
import { authLogger } from '@/lib/auth-logger'
import Captcha, { useCaptcha } from '@/components/auth/Captcha'
import { useAuthSettings, useFailedAttempts } from '@/hooks/useAuthSettings'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Captcha and rate limit
  const { settings } = useAuthSettings()
  const { attempts: failedAttempts, increment: incrementAttempts, reset: resetAttempts } = useFailedAttempts('forgot_password')
  const captcha = useCaptcha()

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

    // Check if captcha is required - Supabase ALWAYS requires captcha when enabled
    const needsCaptcha = settings.captcha.enabled && settings.captcha.forms.forgot_password
    
    console.log('[Forgot Password] Captcha check:', {
      enabled: settings.captcha.enabled,
      formEnabled: settings.captcha.forms.forgot_password,
      needsCaptcha,
      isVerified: captcha.isVerified,
      hasToken: !!captcha.token,
    })
    
    if (needsCaptcha && !captcha.isVerified) {
      toast.error('Vui lòng xác minh captcha (hộp checkbox bên dưới)', {
        icon: '🔒',
        duration: 5000,
      })
      return
    }

    setLoading(true)

    try {
      // Send reset email via Supabase with captcha token
      // Note: redirectTo should point to reset-password page directly for PKCE flow
      // Supabase will append access_token and refresh_token as hash fragments
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken: captcha.token || undefined,
      })

      if (error) {
        console.error('[Forgot Password] Error:', error)
        authLogger.passwordResetRequest(sanitizedEmail, { error: error.message })
        
        // Increment failed attempts
        incrementAttempts()
        captcha.reset()
        
        // Handle specific errors
        if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
          toast.error('Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 1 giờ rồi thử lại.')
          startCooldown()
        } else if (error.message.includes('captcha')) {
          console.error('[Forgot Password] Captcha error:', error.message)
          toast.error(`Lỗi Captcha: ${error.message}`, {
            icon: '🔒',
            duration: 6000,
          })
        } else if (error.message.includes('not found') || error.message.includes('User not found')) {
          // Don't reveal if email exists or not for security
          // Still show success message
          resetAttempts()
          setEmailSent(true)
          startCooldown()
        } else if (error.message.includes('Email rate limit exceeded')) {
          toast.error('Hệ thống đã gửi quá nhiều email. Vui lòng đợi một lúc rồi thử lại.')
          startCooldown()
        } else if (error.message.includes('SMTP') || error.message.includes('email')) {
          toast.error('Lỗi gửi email. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau.')
        } else {
          toast.error(`Không thể gửi email: ${error.message}`)
        }
        setLoading(false)
        return
      }

      // Success - reset failed attempts
      resetAttempts()
      authLogger.passwordResetRequest(sanitizedEmail, { success: true })
      setEmailSent(true)
      startCooldown()
      toast.success('Email khôi phục mật khẩu đã được gửi!')
    } catch (error: any) {
      console.error('[Forgot Password] Error:', error)
      incrementAttempts()
      captcha.reset()
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Email sent success screen
  if (emailSent) {
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
              Nếu email <strong>{email}</strong> tồn tại trong hệ thống, bạn sẽ nhận được link khôi phục mật khẩu.
            </p>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 text-left">
                  <p className="font-semibold mb-1">Các bước tiếp theo:</p>
                  <ol className="text-xs space-y-1 list-decimal list-inside">
                    <li>Kiểm tra hộp thư email của bạn</li>
                    <li>Kiểm tra cả thư mục <strong>Spam/Junk</strong></li>
                    <li>Click vào link trong email</li>
                    <li>Đặt mật khẩu mới</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {cooldown > 0 ? (
                <p className="text-sm text-gray-500">
                  Không nhận được email? Có thể gửi lại sau <strong>{cooldown}s</strong>
                </p>
              ) : (
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline font-semibold text-sm"
                >
                  Không nhận được email? Gửi lại
                </button>
              )}

              <Link href="/login" className="block">
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
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
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
              <Mail className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">
              Quên Mật Khẩu?
            </h1>
            <p className="text-gray-600">
              Nhập email của bạn để nhận link khôi phục mật khẩu
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

            {/* Captcha - always show when enabled (Supabase requires it) */}
            {settings.captcha.enabled && settings.captcha.forms.forgot_password && (
              <Captcha
                onVerify={captcha.handleVerify}
                onExpire={captcha.handleExpire}
                failedAttempts={failedAttempts}
                thresholdAttempts={settings.captcha.threshold_attempts}
                forceShow={true}  // Always show because Supabase requires captcha
                className="mb-4"
              />
            )}

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
                  <Send className="w-5 h-5" />
                  Gửi Email Khôi Phục
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

