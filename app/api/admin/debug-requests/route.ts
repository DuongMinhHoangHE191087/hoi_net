/**
 * Debug API: Check user_requests table directly
 * 
 * This is a temporary debug endpoint to verify:
 * 1. supabaseAdmin is configured correctly
 * 2. user_requests table has data
 * 3. Connection is working
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if supabaseAdmin is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('[Debug] Supabase config:', {
      url: supabaseUrl ? 'configured' : 'missing',
      serviceKey: hasServiceKey ? 'configured' : 'MISSING!'
    })

    // Try to count all requests (no filters)
    const { data: allRequests, error: countError, count } = await supabaseAdmin
      .from('user_requests')
      .select('*', { count: 'exact' })
      .limit(10)

    console.log('[Debug] Query result:', {
      requests: allRequests?.length || 0,
      count,
      error: countError?.message
    })

    // Also try to get table info
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('user_requests')
      .select('id, user_id, type, status, created_at')
      .limit(5)

    return NextResponse.json({
      debug: true,
      config: {
        supabase_url: supabaseUrl ? 'configured' : 'missing',
        service_key: hasServiceKey ? 'configured' : 'MISSING - Add SUPABASE_SERVICE_ROLE_KEY to .env.local',
        admin_user: user.email
      },
      query_result: {
        total_count: count,
        sample_data: tableInfo || [],
        error: countError?.message || tableError?.message || null
      },
      requests: allRequests || [],
      message: count === 0 
        ? 'No requests in database. Users need to create requests first.'
        : `Found ${count} requests in database.`
    })

  } catch (error: any) {
    console.error('[Debug] Error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
