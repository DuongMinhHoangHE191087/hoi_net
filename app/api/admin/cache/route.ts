/**
 * Cache Invalidation API
 * 
 * Endpoint cho admin để xóa cache khi update dữ liệu
 * POST /api/admin/cache/invalidate
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { invalidateCache, invalidateAllHomepageCache, CACHE_CONFIG } from '@/lib/redis'

export const dynamic = 'force-dynamic'

// POST: Invalidate specific cache keys
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, all } = body

    // Invalidate all homepage cache
    if (all) {
      await invalidateAllHomepageCache()
      return NextResponse.json({
        success: true,
        message: 'All homepage cache invalidated'
      })
    }

    // Invalidate specific type
    if (type) {
      const config = CACHE_CONFIG[type as keyof typeof CACHE_CONFIG]
      if (config) {
        await invalidateCache([config.key])
        return NextResponse.json({
          success: true,
          message: `Cache invalidated for ${type}`
        })
      }
    }

    return NextResponse.json({
      error: 'Invalid request. Provide "type" or "all: true"',
      validTypes: Object.keys(CACHE_CONFIG)
    }, { status: 400 })

  } catch (error: any) {
    console.error('[Cache API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET: Get cache status
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      cacheConfig: Object.entries(CACHE_CONFIG).map(([name, config]) => ({
        name,
        key: config.key,
        ttlHours: config.ttl / 3600,
      })),
      info: {
        description: 'Redis cache for static homepage data',
        note: 'Cache auto-expires based on TTL. Manual invalidation available.'
      }
    })

  } catch (error: any) {
    console.error('[Cache API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
