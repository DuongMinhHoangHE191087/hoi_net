'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2, AlertCircle, 
  ShieldCheck, ArrowLeft, KeyRound, RefreshCw, Info, Shield,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validatePasswordComprehensive } from '@/lib/auth/validation'
import toast, { Toaster } from 'react-hot-toast'
import { authLogger } from '@/lib/auth-logger'

// =====================================================
// Animated Background Component (Consistent with Login)
// =====================================================
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -right-20 w-96 h-96 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/10 to-yellow-400/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  )
}

// =====================================================
// Security Info Component
// =====================================================
function SecurityInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Thông tin bảo mật:</p>
          <ul className="text-xs space-y-1 text-blue-700">
            <li>• Link này chỉ sử dụng được một lần duy nhất</li>
            <li>• Link hết hạn sau 1 giờ</li>
            <li>• Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

// =====================================================
// Password Strength Indicator Component
// =====================================================
function PasswordStrengthIndicator({ 
  validation 
}: { 
  validation: ReturnType<typeof validatePasswordComprehensive> 
}) {
  const strengthColors = {
    weak: 'from-red-500 to-red-400',
    medium: 'from-yellow-500 to-yellow-400',
    strong: 'from-green-500 to-green-400',
  }

  const strengthText = {
    weak: { text: 'Yếu', emoji: '🔓' },
    medium: { text: 'Trung bình', emoji: '🔐' },
    strong: { text: 'Mạnh', emoji: '💪' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 space-y-3"
    >
      {/* Strength bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">
            Độ mạnh: {validation.score}%
          </span>
          <span className={`text-xs font-bold flex items-center gap-1 ${
            validation.strength === 'strong' ? 'text-green-600' :
            validation.strength === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {strengthText[validation.strength].emoji} {strengthText[validation.strength].text}
          </span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className={`h-full bg-gradient-to-r ${strengthColors[validation.strength]}`}
            initial={{ width: 0 }}
            animate={{ width: `${validation.score}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
      
      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-2">
        {validation.requirements.slice(0, 6).map((req, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-1.5 text-xs p-1.5 rounded-lg transition-colors ${
              req.met ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.05 + 0.1, type: "spring" }}
            >
              {req.met ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              )}
            </motion.div>
            <span className="truncate">
              {req.label.replace('Ít nhất ', '').replace(' (khuyến nghị)', '*')}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// =====================================================
// Main Reset Password Content Component
// =====================================================
function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Form state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [passwordValidation, setPasswordValidation] = useState(() => 
    validatePasswordComprehensive('')
  )
  
  // UI state
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokenUsed, setTokenUsed] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [countdown, setCountdown] = useState(3)
  
  // Refs
  const passwordRef = useRef<HTMLInputElement>(null)
  const hasAttempted = useRef(false)

  // Check for valid recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      setCheckingSession(true)
      
      try {
        const supabase = createClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Also check URL hash for recovery token (Supabase sometimes puts it there)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')
        const errorParam = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')
        
        // Handle URL error
        if (errorParam) {
          if (errorDescription?.includes('expired')) {
            setError('Link khôi phục đã hết hạn. Vui lòng yêu cầu link mới.')
          } else {
            setError(decodeURIComponent(errorDescription || errorParam))
          }
          setCheckingSession(false)
          return
        }
        
        // Check for valid session or recovery token
        if (session || (type === 'recovery' && accessToken)) {
          setIsValidSession(true)
          
          // Auto-focus password input
          setTimeout(() => {
            passwordRef.current?.focus()
          }, 500)
        } else {
          setError('Link khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.')
        }
      } catch (err) {
        console.error('[Reset Password] Session check error:', err)
        setError('Không thể xác minh phiên. Vui lòng thử lại.')
      } finally {
        setCheckingSession(false)
      }
    }
    
    checkSession()
  }, [])

  // Password validation with debounce
  const handlePasswordChange = useCallback((newPassword: string) => {
    setPassword(newPassword)
    const validation = validatePasswordComprehensive(newPassword)
    setPasswordValidation(validation)
  }, [])

  // Countdown for redirect after success
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (success && countdown === 0) {
      router.push('/login?message=password-reset')
    }
  }, [success, countdown, router])

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (hasAttempted.current || loading) return
    hasAttempted.current = true
    
    setLoading(true)
    setError('')

    try {
      // Client-side validation
      if (password !== confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp')
        setLoading(false)
        hasAttempted.current = false
        return
      }

      if (!passwordValidation.valid) {
        toast.error('Mật khẩu không đủ mạnh. Vui lòng kiểm tra các yêu cầu.')
        setLoading(false)
        hasAttempted.current = false
        return
      }

      // Get current session for API call
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      // Call secure API endpoint
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          confirmPassword,
          sessionToken: session?.access_token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific errors
        if (response.status === 429) {
          toast.error(data.error || 'Quá nhiều yêu cầu. Vui lòng đợi.')
          setLoading(false)
          hasAttempted.current = false
          return
        }
        
        if (data.tokenUsed) {
          setTokenUsed(true)
          setError('Link khôi phục này đã được sử dụng. Mỗi link chỉ có thể sử dụng một lần.')
          toast.error('Link đã được sử dụng trước đó!')
          return
        }
        
        throw new Error(data.error || 'Không thể đặt lại mật khẩu')
      }

      // Success!
      authLogger.passwordResetSuccess(session?.user?.id || 'unknown', session?.user?.email || 'unknown')
      setSuccess(true)
      toast.success('Mật khẩu đã được đặt lại thành công! 🎉')

    } catch (err: any) {
      console.error('[Reset Password] Error:', err)
      
      if (err.message.includes('session') || err.message.includes('expired')) {
        setError('Phiên đã hết hạn. Vui lòng yêu cầu link khôi phục mới.')
      } else if (err.message.includes('same password')) {
        toast.error('Mật khẩu mới phải khác mật khẩu cũ.')
        hasAttempted.current = false
      } else {
        toast.error(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
        hasAttempted.current = false
      }
      
      setLoading(false)
    }
  }

  // =====================================================
  // Loading State
  // =====================================================
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glassmorphism-strong p-10 rounded-3xl z-10"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-10 h-10 text-primary" />
            </motion.div>
            <p className="text-gray-600 font-medium">Đang xác minh link khôi phục...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // =====================================================
  // Error State (Invalid/Expired/Used Token)
  // =====================================================
  if (error || tokenUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        <AnimatedBackground />
        <Toaster position="top-center" />

        <motion.div
          className="glassmorphism-strong w-full max-w-md p-8 md:p-10 z-10"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="text-center">
            <motion.div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                tokenUsed ? 'bg-yellow-100' : 'bg-red-100'
              }`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              {tokenUsed ? (
                <RefreshCw className="w-10 h-10 text-yellow-600" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-600" />
              )}
            </motion.div>

            <motion.h1
              className="text-2xl md:text-3xl font-bold text-text mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {tokenUsed ? 'Link Đã Được Sử Dụng' : 'Link Không Hợp Lệ'}
            </motion.h1>
            
            <motion.p
              className="text-gray-600 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {error}
            </motion.p>

            {tokenUsed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 p-4 bg-yellow-50/80 border border-yellow-200 rounded-xl text-left"
              >
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold">Vì sao điều này xảy ra?</p>
                    <p className="text-xs mt-1">
                      Vì lý do bảo mật, mỗi link khôi phục mật khẩu chỉ có thể sử dụng một lần. 
                      Điều này ngăn chặn việc sử dụng lại link cũ.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <Link href="/forgot-password">
              <motion.button
                className="w-full btn-glass-primary py-3.5 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <RefreshCw className="w-5 h-5" />
                Yêu Cầu Link Mới
              </motion.button>
            </Link>

            <Link href="/login">
              <motion.button
                className="mt-4 w-full px-6 py-3 glassmorphism-light rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-white/70 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
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

  // =====================================================
  // Success State
  // =====================================================
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        <AnimatedBackground />
        <Toaster position="top-center" />

        <motion.div
          className="glassmorphism-strong w-full max-w-md p-8 md:p-10 z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center">
            {/* Success animation */}
            <motion.div
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full mb-6 shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>

            {/* Confetti effect */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#FF6B9D', '#FFC837', '#4ECB71', '#4F8FFF', '#8B7FD4', '#FF8F6B'][i],
                  left: `${30 + i * 8}%`,
                  top: '30%',
                }}
                initial={{ y: 0, opacity: 1 }}
                animate={{
                  y: [0, -100, 100],
                  x: [0, (i % 2 === 0 ? 50 : -50), 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              />
            ))}

            <motion.h1
              className="text-3xl font-bold text-text mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Thành Công! 🎉
            </motion.h1>
            
            <motion.p
              className="text-gray-600 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Mật khẩu của bạn đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.
            </motion.p>

            <motion.div
              className="flex items-center justify-center gap-2 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">
                Chuyển hướng đến trang đăng nhập trong {countdown}s...
              </span>
            </motion.div>

            <Link href="/login">
              <motion.button
                className="mt-6 w-full btn-glass-primary py-3 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                Đăng Nhập Ngay
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // =====================================================
  // Main Form
  // =====================================================
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <AnimatedBackground />
      <Toaster position="top-center" />

      <motion.div
        className="glassmorphism-strong w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-6 shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <KeyRound className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              className="text-3xl md:text-4xl font-bold gradient-text mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Đặt Lại Mật Khẩu
            </motion.h1>
            
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Tạo mật khẩu mới an toàn cho tài khoản của bạn
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="input-glass pl-12 pr-12"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <AnimatePresence>
                {password && (
                  <PasswordStrengthIndicator validation={passwordValidation} />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input-glass pl-12 pr-12 ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                      : confirmPassword && password === confirmPassword
                        ? 'border-green-400 focus:border-green-500 focus:ring-green-200'
                        : ''
                  }`}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Match indicator */}
              <AnimatePresence>
                {confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    {password !== confirmPassword ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Mật khẩu không khớp
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Mật khẩu khớp
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !passwordValidation.valid || password !== confirmPassword}
              className="w-full btn-glass-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={loading || !passwordValidation.valid ? {} : { scale: 1.02, y: -2 }}
              whileTap={loading || !passwordValidation.valid ? {} : { scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Đặt Lại Mật Khẩu</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Security Info */}
          <SecurityInfo />

          {/* Back to login */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay về Đăng Nhập
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// =====================================================
// Main Export with Suspense
// =====================================================
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="glassmorphism-strong p-10 rounded-3xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-gray-600 font-medium">Đang tải...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

