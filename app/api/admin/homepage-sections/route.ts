import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// Define the homepage sections configuration
const HOMEPAGE_SECTIONS_KEY = 'homepage_sections_config'

interface HomepageSection {
  key: string
  is_visible: boolean
  display_order: number
}

// GET: Get homepage sections visibility and order settings
export async function GET(request: NextRequest) {
  try {
    const setting = await dbServer.getSiteSetting(HOMEPAGE_SECTIONS_KEY)
    
    let sections: HomepageSection[] = []
    
    if (setting && setting.value) {
      try {
        sections = JSON.parse(setting.value)
      } catch {
        sections = []
      }
    }

    return NextResponse.json({
      success: true,
      sections
    })
  } catch (error: any) {
    console.error('[Homepage Sections API] GET Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Update homepage sections visibility and order (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sections } = await request.json()

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: 'Sections array is required' }, { status: 400 })
    }

    // Validate section structure
    const validatedSections = sections.map((section: any, index: number) => ({
      key: section.key,
      is_visible: Boolean(section.is_visible),
      display_order: typeof section.display_order === 'number' ? section.display_order : index
    }))

    // Save as JSON string in site_settings
    await dbServer.updateSiteSetting(HOMEPAGE_SECTIONS_KEY, JSON.stringify(validatedSections))

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Homepage sections updated successfully',
      sections: validatedSections
    })
  } catch (error: any) {
    console.error('[Homepage Sections API] POST Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

