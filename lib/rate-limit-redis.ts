/**
 * Redis-backed rate limiter for Node.js-runtime API routes.
 *
 * Backed by Redis (fixed-window counter via INCR+PEXPIRE) when configured,
 * so limits are shared correctly across multiple serverless instances.
 * Falls back to an in-memory, per-instance counter when Redis is not
 * configured/reachable.
 *
 * DO NOT import this from middleware.ts or any other Edge Runtime code -
 * it depends on lib/redis.ts, which depends on the `redis` package's
 * Node.js TCP/TLS sockets (node:net, node:tls, ...), which Edge can't
 * bundle or run. Use lib/rate-limit.ts (in-memory only) there instead.
 */

import { incrWithExpiry, getKeyTTL } from './redis'

const memoryStore = new Map<string, { count: number; resetAt: number }>()

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

function checkMemory(key: string, maxAttempts: number, windowMs: number) {
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

/**
 * Check (and consume) a rate limit slot for an arbitrary key/limit/window.
 */
export async function checkRateLimitCustom(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const redisKey = `ratelimit:${key}`
  const count = await incrWithExpiry(redisKey, windowMs)

  if (count !== null) {
    if (count > maxAttempts) {
      const ttl = await getKeyTTL(redisKey)
      return { allowed: false, remaining: 0, resetIn: Math.ceil((ttl ?? windowMs) / 1000) }
    }
    return { allowed: true, remaining: Math.max(0, maxAttempts - count), resetIn: Math.ceil(windowMs / 1000) }
  }

  // Redis unavailable/unconfigured - degrade to per-instance memory
  return checkMemory(key, maxAttempts, windowMs)
}
