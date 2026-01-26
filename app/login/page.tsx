'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Sparkles, Home, LogIn, Loader2, AlertCircle, XCircle, Info, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { 
  validateEmailComprehensive, 
  loginFormSchema,
} from '@/lib/auth/validation'
import { sanitizeInput } from '@/lib/security'
import toast, { Toaster } from 'react-hot-toast'

// Loading fallback for Suspense
function LoginLoading() {
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

// Main page component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
}

// Actual login content that uses useSearchParams
function LoginContent() {
  const { signInWithGoogle, signInWithEmail, user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loginMethod, setLoginMethod] = useState<'email' | 'google'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get redirect URL from search params
  const redirectUrl = searchParams.get('redirect') || '/dashboard'
  const errorParam = searchParams.get('error')
  const messageParam = searchParams.get('message')

  // Show error/success from URL params
  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam), { duration: 5000 })
    }
    if (messageParam === 'email-confirmed') {
      toast.success('Email đã được xác nhận thành công! Bạn có thể đăng nhập ngay.', {
        duration: 5000,
        icon: '✅'
      })
    } else if (messageParam === 'check-email') {
      toast.success('Vui lòng kiểm tra email để xác nhận tài khoản.', {
        duration: 6000,
        icon: '📧'
      })
    } else if (messageParam === 'password-reset') {
      toast.success('Mật khẩu đã được đặt lại. Hãy đăng nhập với mật khẩu mới.', {
        duration: 5000,
        icon: '🔐'
      })
    }
  }, [errorParam, messageParam])

  // Redirect if already logged in (don't block initial render)
  useEffect(() => {
    if (!authLoading && user) {
      router.push(isAdmin ? '/admin' : redirectUrl)
    }
  }, [authLoading, user, isAdmin, router, redirectUrl])

  // Real-time email validation
  const handleEmailChange = useCallback((email: string) => {
    setFormData(prev => ({ ...prev, email }))
    setEmailSuggestion(null)
    
    if (email.length > 0) {
      const validation = validateEmailComprehensive(email)
      if (!validation.valid && email.includes('@')) {
        if (validation.suggestion) {
          setEmailSuggestion(validation.suggestion)
        }
        if (email.length > 5) {
          setErrors(prev => ({ ...prev, email: validation.error || '' }))
        }
      } else {
        setErrors(prev => {
          const { email: _, ...rest } = prev
          return rest
        })
      }
    } else {
      setErrors(prev => {
        const { email: _, ...rest } = prev
        return rest
      })
    }
  }, [])

  // Accept email suggestion
  const acceptEmailSuggestion = () => {
    if (emailSuggestion) {
      setFormData(prev => ({ ...prev, email: emailSuggestion }))
      setEmailSuggestion(null)
      setErrors(prev => {
        const { email: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Sanitize inputs
      const sanitized = {
        email: sanitizeInput(formData.email, 254).toLowerCase().trim(),
        password: formData.password,
      }

      // Comprehensive email validation
      const emailValidation = validateEmailComprehensive(sanitized.email)
      if (!emailValidation.valid) {
        setErrors({ email: emailValidation.error || 'Email không hợp lệ' })
        if (emailValidation.suggestion) {
          setEmailSuggestion(emailValidation.suggestion)
        }
        toast.error(emailValidation.error || 'Email không hợp lệ', { icon: '⚠️' })
        setLoading(false)
        return
      }

      // Validate with Zod
      const result = loginFormSchema.safeParse(sanitized)

      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        result.error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(fieldErrors)
        setLoading(false)
        return
      }

      // Sign in
      console.log('[Login] Attempting sign in:', {
        email: result.data.email,
        hasPassword: !!result.data.password
      })

      const signInResult = await signInWithEmail(result.data.email, result.data.password)

      if (!signInResult.success) {
        // Handle specific error messages with better UX
        const errorString = signInResult.error?.toString() || ''

        if (errorString.includes('Invalid login credentials')) {
          setErrors({ password: 'Email hoặc mật khẩu không đúng' })
          toast.error('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.', {
            duration: 4000,
            icon: '🔒',
          })
        } else if (errorString.includes('Email not confirmed')) {
          // Show resend confirmation option
          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg rounded-2xl p-4 ring-1 ring-amber-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    Email chưa được xác nhận
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    Vui lòng kiểm tra hộp thư để xác nhận email trước khi đăng nhập.
                  </p>
                  <Link 
                    href={`/auth/resend-confirmation?email=${encodeURIComponent(result.data.email)}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-900"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Gửi lại email xác nhận
                  </Link>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-amber-400 hover:text-amber-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ), { duration: 10000 })
        } else {
          toast.error(errorString || 'Đăng nhập thất bại. Vui lòng thử lại.', {
            duration: 4000,
            icon: '❌',
          })
        }
        setLoading(false)
        return
      }

      console.log('[Login] Sign in successful')

      // Success toast
      toast.success('Đăng nhập thành công! Đang chuyển hướng...', {
        duration: 1500,
        icon: '✅',
      })

      // ✅ WAIT for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000))

      // ✅ VERIFY session exists before redirect
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session: verifiedSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !verifiedSession) {
        console.error('[Login] Session verification failed:', sessionError)
        toast.error('Không thể xác thực phiên đăng nhập. Vui lòng thử lại.', {
          duration: 4000,
          icon: '❌',
        })
        setLoading(false)
        return
      }

      console.log('[Login] Session verified successfully')
      console.log('[Login] Redirecting to:', redirectUrl)

      // Use window.location.href for hard redirect to ensure middleware picks up auth
      window.location.href = redirectUrl
    } catch (err: any) {
      console.error('[Login] Sign in failed:', {
        error: err.message,
        code: err.code,
        name: err.name
      })

      toast.error('Đăng nhập thất bại. Vui lòng thử lại.', {
        duration: 4000,
        icon: '❌',
      })
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      // Note: Redirect will be handled by auth callback page
    } catch (err: any) {
      toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.', {
        duration: 4000,
        icon: '❌',
      })
      setLoading(false)
    }
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

      {/* Login Card */}
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
              className="inline-block mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow-pink">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="gradient-text-alt">Đăng Nhập</span>
            </h1>
            <p className="text-gray-600">
              Chào mừng bạn quay trở lại!
            </p>
          </div>

          {/* Method Toggle */}
          <div className="flex gap-2 mb-6 p-1 glassmorphism-light rounded-xl">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                loginMethod === 'email'
                  ? 'bg-gradient-primary text-white shadow-md'
                  : 'text-gray-600'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setLoginMethod('google')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                loginMethod === 'google'
                  ? 'bg-gradient-primary text-white shadow-md'
                  : 'text-gray-600'
              }`}
            >
              Google
            </button>
          </div>

          {/* Email/Password Form */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`input-glass pl-12 ${errors.email ? 'border-2 border-red-500' : ''}`}
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
                
                {errors.email && !emailSuggestion && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`input-glass pl-12 pr-12 ${errors.password ? 'border-2 border-red-500' : ''}`}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary" />
                  <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <Link href="/forgot-password" className="text-primary hover:underline font-semibold">
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit */}
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
                    Đang đăng nhập...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Đăng Nhập
                  </span>
                )}
              </motion.button>
            </form>
          )}

          {/* Google Login */}
          {loginMethod === 'google' && (
            <div>
              <motion.button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full px-8 py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-3 hover:border-primary/50 hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                whileTap={loading ? {} : { scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Đăng nhập bằng Google
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-white/40"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/60 text-gray-600 font-medium backdrop-blur-sm rounded-full">
                hoặc
              </span>
            </div>
          </div>

          {/* Back to Home */}
          <Link href="/">
            <motion.button
              className="w-full px-6 py-3 glassmorphism-light rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-white/70 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-5 h-5" />
              Quay về Trang Chủ
            </motion.button>
          </Link>

          {/* Register Link */}
          <p className="mt-6 text-center text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          {/* Terms */}
          <p className="mt-4 text-center text-xs text-gray-500">
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

