import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePermissionAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// Helper to add no-cache headers
const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
}

// GET: Get all feedback (admin only)
export async function GET(request: NextRequest) {
  return requirePermissionAuth(request, 'feedback.view', async () => {
    try {
      const feedback = await dbServer.getFeedback()

      return NextResponse.json({
        success: true,
        feedback
      }, { headers: noCacheHeaders })
    } catch (error: any) {
      console.error('[Feedback API] Error:', error)
      return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
  })
}

