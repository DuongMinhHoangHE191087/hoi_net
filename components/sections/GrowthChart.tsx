'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Reveal from '@/components/ui/Reveal'
import { GROWTH, GROWTH_HIGHLIGHTS, UI, formatMilestoneDate, type Lang } from '@/lib/about-content'
import { useAboutLang } from './AboutLang'

const W = 800
const H = 320
const PAD = { left: 48, right: 28, top: 28, bottom: 44 }
const Y_MAX = 40
const Y_TICKS = [0, 10, 20, 30, 40]

const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

const points = GROWTH.map((p, i) => ({
  x: PAD.left + (i * innerW) / (GROWTH.length - 1),
  y: PAD.top + (1 - p.mau / Y_MAX) * innerH,
  ...p,
}))

/** Đường cong mượt (Catmull-Rom → Bézier) đi qua mọi điểm dữ liệu. */
function smoothPath(pts: { x: number; y: number }[]): string {
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-02" → "T2/26" | "Feb '26" */
function shortMonth(month: string, lang: Lang): string {
  const [year, m] = month.split('-')
  const yy = year.slice(2)
  return lang === 'vi' ? `T${Number(m)}/${yy}` : `${MONTHS_EN[Number(m) - 1]} '${yy}`
}

const linePath = smoothPath(points)
const last = points[points.length - 1]
const areaPath = `${linePath} L ${last.x} ${PAD.top + innerH} L ${points[0].x} ${PAD.top + innerH} Z`

/** Biểu đồ đường cong tăng trưởng MAU — đường vẽ dần khi cuộn tới. */
export default function GrowthChart() {
  const { lang, t } = useAboutLang()
  const reduce = useReducedMotion()
  const view = { once: true, amount: 0.3 } as const

  return (
    <section className="py-16 px-4 relative z-10" aria-labelledby="growth-title">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-10">
          <h2 id="growth-title" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-alt">{t(UI.growthTitle)}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(UI.growthSub)}</p>
        </Reveal>

        <Reveal direction="scale">
          <div className="glassmorphism-strong rounded-3xl p-4 sm:p-8">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto"
              role="img"
              aria-label={t(UI.growthMau)}
            >
              <defs>
                <linearGradient id="growth-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFC837" />
                  <stop offset="100%" stopColor="#FF6B9D" />
                </linearGradient>
                <linearGradient id="growth-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B9D" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#FFC837" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Lưới ngang + nhãn trục Y */}
              {Y_TICKS.map((tick) => {
                const y = PAD.top + (1 - tick / Y_MAX) * innerH
                return (
                  <g key={tick}>
                    <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#00000014" strokeDasharray="4 6" />
                    <text x={PAD.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                      {tick}K
                    </text>
                  </g>
                )
              })}

              {/* Nhãn trục X */}
              {points.map((p, i) =>
                i % 2 === 0 || i === points.length - 1 ? (
                  <text key={p.month} x={p.x} y={H - 16} textAnchor="middle" fontSize="12" fill="#6b7280">
                    {shortMonth(p.month, lang)}
                  </text>
                ) : null
              )}

              {/* Vùng tô dưới đường */}
              <motion.path
                d={areaPath}
                fill="url(#growth-area)"
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={view}
                transition={{ duration: 1, delay: 0.9 }}
              />

              {/* Đường chính — vẽ dần */}
              <motion.path
                d={linePath}
                fill="none"
                stroke="url(#growth-line)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={view}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              />

              {/* Các điểm dữ liệu */}
              {points.map((p, i) => (
                <motion.circle
                  key={p.month}
                  cx={p.x}
                  cy={p.y}
                  r={i === points.length - 1 ? 6 : 4}
                  fill="#fff"
                  stroke="#FF6B9D"
                  strokeWidth="3"
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={view}
                  transition={{ duration: 0.3, delay: 0.1 + (i / points.length) * 1.7 }}
                >
                  <title>{`${formatMilestoneDate(p.month, lang)}: ${p.mau}K`}</title>
                </motion.circle>
              ))}

              {/* Điểm cuối: vòng sóng + nhãn */}
              {!reduce && (
                <motion.circle
                  cx={last.x}
                  cy={last.y}
                  fill="#FF6B9D"
                  initial={{ r: 6, opacity: 0.5 }}
                  animate={{ r: 18, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 2 }}
                />
              )}
              <motion.g
                initial={reduce ? false : { opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={view}
                transition={{ duration: 0.5, delay: 1.9 }}
              >
                <rect x={last.x - 44} y={last.y - 40} width="52" height="24" rx="12" fill="#FF6B9D" />
                <text x={last.x - 18} y={last.y - 23} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
                  36K
                </text>
              </motion.g>
            </svg>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {GROWTH_HIGHLIGHTS.map((h) => (
                <div key={h.value} className="rounded-2xl bg-white/60 border border-white/70 px-4 py-4 text-center">
                  <div className="text-3xl font-extrabold gradient-text">{h.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{t(h.label)}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
