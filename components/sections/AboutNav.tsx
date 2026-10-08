'use client'

import { useEffect, useState } from 'react'
import { CORP_UI, SECTION_NAV } from '@/lib/about-corporate'
import { useAboutLang } from './AboutLang'

/**
 * Thanh điều hướng nhanh dính phía trên, đánh dấu mục đang xem.
 * Cuộn mượt tới từng section (tôn trọng "giảm chuyển động").
 */
export default function AboutNav() {
  const { t } = useAboutLang()
  const [active, setActive] = useState<string>(SECTION_NAV[0].id)

  // Chừa chỗ cho navbar cố định + thanh này khi cuộn tới neo
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.scrollPaddingTop
    root.style.scrollPaddingTop = '9.5rem'
    return () => {
      root.style.scrollPaddingTop = previous
    }
  }, [])

  // Theo dõi section đang nằm giữa màn hình
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    SECTION_NAV.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const go = (event: React.MouseEvent, id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav aria-label={t(CORP_UI.navLabel)} className="sticky top-24 z-40 px-4 -mt-4 mb-4 pointer-events-none">
      <div className="max-w-5xl mx-auto pointer-events-auto glassmorphism-strong rounded-full px-2 py-1.5 shadow-card-soft overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex items-center gap-1 w-max mx-auto">
          {SECTION_NAV.map(({ id, label }) => {
            const isActive = active === id
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => go(e, id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`block whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive ? 'bg-gradient-primary text-white shadow-glow-pink' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {t(label)}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
