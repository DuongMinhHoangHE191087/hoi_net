'use client'

import { Building2, Layers, FlaskConical, HeartHandshake, GraduationCap } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { COMPANY } from '@/lib/company-info'
import { BUSINESS_UNITS, CORP_UI, type BusinessUnit } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

const ICONS: Record<BusinessUnit['icon'], React.ComponentType<{ className?: string }>> = {
  building: Building2,
  layers: Layers,
  flask: FlaskConical,
  heart: HeartHandshake,
  graduation: GraduationCap,
}

/** Sơ đồ hệ sinh thái: đơn vị chủ quản ở trên, các đơn vị/chương trình thành viên bên dưới. */
export default function Ecosystem() {
  const { lang, t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="ecosystem-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="ecosystem-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(CORP_UI.ecosystemTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(CORP_UI.ecosystemSub)}</p>
        </Reveal>

        {/* Đơn vị chủ quản */}
        <Reveal direction="scale" className="flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-primary px-6 py-4 text-white shadow-glow">
            <Building2 className="w-6 h-6" aria-hidden="true" />
            <div className="text-left">
              <p className="text-xs uppercase tracking-wider text-white/80">{t(CORP_UI.parent)}</p>
              <p className="font-bold">{lang === 'en' ? COMPANY.legalNameEn : COMPANY.legalName}</p>
            </div>
          </div>
        </Reveal>

        <div className="flex justify-center" aria-hidden="true">
          <Reveal direction="grow" className="w-0.5 h-10 bg-gradient-to-b from-primary/60 to-secondary/40" />
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {BUSINESS_UNITS.map((unit, index) => {
            const Icon = ICONS[unit.icon]
            const tone = TONES[unit.tone]
            return (
              <Reveal
                key={unit.name}
                direction="up"
                delay={index * 0.1}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <article
                  className={`group h-full glassmorphism-strong rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 ${tone.glow}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${tone.gradient} rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        unit.status.live ? 'bg-soft-green-bg text-soft-green-DEFAULT' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          unit.status.live ? 'bg-soft-green-DEFAULT animate-pulse' : 'bg-gray-400'
                        }`}
                        aria-hidden="true"
                      />
                      {t(unit.status.label)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text">{unit.name}</h3>
                  <p className={`text-sm font-semibold mb-2 ${tone.text}`}>{t(unit.role)}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{t(unit.description)}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
