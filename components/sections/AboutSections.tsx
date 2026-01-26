'use client'

import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Target, Eye, Heart, Sparkles } from 'lucide-react'
import { AboutSection } from '@/lib/supabase'

interface AboutSectionsProps {
  sections: AboutSection[]
}

// Animated counter hook with smoother animation
function useCounter(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!start || hasStarted) return
    setHasStarted(true)

    let startTime: number | null = null
    let animationId: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      // Smooth easeOutExpo for more natural feel
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(end * easeOutExpo))

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [end, duration, start, hasStarted])

  return count
}

// Individual Stat Card Component
function StatCard({ value, suffix, label, index, inView }: {
  value: number
  suffix: string
  label: string
  index: number
  inView: boolean
}) {
  const count = useCounter(value, 2000, inView)

  return (
    <motion.div
      className="relative p-4 sm:p-5 md:p-6 lg:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 text-center group"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        delay: 0.4 + index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{
        y: -8,
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
        transition: { duration: 0.3 }
      }}
    >
      <motion.div
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2"
        initial={{ scale: 0.5 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 300 }}
      >
        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
          {count}{suffix}
        </span>
      </motion.div>
      <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">
        {label}
      </div>
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-bl-2xl sm:rounded-bl-3xl rounded-tr-xl sm:rounded-tr-2xl" />
    </motion.div>
  )
}

// Stats Counter Component
function StatsCounter({ inView }: { inView: boolean }) {
  const stats = [
    { value: 1000, suffix: '+', label: 'Khách hàng' },
    { value: 50, suffix: 'K+', label: 'Ảnh đã khôi phục' },
    { value: 99, suffix: '%', label: 'Hài lòng' },
    { value: 24, suffix: '/7', label: 'Hỗ trợ' },
  ]

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mt-10 sm:mt-12 md:mt-16"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          value={stat.value}
          suffix={stat.suffix}
          label={stat.label}
          index={index}
          inView={inView}
        />
      ))}
    </motion.div>
  )
}

// Icons for sections
const getSectionIcon = (index: number) => {
  const icons = [Target, Eye, Heart, Sparkles]
  return icons[index % icons.length]
}

export default function AboutSections({ sections }: AboutSectionsProps) {
  if (!sections || sections.length === 0) return null

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {sections.map((section, index) => {
          const isImageLeft = section.image_position === 'left'
          const Icon = getSectionIcon(index)

          return (
            <SectionItem
              key={section.id}
              section={section}
              index={index}
              isImageLeft={isImageLeft}
              Icon={Icon}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
            />
          )
        })}
      </div>
    </section>
  )
}

interface SectionItemProps {
  section: AboutSection
  index: number
  isImageLeft: boolean
  Icon: React.ComponentType<{ className?: string }>
  isFirst: boolean
  isLast: boolean
}

