import { Building2, CalendarDays, Heart, MapPin, Clock, Mail, Phone, User, FileText, Target, Eye, Landmark } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { COMPANY } from '@/lib/company-info'

interface FactRow {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}

/** Tổng quan công ty: sứ mệnh, tầm nhìn và bảng thông tin pháp nhân. */
export default function CompanyOverview() {
  const facts: FactRow[] = [
    { icon: Building2, label: 'Đơn vị chủ quản', value: COMPANY.legalName },
    { icon: Heart, label: 'Loại hình', value: COMPANY.organizationType },
    { icon: CalendarDays, label: 'Thành lập', value: COMPANY.foundedLabel },
    { icon: User, label: 'Người sáng lập', value: `${COMPANY.founder.name} — ${COMPANY.founder.role}` },
    ...(COMPANY.taxCode ? [{ icon: FileText, label: 'Mã số thuế', value: COMPANY.taxCode }] : []),
    ...(COMPANY.businessLicense
      ? [{ icon: FileText, label: 'Giấy phép kinh doanh', value: COMPANY.businessLicense }]
      : []),
    ...(COMPANY.charterCapital
      ? [{ icon: Landmark, label: 'Vốn điều lệ', value: COMPANY.charterCapital }]
      : []),
    {
      icon: MapPin,
      label: 'Trụ sở',
      value: (
        <a
          href={COMPANY.address.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary hover:underline"
        >
          {COMPANY.address.full}
        </a>
      ),
    },
    { icon: Clock, label: 'Giờ làm việc', value: COMPANY.workingHours },
    {
      icon: Mail,
      label: 'Email',
      value: (
        <a href={`mailto:${COMPANY.emails.contact}`} className="hover:text-primary hover:underline">
          {COMPANY.emails.contact}
        </a>
      ),
    },
    {
      icon: Phone,
      label: 'Điện thoại',
      value: (
        <a href={`tel:${COMPANY.phoneRaw}`} className="hover:text-primary hover:underline">
          {COMPANY.phone}
        </a>
      ),
    },
  ]

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="company-overview-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="company-overview-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">Về {COMPANY.brandName}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {COMPANY.shortDescription}
          </p>
          <p className="mt-4 text-base sm:text-lg font-semibold text-primary">“{COMPANY.tagline}”</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sứ mệnh / Tầm nhìn / Phi lợi nhuận */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Reveal direction="left" delay={0.05}>
              <article className="h-full glassmorphism-strong p-6 rounded-3xl transition-shadow duration-300 hover:shadow-glow">
                <div className="w-12 h-12 mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Sứ mệnh</h3>
                <p className="text-gray-700 leading-relaxed">{COMPANY.mission}</p>
              </article>
            </Reveal>

            <Reveal direction="up" delay={0.15}>
              <article className="h-full glassmorphism-strong p-6 rounded-3xl transition-shadow duration-300 hover:shadow-glow">
                <div className="w-12 h-12 mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Tầm nhìn</h3>
                <p className="text-gray-700 leading-relaxed">{COMPANY.vision}</p>
              </article>
            </Reveal>

            <Reveal direction="up" delay={0.25} className="sm:col-span-2">
              <article className="glassmorphism-strong p-6 rounded-3xl transition-shadow duration-300 hover:shadow-glow">
                <div className="w-12 h-12 mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Cam kết phi lợi nhuận</h3>
                <p className="text-gray-700 leading-relaxed">{COMPANY.nonprofitNote}</p>
              </article>
            </Reveal>
          </div>

          {/* Thông tin pháp nhân */}
          <Reveal direction="right" delay={0.1} className="lg:col-span-2">
          <aside className="h-full glassmorphism-strong p-6 rounded-3xl" aria-label="Thông tin công ty">
            <h3 className="text-xl font-bold text-text mb-4">Thông tin công ty</h3>
            <dl className="space-y-4">
              {facts.map(({ icon: Icon, label, value }, index) => (
                <Reveal key={label} direction="up" delay={0.15 + index * 0.05} duration={0.5} className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
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
