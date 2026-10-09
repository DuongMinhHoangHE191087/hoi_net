'use client'

import type { ReactNode } from 'react'
import Reveal from '@/components/ui/Reveal'
import { COMPANY_PROFILE, UI } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'

/** Biến email / website / số điện thoại thành liên kết bấm được. */
function renderValue(value: string): ReactNode {
  if (/^https?:\/\//.test(value)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
        {value.replace(/^https?:\/\//, '')}
      </a>
    )
  }
  if (/^[^\s@]+@[^\s@]+$/.test(value)) {
    return (
      <a href={`mailto:${value}`} className="hover:text-primary hover:underline break-all">
        {value}
      </a>
    )
  }
  if (/^0\d{2} \d{3} \d{4}$/.test(value)) {
    return (
      <a href={`tel:+84${value.replace(/\s/g, '').slice(1)}`} className="hover:text-primary hover:underline">
        {value}
      </a>
    )
  }
  return value
}

/**
 * Bảng hồ sơ doanh nghiệp song ngữ Việt – Anh.
 * Desktop: bảng 3 cột. Mobile: mỗi hạng mục là một thẻ xếp dọc.
 */
export default function CompanyProfileTable() {
  const { t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="profile-title">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glassmorphism-strong border border-white/60 mb-5 shadow-sm">
            <div className="relative w-7 h-7 shrink-0">
              <img
                src="https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png"
                alt="Hồi Nét"
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-gray-800 uppercase">
              Hồ Sơ Pháp Nhân & Nhận Diện Doanh Nghiệp
            </span>
          </div>

          <h2 id="profile-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(UI.profileTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(UI.profileSub)}</p>
        </Reveal>

        {/* Desktop / tablet: bảng */}
        <Reveal>
          <div className="hidden md:block glassmorphism-strong rounded-3xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{t(UI.profileTitle)}</caption>
              <thead>
                <tr className="bg-gradient-to-r from-primary-dark via-primary to-soft-orange-DEFAULT text-white">
                  <th scope="col" className="px-5 py-3.5 font-bold w-1/5">
                    {UI.colItem.vi} / {UI.colItem.en}
                  </th>
                  <th scope="col" lang="vi" className="px-5 py-3.5 font-bold w-2/5">
                    {UI.colVi.vi} · Vietnamese
                  </th>
                  <th scope="col" lang="en" className="px-5 py-3.5 font-bold w-2/5">
                    English · {UI.colEn.vi}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPANY_PROFILE.map((row, i) => (
                  <tr
                    key={row.item.en}
                    className={`align-top border-t border-white/60 transition-colors hover:bg-primary/5 ${
                      i % 2 === 0 ? 'bg-white/40' : 'bg-white/15'
                    }`}
                  >
                    <th scope="row" className="px-5 py-3.5 font-semibold text-text">
                      <span lang="vi">{row.item.vi}</span>
                      <span className="block text-xs font-normal text-gray-500" lang="en">
                        {row.item.en}
                      </span>
                    </th>
                    <td lang="vi" className="px-5 py-3.5 text-gray-800 leading-relaxed">
                      {renderValue(row.vi)}
                    </td>
                    <td lang="en" className="px-5 py-3.5 text-gray-800 leading-relaxed">
                      {renderValue(row.en)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* Mobile: thẻ xếp dọc */}
        <div className="md:hidden space-y-3">
          {COMPANY_PROFILE.map((row, i) => (
            <Reveal key={row.item.en} direction="up" delay={Math.min(i, 4) * 0.04} duration={0.5}>
              <div className="glassmorphism-strong rounded-2xl p-4">
                <p className="text-sm font-bold text-text">
                  {row.item.vi}
                  <span className="font-normal text-gray-500"> / {row.item.en}</span>
                </p>
                <p className="mt-2 text-sm text-gray-800" lang="vi">
                  <span className="mr-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">VI</span>
                  {renderValue(row.vi)}
                </p>
                <p className="mt-1.5 text-sm text-gray-800" lang="en">
                  <span className="mr-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-soft-blue-bg text-soft-blue-DEFAULT">
                    EN
                  </span>
                  {renderValue(row.en)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
