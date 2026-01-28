/**
 * Lazy Motion Wrapper
 * 
 * Lazy load framer-motion để giảm initial bundle size (~50KB)
 * Sử dụng CSS animations cho Above-the-fold content
 */

'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'
import { ReactNode } from 'react'

interface LazyMotionWrapperProps {
  children: ReactNode
}

/**
 * Wrap components that use motion with this to enable lazy loading
 * Uses domAnimation feature set (smaller than full motion)
 */
export function LazyMotionWrapper({ children }: LazyMotionWrapperProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}

// Re-export m as motion for drop-in replacement
export { m as motion }

/**
 * CSS-only animation classes for Above-the-fold content
 * These load instantly without JS
 */
export const cssAnimations = {
  fadeInUp: 'animate-fade-in-up',
  fadeIn: 'animate-fade-in',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  scaleIn: 'animate-scale-in',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
} as const

/**
 * Animation variants for motion components (below-the-fold)
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 },
}
