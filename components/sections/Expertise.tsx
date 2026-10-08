'use client'

import { motion, useReducedMotion } from 'framer-motion'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import Reveal from '@/components/ui/Reveal'
import { EXPERIENCE_STATS, EXPERTISE, TECH_STACK, UI } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'
import { TONES } from './aboutTone'

/** Chuyên môn (thanh năng lực), chỉ số kinh nghiệm và nền tảng công nghệ. */
export default function Expertise() {
  const { t } = useAboutLang()
  const reduce = useReducedMotion()

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="expertise-title">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 id="expertise-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(UI.expertiseTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">{t(UI.expertiseSub)}</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thanh năng lực */}
          <Reveal direction="left">
            <div className="h-full glassmorphism-strong rounded-3xl p-6 sm:p-8 space-y-6">
              {EXPERTISE.map((skill, i) => {
                const tone = TONES[skill.tone]
                return (
                  <div key={skill.label.vi}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-text">{t(skill.label)}</span>
                      <span className={`text-sm font-bold tabular-nums ${tone.text}`}>{skill.level}%</span>
                    </div>
                    <div
                      className="h-3 rounded-full bg-gray-200/70 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={t(skill.label)}
                    >
                      <motion.div
                        className={`h-full rounded-full ${tone.gradient}`}
                        initial={reduce ? { width: `${skill.level}%` } : { width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ duration: 1.2, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Reveal>

          {/* Chỉ số kinh nghiệm + công nghệ */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              {EXPERIENCE_STATS.map((s, i) => (
                <Reveal key={s.label.vi} direction="scale" delay={i * 0.08}>
                  <div className="h-full glassmorphism-strong rounded-3xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                    <div className="text-3xl sm:text-4xl font-extrabold gradient-text tabular-nums">
                      <AnimatedCounter end={s.value} suffix={s.suffix} compact={false} />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-snug">{t(s.label)}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal direction="right" delay={0.1}>
              <div className="glassmorphism-strong rounded-3xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-text mb-4">{t(UI.techStack)}</h3>
                <ul className="flex flex-wrap gap-2">
                  {TECH_STACK.map((tech, i) => (
                    <motion.li
                      key={tech}
                      className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-white/70 border border-white/80 text-gray-700 hover:text-primary hover:border-primary/40 transition-colors"
                      initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                    >
                      {tech}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
