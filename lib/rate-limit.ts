/**
 * Rate Limiter - path-based, in-memory.
 *
 * This is imported by middleware.ts, which Next.js runs on the Edge
 * Runtime - Edge can't open raw TCP sockets, so a real Redis client
 * (node:net/node:tls) can NOT be imported here, even transitively.
 * That's why this stays in-memory only (per-instance, not shared across
 * serverless instances - an accepted limitation for this coarse,
 * path-based check).
 *
 * For rate limits on specific Node.js-runtime API routes where distributed
 * correctness actually matters (auth abuse endpoints), use
 * checkRateLimitCustom from lib/rate-limit-redis.ts instead - that one can
 * safely depend on the Redis package because those routes run on the
 * Node.js runtime, not Edge.
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

// ============================================
// In-memory fixed-window limiter
// ============================================

const memoryStore = new Map<string, { count: number; resetAt: number }>()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    const entries = Array.from(memoryStore.entries())
    for (const [key, record] of entries) {
      if (now > record.resetAt) {
        memoryStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

function checkMemory(key: string, maxAttempts: number, windowMs: number): Omit<RateLimitResult, 'limit'> {
  const now = Date.now()
  const record = memoryStore.get(key)

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetIn: Math.ceil(windowMs / 1000) }
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((record.resetAt - now) / 1000) }
  }

  record.count++
  return { allowed: true, remaining: maxAttempts - record.count, resetIn: Math.ceil((record.resetAt - now) / 1000) }
}

// ============================================
// Rate Limit Configuration (path-based)
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

/**
 * Check rate limit for a key using one of the path-based RATE_LIMITS presets.
 * In-memory only - see the module note above for why.
 */
export async function checkRateLimit(
  key: string,
  type: RateLimitType = 'default'
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[type]
  const result = checkMemory(key, config.limit, config.windowMs)
  return { ...result, limit: config.limit }
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
  return `${type}:${identifier}`
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
