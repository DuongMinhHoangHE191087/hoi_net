/**
 * API: Request Feedback
 * Allows users to rate and provide feedback on completed requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const log = logger.child({ path: '/api/requests/[id]/feedback' })

// Validation schema
const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  quality_rating: z.number().min(1).max(5).optional(),
  speed_rating: z.number().min(1).max(5).optional(),
  would_recommend: z.boolean().optional(),
  tags: z.array(z.string()).optional()
})

// GET: Get feedback for a request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: requestId } = await params

    // Get feedback
    const { data, error } = await supabaseAdmin
      .from('request_feedback')
      .select('*')
      .eq('request_id', requestId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error
    }

    return NextResponse.json({
      feedback: data || null,
      hasFeedback: !!data
    })

  } catch (error: any) {
    log.error('Error fetching feedback:', { error })
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST: Submit feedback for a request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: requestId } = await params
    const body = await request.json()

    // Validate input
    const validation = feedbackSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { rating, comment, quality_rating, speed_rating, would_recommend, tags } = validation.data

    // Verify request exists and belongs to user
    const { data: userRequest, error: fetchError } = await supabaseAdmin
      .from('user_requests')
      .select('id, user_id, status')
      .eq('id', requestId)
      .single()

    if (fetchError || !userRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (userRequest.user_id !== user.id && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - not your request' },
        { status: 403 }
      )
    }

    // Check if request is completed
    if (userRequest.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only provide feedback for completed requests' },
        { status: 400 }
      )
    }

    // Check if feedback already exists
    const { data: existingFeedback } = await supabaseAdmin
      .from('request_feedback')
      .select('id')
      .eq('request_id', requestId)
      .single()

    if (existingFeedback) {
      // Update existing feedback
      const { data, error } = await supabaseAdmin
        .from('request_feedback')
        .update({
          rating,
          comment: comment || null,
          quality_rating: quality_rating || null,
          speed_rating: speed_rating || null,
          would_recommend: would_recommend ?? null,
          tags: tags || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingFeedback.id)
        .select()
        .single()

      if (error) throw error

      log.info('Feedback updated', { 
        metadata: { request_id: requestId, user_id: user.id, rating } 
      })

      return NextResponse.json({
        success: true,
        message: 'Cảm ơn bạn đã cập nhật đánh giá!',
        feedback: data
      })
    }

    // Create new feedback
    const { data, error } = await supabaseAdmin
      .from('request_feedback')
      .insert({
        request_id: requestId,
        user_id: user.id,
        rating,
        comment: comment || null,
        quality_rating: quality_rating || null,
        speed_rating: speed_rating || null,
        would_recommend: would_recommend ?? null,
        tags: tags || null
      })
      .select()
      .single()

    if (error) throw error

    log.info('Feedback submitted', { 
      metadata: { request_id: requestId, user_id: user.id, rating } 
    })

    // Notify admin about positive feedback (4-5 stars)
    if (rating >= 4) {
      try {
        const { NotificationService } = await import('@/lib/notifications')
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').filter(Boolean)
        
        if (adminEmails.length > 0) {
          const { data: admins } = await supabaseAdmin
            .from('user_profiles')
            .select('id')
            .in('email', adminEmails)
            .limit(5)

          if (admins && admins.length > 0) {
            for (const admin of admins) {
              await NotificationService.createNotification({
                user_id: admin.id,
                type: 'success',
                title: `⭐ Đánh giá ${rating} sao mới!`,
                message: comment 
                  ? `"${comment.slice(0, 100)}${comment.length > 100 ? '...' : ''}"` 
                  : 'Khách hàng hài lòng với kết quả!',
                action_url: `/admin?tab=requests`,
                action_label: 'Xem chi tiết'
              })
            }
          }
        }
      } catch (e) {
        log.warn('Failed to notify admins about feedback', { error: e })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cảm ơn bạn đã gửi đánh giá!',
      feedback: data
    })

  } catch (error: any) {
    log.error('Error submitting feedback:', { error })
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
