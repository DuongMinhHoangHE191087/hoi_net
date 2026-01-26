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
    console.log('[AdminRequests API] Starting verifyAuth...')
    const user = await verifyAuth(request)
    
    console.log('[AdminRequests API] Auth result:', {
      user: user?.email || 'null',
      id: user?.id || 'null',
      isAdmin: user?.isAdmin || false,
      role: user?.role || 'null'
    })
    
    if (!user || !user.isAdmin) {
      console.log('[AdminRequests API] Unauthorized - returning 401')
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const { page, limit, offset } = parsePagination(searchParams, { limit: 20 })

    console.log('[AdminRequests API] Query params:', { status, page, limit, offset })

    // Check if supabaseAdmin is configured
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log('[AdminRequests API] Service key configured:', hasServiceKey)

    // Build query - select all columns like test-db
    let query = supabaseAdmin
      .from('user_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Build count query with same filter
    let countQuery = supabaseAdmin
      .from('user_requests')
      .select('*', { count: 'exact', head: true })

    if (status && status !== 'all') {
      query = query.eq('status', status)
      countQuery = countQuery.eq('status', status)
    }

    // Execute both queries
    const { count: headCount, error: headError } = await countQuery
    const { data, error } = await query

    console.log('[AdminRequests API] Query result:', {
      data_count: data?.length || 0,
      total_count: headCount,
      head_count: headCount,
      head_error: headError?.message || null,
      error: error?.message || null,
      first_item: data?.[0] ? { id: data[0].id, user_id: data[0].user_id, status: data[0].status } : null
    })

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
      metadata: { count: headCount || 0, page, status }
    })

    return withNoCacheHeaders(
      withTiming(
        successResponse(
          { requests: enrichedData },
          { page, limit, total: headCount || 0 }
        ),
        startTime
      )
    )

  } catch (error: any) {
    log.error('Unexpected error fetching requests', { error })
    return internalErrorResponse(error)
  }
}

