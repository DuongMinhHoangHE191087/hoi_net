'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface StatItem {
  value: string | number  // "90+", "33,000+", or numeric
  label: string           // "Branches", "Employees"
  suffix?: string         // "+", "%", "M"
  color?: 'blue' | 'orange' | 'green' | 'default'
}

interface GlobalStatsProps {
  title?: string
  titleHighlight?: string[]  // Words to highlight with gradient
  stats: StatItem[]
  ctaText?: string
  ctaLink?: string
  showGlobe?: boolean
  globeImage?: string
  className?: string
}

// Color mapping for stat values
const colorClasses = {
  blue: 'text-soft-blue-DEFAULT',
  orange: 'text-soft-orange-DEFAULT',
  green: 'text-soft-green-DEFAULT',
  default: 'text-gray-900',
}

/**
 * AnimatedNumber - Counter animation for numbers
 */
function AnimatedNumber({ value, suffix = '' }: { value: string | number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    // Extract numeric part from value
    const numericString = String(value).replace(/[^0-9]/g, '')
    const numericValue = parseInt(numericString, 10)
    
    if (isNaN(numericValue)) {
      setDisplayValue(String(value))
      return
    }

    // Animate from 0 to target
    let startTime: number | null = null
    const duration = 2000 // 2 seconds

    const animateNumber = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(numericValue * easeOutQuart)
      
      // Format with commas
      const formatted = currentValue.toLocaleString()
      setDisplayValue(formatted)

      if (progress < 1) {
        requestAnimationFrame(animateNumber)
      } else {
        // Set final value (may include suffix from original)
        const hasPlus = String(value).includes('+')
        setDisplayValue(numericValue.toLocaleString() + (hasPlus ? '+' : '') + suffix)
      }
    }

    requestAnimationFrame(animateNumber)
  }, [value, suffix])

  return <span ref={ref}>{displayValue}</span>
}

/**
 * GlobalStats - Statistics section with optional globe image
 * Matches Leadership Team style with animated numbers and clean layout
 */
export default function GlobalStats({
  title = 'Being There Wherever, Whenever You Need Us',
  titleHighlight = ['Wherever', 'Whenever'],
  stats,
  ctaText = 'Explore Our Global Delivery Model',
  ctaLink = '#',
  showGlobe = true,
  globeImage,
  className = '',
}: GlobalStatsProps) {
  // Split stats into left and right groups
  const leftStats = stats.slice(0, Math.ceil(stats.length / 2))
  const rightStats = stats.slice(Math.ceil(stats.length / 2))

  // Render title with highlighted words
  const renderTitle = () => {
    let processedTitle = title
    const parts: Array<{ text: string; highlight: boolean }> = []
    
    // Simple split - highlight specific words
    const words = title.split(' ')
    words.forEach((word, i) => {
      const isHighlight = titleHighlight.some(h => 
        word.toLowerCase().includes(h.toLowerCase())
      )
      parts.push({ text: word + (i < words.length - 1 ? ' ' : ''), highlight: isHighlight })
    })

    return (
      <>
        {parts.map((part, i) => (
          part.highlight ? (
            <span key={i} className="gradient-text">{part.text}</span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        ))}
      </>
    )
  }

  const renderStatItem = (stat: StatItem, index: number, side: 'left' | 'right') => (
    <motion.div
      key={index}
      className={`text-center ${side === 'left' ? 'md:text-right' : 'md:text-left'}`}
      initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className={`text-4xl md:text-5xl font-bold mb-2 ${colorClasses[stat.color || 'default']}`}>
        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
      </div>
      <div className="text-gray-600 text-sm md:text-base">
        {stat.label}
      </div>
    </motion.div>
  )

  return (
    <section className={`py-20 bg-white relative overflow-hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {renderTitle()}
        </motion.h2>

        {/* Stats with Globe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center">
          {/* Left Stats */}
          <div className="space-y-12">
            {leftStats.map((stat, index) => renderStatItem(stat, index, 'left'))}
          </div>

          {/* Globe Center */}
          {showGlobe && (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Decorative arcs */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 300 300"
                >
                  {/* Left arc */}
                  <motion.path
                    d="M 50 150 Q 50 50 150 50"
                    fill="none"
                    stroke="url(#gradLeft)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  {/* Right arc */}
                  <motion.path
                    d="M 250 150 Q 250 50 150 50"
                    fill="none"
                    stroke="url(#gradRight)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="gradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4ECB71" />
                      <stop offset="100%" stopColor="#6BCFCF" />
                    </linearGradient>
                    <linearGradient id="gradRight" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6BCFCF" />
                      <stop offset="100%" stopColor="#4ECB71" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Globe Image or Placeholder */}
                <div className="absolute inset-8 rounded-full overflow-hidden border-4 border-soft-cyan-light/30 shadow-glow-cyan">
                  {globeImage ? (
                    <img 
                      src={globeImage} 
                      alt="Global Presence" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Placeholder globe visualization
                    <div className="w-full h-full bg-gradient-to-br from-soft-blue-bg to-soft-cyan-bg flex items-center justify-center">
                      <svg className="w-full h-full text-soft-blue-light" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                        <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                        <ellipse cx="50" cy="50" rx="30" ry="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                        <ellipse cx="50" cy="50" rx="15" ry="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                        {/* Location dots */}
                        <circle cx="30" cy="35" r="2" fill="#4F8FFF" />
                        <circle cx="60" cy="40" r="2" fill="#4F8FFF" />
                        <circle cx="45" cy="55" r="2" fill="#4F8FFF" />
                        <circle cx="70" cy="50" r="2" fill="#4F8FFF" />
                        <circle cx="55" cy="65" r="2" fill="#4F8FFF" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Right Stats */}
          <div className="space-y-12">
            {rightStats.map((stat, index) => renderStatItem(stat, index, 'right'))}
          </div>
        </div>

        {/* CTA */}
        {ctaText && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 text-soft-orange-DEFAULT hover:text-soft-orange-dark font-medium transition-colors"
            >
              {ctaText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>
        )}
      </div>
    </section>
  )
}

/**
 * Demo stats for Photo Restoration App
 */
export const demoStats: StatItem[] = [
  { value: '90+', label: 'AI Models Trained', color: 'default' },
  { value: '1,100+', label: 'Happy Customers', color: 'default' },
  { value: '33,000+', label: 'Photos Restored', color: 'green' },
  { value: '30+', label: 'Countries Served', color: 'orange' },
]
