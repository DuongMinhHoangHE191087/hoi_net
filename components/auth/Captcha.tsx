'use client'

import { useRef, useCallback, useState, useEffect, memo } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { Shield, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

interface CaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: (error: string) => void
  failedAttempts?: number
  thresholdAttempts?: number
  forceShow?: boolean
  size?: 'normal' | 'compact' | 'invisible'
  theme?: 'light' | 'dark'
  className?: string
}

// Get site key from env
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'

// Loading timeout in ms
const LOADING_TIMEOUT = 10000 // 10 seconds

const Captcha = memo(function Captcha({
  onVerify,
  onExpire,
  onError,
  failedAttempts = 0,
  thresholdAttempts = 3,
  forceShow = false,
  size = 'normal',
  theme = 'light',
  className = '',
}: CaptchaProps) {
  const captchaRef = useRef<HCaptcha>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const prevFailedAttempts = useRef(failedAttempts)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Show captcha if failed attempts exceed threshold or forceShow is true
  const shouldShow = forceShow || failedAttempts >= thresholdAttempts

  // Stable callbacks using refs to prevent re-renders
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onVerifyRef.current = onVerify
    onExpireRef.current = onExpire
    onErrorRef.current = onError
  }, [onVerify, onExpire, onError])

  // Loading timeout
  useEffect(() => {
    if (shouldShow && isLoading && !hasError && !loadTimeout) {
      timeoutRef.current = setTimeout(() => {
        console.warn('[Captcha] Loading timeout - captcha did not load in time')
        setLoadTimeout(true)
        setIsLoading(false)
      }, LOADING_TIMEOUT)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [shouldShow, isLoading, hasError, loadTimeout])

  const handleVerify = useCallback((token: string) => {
    console.log('[Captcha] Verified!')
    setIsVerified(true)
    setLoadTimeout(false)
    onVerifyRef.current(token)
  }, [])

  const handleExpire = useCallback(() => {
    console.log('[Captcha] Expired')
    setIsVerified(false)
    onExpireRef.current?.()
  }, [])

  const handleError = useCallback((error: string) => {
    console.error('[Captcha] Error:', error)
    setHasError(true)
    setIsLoading(false)
    onErrorRef.current?.(error)
  }, [])

  const handleLoad = useCallback(() => {
    console.log('[Captcha] Loaded successfully')
    setIsLoading(false)
    setHasError(false)
    setLoadTimeout(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleReset = useCallback(() => {
    console.log('[Captcha] Resetting...')
    captchaRef.current?.resetCaptcha()
    setIsVerified(false)
    setHasError(false)
    setLoadTimeout(false)
    setIsLoading(true)
  }, [])

  // Only reset when failedAttempts actually increases
  useEffect(() => {
    if (failedAttempts > prevFailedAttempts.current && shouldShow) {
      handleReset()
    }
    prevFailedAttempts.current = failedAttempts
  }, [failedAttempts, shouldShow, handleReset])

  if (!shouldShow) {
    return null
  }

  // Show error state when loading timeout or error
  const showError = hasError || loadTimeout

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`captcha-wrapper ${className}`}
    >
      {/* Status message */}
      <div className={`flex items-center gap-2 mb-3 p-3 rounded-lg text-sm ${
        isVerified 
          ? 'bg-green-50 border border-green-200 text-green-700'
          : showError
            ? 'bg-amber-50 border border-amber-200 text-amber-700'
            : 'bg-blue-50 border border-blue-200 text-blue-700'
      }`}>
        {isVerified ? (
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
        ) : showError ? (
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        ) : (
          <Shield className="w-4 h-4 flex-shrink-0" />
        )}
        <span>
          {isVerified 
            ? 'Đã xác minh thành công!'
            : showError
              ? 'Captcha không tải được. Bạn có thể thử lại hoặc liên hệ hỗ trợ.'
              : 'Vui lòng tích vào ô bên dưới để xác minh bạn không phải robot.'
          }
        </span>
      </div>

      {/* Captcha container */}
      <div className="flex flex-col items-center gap-3">
        {isLoading && !showError && (
          <div className="flex items-center gap-2 text-gray-500 py-4">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Đang tải captcha...</span>
          </div>
        )}

        {showError && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="text-amber-600 text-sm text-center">
              {loadTimeout 
                ? 'Captcha mất quá lâu để tải. Có thể do kết nối mạng hoặc trình duyệt chặn.'
                : 'Không thể tải captcha. Vui lòng kiểm tra kết nối mạng.'
              }
            </div>
            <button
              type="button"
              onClick={() => {
                handleReset()
                // Also try to reload the page's captcha
                window.location.reload()
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tải lại trang
            </button>
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Nếu vẫn không được, hãy thử tắt ad blocker hoặc dùng trình duyệt khác.
            </p>
          </div>
        )}

        {/* Always render HCaptcha but hide when loading/error */}
        <div className={isLoading || showError ? 'opacity-0 h-0 overflow-hidden absolute' : ''}>
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={handleVerify}
            onExpire={handleExpire}
            onError={handleError}
            onLoad={handleLoad}
            size={size}
            theme={theme}
            languageOverride="vi"
          />
        </div>

        {isVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-green-600 text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Xác minh thành công</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
})

export default Captcha

// Hook for managing captcha state
export function useCaptcha() {
  const [token, setToken] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = useCallback((newToken: string) => {
    setToken(newToken)
    setIsVerified(true)
  }, [])

  const handleExpire = useCallback(() => {
    setToken(null)
    setIsVerified(false)
  }, [])

  const reset = useCallback(() => {
    setToken(null)
    setIsVerified(false)
  }, [])

  return {
    token,
    isVerified,
    handleVerify,
    handleExpire,
    reset,
  }
}
