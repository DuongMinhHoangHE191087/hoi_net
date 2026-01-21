import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// GET: Get all features
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const features = activeOnly
      ? await dbServer.getActiveFeatures()
      : await dbServer.getAllFeatures()

    return NextResponse.json({
      success: true,
      features
    })
  } catch (error: any) {
    console.error('[Features API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Create new feature (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, icon_type, icon_value, display_order, is_active } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const newFeature = await dbServer.createFeature({
      title,
      description,
      icon_type: icon_type || 'lucide',
      icon_value: icon_value || 'Sparkles',
      display_order: display_order ?? 0,
      is_active: is_active !== undefined ? is_active : true
    })

    return NextResponse.json({
      success: true,
      message: 'Feature created successfully',
      feature: newFeature
    })
  } catch (error: any) {
    console.error('[Features API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
