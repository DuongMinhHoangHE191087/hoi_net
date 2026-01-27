/**
 * Rate Limit Settings Service
 * Manages request rate limits from admin settings
 */

import { dbServer } from '@/lib/supabase/db-server'

export interface RateLimitSettings {
  enabled: boolean
  // Login limits
  login_max_attempts: number
  login_window_minutes: number
  login_block_minutes: number
  // Register limits
  register_max_per_hour: number
  register_max_per_day: number
  // Request form limits
  request_max_per_hour: number
  request_max_per_day: number
  // Password reset limits
  password_reset_max_per_hour: number
}

const DEFAULT_SETTINGS: RateLimitSettings = {
  enabled: true,
  login_max_attempts: 5,
  login_window_minutes: 15,
  login_block_minutes: 30,
  register_max_per_hour: 5,
  register_max_per_day: 10,
  request_max_per_hour: 10,
  request_max_per_day: 50,
  password_reset_max_per_hour: 3,
}

// Server-side function to get rate limit settings
export async function getRateLimitSettings(): Promise<RateLimitSettings> {
  try {
    const setting = await dbServer.getSiteSetting('rate_limit_settings')
    if (setting?.value) {
      const parsed = typeof setting.value === 'string'
        ? JSON.parse(setting.value)
        : setting.value
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.error('[RateLimitService] Error loading settings:', error)
  }
  return DEFAULT_SETTINGS
}

// Server-side function to update rate limit settings
export async function updateRateLimitSettings(settings: Partial<RateLimitSettings>): Promise<boolean> {
  try {
    const current = await getRateLimitSettings()
    const updated = { ...current, ...settings }
    await dbServer.updateSiteSetting('rate_limit_settings', JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('[RateLimitService] Error updating settings:', error)
    return false
  }
}

// In-memory rate limit tracker (for server-side use)
const rateLimitStore = new Map<string, { count: number; resetAt: number; blockedUntil?: number }>()

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
  blockMs?: number
): { allowed: boolean; remaining: number; resetIn: number; blocked: boolean } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // Check if blocked
  if (record?.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((record.blockedUntil - now) / 1000),
      blocked: true,
    }
  }

  // Reset if window expired
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetIn: Math.ceil(windowMs / 1000),
      blocked: false,
    }
  }

  // Check if exceeded
  if (record.count >= maxAttempts) {
    // Block if blockMs is set
    if (blockMs) {
      record.blockedUntil = now + blockMs
    }
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((record.resetAt - now) / 1000),
      blocked: !!blockMs,
    }
  }

  // Increment
  record.count++
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetIn: Math.ceil((record.resetAt - now) / 1000),
    blocked: false,
  }
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}

// Get failed attempts count for a key
export function getFailedAttempts(key: string): number {
  const record = rateLimitStore.get(key)
  return record?.count || 0
}
