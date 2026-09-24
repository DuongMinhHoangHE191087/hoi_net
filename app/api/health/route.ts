/**
 * Health Check Endpoint
 * 
 * GET /api/health
 * 
 * Checks the status of all critical services:
 * - Database (Supabase)
 * - AI Engine (Gemini API key presence)
 * - Image Storage (Cloudinary configuration)
 * - Cache (Redis availability)
 * 
 * Returns overall system health for monitoring & load balancers.
 */

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'down'
  latencyMs?: number
  message?: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down'
  version: string
  timestamp: string
  uptime: number
  environment: string
  services: {
    database: ServiceStatus
    ai: ServiceStatus
    storage: ServiceStatus
    cache: ServiceStatus
  }
}

const startTime = Date.now()

export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkAI(),
    checkStorage(),
    checkCache(),
  ])

  const [db, ai, storage, cache] = checks.map((result) =>
    result.status === 'fulfilled'
      ? result.value
      : { status: 'down' as const, message: (result.reason as Error).message }
  )

  // Overall status: worst of all services
  const statuses = [db.status, ai.status, storage.status, cache.status]
  let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
  if (statuses.includes('down')) {
    overallStatus = statuses.includes('healthy') ? 'degraded' : 'down'
  } else if (statuses.includes('degraded')) {
    overallStatus = 'degraded'
  }

  const response: HealthResponse = {
    status: overallStatus,
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: db,
      ai: ai,
      storage: storage,
      cache: cache,
    },
  }

  const httpStatus = overallStatus === 'down' ? 503 : 200

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Status': overallStatus,
    },
  })
}

// ============================================
// Service Checks
// ============================================

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const { error } = await getSupabaseAdmin()
      .from('site_settings')
      .select('key')
      .limit(1)
      .single()

    // PGRST116 means "no rows" which is still a successful connection
    if (error && error.code !== 'PGRST116') {
      return {
        status: 'degraded',
        latencyMs: Date.now() - start,
        message: error.message,
      }
    }

    return {
      status: 'healthy',
      latencyMs: Date.now() - start,
    }
  } catch (err: any) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      message: err.message,
    }
  }
}

async function checkAI(): Promise<ServiceStatus> {
  const hasKey = !!process.env.GEMINI_API_KEY
  const isPlaceholder = process.env.GEMINI_API_KEY === 'your_api_key_here'

  if (!hasKey || isPlaceholder) {
    return {
      status: 'degraded',
      message: 'Gemini API key not configured',
    }
  }

  return { status: 'healthy' }
}

async function checkStorage(): Promise<ServiceStatus> {
  const hasCloudName = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const hasApiKey = !!process.env.CLOUDINARY_API_KEY
  const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET

  if (!hasCloudName || !hasApiKey || !hasApiSecret) {
    const missing: string[] = []
    if (!hasCloudName) missing.push('cloud_name')
    if (!hasApiKey) missing.push('api_key')
    if (!hasApiSecret) missing.push('api_secret')

    return {
      status: 'degraded',
      message: `Missing Cloudinary config: ${missing.join(', ')}`,
    }
  }

  return { status: 'healthy' }
}

async function checkCache(): Promise<ServiceStatus> {
  const hasRedisUrl = !!process.env.REDIS_URL || !!process.env.KV_REST_API_URL

  if (!hasRedisUrl) {
    return {
      status: 'degraded',
      message: 'Redis not configured (using in-memory cache)',
    }
  }

  try {
    // Dynamically check Redis connection status
    const { isRedisConnected } = await import('@/lib/redis')
    const connected = isRedisConnected()

    return {
      status: connected ? 'healthy' : 'degraded',
      message: connected ? undefined : 'Redis configured but not connected',
    }
  } catch {
    return {
      status: 'degraded',
      message: 'Redis module not available',
    }
  }
}
