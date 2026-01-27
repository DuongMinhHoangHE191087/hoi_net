import { NextRequest, NextResponse } from 'next/server'
import { getCaptchaSettings } from '@/lib/captcha-service'
import { getRateLimitSettings } from '@/lib/rate-limit-service'

export const dynamic = 'force-dynamic'

// Public endpoint to get captcha settings for client-side forms
export async function GET(request: NextRequest) {
  try {
    const [captchaSettings, rateLimitSettings] = await Promise.all([
      getCaptchaSettings(),
      getRateLimitSettings(),
    ])

    // Only return public-facing settings
    return NextResponse.json({
      captcha: {
        enabled: captchaSettings.enabled,
        threshold_attempts: captchaSettings.threshold_attempts,
        forms: captchaSettings.forms,
        siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001',
      },
      rateLimit: {
        enabled: rateLimitSettings.enabled,
        login_max_attempts: rateLimitSettings.login_max_attempts,
        request_max_per_hour: rateLimitSettings.request_max_per_hour,
      }
    }, {
      headers: { 
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' 
      }
    })
  } catch (error: any) {
    console.error('[Auth Settings API] Error:', error)
    // Return default settings on error
    return NextResponse.json({
      captcha: {
        enabled: true,
        threshold_attempts: 3,
        forms: { login: true, register: true, forgot_password: true, request_form: true },
        siteKey: '10000000-ffff-ffff-ffff-000000000001',
      },
      rateLimit: {
        enabled: true,
        login_max_attempts: 5,
        request_max_per_hour: 10,
      }
    })
  }
}
