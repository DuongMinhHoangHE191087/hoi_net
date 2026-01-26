import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET: List all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Query users table first (simple query without relationship)
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[Admin Users] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enrich with user profile data if users exist
    let enrichedData = data || []
    if (enrichedData.length > 0) {
      try {
        const userIds = enrichedData.map(u => u.id)

        const { data: profiles } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .in('id', userIds)

        const profileMap = new Map(
          (profiles || []).map(p => [p.id, p])
        )

        enrichedData = enrichedData.map(user => {
          const profile = profileMap.get(user.id)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: user.created_at,
            updated_at: user.updated_at,
            full_name: profile?.full_name || user.name,
            avatar_url: profile?.avatar_url || null,
            bio: profile?.bio || null,
            phone: profile?.phone || null,
            facebook_url: profile?.facebook_url || null,
            role: profile?.role || 'user'
          }
        })

        // Apply role filter if needed (after enrichment)
        if (role && role !== 'all') {
          enrichedData = enrichedData.filter(user => user.role === role)
        }
      } catch (enrichError: any) {
        console.error('[Admin Users] Failed to enrich with user profiles:', enrichError.message)
        // Continue with unenriched data
        enrichedData = enrichedData.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
          updated_at: user.updated_at,
          full_name: user.name,
          avatar_url: null,
          bio: null,
          phone: null,
          facebook_url: null,
          role: 'user'
        }))
      }
    }

    return NextResponse.json({
      users: enrichedData,
      pagination: {
        page,
        limit,
        total: count || 0
      }
    })
  } catch (error: any) {
    console.error('[Admin Users] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

