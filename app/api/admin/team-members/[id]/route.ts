import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// PATCH: Update team member (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updatedMember = await dbServer.updateTeamMember(id, body)

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully',
      teamMember: updatedMember
    })
  } catch (error: any) {
    console.error('[Team Member API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete team member (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    console.log('[Team Member DELETE] Deleting team member with ID:', id)

    await dbServer.deleteTeamMember(id)
    console.log('[Team Member DELETE] Successfully deleted team member:', id)

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully'
    })
  } catch (error: any) {
    console.error('[Team Member DELETE] Error:', error)
    console.error('[Team Member DELETE] Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
