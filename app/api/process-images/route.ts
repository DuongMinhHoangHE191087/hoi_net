/**
 * API Endpoint for AI Image Processing
 * 
 * Features:
 * - Authentication required
 * - Quota checking (5 uses/month for free tier)
 * - Real Gemini AI processing
 * - Usage logging for tracking
 * - Returns quota info in response
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { checkQuota, logUsage, getQuotaInfo, QuotaInfo } from '@/lib/quota'
import { processImageWithGemini, gemini } from '@/lib/gemini'
import { AIProcessingSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { getCachedResult, cacheResult } from '@/lib/cache'
import { uploadRestoredImage } from '@/lib/ai-image-upload'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let userId = 'anonymous'

  try {
    // ============================================
    // Step 1: Verify Authentication
    // ============================================
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }
    userId = user.id

    // ============================================
    // Step 2: Validate Input (Zod)
    // ============================================
    const body = await request.json()
    const validation = AIProcessingSchema.safeParse(body)
    
    if (!validation.success) {
      logger.warn('Invalid request payload', { 
        user_id: user.id, 
        error: validation.error.format() 
      })
      return NextResponse.json(
        { error: 'Invalid Input', details: validation.error.format() },
        { status: 400 }
      )
    }
    
    const { request_id, images, prompt, type, options } = validation.data
    const modelToUse = options?.model || gemini.DEFAULT_MODEL

    // ============================================
    // Step 3: Check Quota (Skip for Admin)
    // ============================================
    let quotaInfo: QuotaInfo | null = null
    
    if (!user.isAdmin) {
      const quotaCheck = await checkQuota(user.id)
      quotaInfo = quotaCheck.info
      
      if (!quotaCheck.allowed) {
        logger.info('Quota exceeded', { user_id: user.id })
        return NextResponse.json(
          {
            error: 'Quota exceeded',
            message: quotaCheck.message,
            quota: quotaInfo,
            byokAvailable: true
          },
          { status: 429 }
        )
      }
    }

    logger.info('Processing AI Request', { 
      user_id: user.id, 
      metadata: { request_id, type, image_count: images.length, model: modelToUse } 
    })

    // ============================================
    // Step 4: Process Images (With Caching)
    // ============================================
    const actionType = type as 'restore' | 'enhance' | 'colorize' | 'upscale' | 'harmonize'
    
    const processedResults = await Promise.all(images.map(async (imageUrl) => {
      // 4a. Check Cache
      const cacheKey = {
        imageUrl,
        prompt: prompt || 'default',
        model: modelToUse,
        actionType
      }
      
      const cached = await getCachedResult(cacheKey)
      if (cached) {
        return {
          original: imageUrl,
          processed: imageUrl,
          ...cached,
          cached: true
        }
      }
      
      const result = await processImageWithGemini(
        imageUrl,
        actionType,
        prompt,
        { model: modelToUse as any }
      )
      
      let restoredUrl = result.restoredImageUrl

      // 4b. Upload to Cloudinary if native image was generated
      if (result.success && result.restoredImageBase64 && result.restoredImageMimeType && !restoredUrl) {
        try {
          const uploadResult = await uploadRestoredImage(
            result.restoredImageBase64,
            result.restoredImageMimeType,
            actionType
          )
          restoredUrl = uploadResult.url
          result.restoredImageUrl = uploadResult.url // Save URL to result for caching
        } catch (uploadError: any) {
          logger.error('Failed to upload restored image', { error: uploadError })
          result.success = false
          result.error = 'Lỗi lưu ảnh sau khi xử lý'
        }
      }
      
      // 4c. Save to Cache (if successful)
      if (result.success) {
        await cacheResult(cacheKey, result)
      }

      // Avoid sending massive base64 back to client
      const clientResult = { ...result }
      delete clientResult.restoredImageBase64
      
      return {
        original: imageUrl,
        processed: restoredUrl || imageUrl,
        ...clientResult,
        cached: false
      }
    }))

    // ============================================
    // Step 5: Log Usage (Only for non-cached)
    // ============================================
    const successfulNewProcess = processedResults.filter(r => r.success && !r.cached).length
    
    if (!user.isAdmin && successfulNewProcess > 0) {
      await logUsage({
        userId: user.id,
        requestId: request_id,
        actionType: type,
        imagesCount: successfulNewProcess,
        creditsUsed: successfulNewProcess, // Only charge for new processing
        promptUsed: prompt,
        processingTimeMs: Date.now() - startTime
      })
      // Refresh quota info
      quotaInfo = await getQuotaInfo(user.id)
    }

    const processingTimeMs = Date.now() - startTime

    return NextResponse.json({
      success: true,
      request_id,
      results: processedResults,
      processing_time: `${(processingTimeMs / 1000).toFixed(1)}s`,
      quota: user.isAdmin ? { unlimited: true } : quotaInfo
    })

  } catch (error: any) {
    logger.error('API Error', { user_id: userId, error })
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for checking API status and user quota
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({
        status: 'online',
        authenticated: false,
        message: 'AI Image Processing API - Please authenticate to check quota',
        version: '3.0.0',
        geminiConfigured: !!process.env.GEMINI_API_KEY
      })
    }

    const quotaInfo = await getQuotaInfo(user.id)

    return NextResponse.json({
      status: 'online',
      authenticated: true,
      user: {
        email: user.email,
        isAdmin: user.isAdmin
      },
      quota: user.isAdmin ? { unlimited: true } : {
        remaining: quotaInfo.remaining,
        monthlyLimit: quotaInfo.monthlyLimit,
        currentUsage: quotaInfo.currentUsage,
        periodEnd: quotaInfo.periodEnd,
        tier: quotaInfo.tier
      },
      version: '3.0.0',
      geminiConfigured: !!process.env.GEMINI_API_KEY
    })
  } catch (error) {
    return NextResponse.json({
      status: 'online',
      message: 'AI Image Processing API',
      version: '3.0.0',
      error: 'Failed to check quota'
    })
  }
}

