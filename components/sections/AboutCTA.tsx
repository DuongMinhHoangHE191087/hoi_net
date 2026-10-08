'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, Heart, Mail, Rocket } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { COMPANY } from '@/lib/company-info'
import { UI } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'

/** Khối kêu gọi hành động cuối trang About. */
export default function AboutCTA() {
  const { t } = useAboutLang()

  const actions = [
    { href: '/request-photo', icon: Rocket, label: { vi: 'Phục chế ảnh', en: 'Restore a photo' }, external: false },
    { href: '/donate', icon: Heart, label: { vi: 'Đồng hành cùng dự án', en: 'Support the project' }, external: false },
    {
      href: `mailto:${COMPANY.emails.careers}`,
      icon: Briefcase,
      label: { vi: 'Gia nhập đội ngũ', en: 'Join our team' },
      external: true,
    },
    { href: '/contact', icon: Mail, label: { vi: 'Liên hệ', en: 'Contact us' }, external: false },
  ]

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="about-cta-title">
      <Reveal direction="scale">
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-[2rem] bg-gradient-primary p-8 sm:p-12 text-center text-white shadow-glow">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/20 blur-2xl animate-float" aria-hidden="true" />
          <div
            className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-white/20 blur-2xl animate-float [animation-delay:1.5s]"
            aria-hidden="true"
          />

          <div className="relative">
            <h2 id="about-cta-title" className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
              {t(UI.ctaTitle)}
            </h2>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-8">{t(UI.ctaSub)}</p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {actions.map(({ href, icon: Icon, label, external }, i) => {
                const className = `group inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5 ${
                  i === 0
                    ? 'bg-white text-primary-dark shadow-lg hover:shadow-xl'
                    : 'bg-white/85 text-gray-800 hover:bg-white shadow-md'
                }`
                const content = (
                  <>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {t(label)}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </>
                )
                return external ? (
                  <a key={href} href={href} className={className}>
                    {content}
                  </a>
                ) : (
                  <Link key={href} href={href} className={className}>
                    {content}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
