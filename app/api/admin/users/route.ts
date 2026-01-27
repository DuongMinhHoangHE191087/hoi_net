import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// Helper to add no-cache headers
const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
}

// GET: List all users (Admin only)
export async function GET(request: NextRequest) {
  return requirePermissionAuth(request, 'admin.users.manage', async (_user) => {
    try {
      const { searchParams } = new URL(request.url)
      const roleFilter = searchParams.get('role')
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))

      console.log('[Admin Users API] Starting request...')

      // Supabase Admin API pagination is 1-based.
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: limit,
      })

      if (error) {
        console.error('[Admin Users] listUsers error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const users = data?.users || []
      const userIds = users.map(u => u.id)
      console.log('[Admin Users API] Found', users.length, 'auth users')

      // Fetch profiles for role + extra info - FORCE FRESH QUERY
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, full_name, avatar_url, phone, role, is_blocked, blocked_at, blocked_reason')
        .in('id', userIds)

      if (profilesError) {
        console.error('[Admin Users] profiles error:', profilesError)
      }

      console.log('[Admin Users API] Found', profiles?.length || 0, 'profiles')
      
      // Debug: Log actual roles from profiles
      profiles?.forEach(p => {
        console.log('[Admin Users API] Profile:', p.id?.substring(0, 8), 'role:', p.role)
      })

      const profileMap = new Map((profiles || []).map(p => [p.id, p]))

      let enrichedData = users.map(u => {
        const profile = profileMap.get(u.id)
        return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          updated_at: u.updated_at,
          full_name: profile?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || '',
          avatar_url: profile?.avatar_url || null,
          phone: profile?.phone || null,
          role: (profile?.role || 'user') as string,
          is_blocked: profile?.is_blocked ?? false,
          blocked_reason: profile?.blocked_reason ?? null,
          blocked_at: profile?.blocked_at ?? null,
        }
      })

      if (roleFilter && roleFilter !== 'all') {
        enrichedData = enrichedData.filter(u => u.role === roleFilter)
      }

      // Total count isn't provided by listUsers reliably; return best-effort.
      return NextResponse.json({
        users: enrichedData,
        pagination: {
          page,
          limit,
          total: enrichedData.length,
        },
      }, { headers: noCacheHeaders })
    } catch (error: any) {
      console.error('[Admin Users] Error:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  })
}

