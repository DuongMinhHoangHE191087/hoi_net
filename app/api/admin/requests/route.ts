import { NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  successResponse,
  unauthorizedResponse,
  internalErrorResponse,
  parsePagination,
  withTiming,
  withNoCacheHeaders
} from '@/lib/api-response'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const log = logger.child({ path: '/api/admin/requests' })

// GET: List all requests (Admin only)
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const { page, limit, offset } = parsePagination(searchParams, { limit: 20 })

    // Build query - Try with relationship first, fallback to simple query
    let query = supabaseAdmin
      .from('user_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      log.error('Failed to fetch requests', { error: error.message })
      return internalErrorResponse(error.message)
    }

    // Enrich with user profile data if requests exist
    let enrichedData = data || []
    if (enrichedData.length > 0) {
      try {
        // Get unique user IDs
        const userIds = Array.from(new Set(enrichedData.map(r => r.user_id).filter(Boolean)))

        if (userIds.length > 0) {
          // Fetch user profiles
          const { data: profiles } = await supabaseAdmin
            .from('user_profiles')
            .select('id, full_name, phone, facebook_url, avatar_url')
            .in('id', userIds)

          // Create a map for quick lookup
          const profileMap = new Map(
            (profiles || []).map(p => [p.id, p])
          )

          // Enrich requests with profile data
          enrichedData = enrichedData.map(request => ({
            ...request,
            user_profiles: request.user_id ? profileMap.get(request.user_id) : null
          }))
        }
      } catch (enrichError: any) {
        // Log but don't fail - just return requests without profiles
        log.warn('Failed to enrich with user profiles', { error: enrichError.message })
      }
    }

    log.debug('Requests fetched', {
      metadata: { count: count || 0, page, status }
    })

    return withNoCacheHeaders(
      withTiming(
        successResponse(
          { requests: enrichedData },
          { page, limit, total: count || 0 }
        ),
        startTime
      )
    )

  } catch (error: any) {
    log.error('Unexpected error fetching requests', { error })
    return internalErrorResponse(error)
  }
}
