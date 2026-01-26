'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import { Feature } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

// Icon mapping - import directly to avoid barrel file overhead
import {
  Zap, Star, Target, Eye, Heart, ImagePlus, Camera, Palette,
  Clock, Cpu, FileImage, Wand2, Shield, Award, TrendingUp, Globe,
  Rocket, Users, Code, Lock, CheckCircle, Layers
} from 'lucide-react'

// Static constants hoisted outside component
const iconMap: Record<string, React.ElementType> = {
  Sparkles, Zap, Star, Target, Heart, ImagePlus, Camera, Palette,
  Clock, Cpu, FileImage, Wand2, Shield, Award, TrendingUp, Globe,
  Rocket, Users, Code, Lock, CheckCircle, Layers, Eye
}

const gradients = [
  'from-pink-500 to-rose-500',
  'from-orange-500 to-amber-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-violet-500',
  'from-green-500 to-emerald-500',
] as const

const VISIBLE_COUNT = 3
const AUTO_PLAY_INTERVAL = 4000

// Pure functions hoisted outside component
const getIconComponent = (iconName: string): React.ElementType => iconMap[iconName] || Sparkles
const getGradient = (index: number): string => gradients[index % gradients.length]

// Fallback features when database is empty
const defaultFeatures: Feature[] = [
  {
    id: 'default-1',
    title: 'Khôi Phục Ảnh AI',
    description: 'Công nghệ AI tiên tiến giúp khôi phục ảnh cũ, phai màu, hư hỏng trở nên sống động',
    icon_type: 'lucide',
    icon_value: 'Sparkles',
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'default-2',
    title: 'Ghép Ảnh Gia Đình',
    description: 'Ghép ảnh của bạn vào các bức ảnh gia đình một cách tự nhiên và chuyên nghiệp',
    icon_type: 'lucide',
    icon_value: 'Users',
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'default-3',
    title: 'Xử Lý Nhanh Chóng',
    description: 'Nhận kết quả trong vài phút, không cần chờ đợi lâu với hệ thống xử lý tối ưu',
    icon_type: 'lucide',
    icon_value: 'Zap',
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'default-4',
    title: 'Chất Lượng Cao',
    description: 'Ảnh đầu ra chất lượng cao, sắc nét và tự nhiên như ảnh gốc',
    icon_type: 'lucide',
    icon_value: 'Award',
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Memoized Feature Card for optimal re-render performance
const FeatureCard = memo(function FeatureCard({ 
  feature, 
  gradient,
  shouldReduceMotion 
}: { 
  feature: Feature
  gradient: string
  shouldReduceMotion: boolean | null
}) {
  const IconComponent = getIconComponent(feature.icon_value)
  const hasImage = feature.icon_type === 'image' && feature.icon_value

  return (
    <Link href={`/features/${feature.id}`} className="block h-full cursor-pointer">
      <div className="group h-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
        {/* Top gradient section */}
        <div className={`h-40 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          {hasImage && (
            <Image
              src={feature.icon_value}
              alt={feature.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}
          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 70%, white 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} 
          />
          
          {/* Floating icon with hover animation */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <motion.div 
              className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white"
              whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                {hasImage ? (
                  <Image
                    src={feature.icon_value}
                    alt=""
                    width={28}
                    height={28}
                    className="object-contain"
                    loading="lazy"
                  />
                ) : (
                  <IconComponent className="w-6 h-6 text-white" aria-hidden="true" />
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-14 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-1">
            {feature.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
            {feature.description}
          </p>
          
          {/* Learn more */}
          <div className="inline-flex items-center gap-1 text-primary font-medium text-sm opacity-80 group-hover:opacity-100 transition-opacity">
            <span>Tìm hiểu thêm</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Link>
  )
})

interface FeaturesCarouselProps {
  features: Feature[]
  title?: string
  subtitle?: string
}

export default function FeaturesCarousel({ 
  features, 
  title = 'Tính Năng Nổi Bật',
  subtitle = 'Khám phá những công cụ mạnh mẽ giúp bạn khôi phục và cải thiện ảnh'
}: FeaturesCarouselProps) {
  // Respect user's motion preferences
  const shouldReduceMotion = useReducedMotion()
  
  // Stable reference for display features
  const displayFeatures = useMemo(
    () => (features?.length ? features : defaultFeatures),
    [features]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState(0)

  // Memoized calculations
  const maxIndex = useMemo(
    () => Math.max(0, displayFeatures.length - VISIBLE_COUNT),
    [displayFeatures.length]
  )

  const nextSlide = useCallback(() => {
    setDirection(1)
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  const pauseAutoPlay = useCallback(() => setIsAutoPlaying(false), [])
  const resumeAutoPlay = useCallback(() => setIsAutoPlaying(true), [])

  // Auto-play with cleanup
  useEffect(() => {
    if (!isAutoPlaying || displayFeatures.length <= VISIBLE_COUNT) return
    
    const interval = setInterval(nextSlide, AUTO_PLAY_INTERVAL)
    return () => clearInterval(interval)
  }, [isAutoPlaying, displayFeatures.length, nextSlide])

  // Clamp index when features change
  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex))
  }, [maxIndex])

  // Memoized visible features with stable calculation
  const visibleFeatures = useMemo(() => {
    const slice = displayFeatures.slice(currentIndex, currentIndex + VISIBLE_COUNT)
    if (slice.length < VISIBLE_COUNT && displayFeatures.length >= VISIBLE_COUNT) {
      return slice.concat(displayFeatures.slice(0, VISIBLE_COUNT - slice.length))
    }
    return slice
  }, [displayFeatures, currentIndex])

  // Pre-compute gradients for visible features
  const visibleGradients = useMemo(
    () => visibleFeatures.map((_, idx) => getGradient(currentIndex + idx)),
    [visibleFeatures, currentIndex]
  )

  // Animation variants based on motion preference
  const cardVariants = useMemo(() => ({
    enter: (dir: number) => ({
      opacity: shouldReduceMotion ? 1 : 0,
      x: shouldReduceMotion ? 0 : (dir > 0 ? 80 : -80)
    }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({
      opacity: shouldReduceMotion ? 1 : 0,
      x: shouldReduceMotion ? 0 : (dir > 0 ? -80 : 80)
    })
  }), [shouldReduceMotion])

  const showNavigation = displayFeatures.length > VISIBLE_COUNT

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with entrance animation */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, ease: "easeOut" }}
        >
          <motion.span 
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            ✨ Khám phá ngay
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text-alt">{title}</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={pauseAutoPlay}
          onMouseLeave={resumeAutoPlay}
        >
          {/* Navigation Arrows */}
          {showNavigation && (
            <>
              <button
                onClick={prevSlide}
                className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-primary hover:shadow-xl transition-all duration-200 cursor-pointer"
                aria-label="Slide trước"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-primary hover:shadow-xl transition-all duration-200 cursor-pointer"
                aria-label="Slide tiếp theo"
              >
                <ChevronRight className="w-6 h-6" aria-hidden="true" />
              </button>
            </>
          )}

          {/* Cards Grid */}
          <div className="overflow-hidden px-2">
            <div className="flex gap-6">
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                {visibleFeatures.map((feature, idx) => (
                  <motion.div
                    key={feature.id}
                    className="flex-1 min-w-0"
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ 
                      duration: shouldReduceMotion ? 0.1 : 0.3, 
                      ease: [0.4, 0, 0.2, 1] 
                    }}
                  >
                    <FeatureCard 
                      feature={feature} 
                      gradient={visibleGradients[idx]}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Dots indicator */}
          {showNavigation && (
            <div className="flex justify-center gap-2 mt-8" role="tablist" aria-label="Carousel navigation">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  role="tab"
                  aria-selected={idx === currentIndex}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1)
                    setCurrentIndex(idx)
                    pauseAutoPlay()
                  }}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === currentIndex 
                      ? 'w-8 bg-primary' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Đi đến slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View all button with entrance animation */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: shouldReduceMotion ? 0.1 : 0.4 }}
        >
          <Link
            href="/features"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-primary hover:text-primary hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <span>Xem tất cả tính năng</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

