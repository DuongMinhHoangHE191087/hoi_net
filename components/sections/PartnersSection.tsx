'use client'

import { ArrowRight, CheckCircle2, Clock, Cpu, Database, Cloud, Layers, ShieldCheck, Sparkles, Building, Landmark, Award } from 'lucide-react'
import Image from 'next/image'
import Reveal from '@/components/ui/Reveal'
import { COMPANY } from '@/lib/company-info'
import { HOINET_LOGO_URL } from '@/hooks/useSiteSettings'
import {
  CORP_UI,
  PARTNER_TIERS,
  TECH_PLATFORMS,
  PARTNERSHIP_PHASES,
  PARTNER_ORGS,
} from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

/** Render icon trực quan cho các nền tảng công nghệ đối tác */
function PlatformIcon({ type }: { type: string }) {
  switch (type) {
    case 'google':
      return (
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
      )
    case 'supabase':
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
          <Database className="w-5 h-5 text-emerald-500" />
        </div>
      )
    case 'cloudinary':
      return (
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
          <Cloud className="w-5 h-5 text-blue-500" />
        </div>
      )
    case 'vercel':
      return (
        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
          <Cpu className="w-5 h-5 text-purple-500" />
        </div>
      )
    default:
      return (
        <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600">
          <Layers className="w-5 h-5 text-pink-500" />
        </div>
      )
  }
}

/**
 * PartnersSection - Phiên bản doanh nghiệp toàn diện:
 * 1. Huy hiệu nhận diện Hồi Nét & Thông điệp đối tác
 * 2. Hạ tầng & Nền tảng công nghệ đối tác thật
 * 3. 4 Pha quy trình hợp tác chi tiết (Assessment -> Pilot -> Mass Restoration -> Delivery)
 * 4. Mạng lưới tổ chức & phân loại hợp tác
 */
