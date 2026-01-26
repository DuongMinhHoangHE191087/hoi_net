/**
 * API: Create User Request
 * 
 * Enhanced endpoint with:
 * - Server-side request creation (bypasses RLS)
 * - Auto-trigger AI processing if enabled
 * - Proper status transitions
 * - Admin notifications
 * - User confirmation notifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const log = logger.child({ path: '/api/requests' })

// Request status enum for clarity
const REQUEST_STATUS = {
  PENDING: 'pending',           // Waiting for admin/AI
  PROCESSING: 'processing',     // Being processed
  COMPLETED: 'completed',       // Successfully completed
  REJECTED: 'rejected',         // Failed or rejected
  AI_FAILED: 'processing'       // AI failed, needs manual processing
} as const

// Validation schema
const createRequestSchema = z.object({
  type: z.enum(['restore', 'family']),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  original_images: z.array(z.string().url()).min(1, 'Cần ít nhất 1 ảnh'),
  status: z.enum(['pending', 'processing']).optional().default('pending'),
  use_ai: z.boolean().optional().default(false),
  ai_action: z.enum(['restore', 'enhance', 'colorize', 'upscale']).optional()
})

// POST: Create a new request
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const validation = createRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { type, description, original_images, use_ai, ai_action } = validation.data

    log.info('Creating user request', {
      metadata: {
        user_id: user.id,
        user_email: user.email,
        type,
        images_count: original_images.length,
        use_ai
      }
    })

    // Determine initial status
    const initialStatus = use_ai ? REQUEST_STATUS.PROCESSING : REQUEST_STATUS.PENDING

    // Insert using supabaseAdmin (bypasses RLS)
    const { data: insertedRequest, error: insertError } = await supabaseAdmin
      .from('user_requests')
      .insert({
        user_id: user.id,
        type,
        description,
        original_images,
        status: initialStatus,
        admin_notes: use_ai ? 'Đang chờ xử lý AI...' : null
      })
      .select()
      .single()

    if (insertError) {
      log.error('Failed to create request', { error: insertError.message })
      return NextResponse.json(
        { error: 'Database Error', message: insertError.message },
        { status: 500 }
      )
    }

    log.info('Request created successfully', {
      metadata: {
        request_id: insertedRequest.id,
        user_id: user.id,
        status: initialStatus
      }
    })

    // Send confirmation to user
    try {
      const { NotificationService } = await import('@/lib/notifications')
      await NotificationService.createNotification({
        user_id: user.id,
        type: 'info',
        title: '📸 Yêu cầu đã được gửi',
        message: use_ai 
          ? 'Yêu cầu của bạn đang được AI xử lý. Chúng tôi sẽ thông báo khi hoàn tất.'
          : 'Yêu cầu của bạn đã được gửi và đang chờ xử lý.',
        action_url: `/requests`,
        action_label: 'Xem yêu cầu'
      })
    } catch (e) {
      log.warn('Failed to send user confirmation', { error: e })
    }

    // Notify admins (non-blocking)
    try {
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').filter(Boolean)
      
      if (adminEmails.length > 0) {
        const { data: admins } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .in('email', adminEmails)

        if (admins && admins.length > 0) {
          await supabaseAdmin
            .from('notifications')
            .insert(
              admins.map(admin => ({
                user_id: admin.id,
                type: 'info',
                title: '📸 Yêu cầu mới',
                message: `Có yêu cầu ${type === 'restore' ? 'phục hồi ảnh' : 'ảnh gia đình'} mới từ ${user.email}`,
                action_url: `/admin?tab=requests`,
                action_label: 'Xem chi tiết'
              }))
            )
        }
      }
    } catch (notifyError) {
      log.warn('Failed to notify admins', { error: notifyError })
    }

    // Auto-trigger AI processing if enabled
    let aiResult = null
    if (use_ai) {
      try {
        log.info('Auto-triggering AI processing', { metadata: { request_id: insertedRequest.id } })
        
        const aiResponse = await triggerAIProcessing(
          insertedRequest.id,
          ai_action || (type === 'restore' ? 'restore' : 'enhance'),
          user.id
        )
        
        aiResult = aiResponse
        
      } catch (aiError: any) {
        log.error('AI processing failed', { error: aiError.message })
        
        // Update request with AI failure status
        await supabaseAdmin
          .from('user_requests')
          .update({
            status: REQUEST_STATUS.PROCESSING,
            admin_notes: `AI xử lý thất bại: ${aiError.message}. Đang chờ admin xử lý thủ công.`,
            updated_at: new Date().toISOString()
          })
          .eq('id', insertedRequest.id)
        
        aiResult = { success: false, error: aiError.message }
      }
    }

    const processingTime = Date.now() - startTime

    // Return success with request data
    return NextResponse.json({
      success: true,
      message: use_ai 
        ? (aiResult?.success ? 'Yêu cầu đã được AI xử lý thành công!' : 'Yêu cầu đã được tạo. AI đang xử lý...')
        : 'Yêu cầu đã được tạo thành công',
      request: insertedRequest,
      ai_result: aiResult,
      processing_time: `${processingTime}ms`
    })

  } catch (error: any) {
    log.error('Unexpected error creating request', { error })
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * Trigger AI processing for a request
 */
