'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { DEFAULT_LANG, LANG_COOKIE, LANG_COOKIE_MAX_AGE, type L, type Lang } from '@/lib/i18n'
import { COMMON } from '@/lib/site-i18n'

interface LanguageValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Chọn bản dịch theo ngôn ngữ hiện tại */
  t: (text: L) => string
}

const LanguageContext = createContext<LanguageValue | null>(null)

/**
 * Ngôn ngữ giao diện toàn website (EN mặc định, có VI).
 * - Server đọc cookie `site_lang` ở layout rồi truyền vào `initialLang`, nên HTML đầu tiên
 *   đã đúng ngôn ngữ: không bị nháy, và crawler (không có cookie) luôn nhận bản tiếng Anh.
 * - Khi đổi ngôn ngữ: ghi cookie, cập nhật <html lang> và render lại phía client.
 */
export function LanguageProvider({ children, initialLang = DEFAULT_LANG }: { children: ReactNode; initialLang?: Lang }) {
  const router = useRouter()
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; SameSite=Lax`
    // Render lại phần server (tiêu đề trang, JSON-LD) theo ngôn ngữ mới; state client được giữ nguyên
    router.refresh()
  }, [router])

  const value = useMemo<LanguageValue>(() => ({ lang, setLang, t: (text: L) => text[lang] }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang(): LanguageValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang phải được dùng bên trong <LanguageProvider>')
  return ctx
}

const OPTIONS: { value: Lang; short: string; label: string }[] = [
  { value: 'vi', short: 'VI', label: 'Tiếng Việt' },
  { value: 'en', short: 'EN', label: 'English' },
]

interface LanguageSwitchProps {
  className?: string
  /** Bản gọn cho thanh điều hướng */
  compact?: boolean
  /** Id riêng cho chỉ báo trượt để nhiều nút trên cùng trang không giành animation của nhau */
  indicatorId?: string
}

/** Nút chuyển Tiếng Việt / English dạng viên thuốc, có chỉ báo trượt. */
export function LanguageSwitch({ className = '', compact = false, indicatorId = 'lang-pill' }: LanguageSwitchProps) {
  const { lang, setLang, t } = useLang()

  return (
    <div
      role="group"
      aria-label={t(COMMON.languageLabel)}
      className={`inline-flex items-center rounded-full glassmorphism-strong border border-white/60 ${
        compact ? 'p-0.5' : 'p-1'
      } ${className}`}
    >
      {OPTIONS.map((opt) => {
        const active = lang === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLang(opt.value)}
            aria-pressed={active}
            title={opt.label}
            lang={opt.value}
            className={`relative rounded-full font-semibold transition-colors ${
              compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-1.5 text-sm'
            } ${active ? 'text-white' : 'text-gray-600 hover:text-primary'}`}
          >
            {active && (
              <motion.span
                layoutId={indicatorId}
                className="absolute inset-0 rounded-full bg-gradient-primary shadow-glow-pink"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{opt.short}</span>
          </button>
        )
      })}
    </div>
  )
}
