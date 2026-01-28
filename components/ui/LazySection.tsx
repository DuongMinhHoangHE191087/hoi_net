/**
 * Lazy Section Loader
 * 
 * Chỉ render component khi gần vào viewport
 * Giảm initial render time và hydration cost
 */

'use client'

import { useRef, useState, useEffect, ReactNode, ComponentType } from 'react'

interface LazySectionProps {
  children: ReactNode
  /** Khoảng cách trigger trước khi vào viewport (px) */
  rootMargin?: string
  /** Chiều cao placeholder */
  minHeight?: string
  /** Skeleton loading component */
  skeleton?: ReactNode
  /** Class cho wrapper */
  className?: string
}

/**
 * Wrap section với lazy loading dựa trên viewport
 * Chỉ render children khi section gần vào màn hình
 */
export function LazySection({
  children,
  rootMargin = '200px',
  minHeight = '400px',
  skeleton,
  className = ''
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check if already in viewport on mount
    const rect = element.getBoundingClientRect()
    if (rect.top < window.innerHeight + 200) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold: 0,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight: isVisible ? undefined : minHeight }}
    >
      {isVisible ? children : skeleton || <DefaultSkeleton minHeight={minHeight} />}
    </div>
  )
}

function DefaultSkeleton({ minHeight }: { minHeight: string }) {
  return (
    <div
      className="animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center"
      style={{ minHeight }}
    >
      <div className="text-gray-400 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse" />
        <span>Đang tải...</span>
      </div>
    </div>
  )
}

/**
 * Higher-order component for lazy loading
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options?: Omit<LazySectionProps, 'children'>
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazySection {...options}>
        <Component {...props} />
      </LazySection>
    )
  }
}

/**
 * Hook để kiểm tra component có trong viewport không
 */
export function useInViewport(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null)
  const [isInViewport, setIsInViewport] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return { ref, isInViewport }
}
