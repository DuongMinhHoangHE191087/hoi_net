'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Zap, Star, Users, Image as ImageIcon } from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider'
import { useLang } from '@/contexts/LanguageContext'
import { H } from '@/lib/landing-i18n'

// Before/After showcase pairs (placeholder mockups - replace with real
// restoration photos when available; see note in SocialProofSection below)
/** Ảnh minh họa SVG; chữ trong ảnh đổi theo ngôn ngữ */
function buildShowcasePairs(lang: 'vi' | 'en') {
  const T = {
    blurry: { vi: 'Ảnh mờ, hỏng', en: 'Blurry, damaged photo' },
    restored: { vi: 'Đã khôi phục bởi AI', en: 'Restored by AI' },
    yellowed: { vi: 'Ảnh ố vàng, xước', en: 'Yellowed, scratched photo' },
    sharp: { vi: 'Sắc nét và tươi sáng', en: 'Sharp and vibrant' },
  }
  return [
  {
    before: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect fill="#f1f5f9" width="600" height="450"/><text fill="#94a3b8" font-size="20" x="300" y="200" text-anchor="middle">' + T.blurry[lang] + '</text><line x1="50" y1="100" x2="550" y2="400" stroke="#cbd5e1" stroke-width="3"/><circle cx="200" cy="180" r="60" fill="#e2e8f0"/></svg>'),
    after: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#c084fc"/></linearGradient></defs><rect fill="url(#g)" width="600" height="450"/><text fill="white" font-size="20" x="300" y="210" text-anchor="middle">' + T.restored[lang] + '</text><circle cx="200" cy="180" r="60" fill="#a5b4fc"/></svg>'),
    label: H.proofFamily,
  },
  {
    before: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect fill="#fef3c7" width="600" height="450"/><text fill="#b45309" font-size="20" x="300" y="200" text-anchor="middle">' + T.yellowed[lang] + '</text><rect x="100" y="120" width="400" height="200" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="10,5"/></svg>'),
    after: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><rect fill="url(#g2)" width="600" height="450"/><text fill="white" font-size="20" x="300" y="210" text-anchor="middle">' + T.sharp[lang] + '</text><rect x="100" y="120" width="400" height="200" fill="none" stroke="white" stroke-width="2"/></svg>'),
    label: H.proofQuality,
  },
]
}

const TRUST_BADGES = [
  { icon: Shield, label: H.badgeSsl, desc: H.badgeSslDesc },
  { icon: Lock, label: H.badgeSafe, desc: H.badgeSafeDesc },
  { icon: Zap, label: H.badgeFast, desc: H.badgeFastDesc },
]

export default function SocialProofSection() {
  const { lang, t } = useLang()
  const SHOWCASE_PAIRS = buildShowcasePairs(lang)
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Stats Counter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-8">
            {t(H.proofTitle)}
          </h2>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <AnimatedCounter
                end={128000}
                suffix="+"
                compact={false}
                className="text-3xl md:text-4xl font-bold text-primary"
              />
              <p className="text-sm text-gray-600 mt-1">{t(H.proofPhotos)}</p>
            </div>
            <div className="text-center">
              <AnimatedCounter
                end={36000}
                suffix="+"
                compact={false}
                className="text-3xl md:text-4xl font-bold text-purple-600"
              />
              <p className="text-sm text-gray-600 mt-1">{t(H.proofUsers)}</p>
            </div>
            <div className="text-center">
              <AnimatedCounter
                end={98}
                suffix="%"
                className="text-3xl md:text-4xl font-bold text-green-600"
              />
              <p className="text-sm text-gray-600 mt-1">{t(H.proofSatisfied)}</p>
            </div>
          </div>
        </motion.div>

        {/* Before/After Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            {t(H.proofResults)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SHOWCASE_PAIRS.map((pair, idx) => (
              <div key={idx} className="space-y-2">
                <BeforeAfterSlider
                  beforeImage={pair.before}
                  afterImage={pair.after}
                  beforeLabel={t(H.beforeLabel)}
                  afterLabel={t(H.afterLabel)}
                />
                <p className="text-center text-sm text-gray-600 font-medium">{t(pair.label)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label.en}
              className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{t(label)}</p>
                <p className="text-xs text-gray-500">{t(desc)}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
