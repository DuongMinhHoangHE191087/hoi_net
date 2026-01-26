'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
 * ValueCardRow - Compact horizontal row with click-to-expand animation
 */
interface ValueCardRowProps {
  items: Array<{
    icon: ReactNode | string
    title: string
    description?: string
    gradient?: GradientColor
  }>
  className?: string
}

// Mapping for expanded card backgrounds
const expandedBgClasses: Record<GradientColor, string> = {
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
  green: 'bg-gradient-to-br from-green-500 to-green-600',
  cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  pink: 'bg-gradient-to-br from-pink-500 to-rose-600',
}

export function ValueCardRow({ items, className = '' }: ValueCardRowProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleItemClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className={`${className}`}>
      {/* Compact Pills Row */}
      <motion.div 
        className="flex flex-wrap justify-center gap-3 md:gap-4"
        layout
      >
        {items.map((item, index) => {
          const gradient = item.gradient || (['blue', 'orange', 'green', 'cyan', 'purple'] as GradientColor[])[index % 5]
          const isExpanded = expandedIndex === index
          
          return (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4, type: 'spring' }}
              layout
            >
              {/* Pill Button */}
              <motion.button
                onClick={() => handleItemClick(index)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-full
                  ${gradientClasses[gradient]} text-white font-medium
                  shadow-md hover:shadow-xl transition-all duration-300
                  ${isExpanded ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : ''}
                `}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                layout
              >
                {/* Icon */}
                <motion.div 
                  className="w-5 h-5 flex-shrink-0"
                  animate={{ rotate: isExpanded ? 360 : 0 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.title} className="w-full h-full object-contain" />
                  ) : (
                    item.icon
                  )}
                </motion.div>
                {/* Title */}
                <span className="text-sm whitespace-nowrap">{item.title}</span>
                {/* Expand indicator */}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-1"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Expanded Detail Card */}
      <AnimatePresence mode="wait">
        {expandedIndex !== null && (
          <motion.div
            key={expandedIndex}
            className="mt-6 overflow-hidden"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {(() => {
              const item = items[expandedIndex]
              const gradient = item.gradient || (['blue', 'orange', 'green', 'cyan', 'purple'] as GradientColor[])[expandedIndex % 5]
              
              return (
                <motion.div
                  className="max-w-2xl mx-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <div className={`
                    relative p-6 rounded-2xl overflow-hidden
                    ${expandedBgClasses[gradient]}
                    text-white shadow-2xl
                  `}>
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                          radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                      }} />
                    </div>

                    <div className="relative flex items-start gap-4">
                      {/* Large Icon */}
                      <motion.div 
                        className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
                        initial={{ rotate: -10, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      >
                        <div className="w-7 h-7 text-white">
                          {typeof item.icon === 'string' ? (
                            <img src={item.icon} alt={item.title} className="w-full h-full object-contain" />
                          ) : (
                            item.icon
                          )}
                        </div>
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <motion.h4 
                          className="text-lg font-bold mb-1"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          {item.title}
                        </motion.h4>
                        {item.description && (
                          <motion.p 
                            className="text-white/90 text-sm leading-relaxed"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                          >
                            {item.description}
                          </motion.p>
                        )}
                      </div>

                      {/* Close button */}
                      <motion.button
                        onClick={() => setExpandedIndex(null)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronUp className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Decorative elements */}
                    <motion.div 
                      className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
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

