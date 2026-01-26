'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validatePasswordComprehensive } from '@/lib/auth/validation'
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
  const [passwordValidation, setPasswordValidation] = useState(() => 
    validatePasswordComprehensive('')
  )
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)

  // Check if we have valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check URL hash for recovery token
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const type = hashParams.get('type')
      const accessToken = hashParams.get('access_token')

      if (session || (type === 'recovery' && accessToken)) {
        setIsValidSession(true)
      } else {
        setError('Link khôi phục không hợp lệ hoặc đã hết hạn')
      }
    }
    
    checkSession()
  }, [])

  // Password validation
  const handlePasswordChange = useCallback((newPassword: string) => {
    setPassword(newPassword)
    const validation = validatePasswordComprehensive(newPassword)
    setPasswordValidation(validation)
  }, [])

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
      if (!passwordValidation.valid) {
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
        if (error.message.includes('session') || error.message.includes('expired')) {
          setError('Link đã hết hạn. Vui lòng yêu cầu link mới.')
          toast.error('Link đã hết hạn. Vui lòng yêu cầu link mới.')
        } else if (error.message.includes('same password')) {
          toast.error('Mật khẩu mới phải khác mật khẩu cũ.')
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

              {/* Password Strength - Enhanced */}
              {password && (
                <div className="mt-3 space-y-2">
                  {/* Strength bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Độ mạnh: {passwordValidation.score}%</span>
                      <span className={`text-xs font-semibold ${
                        passwordValidation.strength === 'strong' ? 'text-green-600' :
                        passwordValidation.strength === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {passwordValidation.strength === 'strong' ? 'Mạnh 💪' :
                         passwordValidation.strength === 'medium' ? 'Trung bình' : 'Yếu'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          passwordValidation.strength === 'strong' ? 'bg-green-500' :
                          passwordValidation.strength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordValidation.score}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  
                  {/* Requirements checklist */}
                  <div className="grid grid-cols-2 gap-1">
                    {passwordValidation.requirements.slice(0, 5).map((req, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs">
                        {req.met ? (
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
                          {req.label.replace('Ít nhất ', '').replace(' (khuyến nghị)', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

