'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ImageIcon, Mail, Lock, Sparkles, Chrome, UserPlus, Eye, EyeOff, User, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { registerSchema } from '@/lib/validation'
import { sanitizeInput, validatePassword } from '@/lib/security'
import toast, { Toaster } from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { signUpWithEmail, signInWithGoogle, loading: authLoading } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeTerms: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')

  // Password strength indicator
  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    const validation = validatePassword(password)
    setPasswordStrength(validation.strength)
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="glassmorphism-strong p-8 rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600 font-medium">Đang kiểm tra...</p>
          </div>
        </div>
      </div>
    )
  }

  // Email registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Sanitize inputs
      const sanitized = {
        email: sanitizeInput(formData.email, 254).toLowerCase(),
        password: formData.password, // Don't sanitize password
        confirmPassword: formData.confirmPassword,
        fullName: sanitizeInput(formData.fullName || '', 100),
        agreeTerms: formData.agreeTerms,
      }

      // Validate with Zod
      const result = registerSchema.safeParse(sanitized)

      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        result.error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
        toast.error('Vui lòng kiểm tra lại thông tin')
        setLoading(false)
        return
      }

      // Sign up with Supabase
      console.log('[Register] Attempting sign up:', {
        email: result.data.email,
        hasPassword: !!result.data.password,
        fullName: result.data.fullName
      })

      const signUpResult = await signUpWithEmail(
        result.data.email,
        result.data.password,
        { full_name: result.data.fullName }
      )

      if (!signUpResult.success) {
        // Handle specific error messages
        if (signUpResult.error?.includes('already registered')) {
          setErrors({ email: 'Email này đã được đăng ký' })
          toast.error('Email này đã được đăng ký')
        } else if (signUpResult.error?.includes('Invalid email')) {
          setErrors({ email: 'Email không hợp lệ' })
          toast.error('Email không hợp lệ')
        } else {
          toast.error(signUpResult.error || 'Đăng ký thất bại. Vui lòng thử lại.')
        }
        setLoading(false)
        return
      }

      console.log('[Register] Sign up successful')

      if (signUpResult.needsConfirmation) {
        toast.success(
          'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
          {
            duration: 8000,
            style: {
              maxWidth: '500px'
            }
          }
        )

        // Redirect to login with check-email message
        setTimeout(() => {
          router.push('/login?message=check-email')
        }, 2000)
      } else {
        // User is auto-confirmed
        toast.success('Đăng ký thành công!', { duration: 2000 })

        // ✅ WAIT for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 1000))

        // ✅ VERIFY session before redirect
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          console.error('[Register] Session not created, redirecting to login')
          toast.error('Vui lòng đăng nhập để tiếp tục.', { duration: 3000 })
          setTimeout(() => {
            router.push('/login')
          }, 1000)
          return
        }

        console.log('[Register] Session verified, redirecting to dashboard')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      }

    } catch (error: any) {
      console.error('[Register] Sign up failed:', {
        error: error.message,
        code: error.code,
        name: error.name,
        status: error.status
      })

      toast.error('Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Google registration
  const handleGoogleRegister = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      // Note: Redirect will be handled by auth callback page
    } catch (error: any) {
      console.error('Google register error:', error)
      toast.error('Đăng ký với Google thất bại')
      setLoading(false)
    }
  }

  // Password strength color
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

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 11,
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
              className="flex items-center justify-center gap-2 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow-pink animate-glow">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text-alt">Photo Restore</span>
            </motion.div>
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-text mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Đăng Ký
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Tạo tài khoản để bắt đầu hành trình!
            </motion.p>
          </div>

          {/* Email Registration Form */}
          <form onSubmit={handleEmailRegister} className="space-y-5">
            {/* Full Name */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và Tên (Tùy chọn)
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`input-glass pl-12 ${errors.fullName ? 'border-2 border-red-500' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.fullName}
                </p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`input-glass pl-12 ${errors.email ? 'border-2 border-red-500' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`input-glass pl-12 pr-12 ${errors.password ? 'border-2 border-red-500' : ''}`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
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

              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}

              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">Yêu cầu mật khẩu:</p>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  <li className="flex items-center gap-1">
                    {formData.password.length >= 8 ?
                      <CheckCircle className="w-3 h-3 text-green-500" /> :
                      <XCircle className="w-3 h-3 text-gray-400" />
                    }
                    Ít nhất 8 ký tự
                  </li>
                  <li className="flex items-center gap-1">
                    {/[a-z]/.test(formData.password) ?
                      <CheckCircle className="w-3 h-3 text-green-500" /> :
                      <XCircle className="w-3 h-3 text-gray-400" />
                    }
                    Ít nhất 1 chữ thường
                  </li>
                  <li className="flex items-center gap-1">
                    {/[A-Z]/.test(formData.password) ?
                      <CheckCircle className="w-3 h-3 text-green-500" /> :
                      <XCircle className="w-3 h-3 text-gray-400" />
                    }
                    Ít nhất 1 chữ hoa
                  </li>
                  <li className="flex items-center gap-1">
                    {/[0-9]/.test(formData.password) ?
                      <CheckCircle className="w-3 h-3 text-green-500" /> :
                      <XCircle className="w-3 h-3 text-gray-400" />
                    }
                    Ít nhất 1 số
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`input-glass pl-12 pr-12 ${errors.confirmPassword ? 'border-2 border-red-500' : ''}`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </motion.div>

            {/* Terms Agreement */}
            <motion.label
              className="flex items-start gap-3 cursor-pointer group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <input
                type="checkbox"
                className={`mt-1 cursor-pointer w-4 h-4 accent-primary ${errors.agreeTerms ? 'border-2 border-red-500 rounded' : ''}`}
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                required
                disabled={loading}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800">
                Tôi đồng ý với{' '}
                <a href="/terms" className="text-primary font-semibold hover:underline">
                  Điều khoản sử dụng
                </a>{' '}
                và{' '}
                <a href="/privacy" className="text-primary font-semibold hover:underline">
                  Chính sách bảo mật
                </a>
              </span>
            </motion.label>
            {errors.agreeTerms && (
              <p className="text-sm text-red-600 flex items-center gap-1 -mt-2">
                <AlertCircle className="w-4 h-4" />
                {errors.agreeTerms}
              </p>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.button
                type="submit"
                className="btn-glass-primary w-full py-3"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                whileTap={loading ? {} : { scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Đăng Ký Ngay
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>

          {/* Email Verification Notice */}
          <motion.div
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="flex items-start gap-2">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Xác nhận email</p>
                <p className="text-xs">
                  Sau khi đăng ký, bạn sẽ nhận được email xác nhận. Vui lòng kiểm tra hộp thư và xác nhận để kích hoạt tài khoản.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Social Login Divider */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-white/40"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/60 text-gray-600 font-medium backdrop-blur-sm rounded-full">
                  Hoặc đăng ký với
                </span>
              </div>
            </div>

            {/* Google Button */}
            <div className="mt-6">
              <motion.button
                onClick={handleGoogleRegister}
                className="btn-glass-secondary w-full py-3 flex items-center justify-center gap-2"
                whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Chrome className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Đăng ký với Google</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Back to Home Button */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.35 }}
          >
            <Link href="/">
              <motion.button
                className="w-full px-6 py-3 glassmorphism-light rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-white/70 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Quay về Trang Chủ
              </motion.button>
            </Link>
          </motion.div>

          {/* Login Link */}
          <motion.p
            className="mt-8 text-center text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-primary font-bold hover:text-primary-dark hover:underline">
              Đăng nhập ngay
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
