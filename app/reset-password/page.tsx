'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validatePassword } from '@/lib/security'
import toast, { Toaster } from 'react-hot-toast'
import { authLogger } from '@/lib/auth-logger'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Check if we have access token in URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    if (type !== 'recovery') {
      setError('Link khôi phục không hợp lệ hoặc đã hết hạn')
    }

    if (!accessToken && type !== 'recovery') {
      toast.error('Link khôi phục không hợp lệ. Vui lòng yêu cầu link mới.')
    }
  }, [])

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    const validation = validatePassword(newPassword)
    setPasswordStrength(validation.strength)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp')
        setLoading(false)
        return
      }

      // Validate password strength
      const validation = validatePassword(password)
      if (!validation.isValid) {
        toast.error('Mật khẩu không đủ mạnh. Vui lòng kiểm tra yêu cầu.')
        setLoading(false)
        return
      }

      // Update password
      const supabase = createClient()
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('[Reset Password] Error:', error)
        if (error.message.includes('session')) {
          setError('Link đã hết hạn. Vui lòng yêu cầu link mới.')
          toast.error('Link đã hết hạn. Vui lòng yêu cầu link mới.')
        } else {
          toast.error('Không thể đặt lại mật khẩu. Vui lòng thử lại.')
        }
        setLoading(false)
        return
      }

      // Success
      authLogger.passwordResetSuccess(data.user!.id, data.user!.email!)
      setSuccess(true)
      toast.success('Mật khẩu đã được đặt lại thành công!')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?message=password-reset')
      }, 2000)
    } catch (error: any) {
      console.error('[Reset Password] Error:', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'weak': return 'bg-red-500'
    }
  }

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'strong': return 'Mạnh'
      case 'medium': return 'Trung bình'
      case 'weak': return 'Yếu'
    }
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12">
        <Toaster position="top-center" />

        <motion.div
          className="glassmorphism-strong w-full max-w-md p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-text mb-3">Link Không Hợp Lệ</h1>
            <p className="text-gray-600 mb-6">{error}</p>

            <Link href="/forgot-password">
              <motion.button
                className="w-full btn-glass-primary py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Yêu Cầu Link Mới
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12">
        <Toaster position="top-center" />

        <motion.div
          className="glassmorphism-strong w-full max-w-md p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-text mb-3">
              Thành Công!
            </h1>
            <p className="text-gray-600 mb-6">
              Mật khẩu của bạn đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>

            <p className="text-sm text-gray-500">
              Đang chuyển hướng đến trang đăng nhập...
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12">
      <Toaster position="top-center" />

      <motion.div
        className="glassmorphism-strong w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">
              Đặt Lại Mật Khẩu
            </h1>
            <p className="text-gray-600">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="input-glass pl-12 pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Độ mạnh:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength === 'strong' ? 'text-green-600' :
                      passwordStrength === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{
                        width: passwordStrength === 'strong' ? '100%' :
                               passwordStrength === 'medium' ? '66%' : '33%'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">Yêu cầu:</p>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  <li className="flex items-center gap-1">
                    {password.length >= 8 ?
                      <CheckCircle className="w-3 h-3 text-green-500" /> :
                      <XCircle className="w-3 h-3 text-gray-400" />
                    }
                    Ít nhất 8 ký tự
                  </li>
                  <li className="flex items-center gap-1">
                    {/[a-z]/.test(password) ?
                      <CheckCircle className="w-3 h-3 text-green-500" /> :
                      <XCircle className="w-3 h-3 text-gray-400" />
                    }
                    Ít nhất 1 chữ thường
                  </li>
                  <li className="flex items-center gap-1">
                    {/[A-Z]/.test(password) ?
                      <CheckCircle className="w-3 h-3 text-green-500" /> :
                      <XCircle className="w-3 h-3 text-gray-400" />
                    }
                    Ít nhất 1 chữ hoa
                  </li>
                  <li className="flex items-center gap-1">
                    {/[0-9]/.test(password) ?
                      <CheckCircle className="w-3 h-3 text-green-500" /> :
                      <XCircle className="w-3 h-3 text-gray-400" />
                    }
                    Ít nhất 1 số
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-glass pl-12 pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Mật khẩu không khớp
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading || password !== confirmPassword}
              className="w-full btn-glass-primary py-3"
              whileHover={loading ? {} : { scale: 1.02, y: -2 }}
              whileTap={loading ? {} : { scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                <span>Đặt Lại Mật Khẩu</span>
              )}
            </motion.button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:underline font-semibold">
              Quay về Đăng Nhập
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="glassmorphism-strong p-8 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
