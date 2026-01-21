'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export type GradientColor = 'blue' | 'orange' | 'green' | 'cyan' | 'purple' | 'pink'

interface ValueCardProps {
  icon: ReactNode | string  // SVG component or image URL
  title: string
  description?: string
  gradient?: GradientColor
  variant?: 'simple' | 'detailed'
  className?: string
  index?: number
}

// Gradient class mapping
const gradientClasses: Record<GradientColor, string> = {
  blue: 'gradient-soft-blue',
  orange: 'gradient-soft-orange',
  green: 'gradient-soft-green',
  cyan: 'gradient-soft-cyan',
  purple: 'gradient-soft-purple',
  pink: 'gradient-primary',
}

// Shadow class mapping
const shadowClasses: Record<GradientColor, string> = {
  blue: 'shadow-glow-blue',
  orange: 'shadow-glow-orange',
  green: 'shadow-glow-green',
  cyan: 'shadow-glow-cyan',
  purple: 'shadow-glow-purple',
  pink: 'shadow-glow-pink',
}

/**
 * ValueCard - Reusable component for displaying value propositions
 * Matches Leadership Team style with soft gradients and hover effects
 */
export default function ValueCard({
  icon,
  title,
  description,
  gradient = 'blue',
  variant = 'simple',
  className = '',
  index = 0,
}: ValueCardProps) {
  const isSimple = variant === 'simple'

  // Render icon - either as component or as image
  const renderIcon = () => {
    if (typeof icon === 'string') {
      // It's an image URL
      return (
        <img 
          src={icon} 
          alt={title} 
          className="w-16 h-16 object-contain"
        />
      )
    }
    // It's a React node (SVG or component)
    return icon
  }

  if (isSimple) {
    // Simple variant: Just icon and title (like reference image 2 & 3)
    return (
      <motion.div
        className={`flex flex-col items-center gap-4 p-6 cursor-pointer group ${className}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ y: -5 }}
      >
        {/* Icon Container */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <div className={`w-20 h-20 rounded-2xl ${gradientClasses[gradient]} p-4 flex items-center justify-center transition-shadow duration-300 group-hover:${shadowClasses[gradient]}`}>
            {typeof icon === 'string' ? (
              <img src={icon} alt={title} className="w-12 h-12 object-contain" />
            ) : (
              <div className="text-white w-10 h-10">
                {icon}
              </div>
            )}
          </div>
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          {title}
        </h3>
      </motion.div>
    )
  }

  // Detailed variant: With description and hover card (like reference image 1)
  return (
    <motion.div
      className={`glassmorphism-soft p-8 relative overflow-hidden group cursor-pointer ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className={`absolute inset-0 ${gradientClasses[gradient]} opacity-0`}
        whileHover={{ opacity: 0.05 }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon */}
      <motion.div 
        className="relative mb-6"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <div className={`w-16 h-16 rounded-xl ${gradientClasses[gradient]} flex items-center justify-center ${shadowClasses[gradient]}`}>
          {typeof icon === 'string' ? (
            <img src={icon} alt={title} className="w-10 h-10 object-contain" />
          ) : (
            <div className="text-white w-8 h-8">
              {icon}
            </div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 leading-relaxed relative z-10">
          {description}
        </p>
      )}

      {/* Bottom accent line */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-1 ${gradientClasses[gradient]}`}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        style={{ originX: 0 }}
      />
    </motion.div>
  )
}

/**
 * ValueCardRow - Horizontal row of value cards (simple variant)
 */
interface ValueCardRowProps {
  items: Array<{
    icon: ReactNode | string
    title: string
    gradient?: GradientColor
  }>
  className?: string
}

export function ValueCardRow({ items, className = '' }: ValueCardRowProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-8 md:gap-12 ${className}`}>
      {items.map((item, index) => (
        <ValueCard
          key={index}
          icon={item.icon}
          title={item.title}
          gradient={item.gradient || (['blue', 'orange', 'green', 'cyan', 'purple'] as GradientColor[])[index % 5]}
          variant="simple"
          index={index}
        />
      ))}
    </div>
  )
}

/**
 * ValueCardGrid - Grid of value cards (detailed variant)
 */
interface ValueCardGridProps {
  items: Array<{
    icon: ReactNode | string
    title: string
    description?: string
    gradient?: GradientColor
  }>
  columns?: 2 | 3 | 4 | 5
  className?: string
}

export function ValueCardGrid({ items, columns = 3, className = '' }: ValueCardGridProps) {
  const colClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-3 lg:grid-cols-5',
  }

  return (
    <div className={`grid grid-cols-1 ${colClasses[columns]} gap-6 ${className}`}>
      {items.map((item, index) => (
        <ValueCard
          key={index}
          icon={item.icon}
          title={item.title}
          description={item.description}
          gradient={item.gradient || (['blue', 'orange', 'green', 'cyan', 'purple'] as GradientColor[])[index % 5]}
          variant="detailed"
          index={index}
        />
      ))}
    </div>
  )
}
