'use client'

import { ShieldCheck, Lock, Gauge, UserCog, FileSearch, KeyRound, CheckCircle2 } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { CORP_UI, GOVERNANCE_ITEMS, SECURITY_ITEMS, type TrustItem } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'

const ICONS: Record<TrustItem['icon'], React.ComponentType<{ className?: string }>> = {
  shield: ShieldCheck,
  lock: Lock,
  gauge: Gauge,
  user: UserCog,
  file: FileSearch,
  key: KeyRound,
}

/** Tin cậy, bảo mật & quản trị — hai cột: biện pháp kỹ thuật và nguyên tắc quản trị. */
export default function TrustGovernance() {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="trust-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="trust-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(CORP_UI.trustTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">{t(CORP_UI.trustSub)}</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Bảo mật */}
          <div className="lg:col-span-3">
            <Reveal direction="left">
              <h3 className="text-xl font-bold text-text mb-4">{t(CORP_UI.securityHeading)}</h3>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SECURITY_ITEMS.map((item, index) => {
                const Icon = ICONS[item.icon]
                return (
                  <Reveal key={item.title.en} delay={(index % 2) * 0.1} direction="up">
                    <article className="group h-full glassmorphism-strong rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-blue">
                      <div className="w-11 h-11 mb-3 bg-gradient-blue rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
                        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <h4 className="font-bold text-text mb-1">{t(item.title)}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{t(item.description)}</p>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </div>

          {/* Quản trị */}
          <div className="lg:col-span-2">
            <Reveal direction="right">
              <h3 className="text-xl font-bold text-text mb-4">{t(CORP_UI.governanceHeading)}</h3>
            </Reveal>
            <Reveal direction="right" delay={0.1}>
              <ul className="glassmorphism-strong rounded-3xl p-6 space-y-5">
                {GOVERNANCE_ITEMS.map((item) => (
                  <li key={item.title.en} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-soft-green-DEFAULT" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-text">{t(item.title)}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{t(item.description)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
