import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET: Get user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // If preferences don't exist, create default
      if (error.code === 'PGRST116') {
        const { data: newPrefs, error: createError } = await supabaseAdmin
          .from('notification_preferences')
          .insert({ user_id: user.id })
          .select()
          .single()

        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        return NextResponse.json({ preferences: newPrefs })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ preferences: data })
  } catch (error: any) {
    console.error('[Notification Preferences API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT: Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      email_notifications,
      push_notifications,
      request_updates,
      request_delivered,
      system_announcements,
      marketing_emails,
      email_frequency
    } = body

    const updates: any = {}
    if (email_notifications !== undefined) updates.email_notifications = email_notifications
    if (push_notifications !== undefined) updates.push_notifications = push_notifications
    if (request_updates !== undefined) updates.request_updates = request_updates
    if (request_delivered !== undefined) updates.request_delivered = request_delivered
    if (system_announcements !== undefined) updates.system_announcements = system_announcements
    if (marketing_emails !== undefined) updates.marketing_emails = marketing_emails
    if (email_frequency) updates.email_frequency = email_frequency

    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated',
      preferences: data
    })
  } catch (error: any) {
    console.error('[Notification Preferences API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
