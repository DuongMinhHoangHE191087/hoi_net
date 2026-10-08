'use client'

import Link from 'next/link'
import { Wand2, Palette, ScanFace, Users, Layers, Archive, ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { CORP_UI, SERVICES, type ServiceItem } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

const ICONS: Record<ServiceItem['icon'], React.ComponentType<{ className?: string }>> = {
  wand: Wand2,
  palette: Palette,
  face: ScanFace,
  users: Users,
  layers: Layers,
  archive: Archive,
}

const LEARN_MORE = { vi: 'Tìm hiểu thêm', en: 'Learn more' }

/** "Chúng tôi làm gì": lưới dịch vụ, mỗi thẻ là một liên kết. */
export default function ServicesGrid() {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="services-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="services-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(CORP_UI.servicesTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">{t(CORP_UI.servicesSub)}</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => {
            const Icon = ICONS[service.icon]
            const tone = TONES[service.tone]
            return (
              <Reveal key={service.title.en} delay={(index % 3) * 0.1}>
                <Link
                  href={service.href}
                  className={`group relative flex h-full flex-col glassmorphism-strong rounded-3xl p-7 transition-all duration-300 hover:-translate-y-2 ${tone.glow}`}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-14 h-14 ${tone.gradient} rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                    >
                      <Icon className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${tone.soft} ${tone.text}`}>
                      {t(service.tag)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-text mb-2">{t(service.title)}</h3>
                  <p className="text-gray-700 leading-relaxed flex-1">{t(service.description)}</p>
                  <span className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${tone.text}`}>
                    {t(LEARN_MORE)}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