export default function PartnersSection() {
  const { t } = useAboutLang()

  return (
    <section className="py-20 px-4 relative z-10" aria-labelledby="partners-title">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header với Logo Hồi Nét chính thức */}
        <Reveal className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glassmorphism-strong border border-white/60 mb-6 shadow-sm">
            <div className="relative w-6 h-6 shrink-0">
              <Image
                src={HOINET_LOGO_URL}
                alt={COMPANY.brandName}
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-gray-800 uppercase">
              {COMPANY.legalName} • Enterprise & Partner Network
            </span>
          </div>

          <h2 id="partners-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="gradient-text-alt">{t(CORP_UI.partnersTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">{t(CORP_UI.partnersSub)}</p>
        </Reveal>

        {/* 1. NỀN TẢNG CÔNG NGHỆ ĐỐI TÁC (Technology Foundation Cards) */}
        <div>
          <Reveal className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                {t(CORP_UI.poweredBy)}
              </h3>
              <p className="text-sm text-gray-600">
                Hệ thống vận hành trên các giải pháp trí tuệ nhân tạo và hạ tầng đám mây tin cậy nhất
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full w-fit">
              99.99% Uptime SLA
            </span>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TECH_PLATFORMS.map((platform, idx) => (
              <Reveal key={platform.name} delay={idx * 0.08}>
                <div className="glassmorphism-strong rounded-3xl p-6 h-full flex flex-col justify-between border border-white/70 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <PlatformIcon type={platform.iconType} />
                      <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 bg-white/80 px-2.5 py-1 rounded-full border border-gray-100">
                        {t(platform.category)}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{platform.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {t(platform.description)}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đang kết nối API trực tiếp</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* 2. CÁC PHA QUY TRÌNH HỢP TÁC (4-Phase Partnership Framework) */}
        <div>
          <Reveal className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 uppercase tracking-wider">
              Chuẩn hóa quy trình hợp tác
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t(CORP_UI.phasesTitle)}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">{t(CORP_UI.phasesSub)}</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PARTNERSHIP_PHASES.map((phaseItem, index) => {
              const tone = TONES[phaseItem.tone]
              return (
                <Reveal key={phaseItem.phase} delay={index * 0.1}>
                  <div
                    className={`h-full glassmorphism-strong rounded-3xl p-6 flex flex-col justify-between border border-white/80 transition-all duration-300 hover:-translate-y-1.5 ${tone.glow}`}
                  >
                    <div>
                      {/* Số thứ tự pha & Thời gian */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-2xl ${tone.gradient} text-white font-extrabold text-xl flex items-center justify-center shadow-md`}
                        >
                          {phaseItem.phase}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-white/70 px-2.5 py-1 rounded-full border border-gray-200">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{t(phaseItem.duration)}</span>
                        </div>
                      </div>

                      {/* Tiêu đề pha */}
                      <h4 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                        {t(phaseItem.title)}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5">
                        {t(phaseItem.subtitle)}
                      </p>

                      {/* Hạng mục bàn giao then chốt */}
                      <div className="space-y-2 border-t border-gray-100 pt-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          {t(CORP_UI.deliverablesLabel)}:
                        </p>
                        <ul className="space-y-1.5">
                          {phaseItem.deliverables.map((del, dIdx) => (
                            <li
                              key={dIdx}
                              className="text-xs text-gray-700 flex items-start gap-1.5 leading-snug"
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${tone.text}`} />
                              <span>{t(del)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* 3. MẠNG LƯỚI TỔ CHỨC ĐỐI TÁC VĂN HÓA & XÃ HỘI (Partner Network Organizations) */}
        <div>
          <Reveal className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-secondary" />
              {t(CORP_UI.partnerOrgsTitle)}
            </h3>
            <p className="text-sm text-gray-600">
              Đồng hành cùng các viện nghiên cứu, bảo tàng, trường đại học và hội nhiếp ảnh lịch sử
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PARTNER_ORGS.map((org, index) => (
              <Reveal key={org.name} delay={index * 0.08}>
                <div className="glassmorphism-strong rounded-3xl p-5 border border-white/70 h-full flex flex-col justify-between hover:border-primary/40 transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {t(org.badge)}
                      </span>
                      <span className="text-xs text-gray-400">{org.location}</span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mb-1.5">{org.name}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{t(org.role)}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-medium text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đối tác chiến lược
                    </span>
                    <span>Hợp tác tích cực</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* 4. CÁC HÌNH THỨC HỢP TÁC DOANH NGHIỆP (Partner Tiers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {PARTNER_TIERS.map((tier, index) => {
            const tone = TONES[tier.tone]
            return (
              <Reveal key={tier.title.en} delay={index * 0.1}>
                <article
                  className={`group h-full glassmorphism-strong rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 ${tone.glow}`}
                >
                  <div className={`h-1.5 w-12 rounded-full mb-4 ${tone.gradient}`} aria-hidden="true" />
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{t(tier.title)}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{t(tier.description)}</p>
                </article>
              </Reveal>
            )
          })}
        </div>

        {/* CTA Liên Hệ Hợp Tác Doanh Nghiệp */}
        <Reveal className="text-center pt-6">
          <div className="glassmorphism-strong max-w-3xl mx-auto rounded-3xl p-8 border border-white/80 shadow-lg">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center text-white shadow-glow-pink">
              <Building className="w-6 h-6" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              Khởi động dự án số hóa di sản cùng Hồi Nét
            </h4>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-xl mx-auto">
              Chúng tôi luôn sẵn sàng hỗ trợ các đơn vị giáo dục, bảo tàng và doanh nghiệp thiết lập giải pháp phục chế ảnh AI chuyên biệt theo chuẩn quốc tế.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`mailto:${COMPANY.emails.press}?subject=Dang%20ky%20hop%20tac%20doanh%20nghiep%20cung%20Hoi%20Net`}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-primary text-white font-bold shadow-glow-pink hover:shadow-glow transition-all hover:-translate-y-0.5"
              >
                {t(CORP_UI.partnerCta)}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glassmorphism-strong border border-gray-200 text-gray-800 font-semibold hover:border-primary/50 transition-colors"
              >
                Hotline: {COMPANY.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
