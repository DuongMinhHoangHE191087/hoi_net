import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { updateWithOptimisticLock, logConflict } from '@/lib/optimistic-lock'
import { versionConflictResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

// PATCH: Update value section (admin only) - uses optimistic locking when
// the client sends a `version`, so two admins editing the same section at
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
        'value_sections',
        id,
        updates,
        version
      )

      if (result.conflict) {
        await logConflict(supabaseAdmin, {
          tableName: 'value_sections',
          rowId: id,
          expectedVersion: version,
          actualVersion: result.currentVersion || 0,
          userId: user.id
        })

        return versionConflictResponse(version, result.currentVersion || 0, 'Value section')
      }

      if (result.error) {
        console.error('[Values API] Update error:', result.error)
        return NextResponse.json({ error: result.error.message }, { status: 500 })
      }

      revalidatePath('/')

      return NextResponse.json({
        success: true,
        message: 'Value section updated successfully',
        valueSection: result.data
      })
    }

    // Fallback: update without version check (backwards compatibility)
    const updatedValueSection = await dbServer.updateValueSection(id, updates)

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Value section updated successfully',
      valueSection: updatedValueSection
    })
  } catch (error: any) {
    console.error('[Values API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete value section (admin only)
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

    await dbServer.deleteValueSection(id)

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Value section deleted successfully'
    })
  } catch (error: any) {
    console.error('[Values API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
