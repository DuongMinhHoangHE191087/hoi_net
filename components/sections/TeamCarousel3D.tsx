'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play, Twitter, Linkedin, Github, Mail } from 'lucide-react'
import { TeamMember } from '@/lib/supabase'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SafeAvatar } from '@/components/ui/SafeImage'

interface TeamCarousel3DProps {
  team: TeamMember[]
  autoPlay?: boolean
  interval?: number
  variant?: 'default' | 'compact' // compact for homepage, default for about page
  showBackground?: boolean
}

export default function TeamCarousel3D({
  team,
  autoPlay = true,
  interval = 5000,
  variant = 'default',
  showBackground = true
}: TeamCarousel3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isHovering, setIsHovering] = useState(false)
  const [direction, setDirection] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Detect if user prefers reduced motion for accessibility
  const prefersReducedMotion = useReducedMotion()

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return Twitter
      case 'linkedin': return Linkedin
      case 'github': return Github
      default: return Mail
    }
  }

  const goToNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % team.length)
  }, [team.length])

  const goToPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + team.length) % team.length)
  }, [team.length])

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [currentIndex])

  // Auto-play with infinite loop
  useEffect(() => {
    if (isPlaying && team.length > 1 && !isHovering) {
      autoPlayRef.current = setInterval(goToNext, interval)
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isPlaying, team.length, interval, isHovering, goToNext])

  // Get all visible members with their positions
  const getVisibleMembers = useCallback(() => {
    if (team.length === 0) return []
    if (team.length === 1) return [{ member: team[0], position: 'center' as const }]
    if (team.length === 2) {
      return [
        { member: team[currentIndex], position: 'center' as const },
        { member: team[(currentIndex + 1) % 2], position: 'right' as const },
      ]
    }

    const prevIndex = (currentIndex - 1 + team.length) % team.length
    const nextIndex = (currentIndex + 1) % team.length

    return [
      { member: team[prevIndex], position: 'left' as const },
      { member: team[currentIndex], position: 'center' as const },
      { member: team[nextIndex], position: 'right' as const },
    ]
  }, [team, currentIndex])

  const visibleMembers = getVisibleMembers()

  if (team.length === 0) {
    return (
      <div className="glassmorphism-strong p-12 text-center rounded-2xl">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Đang cập nhật</h3>
        <p className="text-gray-600">Thông tin đội ngũ sẽ được cập nhật sớm</p>
      </div>
    )
  }

  // Responsive sizes based on variant - Enhanced with more size contrast
  const sizes = variant === 'compact' ? {
    containerHeight: 'h-[500px] sm:h-[600px] md:h-[700px]',
    centerCard: 'w-[300px] sm:w-[400px] md:w-[550px]',
    sideCard: 'w-[140px] sm:w-[180px] md:w-[250px]',
    centerImage: 'h-[360px] sm:h-[420px] md:h-[500px]',
    sideImage: 'h-[200px] sm:h-[240px] md:h-[280px]',
    titleSize: 'text-lg sm:text-xl md:text-3xl',
    roleSize: 'text-sm sm:text-base md:text-xl',
  } : {
    containerHeight: 'h-[420px] sm:h-[500px] md:h-[580px] lg:h-[640px]',
    centerCard: 'w-[300px] sm:w-[360px] md:w-[420px] lg:w-[480px]',
    sideCard: 'w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px]',
    centerImage: 'h-[340px] sm:h-[420px] md:h-[500px] lg:h-[560px]',
    sideImage: 'h-[200px] sm:h-[260px] md:h-[300px] lg:h-[340px]',
    titleSize: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
    roleSize: 'text-sm md:text-base lg:text-lg',
  }

  // ============================================
  // ULTRA SMOOTH 3D CAROUSEL ANIMATION SYSTEM
  // Based on best practices from Framer Motion
  // ============================================
  
  // Animation variants with optimized 3D transforms
  const getCardVariants = (position: 'left' | 'center' | 'right') => {
    const baseVariants = {
      left: {
        x: '-160%',
        scale: 0.65,
        zIndex: 5,
        opacity: 0.6,
        rotateY: 45,  // More dramatic 3D angle
        rotateX: 3,
        filter: 'brightness(0.7) saturate(0.9)',
      },
      center: {
        x: '0%',
        scale: 1,
        zIndex: 20,
        opacity: 1,
        rotateY: 0,
        rotateX: 0,
        filter: 'brightness(1) saturate(1)',
      },
      right: {
        x: '160%',
        scale: 0.65,
        zIndex: 5,
        opacity: 0.6,
        rotateY: -45,  // More dramatic 3D angle
        rotateX: 3,
        filter: 'brightness(0.7) saturate(0.9)',
      },
    }
    return baseVariants[position]
  }

  // ULTRA SMOOTH TWEEN TRANSITION
  // Using tween with custom cubic-bezier instead of spring
  // This provides much smoother, predictable motion
  const smoothSpringTransition = {
    type: "tween" as const,
    duration: 0.7,      // Smooth 700ms transition
    ease: [0.25, 0.1, 0.25, 1], // CSS ease equivalent - very smooth
  }


  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background - Soft gradient with animated orbs - Matching homepage theme */}
      {showBackground && (
        <div className="absolute inset-0 -mx-4 sm:-mx-6 md:-mx-8 rounded-2xl md:rounded-3xl overflow-hidden">
          {/* Pink-Yellow gradient background - matching homepage theme */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8FAB 30%, #FFC837 70%, #FFE4A0 100%)' }}
          />

          {/* Animated gradient orbs - only if user doesn't prefer reduced motion */}
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute top-0 left-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full blur-3xl"
                style={{ background: 'linear-gradient(135deg, rgba(255, 180, 208, 0.5), rgba(255, 228, 160, 0.4))' }}
                animate={{
                  x: [0, 80, 0],
                  y: [0, 50, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-[200px] h-[200px] md:w-[350px] md:h-[350px] rounded-full blur-3xl"
                style={{ background: 'linear-gradient(135deg, rgba(255, 200, 55, 0.4), rgba(255, 143, 171, 0.4))' }}
                animate={{
                  x: [0, -60, 0],
                  y: [0, -50, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 14,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] md:w-[250px] md:h-[250px] rounded-full blur-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent)' }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${variant === 'compact' ? 'py-8 sm:py-10 md:py-12' : 'py-12 sm:py-16 md:py-20'} px-4`}>
        {/* Header - only for default variant */}
        {variant === 'default' && (
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3">
              <span className="font-light tracking-wide">LEADERSHIP</span>{' '}
              <span className="text-yellow-200 drop-shadow-lg">TEAM</span>
            </h2>
            <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Chúng tôi luôn hướng tới sự chuyên nghiệp và hoàn hảo trong mọi sản phẩm.
            </p>
          </motion.div>
        )}

        {/* 3D Carousel Container - Enhanced Perspective */}
        <div
          className={`relative ${sizes.containerHeight} flex items-center justify-center`}
          style={{ 
            perspective: '2000px',  // Increased for more dramatic 3D
            perspectiveOrigin: '50% 50%',
          }}
        >
          <AnimatePresence mode="sync">
            {visibleMembers.map(({ member, position }) => {
              const isCenter = position === 'center'
              const variants = getCardVariants(position)

              return (
                <motion.div
                  key={`${member.id}-${position}`}
                  className={`absolute cursor-pointer ${
                    isCenter ? sizes.centerCard : sizes.sideCard
                  }`}
                  initial={false}
                  animate={{
                    x: variants.x,
                    scale: variants.scale,
                    rotateY: variants.rotateY,
                    rotateX: variants.rotateX,
                    opacity: variants.opacity,
                    zIndex: variants.zIndex,
                    // Box shadow animates with position
                    boxShadow: isCenter 
                      ? '0 25px 80px rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.2)'
                      : '0 15px 40px rgba(0,0,0,0.2)',
                  }}
                  transition={smoothSpringTransition}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: position === 'left' ? 'right center' : position === 'right' ? 'left center' : 'center center',
                    willChange: 'transform, opacity, box-shadow',
                    backfaceVisibility: 'hidden',
                    // Card base styles - now on motion element
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    background: isCenter
                      ? 'linear-gradient(145deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15))'
                      : 'linear-gradient(145deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08))',
                    backdropFilter: 'blur(12px)',
                    border: isCenter ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.2)',
                  }}
                  onClick={() => {
                    if (!isCenter) {
                      const targetIndex = position === 'left'
                        ? (currentIndex - 1 + team.length) % team.length
                        : (currentIndex + 1) % team.length
                      goToSlide(targetIndex)
                    }
                  }}
                  whileHover={!isCenter ? { 
                    scale: variants.scale * 1.05, 
                    opacity: 0.8,
                    transition: { duration: 0.3 }
                  } : {
                    scale: 1.02,
                    boxShadow: '0 30px 100px rgba(0,0,0,0.4), 0 15px 40px rgba(0,0,0,0.25)',
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: isCenter ? 0.98 : variants.scale * 0.95 }}
                >
                  {/* Image Container */}
                  <motion.div 
                    className={`relative overflow-hidden ${isCenter ? sizes.centerImage : sizes.sideImage}`}
                    animate={{
                      filter: isCenter ? 'brightness(1) saturate(1.1)' : 'brightness(0.85) saturate(0.9)',
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500"
                          style={{ transform: isCenter ? 'scale(1)' : 'scale(1.05)' }}
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center';
                              fallback.innerHTML = `<span class="font-bold text-white ${isCenter ? 'text-6xl md:text-8xl' : 'text-4xl md:text-6xl'}">${member.name.charAt(0)}</span>`;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <span className={`font-bold text-white ${isCenter ? 'text-6xl md:text-8xl' : 'text-4xl md:text-6xl'}`}>
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </motion.div>

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
                      <motion.h3
                        className={`font-bold text-white mb-0.5 ${sizes.titleSize}`}
                        layout
                      >
                        {member.name}
                      </motion.h3>
                      <motion.p
                        className={`text-yellow-300 font-medium ${sizes.roleSize}`}
                        layout
                      >
                        {member.role}
                      </motion.p>

                      {/* Bio - Only for center card */}
                      {isCenter && member.bio && (
                        <motion.p
                          className="text-white/80 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.3 }}
                        >
                          {member.bio}
                        </motion.p>
                      )}

                      {/* Social Links - Only for center */}
                      {isCenter && member.social_links && (
                        <motion.div
                          className="flex gap-2 mt-2 sm:mt-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25, duration: 0.3 }}
                        >
                          {Object.entries(member.social_links).map(([platform, url]) => {
                            if (!url) return null
                            const Icon = getSocialIcon(platform)
                            return (
                              <motion.a
                                key={platform}
                                href={url as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/40 rounded-lg flex items-center justify-center text-white transition-colors"
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </motion.a>
                            )
                          })}
                        </motion.div>
                      )}
                    </div>

                    {/* Slide Counter - Only for center */}
                    {isCenter && team.length > 1 && (
                      <motion.div
                        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                      >
                        <span className="text-sm font-semibold text-gray-800">
                          {currentIndex + 1} / {team.length}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying) }}
                          className="w-6 h-6 rounded-full bg-primary hover:bg-primary-dark flex items-center justify-center text-white transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3 ml-0.5" />
                          )}
                        </button>
                      </motion.div>
                    )}

                    {/* Active indicator for center */}
                    {isCenter && (
                      <motion.div
                        className="absolute top-3 right-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 400 }}
                      >
                        <div className="relative w-2.5 h-2.5 sm:w-3 sm:h-3">
                          <div className="absolute inset-0 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
                          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                        </div>
                      </motion.div>
                    )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className={`flex items-center justify-center gap-3 sm:gap-4 ${variant === 'compact' ? 'mt-4 sm:mt-6' : 'mt-6 sm:mt-8 md:mt-10'}`}>
          <motion.button
            onClick={goToPrev}
            className={`${variant === 'compact' ? 'p-2 sm:p-2.5' : 'p-2.5 sm:p-3 md:p-4'} ${showBackground ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'} backdrop-blur-sm rounded-full transition-colors`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className={`${variant === 'compact' ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 md:w-6 md:h-6'}`} />
          </motion.button>

          {/* Dots */}
          <div className="flex gap-1.5 sm:gap-2">
            {team.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="relative h-2 sm:h-2.5 rounded-full overflow-hidden"
                animate={{
                  width: idx === currentIndex ? (variant === 'compact' ? 24 : 32) : 8,
                  backgroundColor: idx === currentIndex
                    ? (showBackground ? 'rgba(255,255,255,1)' : 'rgb(249,115,22)')
                    : (showBackground ? 'rgba(255,255,255,0.4)' : 'rgba(249,115,22,0.3)'),
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                whileHover={{
                  backgroundColor: showBackground ? 'rgba(255,255,255,0.7)' : 'rgba(249,115,22,0.6)'
                }}
              />
            ))}
          </div>

          <motion.button
            onClick={goToNext}
            className={`${variant === 'compact' ? 'p-2 sm:p-2.5' : 'p-2.5 sm:p-3 md:p-4'} ${showBackground ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'} backdrop-blur-sm rounded-full transition-colors`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className={`${variant === 'compact' ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 md:w-6 md:h-6'}`} />
          </motion.button>

          {team.length > 1 && (
            <motion.button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`${variant === 'compact' ? 'p-2 sm:p-2.5' : 'p-2.5 sm:p-3 md:p-4'} ${showBackground ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'} backdrop-blur-sm rounded-full transition-colors ml-1`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying
                ? <Pause className={`${variant === 'compact' ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4 md:w-5 md:h-5'}`} />
                : <Play className={`${variant === 'compact' ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4 md:w-5 md:h-5'}`} />
              }
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

