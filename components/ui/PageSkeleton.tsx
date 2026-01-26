'use client'

import { useEffect, useState } from 'react'

// ✅ Fixed particle positions to prevent hydration mismatch
const PARTICLE_POSITIONS = [
  { left: 10, top: 5 },
  { left: 85, top: 15 },
  { left: 25, top: 75 },
  { left: 70, top: 45 },
  { left: 45, top: 90 },
  { left: 90, top: 60 },
  { left: 15, top: 35 },
  { left: 60, top: 20 },
]

interface PageSkeletonProps {
  variant?: 'default' | 'admin' | 'dashboard' | 'content'
  message?: string
}

/**
 * 🎨 Page Loading Skeleton
 * 
 * Skeleton loading đẹp và mượt mà cho các trang
 * Sử dụng animation CSS thuần túy để đạt 60 FPS
 */
export default function PageSkeleton({ 
  variant = 'default',
  message = 'Đang tải...'
}: PageSkeletonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const renderParticles = () => {
    if (!isMounted) return null
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLE_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2.5 + (i % 3)}s`,
            }}
          />
        ))}
      </div>
    )
  }

  const renderPulsingBars = () => (
    <div className="space-y-4">
      {[100, 85, 92, 78, 88].map((width, i) => (
        <div
          key={i}
          className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-shimmer"
          style={{ 
            width: `${width}%`,
            animationDelay: `${i * 0.1}s`,
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  )

  // Admin skeleton
  if (variant === 'admin') {
    return (
      <div className="min-h-screen gradient-mesh relative overflow-hidden">
        {renderParticles()}
        
        {/* Sidebar skeleton */}
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-sm border-r border-gray-100 p-4 hidden lg:block">
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse mb-8" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mb-2" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>

        {/* Main content */}
        <div className="lg:ml-64 p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-primary/20 rounded-full animate-pulse" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>

          {/* Content card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {renderPulsingBars()}
            
            {/* Loading indicator */}
            <div className="flex items-center justify-center mt-8 pt-8 border-t border-gray-100">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary rounded-full animate-spin" />
              </div>
              <span className="ml-4 text-gray-500 font-medium">{message}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard skeleton
  if (variant === 'dashboard') {
    return (
      <div className="min-h-screen gradient-mesh relative overflow-hidden">
        {renderParticles()}
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-96 bg-gray-100 rounded animate-pulse" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="w-10 h-10 bg-primary/10 rounded-full animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {renderPulsingBars()}
            
            <div className="flex items-center justify-center mt-8">
              <div className="relative">
                <div className="w-10 h-10 border-3 border-primary/20 rounded-full" />
                <div className="absolute inset-0 w-10 h-10 border-3 border-transparent border-t-primary rounded-full animate-spin" />
              </div>
              <span className="ml-3 text-gray-500">{message}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Content page skeleton
  if (variant === 'content') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        {renderParticles()}
        
        {/* Navbar placeholder */}
        <div className="h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="h-10 w-24 bg-primary/20 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="h-12 w-3/4 bg-gray-200 rounded-lg animate-pulse mb-6 mx-auto" />
          <div className="h-6 w-1/2 bg-gray-100 rounded animate-pulse mb-12 mx-auto" />
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {renderPulsingBars()}
          </div>

          <div className="flex items-center justify-center mt-12">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-primary/20 rounded-full" />
              <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-primary rounded-full animate-spin" />
            </div>
            <span className="ml-3 text-gray-400 text-sm">{message}</span>
          </div>
        </div>
      </div>
    )
  }

  // Default skeleton
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-indigo-100 relative overflow-hidden">
      {renderParticles()}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 via-pink-200/20 to-blue-200/20 animate-gradient-shift" />

      {/* Center content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center max-w-sm mx-4 border border-white/50">
          {/* Logo placeholder */}
          <div className="text-5xl mb-4 animate-bounce">📸</div>
          <div className="h-8 w-32 bg-gradient-to-r from-primary to-secondary rounded-lg animate-pulse mx-auto mb-6" />
          
          {/* Spinner */}
          <div className="relative mx-auto w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
          </div>

          <p className="text-gray-700 font-medium">{message}</p>
          <p className="text-gray-400 text-sm mt-1">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    </div>
  )
}

// Export shimmer animation styles
export const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-15px) scale(1.1); opacity: 0.6; }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}

.animate-gradient-shift {
  animation: gradient-shift 4s ease-in-out infinite;
}
`

