'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect, Suspense } from 'react'
import { ImageIcon, Mail, Lock, Sparkles, Chrome, UserPlus, Eye, EyeOff, User, CheckCircle, XCircle, AlertCircle, Loader2, Info, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, getErrorMessage } from '@/lib/auth'
import { 
  validateEmailComprehensive, 
  validatePasswordComprehensive,
  registerFormSchema,
  type RegisterFormData 
} from '@/lib/auth/validation'
import { sanitizeInput } from '@/lib/security'
import { useSiteSetting } from '@/hooks/useSiteSettings'
import toast, { Toaster } from 'react-hot-toast'
import Captcha, { useCaptcha } from '@/components/auth/Captcha'
import { useAuthSettings, useFailedAttempts } from '@/hooks/useAuthSettings'

// ============================================
// Types for API Response
// ============================================

interface SignUpResponse {
  success: boolean
  needsConfirmation?: boolean
  message?: string
  error?: {
    code: string
    message: string
  }
  exists?: boolean
}

// Loading fallback
function RegisterLoading() {
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

// Main wrapper
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithGoogle, loading: authLoading } = useAuth()
  const brandName = useSiteSetting('brand_name')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)

  // Auth settings & captcha from admin
  const { settings } = useAuthSettings()
  const { attempts: failedAttempts, increment: incrementAttempts, reset: resetAttempts } = useFailedAttempts('register')
  const captcha = useCaptcha()

  // Pre-fill email from URL params (from login redirect)
  const emailFromUrl = searchParams.get('email')

  const [formData, setFormData] = useState({
    email: emailFromUrl || '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeTerms: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordValidation, setPasswordValidation] = useState(() => 
    validatePasswordComprehensive('')
  )

  // Real-time email validation
  const handleEmailChange = useCallback((email: string) => {
    setFormData(prev => ({ ...prev, email }))
    setEmailSuggestion(null)
    
    if (email.length > 0) {
      const validation = validateEmailComprehensive(email)
      if (!validation.valid) {
        if (validation.suggestion) {
          setEmailSuggestion(validation.suggestion)
        }
        // Only show error after user has typed enough
        if (email.length > 5 && email.includes('@')) {
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

  // Real-time password validation
  const handlePasswordChange = useCallback((password: string) => {
    setFormData(prev => ({ ...prev, password }))
    const validation = validatePasswordComprehensive(password)
    setPasswordValidation(validation)
    
    // Clear password error if now valid
    if (validation.valid) {
      setErrors(prev => {
        const { password: _, ...rest } = prev
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

  // Email registration - using API
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Sanitize inputs
      const sanitized = {
        email: sanitizeInput(formData.email, 254).toLowerCase().trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: sanitizeInput(formData.fullName || '', 100).trim(),
        agreeTerms: formData.agreeTerms,
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

      // Password validation
      const pwdValidation = validatePasswordComprehensive(sanitized.password)
      if (!pwdValidation.valid) {
        setErrors({ password: pwdValidation.errors[0] || 'Mật khẩu không đủ mạnh' })
        toast.error('Vui lòng kiểm tra lại mật khẩu', { icon: '⚠️' })
        setLoading(false)
        return
      }

      // Validate with Zod schema
      const result = registerFormSchema.safeParse(sanitized)

      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        result.error.errors.forEach((err) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(fieldErrors)
        
        // Show first error
        const firstError = result.error.errors[0]
        toast.error(firstError?.message || 'Vui lòng kiểm tra lại thông tin')
        setLoading(false)
        return
      }

      // Check if captcha is required - Supabase ALWAYS requires captcha when enabled
      const needsCaptcha = settings.captcha.enabled && settings.captcha.forms.register
      
      console.log('[Register] Captcha check:', {
        enabled: settings.captcha.enabled,
        formEnabled: settings.captcha.forms.register,
        needsCaptcha,
        isVerified: captcha.isVerified,
        hasToken: !!captcha.token,
      })
      
      if (needsCaptcha && !captcha.isVerified) {
        toast.error('Vui lòng xác minh captcha (hộp checkbox bên dưới)', {
          icon: '🔒',
          duration: 5000,
        })
        setLoading(false)
        return
      }

      // Sign up via API
      console.log('[Register] Attempting sign up via API:', {
        email: result.data.email,
        hasPassword: !!result.data.password,
        fullName: result.data.fullName,
        hasCaptcha: !!captcha.token
      })

      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: result.data.email,
          password: result.data.password,
          fullName: result.data.fullName,
          captchaToken: captcha.token || undefined,
        }),
      })

      const data: SignUpResponse = await response.json()

      if (!data.success) {
        const errorCode = data.error?.code || 'UNKNOWN'
        const errorMessage = data.error?.message || getErrorMessage(data.error) || 'Đăng ký thất bại'
        
        // Increment failed attempts and reset captcha
        incrementAttempts()
        captcha.reset()
        
        // Handle "already registered" explicitly
        if (errorCode === 'USER_ALREADY_REGISTERED' || data.exists) {
          setErrors({ email: errorMessage })
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
                    Email đã được đăng ký
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    Tài khoản với email này đã tồn tại. Bạn có muốn đăng nhập?
                  </p>
                  <Link 
                    href={`/login?email=${encodeURIComponent(result.data.email)}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-900"
                  >
                    <LogIn className="w-4 h-4" />
                    Đăng nhập ngay
                  </Link>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-amber-400 hover:text-amber-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ), { duration: 10000 })
        } else {
          toast.error(errorMessage, { icon: '❌' })
        }
        
        setLoading(false)
        return
      }

      console.log('[Register] Sign up successful')

      if (data.needsConfirmation) {
        // Show email confirmation required message
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="max-w-md w-full bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl rounded-2xl p-4 ring-1 ring-green-200"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">
                  Đăng ký thành công! 🎉
                </p>
                <p className="mt-1 text-sm text-green-700">
                  Chúng tôi đã gửi email xác nhận đến <strong>{result.data.email}</strong>. 
                  Vui lòng kiểm tra hộp thư (và thư mục spam) để xác nhận tài khoản.
                </p>
              </div>
              <button 
                onClick={() => toast.dismiss(t.id)}
                className="text-green-400 hover:text-green-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ), { duration: 10000 })

        // Redirect to confirmation page
        setTimeout(() => {
          router.push(`/auth/confirm-email?email=${encodeURIComponent(result.data.email)}`)
        }, 2000)
      } else {
        // User is auto-confirmed
        toast.success('Đăng ký thành công!', { duration: 2000 })

        // Wait then redirect
        await new Promise(resolve => setTimeout(resolve, 1000))
        window.location.href = '/dashboard'
      }

    } catch (error: any) {
      console.error('[Register] Sign up failed:', {
        error: error.message,
        code: error.code,
        name: error.name,
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
              <span className="text-2xl font-bold gradient-text-alt">{brandName}</span>
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
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  {errors.email}
                </motion.p>
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

              {/* Password Strength Indicator - Enhanced */}
              {formData.password && (
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

              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  {errors.password}
                </motion.p>
              )}
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

            {/* Captcha - always show when enabled (Supabase requires it) */}
            {settings.captcha.enabled && settings.captcha.forms.register && (
              <Captcha
                onVerify={captcha.handleVerify}
                onExpire={captcha.handleExpire}
                failedAttempts={failedAttempts}
                thresholdAttempts={settings.captcha.threshold_attempts}
                forceShow={true}  // Always show because Supabase requires captcha
                className="mb-2"
              />
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

