/**
 * Values Section - Lazy Loaded
 * 
 * Below-the-fold component with heavy animations
 * Lazy loaded to reduce initial bundle size
 */

'use client'

import { motion } from 'framer-motion'
import { Target, Eye, Heart, Sparkles, ImagePlus, Users, Zap, Star, Rocket, Globe, Shield, Award, TrendingUp, Camera, Palette, Smile, Clock, Cpu, Database, FileImage, Film, Filter, Fingerprint, Flame, Grid, Hash, HelpCircle, Home, Inbox, Lightbulb, Link as LinkIcon, Mail, Map, MessageCircle, Music, Package, Phone, PieChart, RefreshCw, Search, Send, Settings, Share2, ShoppingCart, Sliders, Sun, Tag, Truck, Video, Wand2, Wifi, Wind, Wrench, Code, Lock, CheckCircle, Layers } from 'lucide-react'

interface ValueItem {
  id: string
  title: string
  description: string
  icon: string
  gradient: string
}

interface ValuesSectionProps {
  values: ValueItem[]
  title?: string
  subtitle?: string
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

export default function ValuesSection({
  values,
  title = 'Về Chúng Tôi',
  subtitle = 'Sứ mệnh và tầm nhìn của chúng tôi'
}: ValuesSectionProps) {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{title}</span>
          </h2>
          <p className="text-gray-600 text-lg">{subtitle}</p>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {values.map((item) => {
            const Icon = getIconComponent(item.icon)
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="glassmorphism-strong p-10 relative overflow-hidden group cursor-pointer"
                whileHover={{ y: -12, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Hover background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0`}
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Icon */}
                <div className="relative mb-6">
                  <motion.div
                    className={`w-20 h-20 mx-auto bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-glow`}
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-text mb-4 text-center relative z-10">
                  {item.title}
                </h3>
                <p className="text-gray-700 text-center leading-relaxed relative z-10">
                  {item.description}
                </p>

                {/* Bottom border on hover */}
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
  )
}
