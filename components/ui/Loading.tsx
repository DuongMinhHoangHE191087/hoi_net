'use client'

import { Loader2 } from 'lucide-react'
import { useState, useEffect, createContext, useContext } from 'react'

/**
 * 🎨 UNIFIED LOADING SYSTEM
 * 
 * Hệ thống loading thống nhất cho toàn app
 * 
 * Variants:
 * - fullscreen: Page transitions, initial load
 * - overlay: Data updates, form submissions  
 * - inline: Component-level loading
 * - minimal: Simple spinner
 */

// ============================================
// TYPES
// ============================================

type LoadingVariant = 'fullscreen' | 'overlay' | 'inline' | 'minimal'

interface LoadingProps {
  variant?: LoadingVariant
  message?: string
  showProgress?: boolean
  progress?: number
  blur?: boolean
}

// ============================================
// PARTICLE POSITIONS (fixed for SSR)
// ============================================

const PARTICLES = [
  { left: 15, top: 8, size: 2 },
  { left: 78, top: 22, size: 1.5 },
  { left: 42, top: 65, size: 2.5 },
  { left: 88, top: 45, size: 1.5 },
  { left: 25, top: 85, size: 2 },
  { left: 55, top: 12, size: 1.5 },
  { left: 92, top: 78, size: 2 },
  { left: 8, top: 55, size: 2.5 },
]

// ============================================
// MAIN COMPONENT
// ============================================

export default function Loading({
  variant = 'inline',
  message = 'Đang tải...',
  showProgress = false,
  progress = 0,
  blur = true,
}: LoadingProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fullscreen loading - Page transitions
  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-indigo-100">
          {/* Animated overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 via-pink-200/20 to-blue-200/20 animate-pulse" />
          
          {/* Particles */}
          {mounted && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {PARTICLES.map((p, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white/30 animate-float"
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    width: `${p.size * 4}px`,
                    height: `${p.size * 4}px`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${3 + (i % 2)}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Radial glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 bg-gradient-radial from-primary/20 via-secondary/10 to-transparent rounded-full blur-3xl animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mx-4 max-w-sm border border-white/50">
            {/* Logo */}
            <div className="text-5xl mb-3 animate-bounce">📸</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-500 to-indigo-500 bg-clip-text text-transparent mb-6">
              Photo AI
            </h2>

            {/* Spinner */}
            <div className="relative mb-6 flex justify-center">
              <div className="absolute w-16 h-16 bg-primary/20 rounded-full animate-ping" />
              <div className="absolute w-14 h-14 bg-primary/30 rounded-full blur-md animate-pulse" />
              <Loader2 className="w-14 h-14 text-primary animate-spin relative z-10" />
            </div>

            {/* Message */}
            <p className="text-gray-700 font-medium text-lg">{message}</p>
            <p className="text-gray-400 text-sm mt-1">Vui lòng chờ trong giây lát</p>

            {/* Progress */}
            {showProgress && (
              <div className="mt-6">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-pink-500 to-indigo-500 transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{Math.round(progress)}%</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Overlay loading - Data updates, form submissions
  if (variant === 'overlay') {
    return (
      <div className={`fixed inset-0 z-[9998] flex items-center justify-center transition-all duration-200 ${blur ? 'backdrop-blur-sm' : ''}`}>
        {/* Semi-transparent background */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Loading card */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mx-4 min-w-[200px] border border-gray-100 animate-scale-in">
          <div className="flex items-center gap-4">
            {/* Spinner with glow */}
            <div className="relative">
              <div className="absolute inset-0 w-10 h-10 bg-primary/30 rounded-full blur-md animate-pulse" />
              <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
            </div>
            
            {/* Message */}
            <div>
              <p className="text-gray-800 font-medium">{message}</p>
              {showProgress && (
                <div className="mt-2 w-32">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Inline loading - Component-level
  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="relative mb-4">
          <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full animate-ping" />
          <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
        
        {showProgress && (
          <div className="mt-4 w-48">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">{Math.round(progress)}%</p>
          </div>
        )}
      </div>
    )
  }

  // Minimal loading - Simple spinner
  return (
    <div className="flex items-center justify-center gap-3 p-4">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
      <span className="text-gray-600 text-sm">{message}</span>
    </div>
  )
}

// ============================================
// EXPORTED VARIANTS
// ============================================

export function FullScreenLoading({ message, showProgress, progress }: { message?: string; showProgress?: boolean; progress?: number }) {
  return <Loading variant="fullscreen" message={message} showProgress={showProgress} progress={progress} />
}

export function OverlayLoading({ message, blur = true }: { message?: string; blur?: boolean }) {
  return <Loading variant="overlay" message={message} blur={blur} />
}

export function InlineLoading({ message }: { message?: string }) {
  return <Loading variant="inline" message={message} />
}

export function MinimalLoading({ message }: { message?: string }) {
  return <Loading variant="minimal" message={message} />
}

// ============================================
// LOADING CONTEXT & HOOK
// ============================================

interface LoadingContextType {
  isLoading: boolean
  message: string
  variant: LoadingVariant
  progress: number
  show: (message?: string, variant?: LoadingVariant) => void
  hide: () => void
  setProgress: (value: number) => void
}

const LoadingContext = createContext<LoadingContextType | null>(null)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Đang tải...')
  const [variant, setVariant] = useState<LoadingVariant>('overlay')
  const [progress, setProgress] = useState(0)

  const show = (msg?: string, v?: LoadingVariant) => {
    setMessage(msg || 'Đang tải...')
    setVariant(v || 'overlay')
    setProgress(0)
    setIsLoading(true)
  }

  const hide = () => {
    setProgress(100)
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 200)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, message, variant, progress, show, hide, setProgress }}>
      {children}
      {isLoading && <Loading variant={variant} message={message} showProgress={progress > 0} progress={progress} />}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    // Return standalone hook if not in provider
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('Đang tải...')
    const [progress, setProgress] = useState(0)
    const [variant, setVariant] = useState<LoadingVariant>('overlay')

    return {
      isLoading,
      show: (msg?: string, v?: LoadingVariant) => {
        setMessage(msg || 'Đang tải...')
        setVariant(v || 'overlay')
        setIsLoading(true)
      },
      hide: () => setIsLoading(false),
      setProgress,
      Component: () => isLoading ? <Loading variant={variant} message={message} showProgress={progress > 0} progress={progress} /> : null,
    }
  }
  return context
}

// ============================================
// CSS STYLES (included in component)
// ============================================

const styles = `
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.1); opacity: 0.6; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes scale-in {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-float { animation: float 3s ease-in-out infinite; }
.animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
.animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
.bg-gradient-radial { background: radial-gradient(circle, var(--tw-gradient-stops)); }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'unified-loading-styles'
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style')
    styleEl.id = styleId
    styleEl.textContent = styles
    document.head.appendChild(styleEl)
  }
}

