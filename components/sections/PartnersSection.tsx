'use client'

import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { COMPANY } from '@/lib/company-info'
import { CORP_UI, PARTNER_TIERS, PLATFORMS } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

/** Đối tác & nền tảng: nhà cung cấp công nghệ thật và các hình thức hợp tác. */
export default function PartnersSection() {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="partners-title">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-10">
          <h2 id="partners-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(CORP_UI.partnersTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(CORP_UI.partnersSub)}</p>
        </Reveal>

        {/* Nền tảng công nghệ */}
        <Reveal>
          <div className="glassmorphism-strong rounded-3xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm font-bold uppercase tracking-wider text-gray-500 shrink-0">{t(CORP_UI.poweredBy)}</p>
            <ul className="flex flex-wrap gap-3">
              {PLATFORMS.map((name) => (
                <li
                  key={name}
                  className="px-5 py-2 rounded-full bg-white/70 border border-white/80 text-sm font-semibold text-gray-800"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Hình thức hợp tác */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PARTNER_TIERS.map((tier, index) => {
            const tone = TONES[tier.tone]
            return (
              <Reveal key={tier.title.en} delay={index * 0.1}>
                <article
                  className={`group h-full glassmorphism-strong rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 ${tone.glow}`}
                >
                  <div className={`h-1.5 w-12 rounded-full mb-4 ${tone.gradient}`} aria-hidden="true" />
                  <h3 className="text-lg font-bold text-text mb-2">{t(tier.title)}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{t(tier.description)}</p>
                </article>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-8 text-center">
          <a
            href={`mailto:${COMPANY.emails.press}`}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-primary text-white font-semibold shadow-glow-pink hover:shadow-glow transition-all hover:-translate-y-0.5"
          >
            {t(CORP_UI.partnerCta)}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
