'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ImageIcon, Heart, ExternalLink, Facebook, Mail, Phone, MapPin } from 'lucide-react'
import { useSiteSettings, useFooterLinksByColumn, DEFAULT_SITE_SETTINGS } from '@/hooks/useSiteSettings'

export default function Footer() {
  const { data: settings = DEFAULT_SITE_SETTINGS } = useSiteSettings()
  const { data: footerColumns = {} } = useFooterLinksByColumn()

  const brandName = settings.brand_name || DEFAULT_SITE_SETTINGS.brand_name
  const footerDescription = settings.footer_description || DEFAULT_SITE_SETTINGS.footer_description
  const contactEmail = settings.contact_email || ''
  const contactPhone = settings.contact_phone || ''
  const contactFacebook = settings.contact_facebook || ''
  const logoUrl = settings.brand_logo_url || ''

  // Default column order
  const columnOrder = ['products', 'company', 'legal']

  return (
    <footer className="relative mt-20">
      <div className="glassmorphism-strong border-t-2 border-white/40 mx-4 mb-4 rounded-3xl overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {logoUrl ? (
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src={logoUrl}
                      alt={brandName}
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-xl font-bold gradient-text">{brandName}</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {footerDescription}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-white/50 rounded-lg transition-all"
                    title={contactEmail}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-white/50 rounded-lg transition-all"
                    title={contactPhone}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                {contactFacebook && (
                  <a
                    href={contactFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-primary hover:bg-white/50 rounded-lg transition-all"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Dynamic Footer Columns */}
            {columnOrder.map((columnName) => {
              const column = footerColumns[columnName]
              if (!column || column.links.length === 0) {
                // Fallback columns if no data from database
                return (
                  <FallbackColumn key={columnName} columnName={columnName} />
                )
              }

              return (
                <div key={columnName}>
                  <h3 className="font-bold text-text mb-4 text-lg">{column.title}</h3>
                  <ul className="space-y-3">
                    {column.links.map((link) => (
                      <li key={link.id}>
                        {link.is_external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-primary text-sm transition-all hover:translate-x-1 inline-flex items-center gap-1"
                          >
                            → {link.label}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-gray-700 hover:text-primary text-sm transition-all hover:translate-x-1 inline-block"
                          >
                            → {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <div className="border-t-2 border-white/30 mt-8 pt-8">
            <p className="text-center text-sm text-gray-700 flex items-center justify-center gap-2">
              © {new Date().getFullYear()} {brandName}. Made with
              <Heart className="w-4 h-4 text-primary fill-primary animate-pulse" />
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Fallback columns when database is empty
function FallbackColumn({ columnName }: { columnName: string }) {
  const fallbackData: Record<string, { title: string; links: { label: string; href: string }[] }> = {
    products: {
      title: 'Sản Phẩm',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Liên Hệ', href: '/contact' },
      ],
    },
    company: {
      title: 'Công Ty',
      links: [
        { label: 'Về Chúng Tôi & Đội Ngũ', href: '/about' },
      ],
    },
    legal: {
      title: 'Pháp Lý',
      links: [
        { label: 'Điều Khoản', href: '/terms' },
        { label: 'Bảo Mật', href: '/privacy' },
      ],
    },
  }

  const column = fallbackData[columnName]
  if (!column) return null

  return (
    <div>
      <h3 className="font-bold text-text mb-4 text-lg">{column.title}</h3>
      <ul className="space-y-3">
        {column.links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className="text-gray-700 hover:text-primary text-sm transition-all hover:translate-x-1 inline-block"
            >
              → {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

