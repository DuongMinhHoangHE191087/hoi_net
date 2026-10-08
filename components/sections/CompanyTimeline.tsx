'use client'

import Reveal from '@/components/ui/Reveal'
import { formatMilestoneDate, MILESTONES, UI, type Milestone } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'

/**
 * Hành trình phát triển — timeline dọc, xen kẽ trái/phải trên desktop.
 * Đường kẻ "vẽ" dần, chấm mốc bật lên, thẻ trượt vào từ hai bên khi cuộn tới.
 */
export default function CompanyTimeline({ milestones = MILESTONES }: { milestones?: Milestone[] }) {
  const { lang, t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="company-timeline-title">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <h2 id="company-timeline-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(UI.timelineTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(UI.timelineSub)}</p>
        </Reveal>

        <ol className="relative">
          {/* Đường dọc — dùng margin thay vì translate để không xung đột với transform của framer-motion */}
          <Reveal
            direction="grow"
            duration={1.2}
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -ml-px bg-gradient-to-b from-primary/60 via-secondary/50 to-transparent"
          />

          {milestones.map((m, index) => {
            const cardOnLeft = index % 2 === 0
            return (
              <li key={`${m.date}-${index}`} className="relative mb-10 last:mb-0 pl-12 md:pl-0">
                {/* Chấm mốc */}
                <div className="absolute left-4 md:left-1/2 top-6 -ml-2 w-4 h-4" aria-hidden="true">
                  <Reveal direction="scale" delay={0.1} duration={0.5} className="w-4 h-4">
                    <span
                      className={`block w-4 h-4 rounded-full border-4 border-white shadow ${
                        m.upcoming ? 'bg-gray-300' : 'bg-primary'
                      }`}
                    />
                  </Reveal>
                </div>

                <div className={`md:w-1/2 ${cardOnLeft ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                  <Reveal direction={cardOnLeft ? 'left' : 'right'}>
                    <article
                      className={`glassmorphism-strong p-5 rounded-2xl transition-shadow duration-300 hover:shadow-glow ${
                        m.upcoming ? 'border-2 border-dashed border-primary/40' : ''
                      }`}
                    >
                      <time
                        dateTime={m.date}
                        className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary mb-2"
                      >
                        {formatMilestoneDate(m.date, lang)}
                        {m.upcoming ? ` · ${t(UI.upcoming)}` : ''}
                      </time>
                      <h3 className="text-lg font-bold text-text mb-1">{t(m.title)}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{t(m.description)}</p>
                    </article>
                  </Reveal>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
