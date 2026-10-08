'use client'

import { Heart, Sparkles, ShieldCheck, Rocket, Award, Users } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { UI, VALUES, type ValueItem } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

const ICONS: Record<ValueItem['icon'], React.ComponentType<{ className?: string }>> = {
  heart: Heart,
  sparkles: Sparkles,
  shield: ShieldCheck,
  rocket: Rocket,
  award: Award,
  users: Users,
}

/** Sáu giá trị cốt lõi, mỗi thẻ một tông màu riêng. */
export default function CoreValues() {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="core-values-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="core-values-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(UI.valuesTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(UI.valuesSub)}</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map((value, index) => {
            const Icon = ICONS[value.icon]
            const tone = TONES[value.tone]
            return (
              <Reveal key={value.title.vi} delay={(index % 3) * 0.1}>
                <article
                  className={`group h-full glassmorphism-strong p-7 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${tone.glow}`}
                >
                  <div
                    className={`w-14 h-14 mb-5 ${tone.gradient} rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                  >
                    <Icon className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-2">{t(value.title)}</h3>
                  <p className="text-gray-700 leading-relaxed">{t(value.description)}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
