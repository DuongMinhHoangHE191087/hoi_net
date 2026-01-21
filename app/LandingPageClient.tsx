'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Sparkles, ImagePlus, Users, Zap, Star, Target, Eye, Heart, ArrowRight, Rocket, Globe, Shield, Award, TrendingUp, Camera, Palette, Smile, Clock, Cpu, Database, FileImage, Film, Filter, Fingerprint, Flame, Grid, Hash, HelpCircle, Home, Inbox, Lightbulb, Link as LinkIcon, Mail, Map, MessageCircle, Music, Package, Phone, PieChart, RefreshCw, Search, Send, Settings, Share2, ShoppingCart, Sliders, Sun, Tag, Truck, Video, Wand2, Wifi, Wind, Wrench, Code, Lock, CheckCircle, Layers } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ValueCardRow } from '@/components/ui/ValueCard'
import { TeamMember, ValueSection, Feature, Feedback } from '@/lib/supabase'
import { demoStats } from '@/components/sections/GlobalStats'
import Image from 'next/image'

// Dynamic imports cho heavy components (below-the-fold)
const TeamCarousel3D = dynamic(() => import('@/components/sections/TeamCarousel3D'), {
  loading: () => (
    <div className="h-96 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Đang tải team...</p>
    </div>
  ),
  ssr: false, // Disable SSR vì component có client-side logic và animations
})

const GlobalStats = dynamic(() => import('@/components/sections/GlobalStats'), {
  loading: () => (
    <div className="h-64 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Đang tải thống kê...</p>
    </div>
  ),
})

interface LandingPageClientProps {
  team: TeamMember[]
  valueSections: ValueSection[]
  features: Feature[]
  testimonials: Feedback[]
}

export default function LandingPageClient({ team, valueSections, features, testimonials: dbTestimonials }: LandingPageClientProps) {
  const [isMounted, setIsMounted] = useState(false)

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
      title: 'Khôi Phục Ảnh Bằng AI',
      description: 'Sử dụng công nghệ AI tiên tiến để khôi phục ảnh cũ, phai màu, hư hỏng.',
      gradient: 'from-pink-500 to-rose-500',
      iconType: 'lucide' as const
    },
    {
      icon: ImagePlus,
      title: 'Ghép Ảnh Gia Đình',
      description: 'Ghép ảnh của bạn vào các bức ảnh gia đình một cách tự nhiên.',
      gradient: 'from-yellow-500 to-orange-500',
      iconType: 'lucide' as const
    },
    {
      icon: Users,
      title: 'Dễ Dàng Sử Dụng',
      description: 'Chỉ cần tải ảnh lên, AI sẽ làm phần còn lại cho bạn.',
      gradient: 'from-purple-500 to-pink-500',
      iconType: 'lucide' as const
    },
    {
      icon: Zap,
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
    ? dbTestimonials.map((item) => ({
        name: item.name || 'Khách hàng',
        role: item.email ? 'Khách hàng' : 'Người dùng',
        content: item.message,
        rating: 5, // Default 5 stars for approved feedback
        avatar: item.name ? item.name.charAt(0).toUpperCase() : '👤'
      }))
    : defaultTestimonials

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
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="fade-in text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text-alt">Khôi Phục Ảnh Cũ</span>
            <br />
            <span className="text-text">Bằng Công Nghệ AI</span>
          </h1>

          <p className="fade-in-delay-1 text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động.
            <br />
            <span className="gradient-text font-semibold">Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp.</span>
          </p>

          <div className="fade-in-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="btn-glass-primary text-xl px-10 py-5 transition-all hover:scale-105 hover:-translate-y-1 active:scale-95">
                <span className="flex items-center gap-2">
                  Bắt Đầu Ngay
                  <Sparkles className="w-6 h-6" />
                </span>
              </button>
            </Link>
            <Link href="/about">
              <button className="btn-glass-secondary text-xl px-10 py-5 transition-all hover:scale-105 hover:-translate-y-1 active:scale-95">
                <span className="flex items-center gap-2">
                  Tìm Hiểu Thêm
                  <ArrowRight className="w-6 h-6" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with Framer Motion */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text-alt">Tính Năng Nổi Bật</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Công nghệ AI tiên tiến mang đến trải nghiệm tuyệt vời
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {displayFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glassmorphism-strong p-6 text-center relative overflow-hidden group cursor-pointer rounded-2xl"
                whileHover={{ y: -12, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0`}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-glow relative z-10`}
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {feature.iconType === 'lucide' && feature.icon ? (
                    <feature.icon className="w-7 h-7 text-white" />
                  ) : feature.iconUrl ? (
                    <div className="relative w-7 h-7">
                      <Image
                        src={feature.iconUrl}
                        alt={feature.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Sparkles className="w-7 h-7 text-white" />
                  )}
                </motion.div>

                <h3 className="text-lg font-bold text-text mb-2 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed relative z-10">
                  {feature.description}
                </p>

                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />
              </motion.div>
            ))}
          </motion.div>
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
              <span className="gradient-text-alt">Về Chúng Tôi</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Sứ mệnh và tầm nhìn của chúng tôi
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {valueSections.map((item, index) => {
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

      {/* Value Propositions Section - Leadership Style */}
      <section className="py-20 px-4 bg-section-light relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text-multi">Tại Sao Chọn Chúng Tôi?</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Cam kết mang đến dịch vụ tốt nhất
            </p>
          </motion.div>

          <ValueCardRow
            items={[
              { icon: <Rocket className="w-full h-full" />, title: 'Tốc Độ', gradient: 'pink' },
              { icon: <TrendingUp className="w-full h-full" />, title: 'Quy Mô', gradient: 'orange' },
              { icon: <Globe className="w-full h-full" />, title: 'Toàn Cầu', gradient: 'pink' },
              { icon: <Award className="w-full h-full" />, title: 'Chất Lượng', gradient: 'orange' },
              { icon: <Shield className="w-full h-full" />, title: 'An Toàn', gradient: 'pink' },
            ]}
          />
        </div>
      </section>

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
              <span className="gradient-text-alt">Đội Ngũ Của Chúng Tôi</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Những người đồng hành cùng bạn
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
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text-alt">Khách Hàng Nói Gì</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Phản hồi từ những người đã sử dụng dịch vụ
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
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="glassmorphism-strong p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 animate-shimmer"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text-alt">Sẵn Sàng Khôi Phục Ảnh?</span>
              </h2>

              <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
                Tham gia cùng <span className="font-bold gradient-text">hàng ngàn người dùng</span> đã tin tưởng chúng tôi để lưu giữ kỷ niệm quý giá.
              </p>

              <Link href="/register">
                <button className="btn-glass-primary text-xl px-12 py-6 transition-all hover:scale-105 hover:-translate-y-1 active:scale-95">
                  <span className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    Đăng Ký Miễn Phí Ngay
                    <ArrowRight className="w-6 h-6" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
