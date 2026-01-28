/**
 * Redis Cache Client
 * 
 * THIẾT KẾ AN TOÀN:
 * - Chỉ cache dữ liệu TĨNH (team, features, settings) - ít thay đổi
 * - KHÔNG cache dữ liệu ĐỘNG (user requests, dashboard stats)
 * - Graceful fallback khi Redis lỗi → app vẫn chạy bình thường
 * - Hỗ trợ nhiều người dùng đồng thời
 * - Connection pooling tự động
 */

import { createClient, RedisClientType } from 'redis'

// Singleton Redis client
let redisClient: RedisClientType | null = null
let isConnecting = false
let connectionPromise: Promise<RedisClientType | null> | null = null

// Redis connection status
let isRedisAvailable = false

/**
 * Get or create Redis client with connection pooling
 * Returns null if Redis is not configured or unavailable
 */
async function getRedisClient(): Promise<RedisClientType | null> {
  // Skip if no Redis URL configured
  const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL
  if (!redisUrl) {
    return null
  }

  // Return existing connected client
  if (redisClient && isRedisAvailable) {
    return redisClient
  }

  // Wait for existing connection attempt
  if (isConnecting && connectionPromise) {
    return connectionPromise
  }

  // Start new connection
  isConnecting = true
  connectionPromise = (async () => {
    try {
      redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000, // 5 second timeout
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              console.warn('[Redis] Max retries reached, disabling Redis')
              isRedisAvailable = false
              return false // Stop reconnecting
            }
            return Math.min(retries * 100, 3000) // Exponential backoff
          },
        },
      })

      redisClient.on('error', (err) => {
        console.error('[Redis] Connection error:', err.message)
        isRedisAvailable = false
      })

      redisClient.on('connect', () => {
        console.log('[Redis] Connected successfully')
        isRedisAvailable = true
      })

      redisClient.on('reconnecting', () => {
        console.log('[Redis] Reconnecting...')
      })

      await redisClient.connect()
      isRedisAvailable = true
      return redisClient
    } catch (error) {
      console.error('[Redis] Failed to connect:', error)
      isRedisAvailable = false
      redisClient = null
      return null
    } finally {
      isConnecting = false
      connectionPromise = null
    }
  })()

  return connectionPromise
}

/**
 * Cache configurations - CHỈ DỮ LIỆU TĨNH
 * TTL in seconds
 */
export const CACHE_CONFIG = {
  // Homepage data - thay đổi rất ít (chỉ admin update)
  TEAM_MEMBERS: {
    key: 'hp:team',
    ttl: 3600 * 6, // 6 hours
  },
  VALUE_SECTIONS: {
    key: 'hp:values',
    ttl: 3600 * 6, // 6 hours
  },
  FEATURES: {
    key: 'hp:features',
    ttl: 3600 * 6, // 6 hours
  },
  SITE_SETTINGS: {
    key: 'hp:settings',
    ttl: 3600 * 6, // 6 hours
  },
  // Testimonials - có thể thay đổi khi có feedback mới
  TESTIMONIALS: {
    key: 'hp:testimonials',
    ttl: 3600 * 2, // 2 hours (shorter TTL)
  },
} as const

/**
 * Get cached data - SAFE, returns null on any error
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient()
    if (!client) return null

    const data = await client.get(key)
    if (!data) return null

    return JSON.parse(data) as T
  } catch (error) {
    // Silent fail - log but don't break app
    console.warn(`[Redis] Cache get failed for ${key}:`, (error as Error).message)
    return null
  }
}

/**
 * Set cached data - SAFE, silently fails on error
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number
): Promise<boolean> {
  try {
    const client = await getRedisClient()
    if (!client) return false

    await client.setEx(key, ttlSeconds, JSON.stringify(data))
    return true
  } catch (error) {
    // Silent fail - log but don't break app
    console.warn(`[Redis] Cache set failed for ${key}:`, (error as Error).message)
    return false
  }
}

/**
 * Invalidate cache keys - call after admin updates
 */
export async function invalidateCache(keys: string[]): Promise<void> {
  try {
    const client = await getRedisClient()
    if (!client || keys.length === 0) return

    await client.del(keys)
    console.log(`[Redis] Invalidated cache keys: ${keys.join(', ')}`)
  } catch (error) {
    console.warn('[Redis] Cache invalidation failed:', (error as Error).message)
  }
}

/**
 * Invalidate all homepage cache
 */
export async function invalidateAllHomepageCache(): Promise<void> {
  const keys = Object.values(CACHE_CONFIG).map((c) => c.key)
  await invalidateCache(keys)
}

/**
 * Check if Redis is available
 */
export function isRedisConnected(): boolean {
  return isRedisAvailable
}

/**
 * Graceful shutdown
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    isRedisAvailable = false
  }
}
