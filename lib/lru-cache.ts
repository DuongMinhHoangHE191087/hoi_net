/**
 * High-Performance LRU Cache with TTL
 * Used for caching database responses, API results, and computed values
 */

interface CacheEntry<T> {
  value: T
  expires: number
  accessCount: number
}

export class LRUCache<T = any> {
  private cache: Map<string, CacheEntry<T>>
  private readonly maxSize: number
  private readonly defaultTTL: number
  private hits: number = 0
  private misses: number = 0

  constructor(options: { maxSize?: number; defaultTTL?: number } = {}) {
    this.cache = new Map()
    this.maxSize = options.maxSize || 1000
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000 // 5 minutes default
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return undefined
    }

    // Check expiration
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      this.misses++
      return undefined
    }

    // Update access count and move to end (most recently used)
    entry.accessCount++
    this.cache.delete(key)
    this.cache.set(key, entry)
    this.hits++

    return entry.value
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl || this.defaultTTL),
      accessCount: 1
    })
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Delete all keys matching pattern
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let deleted = 0
    const keysArray = Array.from(this.cache.keys())

    for (const key of keysArray) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    return deleted
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    hits: number
    misses: number
    hitRate: number
  } {
    const total = this.hits + this.misses
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    // Map maintains insertion order, first key is oldest
    const firstKey = this.cache.keys().next().value
    if (firstKey) {
      this.cache.delete(firstKey)
    }
  }

  /**
   * Cleanup expired entries (call periodically)
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0
    const entriesArray = Array.from(this.cache.entries())

    for (const [key, entry] of entriesArray) {
      if (now > entry.expires) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * Get or set with async factory function
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key)
    if (cached !== undefined) {
      return cached
    }

    const value = await factory()
    this.set(key, value, ttl)
    return value
  }
}

// ============================================
// Singleton Instances for Global Use
// ============================================

// API Response Cache (short TTL)
export const apiCache = new LRUCache<any>({
  maxSize: 500,
  defaultTTL: 60 * 1000 // 1 minute
})

// Database Query Cache (medium TTL)
export const dbCache = new LRUCache<any>({
  maxSize: 1000,
  defaultTTL: 5 * 60 * 1000 // 5 minutes
})

// Site Settings Cache (long TTL)
export const settingsCache = new LRUCache<any>({
  maxSize: 100,
  defaultTTL: 15 * 60 * 1000 // 15 minutes
})

// User Session Cache (short TTL)
export const sessionCache = new LRUCache<any>({
  maxSize: 500,
  defaultTTL: 2 * 60 * 1000 // 2 minutes
})

// ============================================
// Cache Keys Factory
// ============================================

export const cacheKeys = {
  siteSettings: () => 'site:settings:all',
  siteSetting: (key: string) => `site:setting:${key}`,
  footerLinks: () => 'site:footer:links',
  navLinks: () => 'site:nav:links',
  userProfile: (userId: string) => `user:profile:${userId}`,
  userQuota: (userId: string) => `user:quota:${userId}`,
  blogPosts: (publishedOnly: boolean) => `blog:posts:${publishedOnly}`,
  blogPost: (slug: string) => `blog:post:${slug}`,
  teamMembers: () => 'content:team:members',
  valueSections: () => 'content:value:sections',
  aboutSections: () => 'content:about:sections',
  systemPrompts: () => 'ai:prompts:all',
}

// ============================================
// Invalidation Helpers
// ============================================

export function invalidateSiteCache(): void {
  settingsCache.deletePattern('^site:')
}

export function invalidateUserCache(userId: string): void {
  sessionCache.delete(cacheKeys.userProfile(userId))
  dbCache.delete(cacheKeys.userQuota(userId))
}

export function invalidateBlogCache(): void {
  dbCache.deletePattern('^blog:')
}

export function invalidateContentCache(): void {
  dbCache.deletePattern('^content:')
}

// Periodic cleanup (run every 5 minutes in production)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup()
    dbCache.cleanup()
    settingsCache.cleanup()
    sessionCache.cleanup()
  }, 5 * 60 * 1000)
}

