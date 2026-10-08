import { cookies } from 'next/headers'
import { DEFAULT_LANG, isLang, LANG_COOKIE, type Lang } from './i18n'

/** Ngôn ngữ của request hiện tại, đọc từ cookie; chưa có thì dùng mặc định (tiếng Anh). */
export async function getRequestLang(): Promise<Lang> {
  try {
    const value = (await cookies()).get(LANG_COOKIE)?.value
    return isLang(value) ? value : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}
