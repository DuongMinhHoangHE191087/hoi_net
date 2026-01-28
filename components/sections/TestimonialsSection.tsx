/**
 * Testimonials Section - Lazy Loaded
 * 
 * Below-the-fold component, uses framer-motion for animations
 * Lazy loaded to reduce initial bundle size
 */

'use client'

import { motion } from 'framer-motion'
import { Star, ArrowRight, Loader2 } from 'lucide-react'

interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
  title?: string
  subtitle?: string
  ctaText?: string
  onCTAClick?: () => void
  isLoading?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
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

export default function TestimonialsSection({
  testimonials,
  title = 'Khách Hàng Nói Gì',
  subtitle = 'Phản hồi từ những người đã sử dụng dịch vụ',
  ctaText = 'Gửi phản hồi của bạn',
  onCTAClick,
  isLoading = false
}: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{title}</span>
          </h2>
          <p className="text-gray-600 text-lg">{subtitle}</p>
        </motion.div>

        {/* Testimonial Cards */}
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
              {/* Hover background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Avatar */}
              <motion.div
                className="text-6xl mb-4 text-center relative z-10"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {testimonial.avatar}
              </motion.div>

              {/* Rating Stars */}
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

              {/* Content */}
              <p className="text-gray-700 mb-6 text-center italic leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>

              {/* Name & Role */}
              <div className="text-center relative z-10">
                <p className="font-bold text-text text-lg">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-bl-full" />
              
              {/* Bottom border on hover */}
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

        {/* CTA Button */}
        {onCTAClick && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mt-10"
          >
            <button
              onClick={onCTAClick}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-primary/20 text-primary font-semibold rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-lg hover:shadow-xl group disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang chuyển...</span>
                </>
              ) : (
                <>
                  <span>{ctaText}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
