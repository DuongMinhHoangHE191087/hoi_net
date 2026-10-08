'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealDirection = 'up' | 'left' | 'right' | 'scale' | 'grow'

interface RevealProps {
  children?: ReactNode
  direction?: RevealDirection
  /** Trễ (giây) — dùng để tạo hiệu ứng lần lượt giữa các thẻ */
  delay?: number
  duration?: number
  className?: string
  /** Chỉ chạy một lần khi cuộn tới (mặc định) */
  once?: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const // easeOutQuint

function getVariants(direction: RevealDirection): Variants {
  switch (direction) {
    case 'left':
      return { hidden: { opacity: 0, x: -36 }, visible: { opacity: 1, x: 0 } }
    case 'right':
      return { hidden: { opacity: 0, x: 36 }, visible: { opacity: 1, x: 0 } }
    case 'scale':
      return { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } }
    case 'grow':
      // Đường kẻ "vẽ" từ trên xuống
      return { hidden: { scaleY: 0 }, visible: { scaleY: 1 } }
    case 'up':
    default:
      return { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }
  }
}

/**
 * Hiệu ứng xuất hiện khi cuộn tới (scroll-reveal) bằng framer-motion.
 * Tự tắt chuyển động nếu người dùng bật "giảm chuyển động" trong hệ điều hành.
 */
export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className,
  once = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      style={direction === 'grow' ? { transformOrigin: 'top' } : undefined}
      variants={getVariants(direction)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '0px 0px -80px 0px', amount: 0.2 }}
      transition={{ duration: direction === 'grow' ? duration * 2 : duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
