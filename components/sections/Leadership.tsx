'use client'

import Reveal from '@/components/ui/Reveal'
import { LEADERS, UI, type Leader } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

/** "Dương Minh Hoàng" → "DH" (chữ cái đầu của họ và tên) */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/** Ban lãnh đạo — thẻ ảnh đại diện chữ cái, xếp giữa hàng. */
export default function Leadership({ leaders = LEADERS }: { leaders?: Leader[] }) {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="leadership-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="leadership-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(UI.leadershipTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(UI.leadershipSub)}</p>
        </Reveal>

        <div className="flex flex-wrap justify-center gap-6">
          {leaders.map((leader, index) => {
            const tone = TONES[leader.tone]
            return (
              <Reveal
                key={leader.name}
                direction="up"
                delay={(index % 3) * 0.1}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <article
                  className={`group h-full glassmorphism-strong rounded-3xl p-6 text-center transition-all duration-300 hover:-translate-y-2 ${tone.glow}`}
                >
                  <div
                    className={`w-24 h-24 mx-auto mb-4 rounded-full ${tone.gradient} flex items-center justify-center text-3xl font-extrabold text-white shadow-md ring-4 ring-white/70 transition-transform duration-300 group-hover:scale-105`}
                    aria-hidden="true"
                  >
                    {initials(leader.name)}
                  </div>
                  <h3 className="text-xl font-bold text-text">{leader.name}</h3>
                  <p className={`text-sm font-semibold mb-3 ${tone.text}`}>{t(leader.role)}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{t(leader.bio)}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
