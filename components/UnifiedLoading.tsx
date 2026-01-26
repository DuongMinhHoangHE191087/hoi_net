'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 🎯 UNIFIED LOADING SYSTEM v2
 * 
 * Một hệ thống loading duy nhất cho toàn app:
 * - Tự động hiển thị khi chuyển trang
 * - Có thể gọi thủ công khi click
 * - Mượt mà, không giật lag
 * - Tối ưu performance với CSS animations
 */

// ============================================
// TYPES
// ============================================

interface LoadingState {
  isLoading: boolean
  message: string
}

interface LoadingContextType {
  isLoading: boolean
  message: string
  start: (message?: string) => void
  stop: () => void
}

// ============================================
// CONTEXT
// ============================================

const LoadingContext = createContext<LoadingContextType | null>(null)

// ============================================
// HOOK
// ============================================

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    // Fallback khi không có provider
    return {
      isLoading: false,
      message: '',
      start: () => {},
      stop: () => {},
    }
  }
  return context
}

// ============================================
// LOADING COMPONENT - Tối giản, GPU accelerated
// ============================================

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div 
      className="loading-overlay"
      role="progressbar"
      aria-busy="true"
      aria-label={message}
    >
      {/* Backdrop */}
      <div className="loading-backdrop" />
      
      {/* Content */}
      <div className="loading-content">
        {/* Spinner */}
        <div className="loading-spinner">
          <svg viewBox="0 0 50 50" className="loading-svg">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="loading-circle"
            />
          </svg>
        </div>
        
        {/* Message */}
        <p className="loading-message">{message}</p>
      </div>

      <style jsx>{`
        .loading-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.15s ease-out;
        }

        .loading-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .loading-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 32px 48px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
          animation: scaleIn 0.2s ease-out;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          color: #ec4899;
        }

        .loading-svg {
          width: 100%;
          height: 100%;
          animation: rotate 1s linear infinite;
        }

        .loading-circle {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: 0;
          animation: dash 1.5s ease-in-out infinite;
        }

        .loading-message {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          color: #374151;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }

        @keyframes dash {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================
// PROVIDER
// ============================================

export function LoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    message: 'Đang tải...',
  })
  const [isNavigating, setIsNavigating] = useState(false)

  const start = useCallback((message = 'Đang tải...') => {
    setState({ isLoading: true, message })
  }, [])

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false }))
  }, [])

  // Auto-detect navigation
  useEffect(() => {
    if (isNavigating) {
      // Stop loading after navigation complete
      const timer = setTimeout(() => {
        stop()
        setIsNavigating(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [pathname, isNavigating, stop])

  // Listen for click on links to start loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link) {
        const href = link.getAttribute('href')
        // Only for internal links
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          // Don't show for same page or hash links
          if (href !== pathname && !href.startsWith('#')) {
            start('Đang tải...')
            setIsNavigating(true)
          }
        }
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [pathname, start])

  return (
    <LoadingContext.Provider value={{ ...state, start, stop }}>
      {children}
      {state.isLoading && <LoadingOverlay message={state.message} />}
    </LoadingContext.Provider>
  )
}

// ============================================
// UTILITY COMPONENTS
// ============================================

/**
 * HOC để wrap button/link với loading
 */
export function withLoading<T extends { onClick?: (e: React.MouseEvent) => void }>(
  Component: React.ComponentType<T>
) {
  return function WithLoadingComponent(props: T & { loadingMessage?: string }) {
    const { start } = useLoading()
    const { loadingMessage, onClick, ...rest } = props as any

    const handleClick = (e: React.MouseEvent) => {
      start(loadingMessage || 'Đang tải...')
      onClick?.(e)
    }

    return <Component {...(rest as T)} onClick={handleClick} />
  }
}

/**
 * Button với loading tích hợp
 */
export function LoadingButton({
  children,
  onClick,
  loadingMessage = 'Đang xử lý...',
  className = '',
  disabled = false,
  ...props
}: {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void | Promise<void>
  loadingMessage?: string
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  const { start, stop } = useLoading()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    if (isProcessing || disabled) return
    
    setIsProcessing(true)
    start(loadingMessage)
    
    try {
      await onClick?.(e)
    } finally {
      setIsProcessing(false)
      stop()
    }
  }

  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Link với loading tích hợp
 */
export function LoadingLink({
  href,
  children,
  className = '',
  loadingMessage = 'Đang tải...',
  ...props
}: {
  href: string
  children: React.ReactNode
  className?: string
  loadingMessage?: string
  [key: string]: any
}) {
  const { start } = useLoading()
  const pathname = usePathname()

  const handleClick = () => {
    // Only show loading for different pages
    if (href !== pathname && !href.startsWith('#') && !href.startsWith('http')) {
      start(loadingMessage)
    }
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}

