/**
 * API Endpoint: Notify Admins About New Requests
 * 
 * Used to send notifications to all admins when:
 * - A new request is created
 * - A request needs attention
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NotificationService } from '@/lib/notifications'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim())
  .filter(Boolean)

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // Step 1: Verify Authentication
    // ============================================
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ============================================
    // Step 2: Parse Request Body
    // ============================================
    const body = await request.json()
    const { type, requestId, userId } = body

    if (!type || !requestId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, requestId' },
        { status: 400 }
      )
    }

    // ============================================
    // Step 3: Get Admin User IDs
    // ============================================
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, email')
      .in('email', ADMIN_EMAILS)

    if (adminError) {
      logger.error('Failed to fetch admins', { error: adminError })
      return NextResponse.json(
        { error: 'Failed to fetch admins' },
        { status: 500 }
      )
    }

    if (!admins || admins.length === 0) {
      logger.warn('No admins found')
      return NextResponse.json({
        success: true,
        message: 'No admins configured',
        notified: 0
      })
    }

    // ============================================
    // Step 4: Get Request Details
    // ============================================
    const { data: userRequest, error: requestError } = await supabaseAdmin
      .from('user_requests')
      .select('id, type, description, original_images')
      .eq('id', requestId)
      .single()

    if (requestError || !userRequest) {
      logger.error('Request not found', { metadata: { requestId } })
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // ============================================
    // Step 5: Get User Profile
    // ============================================
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single()

    const userName = userProfile?.full_name || userProfile?.email || 'Người dùng'

    // ============================================
    // Step 6: Send Notifications to All Admins
    // ============================================
    const notifications = await Promise.allSettled(
      admins.map(admin =>
        NotificationService.createNotification({
          user_id: admin.id,
          type: 'info',
          title: '📸 Yêu cầu mới cần xử lý',
          message: `${userName} đã gửi yêu cầu ${userRequest.type === 'restore' ? 'phục hồi ảnh cũ' : 'ảnh gia đình'} với ${userRequest.original_images.length} ảnh.`,
          action_url: `/admin/requests?id=${requestId}`,
          action_label: 'Xem chi tiết',
          metadata: {
            request_id: requestId,
            request_type: userRequest.type,
            user_id: userId,
            image_count: userRequest.original_images.length
          }
        })
      )
    )

    const successCount = notifications.filter(n => n.status === 'fulfilled').length

    logger.info('Admin notifications sent', {
      metadata: {
        request_id: requestId,
        admins_notified: successCount,
        total_admins: admins.length
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notifications sent to admins',
      notified: successCount,
      total_admins: admins.length
    })

  } catch (error: any) {
    logger.error('Failed to notify admins', { error })
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    )
  }
}
