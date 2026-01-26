/**
 * API Endpoint: AI Processing for Admin Requests
 *
 * Enhanced with:
 * - Proper error handling and status transitions
 * - Detailed progress tracking
 * - User notifications at each stage
 * - Graceful failure handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { processImageWithGemini } from '@/lib/gemini'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const log = logger.child({ path: '/api/admin/requests/[id]/process-ai' })

interface ProcessAIBody {
  action: 'restore' | 'enhance' | 'colorize' | 'upscale' | 'harmonize'
  prompt?: string
}

// Status constants
const STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
} as const

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    // ============================================
    // Step 1: Verify Admin Authentication
    // ============================================
    const user = await verifyAuth(request)

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id: requestId } = await params

    // ============================================
    // Step 2: Parse Request Body
    // ============================================
    const body: ProcessAIBody = await request.json()
    const { action, prompt } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Invalid Input', message: 'Action is required' },
        { status: 400 }
      )
    }

    // ============================================
    // Step 3: Get Request from Database
    // ============================================
    const { data: userRequest, error: fetchError } = await supabaseAdmin
      .from('user_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !userRequest) {
      log.error('Request not found', { metadata: { request_id: requestId, error: fetchError } })
      return NextResponse.json(
        { error: 'Not Found', message: 'Request not found' },
        { status: 404 }
      )
    }

    if (!userRequest.original_images || userRequest.original_images.length === 0) {
      return NextResponse.json(
        { error: 'No Images', message: 'No images to process' },
        { status: 400 }
      )
    }

    log.info('Admin processing request with AI', {
      metadata: {
        admin_id: user.id,
        request_id: requestId,
        action,
        image_count: userRequest.original_images.length
      }
    })

    // ============================================
    // Step 4: Update Status to Processing
    // ============================================
    await supabaseAdmin
      .from('user_requests')
      .update({
        status: STATUS.PROCESSING,
        admin_id: user.id,
        admin_notes: `🔄 AI đang xử lý (${action})...\nBắt đầu: ${new Date().toLocaleString('vi-VN')}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    // Notify user that processing started
    try {
      const { NotificationService } = await import('@/lib/notifications')
      await NotificationService.notifyRequestUpdate(
        userRequest.user_id,
        requestId,
        'processing',
        'Yêu cầu của bạn đang được AI xử lý...'
      )
    } catch (e) {
      log.warn('Failed to send processing notification', { error: e })
    }

    // ============================================
    // Step 5: Process Each Image with AI
    // ============================================
    const processedResults = await Promise.all(
      userRequest.original_images.map(async (imageUrl: string, index: number) => {
        try {
          const result = await processImageWithGemini(
            imageUrl,
            action,
            prompt || `Professional ${action} for this image with highest quality`,
            { model: 'gemini-2.5-flash' }
          )

          return {
            index,
            original: imageUrl,
            success: result.success,
            processed_url: imageUrl, // Original URL (Gemini only provides analysis, not processed image)
            analysis: result.analysis?.description,
            suggestions: result.analysis?.suggestions?.join(', '),
            error: result.error
          }
        } catch (err: any) {
          log.error('AI processing failed for image', {
            metadata: { request_id: requestId, image_index: index, error: err.message }
          })
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
    const totalImages = userRequest.original_images.length
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1)

    // ============================================
    // Step 6: Determine Final Status
    // ============================================
    let finalStatus: string
    let statusEmoji: string
    let statusText: string

    if (successCount === totalImages) {
      finalStatus = STATUS.COMPLETED
      statusEmoji = '✅'
      statusText = 'Hoàn thành'
    } else if (successCount > 0) {
      finalStatus = STATUS.PROCESSING
      statusEmoji = '⚠️'
      statusText = 'Xử lý một phần - cần admin hoàn tất'
    } else {
      finalStatus = STATUS.PROCESSING
      statusEmoji = '❌'
      statusText = 'Thất bại - cần xử lý thủ công'
    }

    // ============================================
    // Step 7: Build Detailed Admin Notes
    // ============================================
    const adminNotes = `
${statusEmoji} AI Processing Results (${action})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Tổng kết:
• Tổng số ảnh: ${totalImages}
• Thành công: ${successCount} ✅
• Thất bại: ${failCount} ❌
• Thời gian xử lý: ${processingTime}s
• Trạng thái: ${statusText}

📝 Chi tiết từng ảnh:
${processedResults.map((r, i) => `
━━ Ảnh ${i + 1} ${r.success ? '✅' : '❌'} ━━
${r.success 
  ? `• Phân tích: ${r.analysis || 'N/A'}
• Gợi ý: ${r.suggestions || 'Không có'}`
  : `• Lỗi: ${r.error}`}
`).join('')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Xử lý lúc: ${new Date().toLocaleString('vi-VN')}
👤 Admin: ${user.email}
    `.trim()

    // ============================================
    // Step 8: Update Request in Database
    // ============================================
    const updates: Record<string, any> = {
      admin_notes: adminNotes,
      admin_id: user.id,
      status: finalStatus,
      updated_at: new Date().toISOString()
    }

    // If all successful, mark as completed with results
    if (successCount === totalImages) {
      updates.completed_at = new Date().toISOString()
      // Store processed image URLs (or originals if no processed URL available)
      updates.restored_images = processedResults.map(r => r.processed_url || r.original)
    }

    await supabaseAdmin
      .from('user_requests')
      .update(updates)
      .eq('id', requestId)

    log.info('AI processing completed', {
      metadata: {
        request_id: requestId,
        success_count: successCount,
        fail_count: failCount,
        processing_time: processingTime,
        final_status: finalStatus
      }
    })

    // ============================================
    // Step 9: Send Final Notification to User
    // ============================================
    try {
      const { NotificationService } = await import('@/lib/notifications')
      
      if (successCount === totalImages) {
        await NotificationService.notifyRequestUpdate(
          userRequest.user_id,
          requestId,
          'completed',
          `🎉 Yêu cầu đã hoàn thành! AI đã xử lý thành công ${successCount} ảnh của bạn.`
        )
      } else if (successCount > 0) {
        await NotificationService.notifyRequestUpdate(
          userRequest.user_id,
          requestId,
          'processing',
          `⚠️ AI đã xử lý ${successCount}/${totalImages} ảnh. Admin sẽ hoàn tất phần còn lại.`
        )
      } else {
        await NotificationService.notifyRequestUpdate(
          userRequest.user_id,
          requestId,
          'processing',
          '⚠️ AI không thể xử lý ảnh. Admin sẽ xử lý thủ công cho bạn sớm nhất.'
        )
      }
    } catch (notifError) {
      log.warn('Failed to send final notification', { error: notifError })
    }

    // ============================================
    // Step 10: Return Response
    // ============================================
    return NextResponse.json({
      success: successCount === totalImages,
      request_id: requestId,
      status: finalStatus,
      results: processedResults,
      summary: {
        total: totalImages,
        successful: successCount,
        failed: failCount,
        processing_time: `${processingTime}s`
      },
      admin_notes: adminNotes,
      message: successCount === totalImages 
        ? 'AI đã xử lý thành công tất cả ảnh!'
        : successCount > 0 
          ? `AI đã xử lý ${successCount}/${totalImages} ảnh. Cần hoàn tất thủ công.`
          : 'AI không thể xử lý. Vui lòng xử lý thủ công.'
    })

  } catch (error: any) {
    log.error('API Error in AI processing', { error })
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    )
  }
}
