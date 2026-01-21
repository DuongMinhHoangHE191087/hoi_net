import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// POST: Reset user password (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await verifyAuth(request)
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const body = await request.json()
    const { new_password } = body

    // Validate password
    if (!new_password) {
      return NextResponse.json(
        { error: 'Mật khẩu mới là bắt buộc' },
        { status: 400 }
      )
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      )
    }

    // Update user password using admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: new_password,
    })

    if (error) {
      console.error('[Admin Reset Password] Error:', error)

      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Không tìm thấy người dùng' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Update the user_profiles updated_at timestamp
    await supabaseAdmin
      .from('user_profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)

    return NextResponse.json({
      message: 'Đặt lại mật khẩu thành công'
    })
  } catch (error: any) {
    console.error('[Admin Reset Password] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
