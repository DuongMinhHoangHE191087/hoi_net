import { NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
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

// Validation schemas
const deliverSchema = z.object({
  restored_images: z.array(z.string().url()).min(1, 'Cần ít nhất 1 ảnh đã phục hồi'),
  admin_notes: z.string().optional()
})

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'rejected']).optional(),
  admin_notes: z.string().optional()
})

// POST: Deliver restored images to user (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return unauthorizedResponse()
    }

    const { id: requestId } = await params
    const body = await request.json()

    // Validate input
    const validation = deliverSchema.safeParse(body)
    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message)
    }

    const { restored_images, admin_notes } = validation.data

    // Verify request exists
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from('user_requests')
      .select('id, user_id, status')
      .eq('id', requestId)
      .single()

    if (fetchError || !existingRequest) {
      return notFoundResponse('Request')
    }

    // Update request with restored images
    const { data, error } = await supabaseAdmin
      .from('user_requests')
      .update({
        restored_images,
        admin_notes: admin_notes || null,
        admin_id: user.id,
        status: 'completed',
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

    return withTiming(
      successResponse({
        message: 'Giao ảnh thành công',
        request: data
      }),
      startTime
    )

  } catch (error: any) {
    log.error('Unexpected error delivering request', { error })
    return internalErrorResponse(error)
  }
}

// PATCH: Update request status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return unauthorizedResponse()
    }

    const { id: requestId } = await params
    const body = await request.json()

    // Validate input
    const validation = updateStatusSchema.safeParse(body)
    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message)
    }

    const { status, admin_notes } = validation.data

    // Build updates
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updates.status = status
      if (status === 'processing') {
        updates.admin_id = user.id
      }
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
      }
    }

    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes
    }

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

    log.info('Request updated', {
      metadata: { requestId, status, adminId: user.id }
    })

    return withTiming(
      successResponse({
        message: 'Cập nhật thành công',
        request: data
      }),
      startTime
    )

  } catch (error: any) {
    log.error('Unexpected error updating request', { error })
    return internalErrorResponse(error)
  }
}
