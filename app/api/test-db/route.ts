/**
 * Simple test endpoint to verify supabaseAdmin works
 * Access: /api/test-db
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuth } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST DB START ===')
    
    // Check env vars
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('NEXT_PUBLIC_SUPABASE_URL:', url ? 'OK' : 'MISSING')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', key ? `OK (${key.substring(0,20)}...)` : 'MISSING')
    
    // Test auth
    console.log('Testing verifyAuth...')
    const user = await verifyAuth(request)
    console.log('Auth result:', {
      authenticated: !!user,
      email: user?.email || 'null',
      isAdmin: user?.isAdmin || false
    })
    
    // Test query
    console.log('Running test query...')
    const { data, error, count } = await supabaseAdmin
      .from('user_requests')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log('Query result:', {
      success: !error,
      count,
      data_length: data?.length || 0,
      error: error?.message
    })
    
    if (data && data.length > 0) {
      console.log('First record:', JSON.stringify(data[0], null, 2))
    }
    
    console.log('=== TEST DB END ===')
    
    return NextResponse.json({
      success: true,
      auth: {
        authenticated: !!user,
        email: user?.email || null,
        isAdmin: user?.isAdmin || false,
        id: user?.id || null
      },
      env: {
        url: url ? 'configured' : 'MISSING',
        key: key ? 'configured' : 'MISSING'
      },
      query: {
        error: error?.message || null,
        count,
        data: data || []
      }
    })
    
  } catch (error: any) {
    console.error('TEST DB ERROR:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
