import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { apiCache } from '@/lib/lru-cache'

// Cache analytics data for 2 minutes
export const revalidate = 120
export const dynamic = 'force-dynamic'

// Cache key for analytics data
const ANALYTICS_CACHE_KEY = 'admin:analytics:overview'
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Analytics API] === REQUEST START ===')
    console.log('[Admin Analytics API] URL:', request.url)
    console.log('[Admin Analytics API] Method:', request.method)
    console.log('[Admin Analytics API] Headers:', Object.fromEntries(request.headers.entries()))

    // 1. Verify Admin Auth
    const user = await verifyAuth(request)
    console.log('[Admin Analytics API] Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      isAdmin: user?.isAdmin,
      role: user?.role
    })

    if (!user || !user.isAdmin) {
      console.error('[Admin Analytics] Unauthorized access attempt:', {
        hasUser: !!user,
        email: user?.email,
        isAdmin: user?.isAdmin
      })
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'You must be an admin to access analytics',
        isAdmin: user?.isAdmin,
        userEmail: user?.email
      }, { status: 401 })
    }

    console.log('[Admin Analytics] Admin verified:', user.email)

    // Check cache first
    const cached = apiCache.get(ANALYTICS_CACHE_KEY)
    if (cached) {
      console.log('[Admin Analytics] Returning cached data')
      return NextResponse.json({
        ...cached,
        cached: true,
        cacheTimestamp: new Date().toISOString()
      })
    }

    console.log('[Admin Analytics] Cache miss - fetching fresh data')

    // Calculate date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // 2. Fetch Overview Stats (Parallel Queries with better error handling)
    const results = await Promise.allSettled([
      // Total API requests
      supabaseAdmin.from('ai_usage_log').select('*', { count: 'exact', head: true }),

      // Total cached items
      supabaseAdmin.from('ai_analysis_cache').select('*', { count: 'exact', head: true }),

      // Usage by day (Last 30 days)
      supabaseAdmin
        .from('ai_usage_log')
        .select('created_at, action_type')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true }),

      // Top Users
      supabaseAdmin
        .from('user_quotas')
        .select('user_id, current_usage, monthly_limit')
        .order('current_usage', { ascending: false })
        .limit(5),

      // Total users
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }),

      // New users this week
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),

      // Blocked users
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true })
        .eq('is_blocked', true),

      // Total blog posts
      supabaseAdmin.from('blog_posts').select('*', { count: 'exact', head: true }),

      // Published blog posts
      supabaseAdmin.from('blog_posts').select('*', { count: 'exact', head: true })
        .eq('published', true),

      // Total feedback
      supabaseAdmin.from('feedback').select('*', { count: 'exact', head: true }),

      // Unread feedback
      supabaseAdmin.from('feedback').select('*', { count: 'exact', head: true })
        .eq('status', 'new'),

      // Request statuses
      supabaseAdmin.from('user_requests').select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),

      supabaseAdmin.from('user_requests').select('*', { count: 'exact', head: true })
        .eq('status', 'processing'),

      supabaseAdmin.from('user_requests').select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),

      supabaseAdmin.from('user_requests').select('*', { count: 'exact', head: true })
        .eq('status', 'rejected'),
    ])

    // Extract results with error handling
    const getResult = (index: number) => {
      const result = results[index]
      if (result.status === 'fulfilled') {
        if (result.value.error) {
          console.error(`[Admin Analytics] Query ${index} error:`, result.value.error)
          return null
        }
        return result.value
      }
      console.error(`[Admin Analytics] Query ${index} failed:`, result.reason)
      return null
    }

    const totalRequests = getResult(0)?.count ?? 0
    const totalCached = getResult(1)?.count ?? 0
    const usageByDayRaw = getResult(2) ?? { data: [] }
    const topUsersRaw = getResult(3) ?? { data: [] }
    const totalUsers = getResult(4)?.count ?? 0
    const newUsersThisWeek = getResult(5)?.count ?? 0
    const blockedUsers = getResult(6)?.count ?? 0
    const totalBlogPosts = getResult(7)?.count ?? 0
    const publishedBlogPosts = getResult(8)?.count ?? 0
    const totalFeedback = getResult(9)?.count ?? 0
    const unreadFeedback = getResult(10)?.count ?? 0
    const pendingRequests = getResult(11)?.count ?? 0
    const processingRequests = getResult(12)?.count ?? 0
    const completedRequests = getResult(13)?.count ?? 0
    const failedRequests = getResult(14)?.count ?? 0

    // Calculate total errors from failed AI requests instead of system_logs
    const totalErrors = failedRequests

    // 3. Process Usage By Day (Client-side aggregation for MVP)
    const usageByDay = usageByDayRaw.data?.reduce((acc: any, log: any) => {
      const date = log.created_at.split('T')[0]
      if (!acc[date]) acc[date] = { date, count: 0, restore: 0, enhance: 0, other: 0 }

      acc[date].count += 1
      if (log.action_type === 'restore') acc[date].restore += 1
      else if (log.action_type === 'enhance') acc[date].enhance += 1
      else acc[date].other += 1

      return acc
    }, {})

    // 4. Calculate system health
    const errorRate = totalRequests && totalRequests > 0
      ? ((totalErrors || 0) / totalRequests) * 100
      : 0

    let systemHealth = 'Healthy'
    if (errorRate > 10) systemHealth = 'Critical'
    else if (errorRate > 5) systemHealth = 'Warning'

    // 5. Prepare response data
    const responseData = {
      overview: {
        totalRequests: totalRequests || 0,
        totalCached: totalCached || 0,
        totalErrors: totalErrors || 0,
        systemHealth
      },
      chartData: Object.values(usageByDay || {}),
      topUsers: topUsersRaw.data || [],
      // Additional metrics
      userStats: {
        total: totalUsers || 0,
        newThisWeek: newUsersThisWeek || 0,
        blocked: blockedUsers || 0,
        active: (totalUsers || 0) - (blockedUsers || 0)
      },
      requestStats: {
        pending: pendingRequests || 0,
        processing: processingRequests || 0,
        completed: completedRequests || 0,
        rejected: failedRequests || 0,
        total: (pendingRequests || 0) + (processingRequests || 0) + (completedRequests || 0) + (failedRequests || 0)
      },
      contentStats: {
        totalPosts: totalBlogPosts || 0,
        publishedPosts: publishedBlogPosts || 0,
        draftPosts: (totalBlogPosts || 0) - (publishedBlogPosts || 0),
        totalFeedback: totalFeedback || 0,
        unreadFeedback: unreadFeedback || 0
      }
    }

    // Cache the response for 2 minutes
    apiCache.set(ANALYTICS_CACHE_KEY, responseData, CACHE_TTL)
    console.log('[Admin Analytics] Data cached for 2 minutes')

    // Return JSON
    return NextResponse.json({
      ...responseData,
      cached: false,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Admin Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    )
  }
}
