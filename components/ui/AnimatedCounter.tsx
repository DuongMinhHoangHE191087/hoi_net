'use client'

import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'

interface AnimatedCounterProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  /** true (mặc định): rút gọn "128K". false: số đầy đủ theo vi-VN, vd "128.000" */
  compact?: boolean
}

export default function AnimatedCounter({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  compact = true,
}: AnimatedCounterProps) {
  const { lang } = useLang()
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // IntersectionObserver — start animation when visible
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasStarted])

  // Animate count
  useEffect(() => {
    if (!hasStarted) return

    // Người dùng bật "giảm chuyển động": hiện luôn giá trị cuối
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(end)
      return
    }

    let startTime: number
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Ease out quart: nhanh lúc đầu, giảm tốc mượt khi gần tới đích
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(progress >= 1 ? end : Math.floor(eased * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [hasStarted, end, duration])

  const formatNumber = (n: number) => {
    if (compact && n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
    // vi-VN: 128.000 | en-US: 128,000
    return n.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN')
  }

  return (
    <span ref={ref} className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}
