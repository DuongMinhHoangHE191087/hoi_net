import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { updateWithOptimisticLock, logConflict } from '@/lib/optimistic-lock'
import { versionConflictResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

// PATCH: Update feedback (admin only) - uses optimistic locking when the
// client sends a `version`, so two admins moderating the same feedback at
// once don't silently clobber each other's changes.
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
    const { version, ...updates } = body

    if (version !== undefined) {
      const result = await updateWithOptimisticLock(
        supabaseAdmin,
        'feedback',
        id,
        updates,
        version
      )

      if (result.conflict) {
        await logConflict(supabaseAdmin, {
          tableName: 'feedback',
          rowId: id,
          expectedVersion: version,
          actualVersion: result.currentVersion || 0,
          userId: user.id
        })

        return versionConflictResponse(version, result.currentVersion || 0, 'Feedback')
      }

      if (result.error) {
        console.error('[Feedback API] Update error:', result.error)
        return NextResponse.json({ error: result.error.message }, { status: 500 })
      }

      revalidatePath('/')

      return NextResponse.json({
        success: true,
        message: 'Feedback updated successfully',
        feedback: result.data
      })
    }

    // Fallback: update without version check (backwards compatibility)
    const updatedFeedback = await dbServer.updateFeedback(id, updates)

    // Revalidate homepage if testimonials changed
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: updatedFeedback
    })
  } catch (error: any) {
    console.error('[Feedback API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete feedback (admin only)
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

    await dbServer.deleteFeedback(id)

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    })
  } catch (error: any) {
    console.error('[Feedback API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
