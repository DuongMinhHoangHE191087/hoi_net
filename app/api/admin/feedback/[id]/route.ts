import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePermissionAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'
import { invalidateHomepageCache, CACHE_CONFIG } from '@/lib/redis'

export const dynamic = 'force-dynamic'

// PATCH: Update feedback (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requirePermissionAuth(request, 'feedback.respond', async () => {
    try {
      const { id } = params
      const body = await request.json()

      const updatedFeedback = await dbServer.updateFeedback(id, body)

      // Invalidate testimonials cache
      await invalidateHomepageCache([CACHE_CONFIG.TESTIMONIALS.key])

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
  })
}

// DELETE: Delete feedback (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requirePermissionAuth(request, 'feedback.respond', async () => {
    try {
      const { id } = params

      await dbServer.deleteFeedback(id)

      // Invalidate testimonials cache
      await invalidateHomepageCache([CACHE_CONFIG.TESTIMONIALS.key])

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
  })
}
