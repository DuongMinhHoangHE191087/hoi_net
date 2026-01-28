/**
 * Homepage cache utilities
 * Wraps Supabase queries with Redis caching
 * Only caches data that changes rarely (admin-only updates)
 */

import {
  getTeamMembers as getTeamFromDB,
  getValueSections as getValuesFromDB,
  getTestimonials as getTestimoniesFromDB,
  getAllSiteSettings as getSettingsFromDB,
  getServices as getFeaturesFromDB,
} from '@/lib/supabase/server-utils'
import {
  getCachedData,
  setCachedData,
  CACHE_CONFIG,
} from '@/lib/redis'

/**
 * Get team members with Redis caching
 * Cache TTL: 24 hours (only admins can update this)
 */
export async function getTeamMembersWithCache() {
  // Try Redis first
  const cached = await getCachedData(CACHE_CONFIG.TEAM_MEMBERS.key)
  if (cached) {
    console.log('[Cache] Team members from Redis')
    return cached
  }

  // Fallback to database
  console.log('[Cache] Team members from database')
  const data = await getTeamFromDB()

  // Store in Redis for next time
  await setCachedData(
    CACHE_CONFIG.TEAM_MEMBERS.key,
    data,
    CACHE_CONFIG.TEAM_MEMBERS.ttl
  )

  return data
}

/**
 * Get value sections with Redis caching
 * Cache TTL: 24 hours
 */
export async function getValueSectionsWithCache() {
  const cached = await getCachedData(CACHE_CONFIG.VALUE_SECTIONS.key)
  if (cached) {
    console.log('[Cache] Value sections from Redis')
    return cached
  }

  console.log('[Cache] Value sections from database')
  const data = await getValuesFromDB()

  await setCachedData(
    CACHE_CONFIG.VALUE_SECTIONS.key,
    data,
    CACHE_CONFIG.VALUE_SECTIONS.ttl
  )

  return data
}

/**
 * Get features/services with Redis caching
 * Cache TTL: 24 hours
 */
export async function getFeaturesWithCache() {
  const cached = await getCachedData(CACHE_CONFIG.FEATURES.key)
  if (cached) {
    console.log('[Cache] Features from Redis')
    return cached
  }

  console.log('[Cache] Features from database')
  const data = await getFeaturesFromDB()

  await setCachedData(
    CACHE_CONFIG.FEATURES.key,
    data,
    CACHE_CONFIG.FEATURES.ttl
  )

  return data
}

/**
 * Get testimonials with Redis caching
 * Cache TTL: 6 hours (more frequently displayed, potential updates)
 */
export async function getTestimonialsWithCache(limit = 6) {
  const cached = await getCachedData(CACHE_CONFIG.TESTIMONIALS.key)
  if (cached) {
    console.log('[Cache] Testimonials from Redis')
    return cached
  }

  console.log('[Cache] Testimonials from database')
  const data = await getTestimoniesFromDB(limit, false)

  await setCachedData(
    CACHE_CONFIG.TESTIMONIALS.key,
    data,
    CACHE_CONFIG.TESTIMONIALS.ttl
  )

  return data
}

/**
 * Get site settings with Redis caching
 * Cache TTL: 24 hours (admin-only updates)
 */
export async function getSiteSettingsWithCache() {
  const cached = await getCachedData(CACHE_CONFIG.SITE_SETTINGS.key)
  if (cached) {
    console.log('[Cache] Site settings from Redis')
    return cached
  }

  console.log('[Cache] Site settings from database')
  const data = await getSettingsFromDB()

  await setCachedData(
    CACHE_CONFIG.SITE_SETTINGS.key,
    data,
    CACHE_CONFIG.SITE_SETTINGS.ttl
  )

  return data
}
