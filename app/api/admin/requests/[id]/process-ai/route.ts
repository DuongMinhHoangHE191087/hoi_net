/**
 * API Endpoint: AI Processing for Admin Requests
 *
 * Enhanced with:
 * - Structured AI error classification with detailed error payloads
 * - Per-image processing timeline with timestamps
 * - Detailed progress tracking & processing logs
 * - User notifications with AI-specific error details
 * - Graceful failure handling with retry suggestions
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionAuth } from '@/lib/auth-server'
import { processImageWithGemini } from '@/lib/gemini'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { logger } from '@/lib/logger'
import { uploadRestoredImage } from '@/lib/ai-image-upload'
import {
  AIErrorClassifier,
  type AIProcessingLog,
  type AIImageResult,
  type ClassifiedAIError
} from '@/lib/ai-error-classifier'

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

// Action labels in Vietnamese
const ACTION_LABELS: Record<string, string> = {
  restore: 'Khôi phục',
  enhance: 'Nâng cao chất lượng',
  colorize: 'Tô màu',
  upscale: 'Phóng to',
  harmonize: 'Cân bằng màu sắc'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  return requirePermissionAuth(request, 'requests.process', async (user) => {
    try {
      const { id: requestId } = await params

    // ============================================
    // Step 1: Parse & Validate Request Body
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
    // Step 2: Get Request from Database
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
    // Step 3: Update Status to Processing
    // ============================================
    await supabaseAdmin
      .from('user_requests')
      .update({
        status: STATUS.PROCESSING,
        admin_id: user.id,
        admin_notes: `🔄 AI đang xử lý (${ACTION_LABELS[action] || action})...\nBắt đầu: ${new Date().toLocaleString('vi-VN')}`,
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
        `🤖 Yêu cầu của bạn đang được AI xử lý (${ACTION_LABELS[action] || action})...`
      )
    } catch (e) {
      log.warn('Failed to send processing notification', { error: e })
    }

    // ============================================
    // Step 4: Process Each Image with AI + Error Classification
    // ============================================
    const imageResults: AIImageResult[] = await Promise.all(
      userRequest.original_images.map(async (imageUrl: string, index: number) => {
        const imageStartTime = Date.now()

        try {
          const result = await processImageWithGemini(
            imageUrl,
            action,
            prompt || `Professional ${action} for this image with highest quality`,
            { model: 'gemini-2.5-flash' }
          )

          let finalUrl = imageUrl

          if (result.success && result.restoredImageBase64 && result.restoredImageMimeType) {
            try {
              const uploadResult = await uploadRestoredImage(
                result.restoredImageBase64,
                result.restoredImageMimeType,
                action
              )
              finalUrl = uploadResult.url
            } catch (upErr) {
              log.error('Failed to upload processed admin image', { error: upErr })
              // Classify upload error
              const classifiedError = AIErrorClassifier.classify(upErr)
              return {
                index,
                originalUrl: imageUrl,
                success: false,
                error: classifiedError,
                processingTimeMs: Date.now() - imageStartTime
              } as AIImageResult
            }
          }

          if (!result.success) {
            // Classify the Gemini processing error
            const classifiedError = AIErrorClassifier.classify(result.error || 'Unknown processing error')
            return {
              index,
              originalUrl: imageUrl,
              success: false,
              error: classifiedError,
              processingTimeMs: Date.now() - imageStartTime
            } as AIImageResult
          }

          return {
            index,
            originalUrl: imageUrl,
            processedUrl: finalUrl,
            success: true,
            analysis: {
              description: result.analysis?.description,
              quality: result.analysis?.quality,
              issues: result.analysis?.issues,
              suggestions: result.analysis?.suggestions,
            },
            processingTimeMs: Date.now() - imageStartTime
          } as AIImageResult

        } catch (err: any) {
          log.error('Error processing single image with AI', { error: err, metadata: { imageUrl, index } })
          const classifiedError = AIErrorClassifier.classify(err)
          return {
            index,
            originalUrl: imageUrl,
            success: false,
            error: classifiedError,
            processingTimeMs: Date.now() - imageStartTime
          } as AIImageResult
        }
      })
    )

    const successCount = imageResults.filter(r => r.success).length
    const failCount = imageResults.filter(r => !r.success).length
    const totalImages = userRequest.original_images.length
    const processingTimeMs = Date.now() - startTime

    // ============================================
    // Step 5: Build Processing Log
    // ============================================
    const overallStatus: AIProcessingLog['overallStatus'] =
      successCount === totalImages ? 'success' :
      successCount > 0 ? 'partial' : 'failed'

    const processingLog: AIProcessingLog = {
      requestId,
      action,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      totalImages,
      results: imageResults,
      overallStatus,
      processingTimeMs,
      adminEmail: user.email
    }

    // ============================================
    // Step 6: Determine Final Status & Build Notes
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

    // Build detailed admin notes with error classification
    const adminNotes = buildAdminNotes({
      statusEmoji,
      action,
      totalImages,
      successCount,
      failCount,
      processingTimeMs,
      statusText,
      imageResults,
      adminEmail: user.email || ''
    })

    // ============================================
    // Step 7: Update Request in Database
    // ============================================
    const updates: Record<string, any> = {
      admin_notes: adminNotes,
      admin_id: user.id,
      status: finalStatus,
      updated_at: new Date().toISOString()
    }

    if (successCount === totalImages) {
      updates.completed_at = new Date().toISOString()
      updates.restored_images = imageResults.map(r => r.processedUrl || r.originalUrl)
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
        processing_time_ms: processingTimeMs,
        final_status: finalStatus,
        overall_status: overallStatus,
        error_categories: imageResults
          .filter(r => !r.success && r.error)
          .map(r => r.error!.category)
      }
    })

    // ============================================
    // Step 8: Send Detailed Notification to User
    // ============================================
    try {
      const { NotificationService } = await import('@/lib/notifications')
      const notif = AIErrorClassifier.buildNotificationMessage(processingLog)

      await NotificationService.notifyRequestUpdate(
        userRequest.user_id,
        requestId,
        overallStatus === 'success' ? 'completed' :
        overallStatus === 'partial' ? 'processing' : 'failed',
        notif.message
      )
    } catch (notifError) {
      log.warn('Failed to send final notification', { error: notifError })
    }

    // ============================================
    // Step 9: Return Structured Response
    // ============================================
    return NextResponse.json({
      success: successCount === totalImages,
      request_id: requestId,
      status: finalStatus,
      processing_log: processingLog,
      results: imageResults,
      summary: {
        total: totalImages,
        successful: successCount,
        failed: failCount,
        processing_time: `${(processingTimeMs / 1000).toFixed(1)}s`,
        overall_status: overallStatus
      },
      admin_notes: adminNotes,
      // Error summary for quick admin reference
      error_summary: failCount > 0 ? {
        categories: [...new Set(
          imageResults
            .filter(r => !r.success && r.error)
            .map(r => r.error!.category)
        )],
        retryable: imageResults.some(r => !r.success && r.error?.retryable),
        main_error: imageResults.find(r => !r.success && r.error)?.error
      } : null,
      message: successCount === totalImages
        ? `AI đã xử lý thành công tất cả ${totalImages} ảnh!`
        : successCount > 0
          ? `AI đã xử lý ${successCount}/${totalImages} ảnh. ${failCount} ảnh gặp lỗi.`
          : 'AI không thể xử lý. Vui lòng xử lý thủ công.'
    })

  } catch (error: any) {
    log.error('API Error in AI processing', { error })
    const classifiedError = AIErrorClassifier.classify(error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message,
        classified_error: classifiedError
      },
      { status: 500 }
    )
  }
  }) // Close requirePermissionAuth callback
}

// ============================================
// Helper: Build Detailed Admin Notes
// ============================================
function buildAdminNotes(params: {
  statusEmoji: string
  action: string
  totalImages: number
  successCount: number
  failCount: number
  processingTimeMs: number
  statusText: string
  imageResults: AIImageResult[]
  adminEmail: string
}): string {
  const {
    statusEmoji, action, totalImages, successCount, failCount,
    processingTimeMs, statusText, imageResults, adminEmail
  } = params

  const actionLabel = ACTION_LABELS[action] || action
  const timeStr = (processingTimeMs / 1000).toFixed(1)

  let notes = `${statusEmoji} AI Processing: ${actionLabel}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Tổng kết:
• Tổng số ảnh: ${totalImages}
• Thành công: ${successCount} ✅
• Thất bại: ${failCount} ❌
• Thời gian: ${timeStr}s
• Trạng thái: ${statusText}

📝 Chi tiết từng ảnh:`

  for (const result of imageResults) {
    if (result.success) {
      notes += `
━━ Ảnh ${result.index + 1} ✅ ━━
• Phân tích: ${result.analysis?.description || 'N/A'}
• Chất lượng: ${result.analysis?.quality || 'N/A'}
• Gợi ý đã áp dụng: ${result.analysis?.suggestions?.join(', ') || 'Không có'}
• Thời gian: ${result.processingTimeMs ? (result.processingTimeMs / 1000).toFixed(1) + 's' : 'N/A'}`
    } else {
      const err = result.error
      notes += `
━━ Ảnh ${result.index + 1} ❌ ━━
• Loại lỗi: ${err ? AIErrorClassifier.getCategoryLabel(err.category) : 'Không xác định'}
• Mức độ: ${err?.severity || 'N/A'}
• Chi tiết: ${err?.adminMessage || 'Lỗi không xác định'}
• Có thể thử lại: ${err?.retryable ? 'Có' : 'Không'}
• Đề xuất: ${err?.suggestedActions?.join(' | ') || 'Xử lý thủ công'}`
    }
  }

  notes += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Xử lý lúc: ${new Date().toLocaleString('vi-VN')}
👤 Admin: ${adminEmail}`

  return notes.trim()
}