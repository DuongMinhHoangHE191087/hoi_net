'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

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

  const handleResend = async () => {
    if (!email || cooldown > 0) return
    
    setResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        }
      })

      if (error) {
        console.error('Resend error:', error)
        toast.error('Không thể gửi lại email. Vui lòng thử lại sau.')
      } else {
        toast.success('Email xác nhận đã được gửi lại!')
        startCooldown()
      }
    } catch (err) {
      console.error('Resend error:', err)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12">
      <Toaster position="top-center" />

      <motion.div
        className="glassmorphism-strong w-full max-w-lg p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          {/* Icon */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Mail className="w-10 h-10 text-blue-600" />
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-3xl font-bold text-text mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Kiểm Tra Email Của Bạn
          </motion.h1>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-600 mb-2">
              Chúng tôi đã gửi email xác nhận đến:
            </p>
            <p className="text-lg font-semibold text-primary mb-6">
              {email || 'email của bạn'}
            </p>
          </motion.div>

          {/* Instructions */}
          <motion.div 
            className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Các bước tiếp theo:
            </p>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Mở hộp thư email của bạn</li>
              <li>Tìm email từ <strong>Photo Restoration</strong></li>
              <li>Nếu không thấy, kiểm tra thư mục <strong>Spam</strong> hoặc <strong>Junk</strong></li>
              <li>Click vào nút <strong>"Xác nhận Email"</strong> trong email</li>
              <li>Quay lại đăng nhập</li>
            </ol>
          </motion.div>

          {/* Resend button */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {cooldown > 0 ? (
              <p className="text-sm text-gray-500">
                Gửi lại sau <strong>{cooldown}s</strong>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending || !email}
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Không nhận được email? Gửi lại
                  </>
                )}
              </button>
            )}
          </motion.div>

          {/* Back to login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
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
          </motion.div>
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

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmEmailContent />
    </Suspense>
  )
}
