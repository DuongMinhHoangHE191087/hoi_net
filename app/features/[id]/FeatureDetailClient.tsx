'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, ArrowRight, ArrowLeft, ChevronRight, 
  Star, Eye, Zap, Target, Heart, ImagePlus, Check,
  Camera, Palette, Clock, Cpu, FileImage, Wand2, Shield, Award,
  TrendingUp, Globe, Rocket, Users, Code, Lock, CheckCircle, Layers,
  Play, ExternalLink
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
]

interface FeatureDetailClientProps {
  feature: Feature
  relatedFeatures: Feature[]
}

// Mock showcase projects - In production, this would come from database
const mockShowcaseProjects = [
  {
    id: '1',
    title: 'Khôi phục ảnh gia đình năm 1960',
    description: 'Một bộ ảnh gia đình quý giá từ những năm 1960 đã được khôi phục hoàn toàn với màu sắc tự nhiên và độ nét cao.',
    beforeImage: '/images/demo/before-1.jpg',
    afterImage: '/images/demo/after-1.jpg',
    category: 'Ảnh Gia Đình',
  },
  {
    id: '2',
    title: 'Phục hồi ảnh cưới cổ điển',
    description: 'Ảnh cưới từ những năm 1980 đã được làm mới với chất lượng cao, giữ nguyên vẻ đẹp cổ điển.',
    beforeImage: '/images/demo/before-2.jpg',
    afterImage: '/images/demo/after-2.jpg',
    category: 'Ảnh Cưới',
  },
  {
    id: '3',
    title: 'Tái tạo chân dung lịch sử',
    description: 'Chân dung đen trắng từ thế kỷ 19 được tô màu và khôi phục chi tiết.',
    beforeImage: '/images/demo/before-3.jpg',
    afterImage: '/images/demo/after-3.jpg',
    category: 'Chân Dung',
  },
]

// Feature highlights based on common features
const getFeatureHighlights = (title: string) => {
  const defaultHighlights = [
    'Xử lý nhanh chóng trong vài phút',
    'Chất lượng đầu ra cao',
    'Giao diện dễ sử dụng',
    'Hỗ trợ nhiều định dạng ảnh',
    'Bảo mật thông tin tuyệt đối',
  ]
  return defaultHighlights
}

export default function FeatureDetailClient({ feature, relatedFeatures }: FeatureDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'showcase'>('overview')

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Sparkles
  }

  const IconComponent = getIconComponent(feature.icon_value)
  const hasImage = feature.icon_type === 'image' && feature.icon_value
  const gradient = gradients[0] // Could be based on feature index
  const highlights = getFeatureHighlights(feature.title)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl`} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <motion.nav 
            className="flex items-center gap-2 text-sm text-gray-600 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/features" className="hover:text-primary transition-colors">Tính năng</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{feature.title}</span>
          </motion.nav>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-medium mb-6`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {hasImage ? (
                  <Image src={feature.icon_value} alt="" width={20} height={20} className="object-contain" />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
                Tính năng
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {feature.title}
              </h1>

              <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed">
                {feature.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-3 mb-8">
                {highlights.slice(0, 3).map((highlight, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center gap-3 text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span>{highlight}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  href="/register"
                  className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${gradient} text-white font-semibold rounded-full hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Thử ngay miễn phí</span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-primary hover:text-primary transition-all duration-300"
                >
                  <span>Liên hệ tư vấn</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={`relative aspect-square max-w-lg mx-auto rounded-3xl bg-gradient-to-br ${gradient} p-1`}>
                <div className="w-full h-full rounded-3xl bg-white/90 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  {hasImage ? (
                    <Image
                      src={feature.icon_value}
                      alt={feature.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 512px"
                      className="object-cover rounded-3xl"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <div className={`w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-2xl`}>
                        <IconComponent className="w-16 h-16 text-white" />
                      </div>
                      <p className="text-gray-600 text-lg">{feature.title}</p>
                    </div>
                  )}
                </div>

                {/* Floating badges */}
                <motion.div 
                  className="absolute -top-4 -right-4 px-4 py-2 bg-white rounded-full shadow-lg flex items-center gap-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">Phổ biến</span>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -left-4 px-4 py-2 bg-white rounded-full shadow-lg flex items-center gap-2"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Nhanh chóng</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 bg-gray-100 rounded-full">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-white text-primary shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('showcase')}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === 'showcase'
                    ? 'bg-white text-primary shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dự án mẫu
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {highlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center mb-4`}>
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{highlight}</h3>
                    <p className="text-gray-600 text-sm">
                      Trải nghiệm tốt nhất với công nghệ AI tiên tiến
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* How it works */}
              <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
                  Cách hoạt động
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { step: '01', title: 'Tải ảnh lên', desc: 'Chọn ảnh bạn muốn xử lý từ thiết bị của bạn' },
                    { step: '02', title: 'AI xử lý', desc: 'Hệ thống AI sẽ phân tích và xử lý ảnh tự động' },
                    { step: '03', title: 'Tải xuống', desc: 'Nhận kết quả chất lượng cao và tải về ngay' },
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold mb-4`}>
                        {item.step}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'showcase' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Showcase Projects */}
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Dự án đã thực hiện
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Xem các dự án thực tế đã sử dụng tính năng {feature.title}
                </p>
              </div>

              {/* Projects placeholder - In production, would show real projects */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockShowcaseProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Image placeholder */}
                    <div className={`aspect-video bg-gradient-to-br ${gradients[index % gradients.length]} relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Camera className="w-12 h-12 mx-auto mb-2 opacity-60" />
                          <span className="text-sm opacity-60">Ảnh minh họa</span>
                        </div>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="px-6 py-3 bg-white text-gray-900 rounded-full font-medium flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-3">
                        {project.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA to submit project */}
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                  Bạn đã sử dụng tính năng này? Hãy chia sẻ dự án của bạn!
                </p>
                <Link
                  href="/contact"
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${gradient} text-white font-medium rounded-full hover:opacity-90 transition-all duration-300`}
                >
                  <span>Gửi dự án của bạn</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Related Features */}
      {relatedFeatures.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
              Tính năng liên quan
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedFeatures.map((related, index) => {
                const RelatedIcon = getIconComponent(related.icon_value)
                const relatedGradient = gradients[(index + 1) % gradients.length]
                const relatedHasImage = related.icon_type === 'image' && related.icon_value

                return (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/features/${related.id}`}>
                      <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${relatedGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          {relatedHasImage ? (
                            <Image src={related.icon_value} alt="" width={28} height={28} className="object-contain" />
                          ) : (
                            <RelatedIcon className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {related.description}
                        </p>
                        <div className="flex items-center text-primary font-medium text-sm">
                          <span>Tìm hiểu thêm</span>
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Back to all features */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại tất cả tính năng</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
