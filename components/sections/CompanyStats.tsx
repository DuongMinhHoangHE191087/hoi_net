'use client'

import { Image as ImageIcon, Users, MapPinned, Smile, Timer, CalendarCheck } from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import Reveal from '@/components/ui/Reveal'
import { STATS, UI, type StatItem } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'

const ICONS: Record<StatItem['icon'], React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  users: Users,
  map: MapPinned,
  smile: Smile,
  clock: Timer,
  calendar: CalendarCheck,
}

/** Số liệu nổi bật của Hồi Nét — đếm số khi cuộn tới. */
export default function CompanyStats({ stats = STATS }: { stats?: StatItem[] }) {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="company-stats-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="company-stats-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(UI.statsTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(UI.statsSub)}</p>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = ICONS[stat.icon]
            return (
              <Reveal key={stat.label.vi} direction="scale" delay={index * 0.08}>
                <div className="group h-full glassmorphism-strong p-5 sm:p-7 rounded-3xl text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold gradient-text mb-2 tabular-nums">
                    <AnimatedCounter
                      end={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix ? t(stat.suffix) : undefined}
                      compact={false}
                      duration={2200}
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text mb-1">{t(stat.label)}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-snug">{t(stat.description)}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
