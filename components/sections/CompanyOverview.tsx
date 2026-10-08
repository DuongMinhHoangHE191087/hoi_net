'use client'

import { Building2, CalendarDays, Heart, MapPin, Clock, Mail, Phone, User, FileText, Target, Eye, Landmark } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { COMPANY } from '@/lib/company-info'
import { COMPANY_EN, OVERVIEW_CHIPS, UI, type L } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'

interface FactRow {
  icon: React.ComponentType<{ className?: string }>
  label: L
  value: React.ReactNode
}

const linkClass = 'hover:text-primary hover:underline'

/** Tổng quan công ty: sứ mệnh, tầm nhìn và bảng thông tin pháp nhân (song ngữ). */
export default function CompanyOverview() {
  const { lang, t } = useAboutLang()
  const en = lang === 'en'

  const facts: FactRow[] = [
    {
      icon: Building2,
      label: { vi: 'Đơn vị chủ quản', en: 'Parent company' },
      value: en ? COMPANY.legalNameEn : COMPANY.legalName,
    },
    {
      icon: Heart,
      label: { vi: 'Loại hình', en: 'Type' },
      value: en ? COMPANY_EN.organizationType : COMPANY.organizationType,
    },
    {
      icon: CalendarDays,
      label: { vi: 'Thành lập', en: 'Founded' },
      value: en ? 'September 2025' : COMPANY.foundedLabel,
    },
    {
      icon: User,
      label: { vi: 'Người sáng lập', en: 'Founder' },
      value: `${COMPANY.founder.name} — ${en ? COMPANY_EN.founderRole : COMPANY.founder.role}`,
    },
    ...(COMPANY.taxCode
      ? [{ icon: FileText, label: { vi: 'Mã số thuế', en: 'Tax code' }, value: COMPANY.taxCode }]
      : []),
    ...(COMPANY.businessLicense
      ? [
          {
            icon: FileText,
            label: { vi: 'Giấy phép kinh doanh', en: 'Business licence' },
            value: en ? COMPANY_EN.businessLicense : COMPANY.businessLicense,
          },
        ]
      : []),
    ...(COMPANY.charterCapital
      ? [
          {
            icon: Landmark,
            label: { vi: 'Vốn điều lệ', en: 'Charter capital' },
            value: en ? COMPANY_EN.charterCapital : COMPANY.charterCapital,
          },
        ]
      : []),
    {
      icon: MapPin,
      label: { vi: 'Trụ sở', en: 'Headquarters' },
      value: (
        <a href={COMPANY.address.mapUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {en ? COMPANY_EN.addressFull : COMPANY.address.full}
        </a>
      ),
    },
    {
      icon: Clock,
      label: { vi: 'Giờ làm việc', en: 'Working hours' },
      value: en ? COMPANY_EN.workingHours : COMPANY.workingHours,
    },
    {
      icon: Mail,
      label: { vi: 'Email', en: 'Email' },
      value: (
        <a href={`mailto:${COMPANY.emails.contact}`} className={linkClass}>
          {COMPANY.emails.contact}
        </a>
      ),
    },
    {
      icon: Phone,
      label: { vi: 'Điện thoại', en: 'Phone' },
      value: (
        <a href={`tel:${COMPANY.phoneRaw}`} className={linkClass}>
          {COMPANY.phone}
        </a>
      ),
    },
  ]

  const cards: { icon: typeof Target; title: L; text: string; chips: L[]; delay: number; wide?: boolean }[] = [
    { icon: Target, title: UI.mission, text: en ? COMPANY_EN.mission : COMPANY.mission, chips: OVERVIEW_CHIPS.mission, delay: 0.05 },
    { icon: Eye, title: UI.vision, text: en ? COMPANY_EN.vision : COMPANY.vision, chips: OVERVIEW_CHIPS.vision, delay: 0.15 },
    {
      icon: Heart,
      title: UI.nonprofit,
      text: en ? COMPANY_EN.nonprofitNote : COMPANY.nonprofitNote,
      chips: OVERVIEW_CHIPS.nonprofit,
      delay: 0.25,
      wide: true,
    },
  ]

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="company-overview-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="company-overview-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 scroll-mt-28">
            <span className="gradient-text-alt">{t(UI.overviewTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {en ? COMPANY_EN.shortDescription : COMPANY.shortDescription}
          </p>
          <p className="mt-4 text-base sm:text-lg font-semibold text-primary">
            “{en ? COMPANY_EN.tagline : COMPANY.tagline}”
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map(({ icon: Icon, title, text, chips, delay, wide }, i) => (
              <Reveal
                key={title.vi}
                direction={i === 0 ? 'left' : 'up'}
                delay={delay}
                className={wide ? 'sm:col-span-2' : undefined}
              >
                <article className="flex h-full flex-col glassmorphism-strong p-6 rounded-3xl transition-shadow duration-300 hover:shadow-glow">
                  <div className="w-12 h-12 mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-2">{t(title)}</h3>
                  <p className="text-gray-700 leading-relaxed">{text}</p>
                  <ul className="mt-auto pt-5 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <li key={chip.en} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {t(chip)}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal direction="right" delay={0.1} className="lg:col-span-2">
            <aside className="h-full glassmorphism-strong p-6 rounded-3xl" aria-label={t(UI.companyInfo)}>
              <h3 className="text-xl font-bold text-text mb-4">{t(UI.companyInfo)}</h3>
              <dl className="space-y-4">
                {facts.map(({ icon: Icon, label, value }, index) => (
                  <Reveal
                    key={label.vi}
                    direction="up"
                    delay={0.15 + index * 0.05}
                    duration={0.5}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs uppercase tracking-wide text-gray-500">{t(label)}</dt>
                      <dd className="text-sm text-gray-800 font-medium break-words">{value}</dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
