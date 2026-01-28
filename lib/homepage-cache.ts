/**
 * Homepage Cache Utilities
 * 
 * NGUYÊN TẮC:
 * 1. Luôn trả về dữ liệu (từ cache hoặc database)
 * 2. Cache chỉ là optimization, KHÔNG phải requirement
 * 3. Khi Redis lỗi → fallback database → app vẫn chạy
 * 4. Hỗ trợ concurrent requests (nhiều user cùng lúc)
 */

import {
  getTeamMembers as dbGetTeamMembers,
  getValueSections as dbGetValueSections,
  getTestimonials as dbGetTestimonials,
  getAllSiteSettings as dbGetSiteSettings,
  getServices as dbGetFeatures,
} from '@/lib/supabase/server-utils'
import {
  getCachedData,
  setCachedData,
  CACHE_CONFIG,
} from '@/lib/redis'

/**
 * Get team members with Redis caching
 * Fallback: Database query (always works)
 */
export async function getTeamMembersWithCache(): Promise<any[]> {
  // Try cache first
  const cached = await getCachedData<any[]>(CACHE_CONFIG.TEAM_MEMBERS.key)
  if (cached) {
    return cached
  }

  // Fallback to database
  const data = await dbGetTeamMembers()

  // Cache for next time (async, non-blocking)
  setCachedData(CACHE_CONFIG.TEAM_MEMBERS.key, data, CACHE_CONFIG.TEAM_MEMBERS.ttl)

  return data
}

/**
 * Get value sections with Redis caching
 */
export async function getValueSectionsWithCache(): Promise<any[]> {
  const cached = await getCachedData<any[]>(CACHE_CONFIG.VALUE_SECTIONS.key)
  if (cached) {
    return cached
  }

  const data = await dbGetValueSections()
  setCachedData(CACHE_CONFIG.VALUE_SECTIONS.key, data, CACHE_CONFIG.VALUE_SECTIONS.ttl)

  return data
}

/**
 * Get features/services with Redis caching
 */
export async function getFeaturesWithCache(): Promise<any[]> {
  const cached = await getCachedData<any[]>(CACHE_CONFIG.FEATURES.key)
  if (cached) {
    return cached
  }

  const data = await dbGetFeatures()
  setCachedData(CACHE_CONFIG.FEATURES.key, data, CACHE_CONFIG.FEATURES.ttl)

  return data
}

/**
 * Get testimonials with Redis caching
 * Shorter TTL because new testimonials can be added
 */
export async function getTestimonialsWithCache(limit = 6): Promise<any[]> {
  const cached = await getCachedData<any[]>(CACHE_CONFIG.TESTIMONIALS.key)
  if (cached) {
    return cached
  }

  const data = await dbGetTestimonials(limit, false)
  setCachedData(CACHE_CONFIG.TESTIMONIALS.key, data, CACHE_CONFIG.TESTIMONIALS.ttl)

  return data
}

/**
 * Get site settings with Redis caching
 */
export async function getSiteSettingsWithCache(): Promise<Record<string, string>> {
  const cached = await getCachedData<Record<string, string>>(CACHE_CONFIG.SITE_SETTINGS.key)
  if (cached) {
    return cached
  }

  const data = await dbGetSiteSettings()
  setCachedData(CACHE_CONFIG.SITE_SETTINGS.key, data, CACHE_CONFIG.SITE_SETTINGS.ttl)

  return data
}

/**
 * Get all homepage data with caching (parallel fetch)
 * Returns: { team, valueSections, features, testimonials, siteSettings }
 */
export async function getHomepageDataWithCache() {
  const [team, valueSections, features, testimonials, siteSettings] = await Promise.all([
    getTeamMembersWithCache(),
    getValueSectionsWithCache(),
    getFeaturesWithCache(),
    getTestimonialsWithCache(6),
    getSiteSettingsWithCache(),
  ])

  return {
    team,
    valueSections,
    features,
    testimonials,
    siteSettings,
  }
}
