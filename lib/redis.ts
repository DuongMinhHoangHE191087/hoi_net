/**
 * Redis Client for Vercel KV or External Redis
 * Handles caching of static homepage data
 */

import { createClient } from 'redis'

// Initialize Redis client - supports both Vercel KV and external Redis
const redis = createClient({
  url: process.env.KV_REST_API_URL || process.env.REDIS_URL,
})

// Connect to Redis
redis.on('error', (err) => console.error('[Redis] Connection error:', err))
redis.on('connect', () => console.log('[Redis] Connected successfully'))

// Ensure connection is established
if (!redis.isOpen) {
  redis.connect().catch((err) => console.error('[Redis] Connection failed:', err))
}

export { redis }

/**
 * Cache configurations for homepage data
 * TTL in seconds - only cache data that changes rarely
 */
export const CACHE_CONFIG = {
  // Homepage data - changes rarely (only when admin updates)
  TEAM_MEMBERS: {
    key: 'homepage:team',
    ttl: 3600 * 24, // 24 hours
  },
  VALUE_SECTIONS: {
    key: 'homepage:values',
    ttl: 3600 * 24, // 24 hours
  },
  FEATURES: {
    key: 'homepage:features',
    ttl: 3600 * 24, // 24 hours
  },
  TESTIMONIALS: {
    key: 'homepage:testimonials',
    ttl: 3600 * 6, // 6 hours
  },
  SITE_SETTINGS: {
    key: 'homepage:settings',
    ttl: 3600 * 24, // 24 hours
  },
} as const

/**
 * Get cached homepage data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data as T | null
  } catch (error) {
    console.error(`[Redis] Error getting cache for ${key}:`, error)
    return null // Fallback to database on error
  }
}

/**
 * Set cached homepage data
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error(`[Redis] Error setting cache for ${key}:`, error)
    // Silently fail - don't break the app if Redis is unavailable
  }
}

/**
 * Invalidate specific cache keys (call after mutations)
 */
export async function invalidateHomepageCache(keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) {
      await redis.del(keys)
    }
  } catch (error) {
    console.error('[Redis] Error invalidating cache:', error)
  }
}

/**
 * Invalidate all homepage cache
 */
export async function invalidateAllHomepageCache(): Promise<void> {
  try {
    const cacheKeys = Object.values(CACHE_CONFIG).map((config) => config.key)
    await invalidateHomepageCache(cacheKeys)
  } catch (error) {
    console.error('[Redis] Error invalidating all homepage cache:', error)
  }
}
