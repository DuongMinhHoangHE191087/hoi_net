/**
 * Kiểu và tiện ích dùng chung cho đa ngôn ngữ (VI/EN) trên toàn website.
 * Văn bản song ngữ có dạng { vi, en }. Không import React nên dùng được ở server lẫn client.
 */

export type Lang = 'vi' | 'en'

export interface L {
  vi: string
  en: string
}

/** Ngôn ngữ mặc định của website (khi người dùng chưa chọn) */
export const DEFAULT_LANG: Lang = 'en'
/** Tên cookie lưu lựa chọn ngôn ngữ — server đọc để render đúng ngôn ngữ ngay từ HTML đầu tiên */
export const LANG_COOKIE = 'site_lang'
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isLang(value: unknown): value is Lang {
  return value === 'vi' || value === 'en'
}

/** Chọn bản dịch theo ngôn ngữ */
export function pick(text: L, lang: Lang): string {
  return text[lang]
}
