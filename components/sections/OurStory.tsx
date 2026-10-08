'use client'

import { Quote } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { COMPANY } from '@/lib/company-info'
import { COMPANY_EN, STORY, UI } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'

/** Câu chuyện thương hiệu: đoạn kể bên trái, trích dẫn nhà sáng lập bên phải. */
export default function OurStory() {
  const { lang, t } = useAboutLang()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="our-story-title">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-3">
          <Reveal direction="left">
            <h2 id="our-story-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
              <span className="gradient-text-alt">{t(UI.storyTitle)}</span>
            </h2>
          </Reveal>
          <div className="space-y-5">
            {STORY.paragraphs.map((paragraph, i) => (
              <Reveal key={paragraph.vi} direction="up" delay={0.1 + i * 0.12}>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">{t(paragraph)}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal direction="right" delay={0.2} className="lg:col-span-2">
          <figure className="relative glassmorphism-strong rounded-3xl p-8 sm:p-10 overflow-hidden">
            <Quote className="absolute -top-2 -left-2 w-24 h-24 text-primary/10" aria-hidden="true" />
            <blockquote className="relative text-xl sm:text-2xl font-bold leading-snug text-text">
              “{t(STORY.quote)}”
            </blockquote>
            <figcaption className="relative mt-6 flex items-center gap-3">
              <span
                className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-extrabold shadow-md"
                aria-hidden="true"
              >
                DH
              </span>
              <span>
                <span className="block font-bold text-text">{COMPANY.founder.name}</span>
                <span className="block text-sm text-gray-600">
                  {lang === 'en' ? COMPANY_EN.founderRole : COMPANY.founder.role}
                </span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
