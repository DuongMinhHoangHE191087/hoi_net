import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// GET: Get all value sections
export async function GET(request: NextRequest) {
  try {
    const valueSections = await dbServer.getAllValueSections()

    return NextResponse.json({
      success: true,
      valueSections
    })
  } catch (error: any) {
    console.error('[Values API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Create new value section (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, icon, gradient, display_order, is_active } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const newValueSection = await dbServer.createValueSection({
      title,
      description,
      icon: icon || 'Target',
      gradient: gradient || 'from-pink-500 via-rose-500 to-red-500',
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true
    })

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Value section created successfully',
      valueSection: newValueSection
    })
  } catch (error: any) {
    console.error('[Values API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

