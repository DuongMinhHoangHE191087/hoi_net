'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Sparkles, ImagePlus, Users, Zap, Star, Target, Eye, Heart, ArrowRight, Rocket, Globe, Shield, Award, TrendingUp, Camera, Palette, Smile, Clock, Cpu, Database, FileImage, Film, Filter, Fingerprint, Flame, Grid, Hash, HelpCircle, Home, Inbox, Lightbulb, Link as LinkIcon, Mail, Map, MessageCircle, Music, Package, Phone, PieChart, RefreshCw, Search, Send, Settings, Share2, ShoppingCart, Sliders, Sun, Tag, Truck, Video, Wand2, Wifi, Wind, Wrench, Code, Lock, CheckCircle, Layers, Loader2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { TeamMember, ValueSection, Feature, Feedback } from '@/lib/supabase'
import { demoStats } from '@/components/sections/GlobalStats'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/ui/BrandLogo'

// Dynamic imports cho heavy components (below-the-fold)
const TeamCarousel3D = dynamic(() => import('@/components/sections/TeamCarousel3D'), {
  loading: () => (
    <div className="h-96 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Đang tải team...</p>
    </div>
  ),
  ssr: false,
})

const GlobalStats = dynamic(() => import('@/components/sections/GlobalStats'), {
  loading: () => (
    <div className="h-64 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Đang tải thống kê...</p>
    </div>
  ),
})

const FeaturesCarousel = dynamic(() => import('@/components/sections/FeaturesCarousel'), {
  loading: () => (
    <div className="h-96 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Đang tải tính năng...</p>
    </div>
  ),
  ssr: false,
})

interface LandingPageClientProps {
  team: TeamMember[]
  valueSections: ValueSection[]
  features: Feature[]
  testimonials: Feedback[]
  siteSettings: Record<string, string>
}

