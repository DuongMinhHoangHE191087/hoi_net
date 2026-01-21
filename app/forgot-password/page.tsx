'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sanitizeInput, validateEmail } from '@/lib/security'
import toast, { Toaster } from 'react-hot-toast'
import { authLogger } from '@/lib/auth-logger'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate email
      const sanitizedEmail = sanitizeInput(email, 254).toLowerCase()

      if (!validateEmail(sanitizedEmail)) {
        toast.error('Email không hợp lệ')
        setLoading(false)
        return
      }

      // Send reset email
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error('[Forgot Password] Error:', error)
        authLogger.passwordResetRequest(sanitizedEmail, { error: error.message })
        toast.error('Không thể gửi email. Vui lòng thử lại.')
        setLoading(false)
        return
      }

      // Success
      authLogger.passwordResetRequest(sanitizedEmail, { success: true })
      setEmailSent(true)
      toast.success('Email khôi phục mật khẩu đã được gửi!')
    } catch (error: any) {
      console.error('[Forgot Password] Error:', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
      setLoading(false)
    }
  }

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
              Chúng tôi đã gửi link khôi phục mật khẩu đến email <strong>{email}</strong>
            </p>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 text-left">
                  <p className="font-semibold mb-1">Các bước tiếp theo:</p>
                  <ol className="text-xs space-y-1 list-decimal list-inside">
                    <li>Kiểm tra hộp thư email của bạn</li>
                    <li>Click vào link trong email</li>
                    <li>Đặt mật khẩu mới</li>
                    <li>Đăng nhập với mật khẩu mới</li>
                  </ol>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Không thấy email? Kiểm tra thư mục spam hoặc{' '}
              <button
                onClick={() => setEmailSent(false)}
                className="text-primary hover:underline font-semibold"
              >
                gửi lại
              </button>
            </p>

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
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass pl-12"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-glass-primary py-3"
              whileHover={loading ? {} : { scale: 1.02, y: -2 }}
              whileTap={loading ? {} : { scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
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
