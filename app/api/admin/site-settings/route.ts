import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET: Get all site settings (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('[Site Settings API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Convert array to key-value object
    const settings: Record<string, string> = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })

    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('[Site Settings API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT: Update multiple site settings (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings object' }, { status: 400 })
    }

    // Update each setting
    const updates = Object.entries(settings).map(async ([key, value]) => {
      const { error } = await supabaseAdmin
        .from('site_settings')
        .upsert({
          key,
          value: String(value),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })

      if (error) throw error
    })

    await Promise.all(updates)

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    })
  } catch (error: any) {
    console.error('[Site Settings API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Create new site setting (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, description } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .insert({
        key,
        value: String(value),
        description
      })
      .select()
      .single()

    if (error) {
      console.error('[Site Settings API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, setting: data })
  } catch (error: any) {
    console.error('[Site Settings API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete a site setting (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('site_settings')
      .delete()
      .eq('key', key)

    if (error) {
      console.error('[Site Settings API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Setting deleted' })
  } catch (error: any) {
    console.error('[Site Settings API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
