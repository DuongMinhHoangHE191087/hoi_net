'use client'

import { ArrowUpRight, Briefcase, Clock, MapPin } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { CORP_UI, PERKS, ROLES, applyMailto } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'

/** Tuyển dụng: quyền lợi và danh sách vị trí đang mở, nút ứng tuyển gửi email sẵn tiêu đề. */
export default function CareersSection() {
  const { lang, t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="careers-title">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-10">
          <h2 id="careers-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(CORP_UI.careersTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(CORP_UI.careersSub)}</p>
        </Reveal>

        {/* Quyền lợi */}
        <Reveal>
          <div className="glassmorphism-strong rounded-3xl p-6 mb-6">
            <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">{t(CORP_UI.perks)}</p>
            <ul className="flex flex-wrap gap-2.5">
              {PERKS.map((perk) => (
                <li
                  key={perk.en}
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/70 border border-white/80 text-gray-700"
                >
                  {t(perk)}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Vị trí */}
        <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" aria-hidden="true" />
          {t(CORP_UI.openRoles)}
          <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{ROLES.length}</span>
        </h3>
        <ul className="space-y-3">
          {ROLES.map((role, index) => (
            <li key={role.title.en}>
              <Reveal direction="up" delay={index * 0.06} duration={0.5}>
                <a
                  href={applyMailto(role.title, lang)}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 glassmorphism-strong rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-pink"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text group-hover:text-primary transition-colors">{t(role.title)}</p>
                    <p className="text-sm text-gray-600">{t(role.team)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                      {t(role.location)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                      {t(role.type)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {t(CORP_UI.apply)}
                    <ArrowUpRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
