'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { CORP_UI, FAQS } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'

/** Câu hỏi thường gặp dạng accordion truy cập được (aria-expanded / aria-controls). */
export default function AboutFAQ() {
  const { t } = useAboutLang()
  const reduce = useReducedMotion()
  const baseId = useId()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="faq-title">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-10">
          <h2 id="faq-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(CORP_UI.faqTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700">{t(CORP_UI.faqSub)}</p>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((item, index) => {
            const isOpen = open === index
            const panelId = `${baseId}-panel-${index}`
            const buttonId = `${baseId}-button-${index}`
            return (
              <Reveal key={item.q.en} direction="up" delay={Math.min(index, 4) * 0.05} duration={0.5}>
                <div
                  className={`glassmorphism-strong rounded-2xl overflow-hidden transition-shadow duration-300 ${
                    isOpen ? 'shadow-glow-pink' : ''
                  }`}
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className={`font-semibold transition-colors ${isOpen ? 'text-primary' : 'text-text'}`}>
                        {t(item.q)}
                      </span>
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen ? 'bg-gradient-primary text-white rotate-45' : 'bg-primary/10 text-primary'
                        }`}
                        aria-hidden="true"
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-gray-700 leading-relaxed">{t(item.a)}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