async function triggerAIProcessing(
  requestId: string, 
  action: string, 
  adminId: string
): Promise<{ success: boolean; error?: string; results?: any }> {
  const { processImageWithGemini } = await import('@/lib/gemini')
  
  // Get request details
  const { data: userRequest, error: fetchError } = await supabaseAdmin
    .from('user_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !userRequest) {
    throw new Error('Request not found')
  }

  if (!userRequest.original_images || userRequest.original_images.length === 0) {
    throw new Error('No images to process')
  }

  const startTime = Date.now()

  // Process each image with AI
  const processedResults = await Promise.all(
    userRequest.original_images.map(async (imageUrl: string, index: number) => {
      try {
        const result = await processImageWithGemini(
          imageUrl,
          action as any,
          `Professional ${action} for this image`,
          { model: 'gemini-2.5-flash' }
        )

        return {
          index,
          original: imageUrl,
          success: result.success,
          analysis: result.analysis?.description,
          suggestions: result.analysis?.suggestions?.join(', '),
          error: result.error
        }
      } catch (err: any) {
        return {
          index,
          original: imageUrl,
          success: false,
          error: err.message
        }
      }
    })
  )

  const successCount = processedResults.filter(r => r.success).length
  const failCount = processedResults.filter(r => !r.success).length
  const allSuccess = successCount === userRequest.original_images.length
  const processingTime = ((Date.now() - startTime) / 1000).toFixed(1)

  // Build admin notes
  const adminNotes = `
🤖 AI Processing Results (${action}):
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary:
- Processed: ${successCount}/${userRequest.original_images.length} images
- Failed: ${failCount}
- Time: ${processingTime}s
- Status: ${allSuccess ? '✅ Completed' : (successCount > 0 ? '⚠️ Partial' : '❌ Failed')}

📝 Details:
${processedResults.map((r, i) => `
Image ${i + 1}: ${r.success ? '✅' : '❌'}
${r.success ? `Analysis: ${r.analysis || 'N/A'}` : `Error: ${r.error}`}
`).join('')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Timestamp: ${new Date().toISOString()}
  `.trim()

  // Determine final status
  let finalStatus: string
  if (allSuccess) {
    finalStatus = 'completed'
  } else if (successCount > 0) {
    finalStatus = 'processing' // Partial success, needs admin review
  } else {
    finalStatus = 'processing' // All failed, needs manual processing
  }

  // Update request
  const updates: Record<string, any> = {
    admin_notes: adminNotes,
    admin_id: adminId,
    status: finalStatus,
    updated_at: new Date().toISOString()
  }

  if (allSuccess) {
    updates.completed_at = new Date().toISOString()
    updates.restored_images = userRequest.original_images // Placeholder
  }

  await supabaseAdmin
    .from('user_requests')
    .update(updates)
    .eq('id', requestId)

  // Notify user based on result
  try {
    const { NotificationService } = await import('@/lib/notifications')
    
    if (allSuccess) {
      await NotificationService.notifyRequestUpdate(
        userRequest.user_id,
        requestId,
        'completed',
        `AI đã xử lý thành công ${successCount} ảnh của bạn!`
      )
    } else if (successCount > 0) {
      await NotificationService.notifyRequestUpdate(
        userRequest.user_id,
        requestId,
        'processing',
        `AI đã xử lý ${successCount}/${userRequest.original_images.length} ảnh. Admin sẽ hoàn tất phần còn lại.`
      )
    } else {
      await NotificationService.notifyRequestUpdate(
        userRequest.user_id,
        requestId,
        'processing',
        'AI không thể xử lý ảnh. Admin sẽ xử lý thủ công cho bạn.'
      )
    }
  } catch (e) {
    // Ignore notification errors
  }

  return {
    success: allSuccess,
    results: processedResults,
    error: allSuccess ? undefined : `${failCount} images failed`
  }
}

// GET: List user's own requests
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: requests, error } = await supabaseAdmin
      .from('user_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    )
  }
}
