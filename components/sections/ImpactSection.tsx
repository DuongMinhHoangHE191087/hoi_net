'use client'

import { Users, Leaf, Scale } from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import Reveal from '@/components/ui/Reveal'
import { CORP_UI, IMPACT_METRICS, PILLARS, SDGS, type Pillar } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

const ICONS: Record<Pillar['icon'], React.ComponentType<{ className?: string }>> = {
  users: Users,
  leaf: Leaf,
  scale: Scale,
}

/** Tác động & phát triển bền vững: ba trụ cột (ESG), chỉ số tác động và các SDG. */
export default function ImpactSection() {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="impact-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="impact-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(CORP_UI.impactTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">{t(CORP_UI.impactSub)}</p>
        </Reveal>

        {/* Ba trụ cột */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PILLARS.map((pillar, index) => {
            const Icon = ICONS[pillar.icon]
            const tone = TONES[pillar.tone]
            return (
              <Reveal key={pillar.title.en} delay={index * 0.1}>
                <article
                  className={`group h-full glassmorphism-strong rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 ${tone.glow}`}
                >
                  <div
                    className={`w-12 h-12 mb-4 ${tone.gradient} rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:rotate-6`}
                  >
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-2">{t(pillar.title)}</h3>
                  <p className="text-gray-700 leading-relaxed">{t(pillar.description)}</p>
                </article>
              </Reveal>
            )
          })}
        </div>

        {/* Chỉ số tác động */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {IMPACT_METRICS.map((metric, index) => (
            <Reveal key={metric.label.en} direction="scale" delay={index * 0.08}>
              <div className="h-full glassmorphism-strong rounded-3xl p-5 sm:p-6 text-center">
                <div className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1 tabular-nums">
                  <AnimatedCounter end={metric.value} suffix={metric.suffix} compact={false} />
                </div>
                <h4 className="font-bold text-text text-sm sm:text-base">{t(metric.label)}</h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-snug">{t(metric.description)}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* SDG */}
        <Reveal>
          <div className="glassmorphism-strong rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-5">
            <p className="font-semibold text-text md:max-w-xs">{t(CORP_UI.sdgLabel)}</p>
            <ul className="flex flex-wrap gap-3">
              {SDGS.map((sdg) => (
                <li
                  key={sdg.number}
                  className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 pr-4 overflow-hidden"
                >
                  <span
                    className="w-12 h-12 flex items-center justify-center text-white text-xl font-extrabold"
                    style={{ backgroundColor: sdg.color }}
                    aria-label={`SDG ${sdg.number}`}
                  >
                    {sdg.number}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{t(sdg.label)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
