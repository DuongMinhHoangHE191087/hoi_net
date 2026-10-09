'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ImageIcon, Heart, ExternalLink, Mail, Phone, MapPin, Clock, Globe } from 'lucide-react'
import { useSiteSettings, useFooterLinksByColumn, DEFAULT_SITE_SETTINGS } from '@/hooks/useSiteSettings'
import { COMPANY, SOCIAL_LINKS } from '@/lib/company-info'
import { COMPANY_EN } from '@/lib/about-content'
import { useLang } from '@/contexts/LanguageContext'
import { FOOTER, translateFooterColumn, translateLink } from '@/lib/site-i18n'
import SocialIcon from '@/components/ui/SocialIcon'

export default function Footer() {
  const { data: settings = DEFAULT_SITE_SETTINGS } = useSiteSettings()
  const { data: footerColumns = {} } = useFooterLinksByColumn()
  const { lang, t } = useLang()
  const en = lang === 'en'

  const brandName = settings.brand_name || DEFAULT_SITE_SETTINGS.brand_name
  const footerDescription = en
    ? FOOTER.description.en
    : settings.footer_description || DEFAULT_SITE_SETTINGS.footer_description
  const logoUrl = settings.brand_logo_url || DEFAULT_SITE_SETTINGS.brand_logo_url

  // Default column order
  const columnOrder = ['products', 'company', 'legal']

  return (
    <footer className="relative mt-20">
      <div className="glassmorphism-strong border-t-2 border-white/40 mx-4 mb-4 rounded-3xl overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
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

              {/* Social Links (hardcode: lib/company-info.ts) */}
              <div className="flex flex-wrap items-center gap-2">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 text-gray-600 hover:text-primary hover:bg-white/60 border border-gray-300/70 hover:border-primary/50 rounded-full transition-all"
                    title={social.label}
                    aria-label={social.label}
                  >
                    <SocialIcon name={social.key} />
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Column (hardcode: lib/company-info.ts) */}
            <div>
              <h3 className="font-bold text-text mb-4 text-lg">{t(FOOTER.contactTitle)}</h3>
              <address className="not-italic space-y-3 text-sm text-gray-700">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href={COMPANY.address.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {en ? COMPANY_EN.addressFull : COMPANY.address.full}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  <a href={`tel:${COMPANY.phoneRaw}`} className="hover:text-primary transition-colors">
                    {COMPANY.phone}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href={`mailto:${COMPANY.emails.contact}`}
                    className="hover:text-primary transition-colors break-all"
                  >
                    {COMPANY.emails.contact}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="w-4 h-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href={COMPANY.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {COMPANY.domain}
                  </a>
                </p>
                <p className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
                  <span>{en ? COMPANY_EN.workingHours : COMPANY.workingHours}</span>
                </p>
              </address>
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
                  <h3 className="font-bold text-text mb-4 text-lg">{translateFooterColumn(column.title, columnName, lang)}</h3>
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
                            → {translateLink(link.label, link.href, lang)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-gray-700 hover:text-primary text-sm transition-all hover:translate-x-1 inline-block"
                          >
                            → {translateLink(link.label, link.href, lang)}
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
            <p className="text-center text-sm text-gray-700">{FOOTER.copyright(new Date().getFullYear(), lang)}</p>
            <p className="mt-1 text-center text-xs text-gray-600 flex items-center justify-center gap-2">
              {t(FOOTER.madeWith)}
              <Heart className="w-3.5 h-3.5 text-primary fill-primary animate-pulse" />
              {t(FOOTER.inVietnam)}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Fallback columns when database is empty
function FallbackColumn({ columnName }: { columnName: string }) {
  const { lang } = useLang()
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
        { label: 'Ban Lãnh Đạo', href: '/about#leadership-title' },
        { label: 'Tin Tức', href: '/about#news-title' },
        { label: 'Tuyển Dụng', href: '/about#careers-title' },
        { label: 'Hỏi Đáp', href: '/about#faq-title' },
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
      <h3 className="font-bold text-text mb-4 text-lg">{translateFooterColumn(column.title, columnName, lang)}</h3>
      <ul className="space-y-3">
        {column.links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className="text-gray-700 hover:text-primary text-sm transition-all hover:translate-x-1 inline-block"
            >
              → {translateLink(link.label, link.href, lang)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

