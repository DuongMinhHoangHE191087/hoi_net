/**
 * 🔐 Check Account API
 * 
 * Kiểm tra tài khoản có tồn tại hay không (với hCaptcha protection).
 * Endpoint này cho phép thông báo "chưa đăng ký" một cách an toàn.
 * 
 * POST /api/auth/check-account
 * Body: { email: string, captchaToken: string }
 * 
 * Response: { exists: boolean, locked?: boolean, lockoutUntil?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashEmail, hashIP, hashEmailIP, getClientIP } from '@/lib/auth/security-hash'
import { checkRateLimitCustom } from '@/lib/rate-limit-redis'
import { createAuthError, createLockoutError } from '@/lib/auth/error-normalizer'
import { z } from 'zod'

// ============================================
// Request Validation
// ============================================

const checkAccountSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(254),
  captchaToken: z.string().min(1, 'Vui lòng hoàn thành CAPTCHA'),
})

// ============================================
// hCaptcha Verification
// ============================================

async function verifyHCaptcha(token: string, ip: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY
  
  if (!secret) {
    console.warn('[check-account] HCAPTCHA_SECRET_KEY not configured, skipping verification')
    // In development, allow without captcha if not configured
    return process.env.NODE_ENV === 'development'
  }
  
  try {
    const response = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
    })
    
    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('[check-account] hCaptcha verification error:', error)
    return false
  }
}

// ============================================
// Rate Limiting - shared, Redis-backed (see lib/rate-limit.ts)
// ============================================

const RATE_LIMIT = 10 // 10 requests per minute per IP
const RATE_WINDOW = 60 * 1000 // 1 minute

// ============================================
// Main Handler
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get client IP
    const clientIP = getClientIP(request.headers)
    
    // Rate limit check
    const rateLimit = await checkRateLimitCustom(`check-account:${clientIP}`, RATE_LIMIT, RATE_WINDOW)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: createAuthError('RATE_LIMITED') },
        { status: 429 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    // Validate input
    const validation = checkAccountSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: createAuthError('INVALID_EMAIL', { message: validation.error.errors[0]?.message }) },
        { status: 400 }
      )
    }
    
    const { email, captchaToken } = validation.data
    
    // Verify hCaptcha
    const captchaValid = await verifyHCaptcha(captchaToken, clientIP)
    if (!captchaValid) {
      return NextResponse.json(
        { error: createAuthError('CAPTCHA_FAILED') },
        { status: 400 }
      )
    }
    
    // Hash identifiers for lockout check
    const emailHash = hashEmail(email)
    const ipHash = hashIP(clientIP)
    const emailIPHash = hashEmailIP(email, clientIP)
    
    // Get Supabase admin client
    const supabase = getSupabaseAdmin()
    
    // Check if account is locked
    const { data: lockoutData, error: lockoutError } = await supabase
      .rpc('check_auth_lockout', {
        p_email_ip_hash: emailIPHash,
        p_email_hash: emailHash,
      })
    
    if (!lockoutError && lockoutData && lockoutData.length > 0) {
      const lockout = lockoutData[0]
      if (lockout.is_locked || lockout.is_globally_locked) {
        return NextResponse.json({
          exists: false, // Don't reveal existence when locked
          locked: true,
          lockoutUntil: lockout.lockout_until,
          error: createLockoutError(lockout.lockout_until),
        })
      }
    }
    
    // Check if user exists using admin API
    // Use listUsers and filter by email
    let exists = false
    
    try {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000, // Get enough users to search
      })
      
      if (!listError && usersData?.users) {
        exists = usersData.users.some(u => u.email?.toLowerCase() === email.toLowerCase())
      }
    } catch (err) {
      console.error('[check-account] Error checking users:', err)
    }
    
    // Log the check (for security monitoring)
    console.log('[check-account]', {
      emailHash: emailHash.slice(0, 8) + '...',
      exists,
      duration: Date.now() - startTime,
    })
    
    return NextResponse.json({
      exists,
      locked: false,
    })
    
  } catch (error: any) {
    console.error('[check-account] Error:', error)
    
    return NextResponse.json(
      { error: createAuthError('SERVER_ERROR') },
      { status: 500 }
    )
  }
}

// ============================================
// GET handler (for health check)
// ============================================

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'check-account',
    requiresCaptcha: true,
  })
}
