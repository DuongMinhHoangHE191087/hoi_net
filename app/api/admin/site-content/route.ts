import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// GET: Get all site settings
export async function GET(request: NextRequest) {
  try {
    const settings = await dbServer.getAllSiteSettings()

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error: any) {
    console.error('[Site Settings API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Update multiple site settings (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { settings } = await request.json()

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object is required' }, { status: 400 })
    }

    await dbServer.updateMultipleSiteSettings(settings)

    // Revalidate all pages that use site settings
    revalidatePath('/')
    revalidatePath('/about')

    return NextResponse.json({
      success: true,
      message: 'Site settings updated successfully'
    })
  } catch (error: any) {
    console.error('[Site Settings API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

