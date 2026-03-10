'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Zap, Star, Users, Image as ImageIcon } from 'lucide-react'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider'

// Before/After showcase pairs (replace with real images when available)
const SHOWCASE_PAIRS = [
  {
    before: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect fill="%23f1f5f9" width="600" height="450"/><text fill="%2394a3b8" font-size="20" x="300" y="200" text-anchor="middle">Ảnh mờ, hỏng</text><line x1="50" y1="100" x2="550" y2="400" stroke="%23cbd5e1" stroke-width="3"/><circle cx="200" cy="180" r="60" fill="%23e2e8f0"/></svg>'),
    after: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23818cf8"/><stop offset="100%" stop-color="%23c084fc"/></linearGradient></defs><rect fill="url(%23g)" width="600" height="450"/><text fill="white" font-size="20" x="300" y="210" text-anchor="middle">Đã khôi phục bởi AI</text><circle cx="200" cy="180" r="60" fill="%23a5b4fc"/></svg>'),
    label: 'Phục hồi ảnh gia đình',
  },
  {
    before: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect fill="%23fef3c7" width="600" height="450"/><text fill="%23b45309" font-size="20" x="300" y="200" text-anchor="middle">Ảnh ố vàng, xước</text><rect x="100" y="120" width="400" height="200" fill="none" stroke="%23f59e0b" stroke-width="2" stroke-dasharray="10,5"/></svg>'),
    after: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient></defs><rect fill="url(%23g2)" width="600" height="450"/><text fill="white" font-size="20" x="300" y="210" text-anchor="middle">Sắc nét và tươi sáng</text><rect x="100" y="120" width="400" height="200" fill="none" stroke="white" stroke-width="2"/></svg>'),
    label: 'Nâng cấp chất lượng',
  },
]

const TRUST_BADGES = [
  { icon: Shield, label: 'Bảo mật SSL', desc: 'Dữ liệu được mã hóa' },
  { icon: Lock, label: 'An toàn dữ liệu', desc: 'Không chia sẻ ảnh' },
  { icon: Zap, label: 'Xử lý nhanh', desc: 'AI thế hệ mới' },
]

export default function SocialProofSection() {
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
            Được Tin Tưởng Bởi Hàng Ngàn Người Dùng
          </h2>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <AnimatedCounter
                end={10000}
                suffix="+"
                className="text-3xl md:text-4xl font-bold text-primary"
              />
              <p className="text-sm text-gray-600 mt-1">Ảnh đã xử lý</p>
            </div>
            <div className="text-center">
              <AnimatedCounter
                end={2500}
                suffix="+"
                className="text-3xl md:text-4xl font-bold text-purple-600"
              />
              <p className="text-sm text-gray-600 mt-1">Người dùng</p>
            </div>
            <div className="text-center">
              <AnimatedCounter
                end={98}
                suffix="%"
                className="text-3xl md:text-4xl font-bold text-green-600"
              />
              <p className="text-sm text-gray-600 mt-1">Hài lòng</p>
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
            Kết Quả Thực Tế
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SHOWCASE_PAIRS.map((pair, idx) => (
              <div key={idx} className="space-y-2">
                <BeforeAfterSlider
                  beforeImage={pair.before}
                  afterImage={pair.after}
                />
                <p className="text-center text-sm text-gray-600 font-medium">{pair.label}</p>
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
              key={label}
              className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