export default function LandingPageClient({ team, valueSections, features, testimonials: dbTestimonials, siteSettings }: LandingPageClientProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Helper function to get setting with fallback
  const getSetting = (key: string, fallback: string = '') => siteSettings[key] || fallback

  const brandLogoUrl = getSetting('site_logo_url', getSetting('brand_logo_url', getSetting('site_favicon_url', '')))

  // ✅ Fix hydration mismatch - only render particles on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // ✅ Generate consistent particle positions based on index
  const getParticleStyle = (index: number) => {
    const positions = [
      { left: 21, top: 2 },
      { left: 61, top: 56 },
      { left: 31, top: 92 },
      { left: 75, top: 15 },
      { left: 10, top: 45 },
      { left: 85, top: 70 },
      { left: 45, top: 25 },
      { left: 55, top: 80 },
      { left: 15, top: 60 },
      { left: 90, top: 35 },
      { left: 25, top: 75 },
      { left: 70, top: 10 },
      { left: 40, top: 50 },
      { left: 80, top: 65 },
      { left: 5, top: 30 },
      { left: 65, top: 85 },
      { left: 35, top: 40 },
      { left: 50, top: 20 },
      { left: 20, top: 90 },
      { left: 95, top: 55 },
    ]
    const pos = positions[index % positions.length]
    return {
      left: `${pos.left}%`,
      top: `${pos.top}%`,
      '--duration': `${3 + (index % 3)}s`,
      '--delay': `${(index % 2)}s`,
    } as React.CSSProperties
  }

  // Map icon string to icon component
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Target, Eye, Heart, Sparkles, ImagePlus, Users, Zap, Star, Rocket,
      Globe, Shield, Award, TrendingUp, Camera, Palette, Smile, Clock,
      Cpu, Database, FileImage, Film, Filter, Fingerprint, Flame, Grid,
      Hash, HelpCircle, Home, Inbox, Lightbulb, Link: LinkIcon, Mail, Map,
      MessageCircle, Music, Package, Phone, PieChart, RefreshCw, Search,
      Send, Settings, Share2, ShoppingCart, Sliders, Sun, Tag, Truck,
      Video, Wand2, Wifi, Wind, Wrench, Code, Lock, CheckCircle, Layers
    }
    return icons[iconName] || Sparkles
  }

  // Gradients for features (expanded to support many features)
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-yellow-500 to-orange-500',
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-indigo-500 to-purple-500',
    'from-red-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-teal-500 to-green-500',
    'from-orange-500 to-red-500',
    'from-violet-500 to-purple-500',
    'from-lime-500 to-green-500',
    'from-fuchsia-500 to-pink-500',
    'from-sky-500 to-blue-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500'
  ]

  // Fallback features if database is empty
  const defaultFeatures = [
    {
      icon: Sparkles,
      iconUrl: null,
      title: 'Khôi Phục Ảnh Bằng AI',
      description: 'Sử dụng công nghệ AI tiên tiến để khôi phục ảnh cũ, phai màu, hư hỏng.',
      gradient: 'from-pink-500 to-rose-500',
      iconType: 'lucide' as const
    },
    {
      icon: ImagePlus,
      iconUrl: null,
      title: 'Ghép Ảnh Gia Đình',
      description: 'Ghép ảnh của bạn vào các bức ảnh gia đình một cách tự nhiên.',
      gradient: 'from-yellow-500 to-orange-500',
      iconType: 'lucide' as const
    },
    {
      icon: Users,
      iconUrl: null,
      title: 'Dễ Dàng Sử Dụng',
      description: 'Chỉ cần tải ảnh lên, AI sẽ làm phần còn lại cho bạn.',
      gradient: 'from-purple-500 to-pink-500',
      iconType: 'lucide' as const
    },
    {
      icon: Zap,
      iconUrl: null,
      title: 'Xử Lý Nhanh Chóng',
      description: 'Nhận kết quả trong vài phút, không cần chờ đợi lâu.',
      gradient: 'from-blue-500 to-cyan-500',
      iconType: 'lucide' as const
    }
  ]

  // Map database features to display format
  const displayFeatures = features.length > 0
    ? features.map((feature, index) => ({
        icon: feature.icon_type === 'lucide' ? getIconComponent(feature.icon_value) : null,
        iconUrl: feature.icon_type === 'image' ? feature.icon_value : null,
        iconType: feature.icon_type,
        title: feature.title,
        description: feature.description,
        gradient: gradients[index % gradients.length]
      }))
    : defaultFeatures

  const defaultTestimonials = [
    {
      name: 'Nguyễn Thị Mai',
      role: 'Khách hàng',
      content: 'Ứng dụng tuyệt vời! Đã giúp tôi khôi phục những bức ảnh gia đình quý giá.',
      rating: 5,
      avatar: '👩'
    },
    {
      name: 'Trần Văn Hùng',
      role: 'Khách hàng',
      content: 'Chất lượng ảnh sau khi phục hồi rất tốt, vượt quá mong đợi của tôi.',
      rating: 5,
      avatar: '👨'
    },
    {
      name: 'Lê Thị Hoa',
      role: 'Khách hàng',
      content: 'Dễ sử dụng và kết quả nhanh chóng. Rất hài lòng với dịch vụ!',
      rating: 5,
      avatar: '👩‍💼'
    }
  ]

  // Map database feedback to testimonials format or use defaults
  const testimonials = dbTestimonials.length > 0
    ? dbTestimonials.slice(0, 3).map((item) => ({
        name: item.name || 'Khách hàng',
        role: item.position_title || (item.company_name ? `${item.company_name}` : 'Khách hàng'),
        content: item.message,
        rating: item.rating || 5,
        avatar: item.testimonial_image_url || (item.name ? item.name.charAt(0).toUpperCase() : '👤')
      }))
    : defaultTestimonials

  // Default value sections (Mission, Vision, Values)
  const defaultValueSections = [
    {
      id: 'default-1',
      title: 'Sứ Mệnh',
      description: 'Mang lại giá trị cho khách hàng thông qua công nghệ AI tiên tiến, giúp khôi phục và lưu giữ những kỷ niệm quý giá của mọi gia đình.',
      icon: 'Target',
      gradient: 'from-pink-500 via-rose-500 to-red-500'
    },
    {
      id: 'default-2',
      title: 'Tầm Nhìn',
      description: 'Trở thành nền tảng hàng đầu về khôi phục ảnh AI tại Việt Nam, mang đến trải nghiệm tốt nhất cho người dùng.',
      icon: 'Eye',
      gradient: 'from-yellow-500 via-orange-500 to-amber-500'
    },
    {
      id: 'default-3',
      title: 'Giá Trị Cốt Lõi',
      description: 'Chất lượng, Sáng tạo, Tận tâm - Ba giá trị cốt lõi định hướng mọi hoạt động của chúng tôi.',
      icon: 'Heart',
      gradient: 'from-purple-500 via-pink-500 to-rose-500'
    }
  ]

  // Use database value sections or defaults
  const displayValueSections = valueSections.length > 0 ? valueSections : defaultValueSections

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  }

  // CTA Button with loading state
  const router = useRouter()
  const [loadingButton, setLoadingButton] = useState<string | null>(null)

  const handleCTAClick = (buttonId: string, href: string) => {
    setLoadingButton(buttonId)
    // Navigate after showing loading
    setTimeout(() => {
      router.push(href)
    }, 100)
  }

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      {/* ✅ Pure CSS Animated background particles - NO Framer Motion */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.5;
          }
        }
        .particle {
          animation: float var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          will-change: transform, opacity;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .fade-in-delay-1 {
          animation: fadeIn 0.6s ease-out 0.1s forwards;
          opacity: 0;
        }
        .fade-in-delay-2 {
          animation: fadeIn 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }
        .fade-in-delay-3 {
          animation: fadeIn 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
          transform: scale(0);
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isMounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 bg-gradient-primary rounded-full opacity-20"
            style={getParticleStyle(i)}
          />
        ))}
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto text-center">
          <div className="scale-in mb-6 inline-block">
            <div className="p-4 bg-gradient-primary rounded-3xl shadow-glow animate-glow">
              <BrandLogo src={brandLogoUrl} className="w-12 h-12 object-contain" priority />
            </div>
          </div>

          <h1 className="fade-in text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text-alt">{getSetting('hero_title', 'Khôi Phục Ảnh Cũ')}</span>
            <br />
            <span className="text-text">Bằng Công Nghệ AI</span>
          </h1>

          <p className="fade-in-delay-1 text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            {getSetting('hero_subtitle', 'Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động. Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp.')}
          </p>

          <div className="fade-in-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleCTAClick('hero-primary', getSetting('hero_cta_primary_link', '/register'))}
              disabled={loadingButton === 'hero-primary'}
              className="btn-glass-primary text-xl px-10 py-5 transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:opacity-70"
            >
              <span className="flex items-center gap-2">
                {loadingButton === 'hero-primary' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Đang chuyển...
                  </>
                ) : (
                  <>
                    {getSetting('hero_cta_primary_text', 'Bắt Đầu Ngay')}
                    <Sparkles className="w-6 h-6" />
                  </>
                )}
              </span>
            </button>
            <button 
              onClick={() => handleCTAClick('hero-secondary', getSetting('hero_cta_secondary_link', '/about'))}
              disabled={loadingButton === 'hero-secondary'}
              className="btn-glass-secondary text-xl px-10 py-5 transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:opacity-70"
            >
              <span className="flex items-center gap-2">
                {loadingButton === 'hero-secondary' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Đang chuyển...
                  </>
                ) : (
                  <>
                    {getSetting('hero_cta_secondary_text', 'Tìm Hiểu Thêm')}
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Section - Enhanced */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text-alt">{getSetting('about_section_title', 'Về Chúng Tôi')}</span>
            </h2>
            <p className="text-gray-600 text-lg">
              {getSetting('about_section_subtitle', 'Sứ mệnh và tầm nhìn của chúng tôi')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {displayValueSections.map((item, index) => {
              const Icon = getIconComponent(item.icon)
              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="glassmorphism-strong p-10 relative overflow-hidden group cursor-pointer"
                  whileHover={{ y: -12, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0`}
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <div className="relative mb-6">
                    <motion.div
                      className={`w-20 h-20 mx-auto bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-glow`}
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-text mb-4 text-center relative z-10">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 text-center leading-relaxed relative z-10">
                    {item.description}
                  </p>

                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ originX: 0 }}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Carousel */}
      <FeaturesCarousel 
        features={features}
        title={getSetting('features_section_title', 'Tính Năng Nổi Bật')}
        subtitle={getSetting('features_section_subtitle', 'Khám phá những công cụ mạnh mẽ giúp bạn khôi phục và cải thiện ảnh')}
      />

      {/* Global Stats Section */}
      <GlobalStats
        title="Luôn Bên Bạn Mọi Lúc, Mọi Nơi"
        titleHighlight={['Mọi Lúc', 'Mọi Nơi']}
        stats={[
          { value: '7+', label: 'Mô Hình AI', color: 'default' },
          { value: '1,000+', label: 'Khách Hàng Hài Lòng', color: 'default' },
          { value: '50,000+', label: 'Ảnh Đã Khôi Phục', color: 'orange' },
          { value: '30+', label: 'Quốc Gia', color: 'default' },
        ]}
        ctaText="Khám Phá Dịch Vụ Của Chúng Tôi"
        ctaLink="/about"
        showGlobe={true}
      />

      {/* Team Section - Using shared TeamCarousel3D component */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text-alt">{getSetting('team_section_title', 'Đội Ngũ Của Chúng Tôi')}</span>
            </h2>
            <p className="text-gray-600 text-lg">
              {getSetting('team_section_subtitle', 'Những người đồng hành cùng bạn')}
            </p>
          </motion.div>

          <TeamCarousel3D
            team={team}
            variant="compact"
            showBackground={false}
            autoPlay={true}
            interval={4000}
          />
        </div>
      </section>

      {/* Testimonials Section - Enhanced */}
      <section id="testimonials" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text-alt">{getSetting('testimonials_section_title', 'Khách Hàng Nói Gì')}</span>
            </h2>
            <p className="text-gray-600 text-lg">
              {getSetting('testimonials_section_subtitle', 'Phản hồi từ những người đã sử dụng dịch vụ')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glassmorphism-strong p-8 relative overflow-hidden group cursor-pointer"
                whileHover={{ y: -12, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className="text-6xl mb-4 text-center relative z-10"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {testimonial.avatar}
                </motion.div>

                <div className="flex gap-1 mb-4 justify-center relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i, type: "spring", stiffness: 400 }}
                    >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-gray-700 mb-6 text-center italic leading-relaxed relative z-10">
                  "{testimonial.content}"
                </p>

                <div className="text-center relative z-10">
                  <p className="font-bold text-text text-lg">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>

                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-bl-full" />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mt-10"
          >
            <button
              onClick={() => handleCTAClick('testimonial-cta', '/contact')}
              disabled={loadingButton === 'testimonial-cta'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-primary/20 text-primary font-semibold rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-lg hover:shadow-xl group disabled:opacity-70"
            >
              {loadingButton === 'testimonial-cta' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang chuyển...</span>
                </>
              ) : (
                <>
                  <span>Gửi phản hồi của bạn</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="glassmorphism-strong p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 animate-shimmer"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text-alt">{getSetting('final_cta_title', 'Sẵn Sàng Khôi Phục Ảnh?')}</span>
              </h2>

              <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
                {getSetting('final_cta_subtitle', 'Tham gia cùng hàng ngàn người dùng đã tin tưởng chúng tôi để lưu giữ kỷ niệm quý giá.')}
              </p>

              <button 
                onClick={() => handleCTAClick('final-cta', getSetting('final_cta_button_link', '/register'))}
                disabled={loadingButton === 'final-cta'}
                className="btn-glass-primary text-xl px-12 py-6 transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:opacity-70"
              >
                <span className="flex items-center gap-3">
                  {loadingButton === 'final-cta' ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Đang chuyển...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      {getSetting('final_cta_button_text', 'Đăng Ký Miễn Phí Ngay')}
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

