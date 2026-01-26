/**
 * Rate Limiter with Redis-compatible interface
 * Uses in-memory storage with optional Upstash Redis support
 */

// ============================================
// Types
// ============================================

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number
  limit: number
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

// ============================================
// In-Memory Rate Limiter
// ============================================

class InMemoryRateLimiter {
  private storage = new Map<string, RateLimitRecord>()
  private readonly windowMs: number = 60000 // 1 minute window

  constructor() {
    // Cleanup expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000)
    }
  }

  check(key: string, limit: number): RateLimitResult {
    const now = Date.now()
    const record = this.storage.get(key)

    // No record or expired - create new
    if (!record || now > record.resetTime) {
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return {
        allowed: true,
        remaining: limit - 1,
        resetIn: Math.ceil(this.windowMs / 1000),
        limit
      }
    }

    // Check if limit reached
    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil((record.resetTime - now) / 1000),
        limit
      }
    }

    // Increment counter
    record.count++
    return {
      allowed: true,
      remaining: limit - record.count,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
      limit
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const entriesArray = Array.from(this.storage.entries())
    for (const [key, record] of entriesArray) {
      if (now > record.resetTime) {
        this.storage.delete(key)
      }
    }
  }

  getStats(): { size: number } {
    return { size: this.storage.size }
  }
}

// ============================================
// Sliding Window Rate Limiter (more accurate)
// ============================================

class SlidingWindowRateLimiter {
  private storage = new Map<string, number[]>()
  private readonly windowMs: number = 60000

  check(key: string, limit: number): RateLimitResult {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get or create timestamps array
    let timestamps = this.storage.get(key) || []

    // Filter to only include requests within the window
    timestamps = timestamps.filter(t => t > windowStart)

    // Check if limit reached
    if (timestamps.length >= limit) {
      const oldestInWindow = Math.min(...timestamps)
      const resetIn = Math.ceil((oldestInWindow + this.windowMs - now) / 1000)

      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.max(1, resetIn),
        limit
      }
    }

    // Add current request
    timestamps.push(now)
    this.storage.set(key, timestamps)

    return {
      allowed: true,
      remaining: limit - timestamps.length,
      resetIn: 60,
      limit
    }
  }

  cleanup(): void {
    const windowStart = Date.now() - this.windowMs
    const entriesArray = Array.from(this.storage.entries())
    for (const [key, timestamps] of entriesArray) {
      const validTimestamps = timestamps.filter(t => t > windowStart)
      if (validTimestamps.length === 0) {
        this.storage.delete(key)
      } else {
        this.storage.set(key, validTimestamps)
      }
    }
  }
}

// ============================================
// Rate Limit Configuration
// ============================================

export const RATE_LIMITS = {
  // API endpoints
  api: {
    limit: 60,        // 60 requests per minute
    windowMs: 60000
  },
  // AI processing (stricter)
  aiProcess: {
    limit: 10,        // 10 requests per minute
    windowMs: 60000
  },
  // Auth routes
  auth: {
    limit: 10,        // 10 requests per minute
    windowMs: 60000
  },
  // File uploads
  upload: {
    limit: 20,        // 20 uploads per minute
    windowMs: 60000
  },
  // Admin routes (more lenient)
  admin: {
    limit: 100,       // 100 requests per minute
    windowMs: 60000
  },
  // Default
  default: {
    limit: 100,       // 100 requests per minute
    windowMs: 60000
  }
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

// ============================================
// Singleton Instance
// ============================================

const rateLimiter = new SlidingWindowRateLimiter()

// Cleanup every 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 2 * 60 * 1000)
}

// ============================================
// Exported Functions
// ============================================

/**
 * Check rate limit for a key
 */
export function checkRateLimit(
  key: string,
  type: RateLimitType = 'default'
): RateLimitResult {
  const config = RATE_LIMITS[type]
  return rateLimiter.check(key, config.limit)
}

/**
 * Get rate limit type for a given pathname
 */
export function getRateLimitType(pathname: string): RateLimitType {
  if (pathname.startsWith('/api/process-images')) {
    return 'aiProcess'
  }
  if (pathname.startsWith('/api/upload') || pathname.startsWith('/api/secure-upload')) {
    return 'upload'
  }
  if (pathname.startsWith('/api/admin')) {
    return 'admin'
  }
  if (pathname.startsWith('/api/')) {
    return 'api'
  }
  if (pathname.startsWith('/auth') || pathname === '/login' || pathname === '/register') {
    return 'auth'
  }
  return 'default'
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': (Date.now() + result.resetIn * 1000).toString(),
    ...(result.allowed ? {} : { 'Retry-After': result.resetIn.toString() })
  }
}

/**
 * Generate rate limit key from request
 */
export function generateRateLimitKey(
  identifier: string,
  type: RateLimitType
): string {
  return `ratelimit:${type}:${identifier}`
}

// ============================================
// Export
// ============================================

export const rateLimit = {
  check: checkRateLimit,
  getType: getRateLimitType,
  createHeaders: createRateLimitHeaders,
  generateKey: generateRateLimitKey,
  LIMITS: RATE_LIMITS
}

export default rateLimit

