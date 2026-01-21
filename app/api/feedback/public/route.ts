import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: Get public feedback/testimonials
export async function GET(request: NextRequest) {
  try {
    // For now, we'll get all feedback marked as 'read' status
    // In the future, we can add a separate 'published' or 'featured' field
    const feedback = await db.getFeedback()

    // Filter only feedback that can be shown publicly (has name and content)
    const publicFeedback = feedback
      .filter((item) => item.name && item.message && item.status === 'read')
      .slice(0, 6) // Limit to 6 testimonials

    return NextResponse.json({
      success: true,
      feedback: publicFeedback
    })
  } catch (error: any) {
    console.error('[Public Feedback API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
