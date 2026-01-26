'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, ArrowRight, ChevronLeft, ChevronRight, 
  Search, X, Star, Eye, Zap, Target, Heart, ImagePlus,
  Camera, Palette, Clock, Cpu, FileImage, Wand2, Shield, Award,
  TrendingUp, Globe, Rocket, Users, Code, Lock, CheckCircle, Layers
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Feature } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

// Icon mapping
const iconMap: Record<string, any> = {
  Sparkles, Zap, Star, Target, Heart, ImagePlus, Camera, Palette,
  Clock, Cpu, FileImage, Wand2, Shield, Award, TrendingUp, Globe,
  Rocket, Users, Code, Lock, CheckCircle, Layers, Eye
}

// Gradient options
const gradients = [
  'from-pink-500 to-rose-500',
  'from-orange-500 to-amber-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-violet-500',
  'from-green-500 to-emerald-500',
  'from-indigo-500 to-blue-500',
]

interface FeaturesPageClientProps {
  features: Feature[]
}

export default function FeaturesPageClient({ features }: FeaturesPageClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Get top 5 featured (or all if less than 5)
  const featuredItems = features.slice(0, 5)
  
  // Filter features based on search
  const filteredFeatures = features.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length)
  }, [featuredItems.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)
  }, [featuredItems.length])

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying || featuredItems.length <= 1) return
    
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, featuredItems.length, nextSlide])

  const getIconComponent = (iconName: string) => iconMap[iconName] || Sparkles
  const getGradient = (index: number) => gradients[index % gradients.length]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Navbar />

      {/* Hero Section with Featured Slider */}
      <section className="pt-24 pb-12 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Title */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ✨ Tính năng mạnh mẽ
            </motion.span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text-alt">Tất Cả Tính Năng</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
              Khám phá bộ công cụ toàn diện giúp bạn khôi phục, cải thiện và biến đổi ảnh của mình
            </p>
          </motion.div>

          {/* Featured Slider */}
          {featuredItems.length > 0 && (
            <motion.div 
              className="relative mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div 
                className="relative h-[400px] md:h-[450px] rounded-3xl overflow-hidden"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <AnimatePresence mode="wait">
                  {featuredItems.map((feature, index) => {
                    if (index !== currentSlide) return null
                    const IconComponent = getIconComponent(feature.icon_value)
                    const gradient = getGradient(index)
                    const hasImage = feature.icon_type === 'image' && feature.icon_value

                    return (
                      <motion.div
                        key={feature.id}
                        className="absolute inset-0"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                          {hasImage && (
                            <Image
                              src={feature.icon_value}
                              alt={feature.title}
                              fill
                              sizes="100vw"
                              className="object-cover opacity-30"
                            />
                          )}
                          {/* Pattern overlay */}
                          <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px)`,
                            backgroundSize: '30px 30px'
                          }} />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center">
                          <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                              {/* Text Content */}
                              <div className="text-white">
                                <motion.div 
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm mb-6"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <Star className="w-4 h-4" />
                                  Tính năng nổi bật #{index + 1}
                                </motion.div>
                                <motion.h2 
                                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  {feature.title}
                                </motion.h2>
                                <motion.p 
                                  className="text-white/90 text-lg md:text-xl mb-8 leading-relaxed"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  {feature.description}
                                </motion.p>
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <Link
                                    href={`/features/${feature.id}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-white/90 transition-all duration-300 group shadow-lg"
                                  >
                                    <span>Xem chi tiết</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                  </Link>
                                </motion.div>
                              </div>

                              {/* Icon/Visual */}
                              <motion.div 
                                className="hidden md:flex justify-center items-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: "spring" }}
                              >
                                <div className="w-48 h-48 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                                  {hasImage ? (
                                    <Image
                                      src={feature.icon_value}
                                      alt={feature.title}
                                      width={120}
                                      height={120}
                                      className="object-contain"
                                    />
                                  ) : (
                                    <IconComponent className="w-24 h-24 text-white" />
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Navigation Arrows */}
                {featuredItems.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
                    >
                      <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
                    >
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </>
                )}

                {/* Dots Navigation */}
                {featuredItems.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {featuredItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentSlide(index)
                          setIsAutoPlaying(false)
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? 'w-8 bg-white' 
                            : 'w-2 bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* All Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search & Filter Bar */}
          <motion.div 
            className="flex flex-col md:flex-row gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tính năng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm">
                Hiển thị <strong>{filteredFeatures.length}</strong> / {features.length} tính năng
              </span>
            </div>
          </motion.div>

          {/* Features Grid */}
          {filteredFeatures.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {filteredFeatures.map((feature, index) => {
                const IconComponent = getIconComponent(feature.icon_value)
                const gradient = getGradient(index)
                const hasImage = feature.icon_type === 'image' && feature.icon_value

                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/features/${feature.id}`}>
                      <div className="group h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                        {/* Header with gradient */}
                        <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                          {hasImage && (
                            <Image
                              src={feature.icon_value}
                              alt={feature.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                          }} />
                        </div>

                        {/* Icon Badge */}
                        <div className="relative -mt-8 ml-6">
                          <div className={`w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center border-4 border-white group-hover:scale-110 transition-transform duration-300`}>
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                              {hasImage ? (
                                <Image
                                  src={feature.icon_value}
                                  alt={feature.title}
                                  width={24}
                                  height={24}
                                  className="object-contain"
                                />
                              ) : (
                                <IconComponent className="w-5 h-5 text-white" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 pt-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {feature.description}
                          </p>
                          <div className="flex items-center text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Xem chi tiết</span>
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy tính năng
              </h3>
              <p className="text-gray-600">
                Thử tìm kiếm với từ khóa khác
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 30% 70%, white 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Sẵn sàng trải nghiệm?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Bắt đầu sử dụng các tính năng mạnh mẽ của chúng tôi ngay hôm nay
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Đăng ký miễn phí</span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300"
                >
                  <span>Liên hệ tư vấn</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

