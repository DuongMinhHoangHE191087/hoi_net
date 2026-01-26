'use client'

import { motion } from 'framer-motion'
import { Star, Facebook, Phone, Globe, MessageCircle, ExternalLink, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Feedback } from '@/lib/supabase'

interface TestimonialCardProps {
  testimonial: Feedback
  index?: number
  showContactInfo?: boolean
  variant?: 'compact' | 'full'
}

export default function TestimonialCard({ 
  testimonial, 
  index = 0, 
  showContactInfo = false,
  variant = 'compact'
}: TestimonialCardProps) {
  // Get avatar display - either image URL, first letter, or emoji
  const getAvatar = () => {
    if (testimonial.testimonial_image_url) {
      // Check if it's an image URL
      if (testimonial.testimonial_image_url.startsWith('http') || testimonial.testimonial_image_url.startsWith('/')) {
        return (
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20">
            <Image
              src={testimonial.testimonial_image_url}
              alt={testimonial.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        )
      }
      // It's an emoji or letter
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl ring-2 ring-primary/20">
          {testimonial.testimonial_image_url}
        </div>
      )
    }
    // Default: first letter of name
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white ring-2 ring-primary/20">
        {testimonial.name?.charAt(0).toUpperCase() || '?'}
      </div>
    )
  }

  // Render star rating
  const renderStars = () => {
    const rating = testimonial.rating || 5
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  // Render contact verification links
  const renderContactInfo = () => {
    if (!showContactInfo || !testimonial.allow_contact_display) return null

    const contacts = []
    
    if (testimonial.facebook_url) {
      contacts.push(
        <Link
          key="facebook"
          href={testimonial.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Facebook className="w-3.5 h-3.5" />
          <span>Facebook</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      )
    }

    if (testimonial.zalo_id) {
      contacts.push(
        <Link
          key="zalo"
          href={`https://zalo.me/${testimonial.zalo_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Zalo</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      )
    }

    if (testimonial.website_url) {
      contacts.push(
        <Link
          key="website"
          href={testimonial.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      )
    }

    if (testimonial.phone_number) {
      // Only show partial phone for privacy
      const maskedPhone = testimonial.phone_number.replace(/(\d{4})(\d+)(\d{3})/, '$1***$3')
      contacts.push(
        <span key="phone" className="flex items-center gap-1.5 text-xs text-gray-500">
          <Phone className="w-3.5 h-3.5" />
          <span>{maskedPhone}</span>
        </span>
      )
    }

    if (contacts.length === 0) return null

    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-green-600 mb-2">
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="font-medium">Đã xác minh</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {contacts}
        </div>
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 15 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
      >
        {/* Featured badge */}
        {testimonial.is_featured && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            ⭐ Nổi bật
          </div>
        )}

        {/* Header with avatar and info */}
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {getAvatar()}
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate">
              {testimonial.name}
            </h3>
            {(testimonial.position_title || testimonial.company_name) && (
              <p className="text-sm text-gray-500 truncate">
                {testimonial.position_title}
                {testimonial.position_title && testimonial.company_name && ' · '}
                {testimonial.company_name}
              </p>
            )}
            <div className="mt-1">
              {renderStars()}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700 leading-relaxed">
          "{testimonial.message}"
        </p>

        {/* Contact verification info */}
        {renderContactInfo()}

        {/* Date */}
        <div className="mt-4 text-xs text-gray-400">
          {new Date(testimonial.created_at).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </motion.div>
    )
  }

  // Compact variant (for homepage)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 15 }}
      className="glassmorphism-strong p-8 relative overflow-hidden group cursor-pointer"
      whileHover={{ y: -12, scale: 1.02 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Avatar */}
      <motion.div
        className="flex justify-center mb-4 relative z-10"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {getAvatar()}
      </motion.div>

      {/* Stars */}
      <div className="flex gap-1 mb-4 justify-center relative z-10">
        {[...Array(testimonial.rating || 5)].map((_, i) => (
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
      <p className="text-gray-700 mb-6 text-center italic leading-relaxed relative z-10 line-clamp-4">
        "{testimonial.message}"
      </p>

      {/* Name and role */}
      <div className="text-center relative z-10">
        <p className="font-bold text-text text-lg">{testimonial.name}</p>
        <p className="text-sm text-gray-600">
          {testimonial.position_title || testimonial.company_name || 'Khách hàng'}
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-bl-full" />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        style={{ originX: 0 }}
      />
    </motion.div>
  )
}

// Skeleton component for loading state
export function TestimonialCardSkeleton({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  if (variant === 'full') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="glassmorphism-strong p-8 animate-pulse">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
      </div>
      <div className="flex gap-1 mb-4 justify-center">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-5 h-5 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
      </div>
      <div className="text-center">
        <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
      </div>
    </div>
  )
}

