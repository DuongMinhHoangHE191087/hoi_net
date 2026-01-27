import { NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  conflictResponse,
  internalErrorResponse,
  withTiming
} from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema
const createUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['user', 'editor', 'moderator', 'admin']).optional().default('user')
})

// POST: Create new user (Admin only)
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const log = logger.child({ path: '/api/admin/users/create' })

  try {
    // 1. Verify admin authentication
    const admin = await verifyAuth(request)
    if (!admin || !admin.isAdmin) {
      return unauthorizedResponse('Chỉ admin mới có quyền tạo tài khoản')
    }

    // 2. Parse and validate input
    const body = await request.json()
    const validation = createUserSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(', ')
      return badRequestResponse(errors)
    }

    const { email, password, full_name, phone, role } = validation.data

    log.info('Creating new user', { metadata: { email, role, adminId: admin.id } })

    // 3. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || '',
        phone: phone || '',
      },
    })

    if (authError) {
      log.warn('Failed to create user', { error: authError.message, metadata: { email } })

      if (authError.message.includes('already been registered')) {
        return conflictResponse('Email này đã được đăng ký')
      }

      return internalErrorResponse(authError.message)
    }

    if (!authData.user) {
      return internalErrorResponse('Không thể tạo tài khoản')
    }

    // 4. Create/Update user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        full_name: full_name || '',
        phone: phone || '',
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      log.warn('Profile creation failed (non-critical)', { error: profileError.message })
    }

    log.info('User created successfully', {
      metadata: { userId: authData.user.id, email, role }
    })

    // 5. Return success response with timing
    return withTiming(
      successResponse({
        message: 'Tạo tài khoản thành công',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: full_name || '',
          role: role,
        }
      }),
      startTime
    )

  } catch (error: any) {
    log.error('Unexpected error creating user', { error })
    return internalErrorResponse(error)
  }
}

