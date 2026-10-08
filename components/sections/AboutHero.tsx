'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronDown, Handshake, Rocket } from 'lucide-react'
import { HERO } from '@/lib/about-content'
import { useAboutLang, LanguageSwitch } from './AboutLang'

/** Hero trang About: tiêu đề, huy hiệu, nút CTA và chuyển ngôn ngữ. */
export default function AboutHero() {
  const { t } = useAboutLang()
  const reduce = useReducedMotion()

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section className="pt-28 sm:pt-32 pb-16 px-4 relative z-10 overflow-hidden" aria-labelledby="about-hero-title">
      {/* Quầng sáng trang trí */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-10 left-1/4 w-72 h-72 rounded-full bg-primary/15 blur-3xl animate-float" />
        <div className="absolute top-32 right-1/5 w-64 h-64 rounded-full bg-secondary/20 blur-3xl animate-float [animation-delay:1.5s]" />
      </div>

      <div className="max-w-5xl mx-auto relative text-center">
        <motion.div className="flex justify-end mb-8" {...fadeUp(0)}>
          <LanguageSwitch indicatorId="hero-lang-pill" />
        </motion.div>

        <motion.ul className="flex flex-wrap justify-center gap-2 mb-6" {...fadeUp(0.05)}>
          {HERO.badges.map((badge, i) => (
            <li
              key={badge.vi}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${
                i === 0
                  ? 'bg-gradient-primary text-white border-transparent shadow-glow-pink'
                  : 'glassmorphism-strong text-gray-700 border-white/60'
              }`}
            >
              {t(badge)}
            </li>
          ))}
        </motion.ul>

        <motion.h1
          id="about-hero-title"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-text"
          {...fadeUp(0.12)}
        >
          {t(HERO.title)}
          <br />
          <span className="gradient-text-alt">{t(HERO.highlight)}</span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-10"
          {...fadeUp(0.2)}
        >
          {t(HERO.subtitle)}
        </motion.p>

        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4" {...fadeUp(0.28)}>
          <Link
            href="/request-photo"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-primary text-white font-bold shadow-glow-pink hover:shadow-glow transition-all hover:-translate-y-0.5"
          >
            <Rocket className="w-5 h-5" aria-hidden="true" />
            {t(HERO.ctaPrimary)}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glassmorphism-strong border border-white/60 text-gray-800 font-semibold hover:text-primary transition-all hover:-translate-y-0.5"
          >
            <Handshake className="w-5 h-5" aria-hidden="true" />
            {t(HERO.ctaSecondary)}
          </Link>
        </motion.div>

        <motion.a
          href="#company-overview-title"
          className="mt-12 inline-flex flex-col items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
          {...fadeUp(0.4)}
        >
          {t(HERO.scroll)}
          <ChevronDown className="w-5 h-5 animate-bounce" aria-hidden="true" />
        </motion.a>
      </div>
    </section>
  )
}