function SectionItem({ section, index, isImageLeft, Icon, isFirst, isLast }: SectionItemProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  // Unique accent color for each section
  const accentColors = [
    { primary: 'from-amber-400 to-orange-500', bg: 'bg-gradient-to-br from-amber-400 to-orange-500', text: 'text-orange-500' },
    { primary: 'from-blue-400 to-indigo-500', bg: 'bg-gradient-to-br from-blue-400 to-indigo-500', text: 'text-indigo-500' },
    { primary: 'from-rose-400 to-pink-500', bg: 'bg-gradient-to-br from-rose-400 to-pink-500', text: 'text-pink-500' },
    { primary: 'from-emerald-400 to-teal-500', bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', text: 'text-teal-500' },
  ]
  const accent = accentColors[index % accentColors.length]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      }
    }
  }

  return (
    <div
      ref={sectionRef}
      className="relative mb-16 sm:mb-20 md:mb-28 lg:mb-32 last:mb-0"
    >
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Content Column */}
        <motion.div
          className={`${isImageLeft ? 'lg:order-2' : 'lg:order-1'} relative z-10`}
          variants={itemVariants}
        >
          {/* Title with accent */}
          <motion.div className="mb-4 sm:mb-5 md:mb-6" variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              <span className="text-gray-400 font-light block sm:inline text-lg sm:text-2xl md:text-3xl lg:text-4xl">
                ABOUT
              </span>{' '}
              <span className={`bg-gradient-to-r ${accent.primary} bg-clip-text text-transparent`}>
                {section.title.toUpperCase()}
              </span>
            </h2>

            {section.subtitle && (
              <motion.p
                className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-500 font-medium italic"
                variants={itemVariants}
              >
                "{section.subtitle}"
              </motion.p>
            )}
          </motion.div>

          {/* Description */}
          <motion.div className="space-y-3 sm:space-y-4" variants={itemVariants}>
            <div className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line prose prose-sm sm:prose md:prose-lg max-w-none">
              {section.description.split('\n\n').map((paragraph, idx) => {
                // Check if paragraph starts with **text** (bold)
                if (paragraph.trim().startsWith('**')) {
                  const parts = paragraph.split('**')
                  return (
                    <p key={idx} className="mb-3">
                      {parts.map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part
                      )}
                    </p>
                  )
                }
                // Check if paragraph starts with • (bullet points)
                if (paragraph.trim().startsWith('•')) {
                  return (
                    <ul key={idx} className="list-none space-y-2 ml-0">
                      {paragraph.split('\n').filter(line => line.trim()).map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent.bg}`} />
                          <span>{line.replace('•', '').trim()}</span>
                        </li>
                      ))}
                    </ul>
                  )
                }
                return <p key={idx} className="mb-3">{paragraph}</p>
              })}
            </div>
          </motion.div>

          {/* Decorative line with icon */}
          <motion.div
            className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4"
            variants={itemVariants}
          >
            <motion.div
              className={`h-1 w-12 sm:w-16 ${accent.bg} rounded-full`}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              style={{ originX: 0 }}
            />
            <motion.div
              className={`w-9 h-9 sm:w-10 sm:h-10 ${accent.bg} rounded-lg sm:rounded-xl flex items-center justify-center`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
          </motion.div>

          {/* Stats - only for first section */}
          {isFirst && <StatsCounter inView={isInView} />}
        </motion.div>

        {/* Image Column with Decorative Elements */}
        {section.image_url && (
          <motion.div
            className={`relative ${isImageLeft ? 'lg:order-1' : 'lg:order-2'}`}
            variants={itemVariants}
          >
            {/* Large Decorative Circle - Hidden on mobile, visible on tablet+ */}
            <motion.div
              className={`hidden sm:block absolute ${
                isImageLeft ? '-left-6 md:-left-10 lg:-left-16' : '-right-6 md:-right-10 lg:-right-16'
              } top-1/2 -translate-y-1/2 w-[200px] sm:w-[280px] md:w-[350px] lg:w-[420px] aspect-square pointer-events-none`}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 0.85 } : {}}
              transition={{
                delay: 0.2,
                duration: 0.8,
                type: "spring",
                stiffness: 80,
                damping: 15,
              }}
            >
              <div className={`w-full h-full rounded-full ${accent.bg} opacity-90`} />
            </motion.div>

            {/* Main Image Container */}
            <motion.div
              className="relative z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Primary Image */}
              <motion.div
                className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl sm:shadow-2xl"
                initial={{ y: 40, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              >
                <img
                  src={section.image_url}
                  alt={section.title}
                  className="w-full h-[220px] sm:h-[280px] md:h-[350px] lg:h-[420px] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png'
                  }}
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </motion.div>

              {/* Secondary floating image - Hidden on mobile */}
              <motion.div
                className={`hidden sm:block absolute ${
                  isImageLeft ? '-right-3 md:-right-6 lg:-right-8' : '-left-3 md:-left-6 lg:-left-8'
                } -bottom-4 sm:-bottom-6 md:-bottom-8 lg:-bottom-10 w-[100px] sm:w-[140px] md:w-[180px] lg:w-[220px] z-20`}
                initial={{ y: 60, opacity: 0, rotate: -8 }}
                animate={isInView ? { y: 0, opacity: 1, rotate: 3 } : {}}
                transition={{ delay: 0.5, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ rotate: 0, scale: 1.05 }}
              >
                <div className="rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl border-2 sm:border-4 border-white bg-white">
                  <img
                    src={section.image_url}
                    alt={section.title}
                    className="w-full h-[70px] sm:h-[100px] md:h-[130px] lg:h-[150px] object-cover"
                  />
                </div>
              </motion.div>

              {/* Badge with icon */}
              <motion.div
                className={`absolute ${
                  isImageLeft ? 'left-3 sm:left-4 md:left-6' : 'right-3 sm:right-4 md:right-6'
                } top-3 sm:top-4 md:top-6 z-20`}
                initial={{ scale: 0, rotate: -180 }}
                animate={isInView ? { scale: 1, rotate: 0 } : {}}
                transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
                whileHover={{ scale: 1.15 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${accent.text}`} />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Full width content if no image */}
        {!section.image_url && (
          <motion.div
            className="lg:col-span-2 text-center max-w-3xl mx-auto"
            variants={itemVariants}
          >
            <motion.div
              className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 ${accent.bg} rounded-xl sm:rounded-2xl flex items-center justify-center`}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Section divider */}
      {!isLast && (
        <motion.div
          className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              className="h-px w-12 sm:w-16 md:w-24 bg-gradient-to-r from-transparent to-gray-300"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{ originX: 0 }}
            />
            <motion.div
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${accent.bg}`}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
            />
            <motion.div
              className="h-px w-12 sm:w-16 md:w-24 bg-gradient-to-l from-transparent to-gray-300"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{ originX: 1 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

