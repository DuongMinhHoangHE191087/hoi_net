'use client'

/**
 * 🔐 hCaptcha Component
 * 
 * Wrapper component cho hCaptcha với:
 * - Tự động load script
 * - Callback handlers
 * - Theme support
 * - Error handling
 */

import { useEffect, useRef, useCallback, useState } from 'react'

// ============================================
// Types
// ============================================

interface HCaptchaProps {
  siteKey?: string
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: (error: string) => void
  size?: 'normal' | 'compact' | 'invisible'
  theme?: 'light' | 'dark'
  language?: string
  className?: string
}

declare global {
  interface Window {
    hcaptcha: any
    onHCaptchaLoad?: () => void
  }
}

// ============================================
// Component
// ============================================

export function HCaptcha({
  siteKey,
  onVerify,
  onExpire,
  onError,
  size = 'normal',
  theme = 'light',
  language = 'vi',
  className = '',
}: HCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get site key from props or env
  const actualSiteKey = siteKey || process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY
  
  // ============================================
  // Load hCaptcha script
  // ============================================
  
  useEffect(() => {
    if (!actualSiteKey) {
      setError('hCaptcha site key not configured')
      console.warn('[HCaptcha] NEXT_PUBLIC_HCAPTCHA_SITE_KEY not set')
      return
    }
    
    // Check if already loaded
    if (window.hcaptcha) {
      setIsLoaded(true)
      return
    }
    
    // Load script
    const script = document.createElement('script')
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      setIsLoaded(true)
    }
    
    script.onerror = () => {
      setError('Failed to load hCaptcha')
      onError?.('Failed to load hCaptcha script')
    }
    
    document.head.appendChild(script)
    
    return () => {
      // Cleanup widget if exists
      if (widgetIdRef.current && window.hcaptcha) {
        try {
          window.hcaptcha.reset(widgetIdRef.current)
        } catch {}
      }
    }
  }, [actualSiteKey, onError])
  
  // ============================================
  // Render captcha
  // ============================================
  
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !actualSiteKey) return
    if (widgetIdRef.current !== null) return // Already rendered
    
    // Wait for hcaptcha to be ready
    const renderCaptcha = () => {
      if (!window.hcaptcha || !containerRef.current) return
      
      try {
        widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
          sitekey: actualSiteKey,
          size,
          theme,
          hl: language,
          callback: (token: string) => {
            onVerify(token)
          },
          'expired-callback': () => {
            widgetIdRef.current = null
            onExpire?.()
          },
          'error-callback': (err: string) => {
            setError(err)
            onError?.(err)
          },
        })
      } catch (err: any) {
        console.error('[HCaptcha] Render error:', err)
        setError(err.message || 'Failed to render captcha')
        onError?.(err.message || 'Failed to render captcha')
      }
    }
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(renderCaptcha, 100)
    
    return () => clearTimeout(timer)
  }, [isLoaded, actualSiteKey, size, theme, language, onVerify, onExpire, onError])
  
  // ============================================
  // Reset method
  // ============================================
  
  const reset = useCallback(() => {
    if (widgetIdRef.current && window.hcaptcha) {
      window.hcaptcha.reset(widgetIdRef.current)
    }
  }, [])
  
  // ============================================
  // Render
  // ============================================
  
  if (!actualSiteKey) {
    // Development fallback - show placeholder
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center ${className}`}>
          <p className="text-sm text-gray-500">hCaptcha (dev mode)</p>
          <button
            type="button"
            onClick={() => onVerify('dev-token-skip')}
            className="mt-2 px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
          >
            Skip (dev only)
          </button>
        </div>
      )
    }
    
    return null
  }
  
  if (error) {
    return (
      <div className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}>
        <p className="text-sm text-red-600">Không thể tải CAPTCHA: {error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null)
            setIsLoaded(false)
            widgetIdRef.current = null
          }}
          className="mt-2 text-xs text-red-700 underline"
        >
          Thử lại
        </button>
      </div>
    )
  }
  
  return (
    <div className={className}>
      <div ref={containerRef} />
      {!isLoaded && (
        <div className="p-4 text-center text-gray-500 text-sm">
          Đang tải CAPTCHA...
        </div>
      )}
    </div>
  )
}

// ============================================
// Hook for invisible captcha
// ============================================

export function useHCaptcha(siteKey?: string) {
  const [token, setToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  
  const actualSiteKey = siteKey || process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY
  
  useEffect(() => {
    if (!actualSiteKey) return
    
    if (window.hcaptcha) {
      setIsReady(true)
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit'
    script.async = true
    script.onload = () => setIsReady(true)
    document.head.appendChild(script)
  }, [actualSiteKey])
  
  const execute = useCallback(async (): Promise<string | null> => {
    if (!window.hcaptcha || !actualSiteKey) return null
    
    try {
      const response = await window.hcaptcha.execute(actualSiteKey, { async: true })
      setToken(response.response)
      return response.response
    } catch (error) {
      console.error('[useHCaptcha] Execute error:', error)
      return null
    }
  }, [actualSiteKey])
  
  const reset = useCallback(() => {
    setToken(null)
    if (window.hcaptcha) {
      window.hcaptcha.reset()
    }
  }, [])
  
  return { token, isReady, execute, reset }
}

export default HCaptcha
