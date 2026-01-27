/**
 * API Endpoint: Admin Delivery & Status Management
 *
 * Enhanced with:
 * - Complete delivery flow with image upload
 * - Proper status transitions
 * - User notifications
 * - Rejection handling
 * - Detailed logging
 */

import { NextRequest } from 'next/server'
import { requirePermissionAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
  withTiming
} from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const log = logger.child({ path: '/api/admin/requests/[id]/deliver' })

// Status constants
const STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
} as const

// Validation schemas
const deliverSchema = z.object({
  restored_images: z.array(z.string().url()).min(1, 'Cần ít nhất 1 ảnh đã phục hồi'),
  admin_notes: z.string().optional(),
  notify_user: z.boolean().optional().default(true)
})

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'rejected']),
  admin_notes: z.string().optional(),
  rejection_reason: z.string().optional(),
  notify_user: z.boolean().optional().default(true)
})

// POST: Deliver restored images to user (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  return requirePermissionAuth(request, 'requests.process', async (user) => {
    try {
      const { id: requestId } = await params
      const body = await request.json()

    // Validate input
    const validation = deliverSchema.safeParse(body)
    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message)
    }

    const { restored_images, admin_notes, notify_user } = validation.data

    // Get existing request with user info
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from('user_requests')
      .select('id, user_id, status, type, original_images, description')
      .eq('id', requestId)
      .single()

    if (fetchError || !existingRequest) {
      return notFoundResponse('Request')
    }

    log.info('Admin delivering request', {
      metadata: {
        requestId,
        adminId: user.id,
        previousStatus: existingRequest.status,
        imagesCount: restored_images.length
      }
    })

    // Build comprehensive admin notes
    const finalNotes = `
✅ Đã giao kết quả thành công!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Thông tin giao:
• Số ảnh gốc: ${existingRequest.original_images?.length || 0}
• Số ảnh đã xử lý: ${restored_images.length}
• Thời gian giao: ${new Date().toLocaleString('vi-VN')}

👤 Admin xử lý: ${user.email}

${admin_notes ? `📝 Ghi chú:\n${admin_notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim()

    // Update request with restored images
    const { data, error } = await supabaseAdmin
      .from('user_requests')
      .update({
        restored_images,
        admin_notes: finalNotes,
        admin_id: user.id,
        status: STATUS.COMPLETED,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
      log.error('Failed to deliver request', { error: error.message, metadata: { requestId } })
      return internalErrorResponse(error.message)
    }

    log.info('Request delivered successfully', {
      metadata: { requestId, adminId: user.id, imagesCount: restored_images.length }
    })

    // Notify user about completed request
    if (notify_user) {
      try {
        const { NotificationService } = await import('@/lib/notifications')
        await NotificationService.createNotification({
          user_id: existingRequest.user_id,
          type: 'success',
          title: '🎉 Yêu cầu đã hoàn thành!',
          message: `Yêu cầu ${existingRequest.type === 'restore' ? 'phục hồi ảnh' : 'ảnh gia đình'} của bạn đã được xử lý xong. Bạn có ${restored_images.length} ảnh đã sẵn sàng!`,
          action_url: `/requests`,
          action_label: 'Xem kết quả',
          metadata: { request_id: requestId }
        })
        log.info('User notification sent', { metadata: { userId: existingRequest.user_id } })
      } catch (notifyError: any) {
        log.warn('Failed to send user notification', { error: notifyError.message })
      }
    }

    return withTiming(
      successResponse({
        message: 'Giao ảnh thành công! Người dùng đã được thông báo.',
        request: data
      }),
      startTime
    )

    } catch (error: any) {
      log.error('Unexpected error delivering request', { error })
      return internalErrorResponse(error)
    }
  })
}

