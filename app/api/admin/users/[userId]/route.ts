import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hasServerPermission } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET: Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasServerPermission(user, 'admin.users.manage')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await params

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[Admin User] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
    console.error('[Admin User] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH: Update user (role, blocked status, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasServerPermission(user, 'admin.users.manage')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await params
    const body = await request.json()

    // Allowed update fields
    const allowedFields = ['role', 'is_blocked', 'blocked_reason', 'full_name', 'phone']
    const updates: Record<string, any> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // Only admin can change roles
    if (updates.role !== undefined && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate role values (defense-in-depth)
    if (updates.role !== undefined) {
      const allowedRoles = new Set(['admin', 'moderator', 'editor', 'user'])
      if (!allowedRoles.has(String(updates.role))) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
    }

    // If blocking user, set blocked_at timestamp
    if (body.is_blocked === true) {
      updates.blocked_at = new Date().toISOString()
    } else if (body.is_blocked === false) {
      updates.blocked_at = null
      updates.blocked_reason = null
    }

    // Prevent admin from changing their own role
    if (userId === user.id && updates.role) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Prevent blocking yourself
    if (userId === user.id && updates.is_blocked === true) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('[Admin User Update] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: data
    })
  } catch (error: any) {
    console.error('[Admin User Update] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await params

    // Prevent deleting yourself
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete the user profile (auth.users deletion requires service role)
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('[Admin User Delete] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('[Admin User Delete] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
