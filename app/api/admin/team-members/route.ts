import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// GET: Get all team members
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)

    // Anyone can view team members (public data)
    const teamMembers = await dbServer.getTeamMembers()

    return NextResponse.json({
      success: true,
      teamMembers
    })
  } catch (error: any) {
    console.error('[Team Members API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Create new team member (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, role, bio, avatar_url, social_links, order_index } = body

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 })
    }

    const newMember = await dbServer.createTeamMember({
      name,
      role,
      bio: bio || '',
      avatar_url: avatar_url || '',
      social_links: social_links || {},
      display_order: order_index || 0
    })

    return NextResponse.json({
      success: true,
      message: 'Team member created successfully',
      teamMember: newMember
    })
  } catch (error: any) {
    console.error('[Team Members API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
