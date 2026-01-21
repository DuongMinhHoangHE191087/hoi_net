'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface LogoItem {
  name: string
  logo: string  // URL to logo image
  url?: string  // Optional link
}

interface ClientsPartnersGridProps {
  title?: string
  subtitle?: string
  clients?: LogoItem[]
  partners?: LogoItem[]
  showExploreButton?: boolean
  exploreText?: string
  exploreLink?: string
  className?: string
}

/**
 * ClientsPartnersGrid - Logo grid section for clients and partners
 * Matches Leadership Team style with clean white background and hover animations
 */
export default function ClientsPartnersGrid({
  title = 'Our Clients and Partners Network',
  subtitle,
  clients = [],
  partners = [],
  showExploreButton = true,
  exploreText = 'Explore our Success Stories',
  exploreLink = '#',
  className = '',
}: ClientsPartnersGridProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  const renderLogoGrid = (items: LogoItem[], label: string) => {
    if (items.length === 0) return null

    return (
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-600 text-center mb-8">
          <span className="gradient-text">{label}</span>
        </h3>
        
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <a
                href={item.url || '#'}
                className="flex items-center justify-center p-4 h-20 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              >
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={120}
                  height={40}
                  className="max-h-10 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0"
                />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <section className={`py-20 bg-section-light ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our <span className="gradient-text">Clients</span> and{' '}
            <span className="gradient-text">Partners</span> Network
          </h2>
          
          {subtitle && (
            <p className="text-gray-600 text-lg">{subtitle}</p>
          )}

          {showExploreButton && (
            <motion.a
              href={exploreLink}
              className="inline-flex items-center gap-2 text-soft-orange-DEFAULT hover:text-soft-orange-dark mt-4 font-medium transition-colors"
              whileHover={{ x: 5 }}
            >
              {exploreText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          )}
        </motion.div>

        {/* Clients Grid */}
        {renderLogoGrid(clients, 'Clients')}

        {/* Partners Grid */}
        {renderLogoGrid(partners, 'Partners')}
      </div>
    </section>
  )
}

/**
 * Demo data for testing - can be replaced with real data
 */
export const demoClientsPartners = {
  clients: [
    { name: 'AT&T', logo: '/logos/att.svg' },
    { name: 'Microsoft', logo: '/logos/microsoft.svg' },
    { name: 'Panasonic', logo: '/logos/panasonic.svg' },
    { name: 'Sony', logo: '/logos/sony.svg' },
    { name: 'Toshiba', logo: '/logos/toshiba.svg' },
    { name: 'Allianz', logo: '/logos/allianz.svg' },
  ],
  partners: [
    { name: 'NVIDIA', logo: '/logos/nvidia.svg' },
    { name: 'SAP', logo: '/logos/sap.svg' },
    { name: 'Adobe', logo: '/logos/adobe.svg' },
    { name: 'AWS', logo: '/logos/aws.svg' },
    { name: 'Google Cloud', logo: '/logos/gcp.svg' },
  ],
}
