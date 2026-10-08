'use client'

import { UploadCloud, Cpu, Sparkles, Download } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { CORP_UI, PROCESS, type ProcessStep } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'

const ICONS: Record<ProcessStep['icon'], React.ComponentType<{ className?: string }>> = {
  upload: UploadCloud,
  cpu: Cpu,
  sparkles: Sparkles,
  download: Download,
}

/** Quy trình bốn bước, nối nhau bằng đường kẻ gradient. */
export default function HowItWorks() {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="process-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 id="process-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(CORP_UI.processTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(CORP_UI.processSub)}</p>
        </Reveal>

        <div className="relative">
          <Reveal
            direction="grow"
            className="hidden lg:block absolute left-[12.5%] right-[12.5%] top-0 h-0.5 bg-gradient-to-r from-primary/50 via-secondary/60 to-primary/50 origin-left"
          />
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
          {PROCESS.map((step, index) => {
            const Icon = ICONS[step.icon]
            return (
              <li key={step.title.en}>
                <Reveal direction="up" delay={index * 0.12} className="h-full">
                  <div className="relative h-full glassmorphism-strong rounded-3xl p-6 pt-12 text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow-pink ring-4 ring-white/80">
                        <Icon className="w-7 h-7 text-white" aria-hidden="true" />
                      </div>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      {t(CORP_UI.step)} {index + 1}
                    </p>
                    <h3 className="text-lg font-bold text-text mb-2">{t(step.title)}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{t(step.description)}</p>
                  </div>
                </Reveal>
              </li>
            )
          })}
        </ol>
        </div>
      </div>
    </section>
  )
}
