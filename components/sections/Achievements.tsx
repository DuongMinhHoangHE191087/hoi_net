'use client'

import { Award, Medal, Trophy, Star, Crown, PartyPopper } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { ACHIEVEMENTS, UI, type Achievement } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

const ICONS = [Trophy, Crown, Star, Medal, Award, PartyPopper]

/** Thành tựu & ghi nhận — lưới thẻ huy hiệu, mỗi thẻ một tông màu. */
export default function Achievements({ achievements = ACHIEVEMENTS }: { achievements?: Achievement[] }) {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="achievements-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="achievements-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(UI.achievementsTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(UI.achievementsSub)}</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((a, index) => {
            const tone = TONES[a.tone]
            const Icon = ICONS[index % ICONS.length]
            return (
              <Reveal key={a.title.vi} direction="up" delay={(index % 3) * 0.1}>
                <article
                  className={`group relative h-full overflow-hidden glassmorphism-strong rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 ${tone.glow}`}
                >
                  {/* Dải màu trên cùng */}
                  <div className={`absolute inset-x-0 top-0 h-1.5 ${tone.gradient}`} aria-hidden="true" />

                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-14 h-14 ${tone.gradient} rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <Icon className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${tone.soft} ${tone.text}`}>
                      {a.year}
                    </span>
                  </div>

                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${tone.text}`}>{t(a.rank)}</p>
                  <h3 className="text-lg font-bold text-text mb-2 leading-snug">{t(a.title)}</h3>
                  <p className="text-sm text-gray-600">{t(a.issuer)}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
