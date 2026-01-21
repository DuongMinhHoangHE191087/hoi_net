/**
 * API Endpoint: AI Processing for Admin Requests
 *
 * Allows admin to trigger AI processing for user requests
 * Processes original images and stores results
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { processImageWithGemini } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

interface ProcessAIBody {
  action: 'restore' | 'enhance' | 'colorize' | 'upscale' | 'harmonize'
  prompt?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const requestId = params.id

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
    const supabase = await createClient()

    const { data: userRequest, error: fetchError } = await supabase
      .from('user_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !userRequest) {
      logger.error('Request not found', {
        metadata: { request_id: requestId, error: fetchError }
      })
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

    logger.info('Admin processing request with AI', {
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
    await supabase
      .from('user_requests')
      .update({
        status: 'processing',
        admin_id: user.id
      })
      .eq('id', requestId)

    // ============================================
    // Step 5: Process Each Image with AI
    // ============================================
    const processedResults = await Promise.all(
      userRequest.original_images.map(async (imageUrl: string, index: number) => {
        try {
          const result = await processImageWithGemini(
            imageUrl,
            action,
            prompt || `${action} this image professionally`,
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
          logger.error('AI processing failed for image', {
            metadata: {
              request_id: requestId,
              image_index: index,
              error: err
            }
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

    // ============================================
    // Step 6: Store Results in Admin Notes
    // ============================================
    const adminNotes = `
AI Processing Results (${action}):
- Processed: ${successCount}/${userRequest.original_images.length} images
- Failed: ${failCount}
- Processing Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s
- Timestamp: ${new Date().toISOString()}

Analysis:
${processedResults.map((r, i) => `
Image ${i + 1}:
${r.success ? `✅ Success
Analysis: ${r.analysis || 'N/A'}
Suggestions: ${r.suggestions || 'N/A'}` : `❌ Failed: ${r.error}`}
`).join('\n')}
    `.trim()

    await supabase
      .from('user_requests')
      .update({
        admin_notes: adminNotes
      })
      .eq('id', requestId)

    const processingTimeMs = Date.now() - startTime

    logger.info('AI processing completed', {
      metadata: {
        request_id: requestId,
        success_count: successCount,
        fail_count: failCount,
        processing_time_ms: processingTimeMs
      }
    })

    return NextResponse.json({
      success: true,
      request_id: requestId,
      results: processedResults,
      summary: {
        total: userRequest.original_images.length,
        successful: successCount,
        failed: failCount,
        processing_time: `${(processingTimeMs / 1000).toFixed(1)}s`
      },
      admin_notes: adminNotes
    })

  } catch (error: any) {
    logger.error('API Error in AI processing', { error })
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    )
  }
}
