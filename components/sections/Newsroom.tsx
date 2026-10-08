'use client'

import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { COMPANY } from '@/lib/company-info'
import { CORP_UI, NEWS, formatNewsDate } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

/** Tin tức & cập nhật: một bài nổi bật lớn và các bài còn lại. */
export default function Newsroom() {
  const { lang, t } = useAboutLang()
  const [featured, ...rest] = NEWS
  const featuredTone = TONES[featured.tone]

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="news-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="news-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(CORP_UI.newsTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(CORP_UI.newsSub)}</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Bài nổi bật */}
          <Reveal direction="left" className="lg:col-span-3">
            <article
              className={`group relative flex h-full flex-col justify-center overflow-hidden glassmorphism-strong rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:-translate-y-1 ${featuredTone.glow}`}
            >
              <div className={`absolute inset-x-0 top-0 h-2 ${featuredTone.gradient}`} aria-hidden="true" />
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${featuredTone.soft} ${featuredTone.text}`}>
                  {t(featured.category)}
                </span>
                <time dateTime={featured.date} className="text-sm text-gray-500">
                  {formatNewsDate(featured.date, lang)}
                </time>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text leading-tight mb-4">{t(featured.title)}</h3>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">{t(featured.excerpt)}</p>
              {featured.highlight && (
                <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                  {featured.highlight.map((item) => (
                    <div key={item.value} className="rounded-2xl bg-white/60 border border-white/70 px-3 py-4 text-center">
                      <dt className="text-2xl sm:text-3xl font-extrabold gradient-text">{item.value}</dt>
                      <dd className="mt-1 text-xs sm:text-sm text-gray-600 leading-snug">{t(item.label)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </article>
          </Reveal>

          {/* Các bài còn lại */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {rest.map((item, index) => {
              const tone = TONES[item.tone]
              return (
                <Reveal key={item.date} direction="right" delay={index * 0.1}>
                  <article
                    className={`group glassmorphism-strong rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${tone.glow}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tone.soft} ${tone.text}`}>
                        {t(item.category)}
                      </span>
                      <time dateTime={item.date} className="text-xs text-gray-500">
                        {formatNewsDate(item.date, lang)}
                      </time>
                    </div>
                    <h3 className="font-bold text-text leading-snug mb-1">{t(item.title)}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{t(item.excerpt)}</p>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>

        <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full glassmorphism-strong border border-white/60 text-gray-800 font-semibold hover:text-primary transition-all hover:-translate-y-0.5"
          >
            {t(CORP_UI.allNews)}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <a
            href={`mailto:${COMPANY.emails.press}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            {t(CORP_UI.pressContact)}: {COMPANY.emails.press}
          </a>
        </Reveal>
      </div>
    </section>
  )
}
