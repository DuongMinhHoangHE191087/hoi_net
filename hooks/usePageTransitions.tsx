'use client'

import { useEffect, useCallback, useRef, memo, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * 🚀 SMOOTH PAGE TRANSITIONS (Optimized for Next.js 16)
 * 
 * Hook để tạo hiệu ứng chuyển trang mượt mà
 * Sử dụng View Transitions API (nếu browser hỗ trợ)
 * Fallback: CSS animations
 * 
 * Features:
 * - View Transitions API cho Chrome 111+
 * - Fallback animation cho browsers cũ
 * - Prefetch links khi hover
 * - Loading indicator integration
 * - SSR-safe checks
 * - Memoized callbacks for performance
 */

// SSR-safe check for View Transitions API
const getViewTransitionsSupport = () => {
  if (typeof window === 'undefined') return false
  return 'startViewTransition' in document
}

/**
 * Hook for smooth page transitions
 */
export function usePageTransitions() {
  const pathname = usePathname()
  const router = useRouter()
  const isNavigating = useRef(false)
  
  // Memoize support check
  const isViewTransitionsSupported = useMemo(() => getViewTransitionsSupport(), [])

  // Navigate with view transition
  const navigateTo = useCallback((href: string) => {
    if (isNavigating.current) return
    if (href === pathname) return

    isNavigating.current = true

    if (isViewTransitionsSupported) {
      // Use View Transitions API
      (document as any).startViewTransition(() => {
        router.push(href)
      })
    } else {
      // Fallback: just navigate
      router.push(href)
    }

    // Reset after navigation
    const timer = setTimeout(() => {
      isNavigating.current = false
    }, 500)
    
    return () => clearTimeout(timer)
  }, [pathname, router, isViewTransitionsSupported])

  // Prefetch on link hover - with debounce
  const prefetchLink = useCallback((href: string) => {
    if (typeof window === 'undefined') return
    if (href.startsWith('/') && href !== pathname) {
      // Use requestIdleCallback if available for better performance
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => router.prefetch(href))
      } else {
        router.prefetch(href)
      }
    }
  }, [pathname, router])

  return {
    navigateTo,
    prefetchLink,
    isNavigating: isNavigating.current,
  }
}

/**
 * Component to add View Transitions styles
 * Add this once in your layout
 */
function ViewTransitionsStylesComponent() {
  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return
    
    // Add view transitions CSS if supported
    if (getViewTransitionsSupport()) {
      const existingStyle = document.getElementById('view-transitions-styles')
      if (existingStyle) return // Already added
      
      const style = document.createElement('style')
      style.id = 'view-transitions-styles'
      style.textContent = `
        /* View Transitions - Root */
        ::view-transition {
          pointer-events: none;
        }
        
        /* Fade animation for old page */
        ::view-transition-old(root) {
          animation: fade-out 150ms ease-out forwards;
        }
        
        /* Fade + slide animation for new page */
        ::view-transition-new(root) {
          animation: fade-slide-in 200ms ease-out forwards;
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes fade-slide-in {
          from { 
            opacity: 0; 
            transform: translateY(10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        /* Prevent content from flashing */
        .transitioning {
          contain: paint;
        }
      `
      
      if (!document.getElementById('view-transitions-styles')) {
        document.head.appendChild(style)
      }
    }
  }, [])

  return null
}

/**
 * Enhanced Link component with prefetch and transitions
 */
export function TransitionLink({
  href,
  children,
  className = '',
  ...props
}: {
  href: string
  children: React.ReactNode
  className?: string
  [key: string]: any
}) {
  const { navigateTo, prefetchLink } = usePageTransitions()

  const handleClick = (e: React.MouseEvent) => {
    // Allow default for external links, anchors, or modified clicks
    if (
      !href.startsWith('/') ||
      href.startsWith('//') ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey
    ) {
      return
    }

    e.preventDefault()
    navigateTo(href)
  }

  const handleMouseEnter = () => {
    prefetchLink(href)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}

/**
 * Progress bar component for page transitions
 * Shows at the top of the page during navigation
 */
function TransitionProgressBarComponent() {
  const pathname = usePathname()
  const progressRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return

    const handleStart = () => {
      if (!progressRef.current) return
      
      // Reset and show
      progressRef.current.style.transform = 'scaleX(0)'
      progressRef.current.style.opacity = '1'
      
      let progress = 0
      const animate = () => {
        progress += (90 - progress) * 0.1
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${progress / 100})`
        }
        if (progress < 89) {
          animationRef.current = requestAnimationFrame(animate)
        }
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    const handleComplete = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      if (!progressRef.current) return
      
      progressRef.current.style.transform = 'scaleX(1)'
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.opacity = '0'
        }
      }, 200)
    }

    // Listen for link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement | null
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        handleStart()
      }
    }

    document.addEventListener('click', handleClick, { capture: true })

    // Complete on pathname change
    handleComplete()

    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [pathname])

  return (
    <div
      ref={progressRef}
      className="fixed top-0 left-0 right-0 h-1 z-[10001] origin-left transition-opacity duration-200"
      style={{
        background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #6366f1 100%)',
        transform: 'scaleX(0)',
        opacity: 0,
        willChange: 'transform, opacity',
      }}
      role="progressbar"
      aria-hidden="true"
    />
  )
}

// Memoize components for performance
export const ViewTransitionsStyles = memo(ViewTransitionsStylesComponent)
ViewTransitionsStyles.displayName = 'ViewTransitionsStyles'

export const TransitionProgressBar = memo(TransitionProgressBarComponent)
TransitionProgressBar.displayName = 'TransitionProgressBar'
