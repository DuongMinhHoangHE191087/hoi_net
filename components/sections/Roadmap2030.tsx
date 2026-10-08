'use client'

import { CheckCircle2 } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { ROADMAP, UI } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

/** Lộ trình 2026 – 2030: bốn giai đoạn nối nhau bằng một đường gradient. */
export default function Roadmap2030() {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="roadmap-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <h2 id="roadmap-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(UI.roadmapTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">{t(UI.roadmapSub)}</p>
        </Reveal>

        <div className="relative">
          {/* Đường nối (chỉ desktop) */}
          <Reveal
            direction="grow"
            className="hidden lg:block absolute left-0 right-0 top-[3.25rem] h-0.5 bg-gradient-to-r from-primary/50 via-secondary/60 to-soft-blue-DEFAULT/50 origin-left"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROADMAP.map((phase, index) => {
              const tone = TONES[phase.tone]
              return (
                <Reveal key={phase.period} direction="up" delay={index * 0.12}>
                  <article
                    className={`group relative h-full glassmorphism-strong rounded-3xl p-6 pt-8 transition-all duration-300 hover:-translate-y-2 ${tone.glow}`}
                  >
                    <div
                      className={`absolute -top-4 left-6 px-4 py-1.5 rounded-full text-white font-extrabold text-lg shadow-md ${tone.gradient}`}
                    >
                      {phase.period}
                    </div>
                    <h3 className="text-xl font-bold text-text mt-2 mb-1">{t(phase.title)}</h3>
                    <p className={`text-sm font-medium mb-4 ${tone.text}`}>{t(phase.goal)}</p>
                    <ul className="space-y-2.5">
                      {phase.targets.map((target) => (
                        <li key={target.vi} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tone.text}`} aria-hidden="true" />
                          {t(target)}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
