import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionAuth } from '@/lib/auth-server'
import { getCaptchaSettings, updateCaptchaSettings } from '@/lib/captcha-service'
import { getRateLimitSettings, updateRateLimitSettings } from '@/lib/rate-limit-service'

export const dynamic = 'force-dynamic'

// GET: Get all security settings (captcha + rate limits)
export async function GET(request: NextRequest) {
  return requirePermissionAuth(request, 'admin.settings.manage', async () => {
    try {
      const [captchaSettings, rateLimitSettings] = await Promise.all([
        getCaptchaSettings(),
        getRateLimitSettings(),
      ])

      return NextResponse.json({
        success: true,
        captcha: captchaSettings,
        rateLimit: rateLimitSettings,
      }, {
        headers: { 'Cache-Control': 'no-store' }
      })
    } catch (error: any) {
      console.error('[Security Settings API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  })
}

// POST: Update security settings
export async function POST(request: NextRequest) {
  return requirePermissionAuth(request, 'admin.settings.manage', async () => {
    try {
      const body = await request.json()
      const { captcha, rateLimit } = body

      const results: any = { success: true }

      if (captcha) {
        const captchaUpdated = await updateCaptchaSettings(captcha)
        results.captchaUpdated = captchaUpdated
      }

      if (rateLimit) {
        const rateLimitUpdated = await updateRateLimitSettings(rateLimit)
        results.rateLimitUpdated = rateLimitUpdated
      }

      return NextResponse.json(results)
    } catch (error: any) {
      console.error('[Security Settings API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  })
}
