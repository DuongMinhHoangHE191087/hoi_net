'use client'

import { useState, useEffect, useCallback } from 'react'

interface CaptchaSettings {
  enabled: boolean
  threshold_attempts: number
  forms: {
    login: boolean
    register: boolean
    forgot_password: boolean
    request_form: boolean
  }
  siteKey: string
}

interface RateLimitSettings {
  enabled: boolean
  login_max_attempts: number
  request_max_per_hour: number
}

interface AuthSettings {
  captcha: CaptchaSettings
  rateLimit: RateLimitSettings
}

const DEFAULT_SETTINGS: AuthSettings = {
  captcha: {
    enabled: true,
    threshold_attempts: 3,
    forms: { login: true, register: true, forgot_password: true, request_form: true },
    siteKey: '10000000-ffff-ffff-ffff-000000000001',
  },
  rateLimit: {
    enabled: true,
    login_max_attempts: 5,
    request_max_per_hour: 10,
  }
}

// Cache settings in memory
let cachedSettings: AuthSettings | null = null
let cacheTime = 0
const CACHE_TTL = 60 * 1000 // 1 minute

export function useAuthSettings() {
  const [settings, setSettings] = useState<AuthSettings>(cachedSettings || DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(!cachedSettings)

  const fetchSettings = useCallback(async () => {
    // Use cache if fresh
    if (cachedSettings && Date.now() - cacheTime < CACHE_TTL) {
      console.log('[useAuthSettings] Using cached settings:', cachedSettings.captcha)
      setSettings(cachedSettings)
      setLoading(false)
      return
    }

    try {
      console.log('[useAuthSettings] Fetching settings from API...')
      const res = await fetch('/api/auth/settings')
      if (res.ok) {
        const data = await res.json()
        console.log('[useAuthSettings] Received settings:', data.captcha)
        cachedSettings = data
        cacheTime = Date.now()
        setSettings(data)
      } else {
        console.error('[useAuthSettings] API error:', res.status)
      }
    } catch (error) {
      console.error('[useAuthSettings] Error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { settings, loading, refetch: fetchSettings }
}

// Hook to track failed attempts with localStorage persistence
export function useFailedAttempts(formType: 'login' | 'register' | 'forgot_password' | 'request_form') {
  const storageKey = `failed_attempts_${formType}`
  
  const [attempts, setAttempts] = useState(() => {
    if (typeof window === 'undefined') return 0
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const { count, expiry } = JSON.parse(stored)
      if (Date.now() < expiry) {
        return count
      }
      localStorage.removeItem(storageKey)
    }
    return 0
  })

  const increment = useCallback(() => {
    const newCount = attempts + 1
    setAttempts(newCount)
    // Store with 1 hour expiry
    localStorage.setItem(storageKey, JSON.stringify({
      count: newCount,
      expiry: Date.now() + 60 * 60 * 1000
    }))
    return newCount
  }, [attempts, storageKey])

  const reset = useCallback(() => {
    setAttempts(0)
    localStorage.removeItem(storageKey)
  }, [storageKey])

  return { attempts, increment, reset }
}
