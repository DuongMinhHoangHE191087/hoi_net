import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: Get public feedback/testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    
    if (all) {
      // Get all testimonials for dedicated feedback page
      const testimonials = await db.getAllPublicTestimonials()
      return NextResponse.json({
        success: true,
        feedback: testimonials
      })
    }
    
    // Get limited testimonials for homepage (default: 6)
    const limit = parseInt(searchParams.get('limit') || '6', 10)
    const testimonials = await db.getTestimonials(limit)

    return NextResponse.json({
      success: true,
      feedback: testimonials
    })
  } catch (error: any) {
    console.error('[Public Feedback API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