// PATCH: Update request status (Requires requests.process)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  return requirePermissionAuth(request, 'requests.process', async (user) => {
    try {
      const { id: requestId } = await params
      const body = await request.json()

    // Validate input
    const validation = updateStatusSchema.safeParse(body)
    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message)
    }

    const { status, admin_notes, rejection_reason, notify_user } = validation.data

    // Get existing request
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from('user_requests')
      .select('id, user_id, status, type, admin_notes')
      .eq('id', requestId)
      .single()

    if (fetchError || !existingRequest) {
      return notFoundResponse('Request')
    }

    log.info('Admin updating request status', {
      metadata: {
        requestId,
        adminId: user.id,
        previousStatus: existingRequest.status,
        newStatus: status
      }
    })

    // Build updates based on status
    const updates: Record<string, any> = {
      status,
      admin_id: user.id,
      updated_at: new Date().toISOString()
    }

    // Handle different status transitions
    switch (status) {
      case STATUS.PROCESSING:
        updates.admin_notes = `
🔄 Đang xử lý
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin ${user.email} đã tiếp nhận yêu cầu.
Bắt đầu xử lý lúc: ${new Date().toLocaleString('vi-VN')}
${admin_notes ? `\n📝 Ghi chú: ${admin_notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
        break

      case STATUS.COMPLETED:
        updates.completed_at = new Date().toISOString()
        updates.admin_notes = `
✅ Hoàn thành
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin ${user.email} đã hoàn thành yêu cầu.
Hoàn thành lúc: ${new Date().toLocaleString('vi-VN')}
${admin_notes ? `\n📝 Ghi chú: ${admin_notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
        break

      case STATUS.REJECTED:
        updates.completed_at = new Date().toISOString()
        updates.admin_notes = `
❌ Từ chối
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin ${user.email} đã từ chối yêu cầu.
Thời gian: ${new Date().toLocaleString('vi-VN')}

📝 Lý do: ${rejection_reason || admin_notes || 'Không đáp ứng yêu cầu'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
        break

      case STATUS.PENDING:
        updates.admin_notes = admin_notes || existingRequest.admin_notes
        updates.admin_id = null // Reset admin assignment
        break
    }

    // Perform update
    const { data, error } = await supabaseAdmin
      .from('user_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
      log.error('Failed to update request', { error: error.message, metadata: { requestId } })
      return internalErrorResponse(error.message)
    }

    log.info('Request status updated', {
      metadata: { requestId, status, adminId: user.id }
    })

    // Notify user if enabled
    if (notify_user) {
      try {
        const { NotificationService } = await import('@/lib/notifications')
        
        const notificationConfig: Record<string, { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }> = {
          processing: {
            title: '⏳ Yêu cầu đang được xử lý',
            message: 'Admin đã tiếp nhận và đang xử lý yêu cầu của bạn.',
            type: 'info'
          },
          completed: {
            title: '✅ Yêu cầu hoàn thành',
            message: 'Yêu cầu của bạn đã được xử lý thành công!',
            type: 'success'
          },
          rejected: {
            title: '❌ Yêu cầu bị từ chối',
            message: rejection_reason || 'Yêu cầu không thể được xử lý. Vui lòng liên hệ hỗ trợ.',
            type: 'error'
          },
          pending: {
            title: '📋 Yêu cầu đang chờ',
            message: 'Yêu cầu của bạn đang chờ được xử lý.',
            type: 'info'
          }
        }

        const config = notificationConfig[status]
        if (config) {
          await NotificationService.createNotification({
            user_id: existingRequest.user_id,
            type: config.type,
            title: config.title,
            message: config.message,
            action_url: `/requests`,
            action_label: 'Xem chi tiết',
            metadata: { request_id: requestId, status }
          })
        }
      } catch (notifyError: any) {
        log.warn('Failed to send status notification', { error: notifyError.message })
      }
    }

    return withTiming(
      successResponse({
        message: `Cập nhật trạng thái thành "${status}" thành công`,
        request: data
      }),
      startTime
    )

    } catch (error: any) {
      log.error('Unexpected error updating request', { error })
      return internalErrorResponse(error)
    }
  })
}

// DELETE: Cancel/Delete a request (Requires requests.delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  return requirePermissionAuth(request, 'requests.delete', async (user) => {
    try {
      const { id: requestId } = await params

    // Get existing request
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from('user_requests')
      .select('id, user_id, status')
      .eq('id', requestId)
      .single()

    if (fetchError || !existingRequest) {
      return notFoundResponse('Request')
    }

    // Only allow deletion of pending or rejected requests
    if (!['pending', 'rejected'].includes(existingRequest.status)) {
      return badRequestResponse('Chỉ có thể xóa yêu cầu đang chờ hoặc bị từ chối')
    }

    // Delete request
    const { error } = await supabaseAdmin
      .from('user_requests')
      .delete()
      .eq('id', requestId)

    if (error) {
      log.error('Failed to delete request', { error: error.message, metadata: { requestId } })
      return internalErrorResponse(error.message)
    }

    log.info('Request deleted', { metadata: { requestId, adminId: user.id } })

    return withTiming(
      successResponse({ message: 'Đã xóa yêu cầu' }),
      startTime
    )

    } catch (error: any) {
      log.error('Unexpected error deleting request', { error })
      return internalErrorResponse(error)
    }
  })
}
