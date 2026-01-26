import { NextRequest, NextResponse } from 'next/server'
import { getTestimonials } from '@/lib/supabase/server-utils'

export const dynamic = 'force-dynamic'

// GET: Get public feedback/testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    
    // Get testimonials with optional limit
    const limit = all ? undefined : parseInt(searchParams.get('limit') || '6', 10)
    const testimonials = await getTestimonials(limit || 100)

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

