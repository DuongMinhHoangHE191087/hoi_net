/**
 * Captcha Settings Service
 * Manages captcha configuration from admin settings
 */

import { dbServer } from '@/lib/supabase/db-server'

export interface CaptchaSettings {
  enabled: boolean
  threshold_attempts: number  // Show captcha after this many failed attempts
  forms: {
    login: boolean
    register: boolean
    forgot_password: boolean
    request_form: boolean
  }
}

const DEFAULT_SETTINGS: CaptchaSettings = {
  enabled: true,
  threshold_attempts: 3,
  forms: {
    login: true,
    register: true,
    forgot_password: true,
    request_form: true,
  }
}

// Server-side function to get captcha settings
export async function getCaptchaSettings(): Promise<CaptchaSettings> {
  try {
    const setting = await dbServer.getSiteSetting('captcha_settings')
    if (setting?.value) {
      const parsed = typeof setting.value === 'string' 
        ? JSON.parse(setting.value) 
        : setting.value
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.error('[CaptchaService] Error loading settings:', error)
  }
  return DEFAULT_SETTINGS
}

// Server-side function to update captcha settings
export async function updateCaptchaSettings(settings: Partial<CaptchaSettings>): Promise<boolean> {
  try {
    const current = await getCaptchaSettings()
    const updated = { ...current, ...settings }
    await dbServer.updateSiteSetting('captcha_settings', JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('[CaptchaService] Error updating settings:', error)
    return false
  }
}
