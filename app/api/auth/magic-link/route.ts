/**
 * 🔐 Magic Link API
 * 
 * Gửi OTP/magic link đến email - dùng khi bị lockout hoặc quên mật khẩu.
 * Sử dụng Supabase signInWithOtp.
 * 
 * POST /api/auth/magic-link
 * Body: { email: string, captchaToken?: string }
 * 
 * Response: { success: boolean, message: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashEmail, hashIP, getClientIP } from '@/lib/auth/security-hash'
import { createAuthError } from '@/lib/auth/error-normalizer'
import { checkRateLimitCustom } from '@/lib/rate-limit-redis'
import { z } from 'zod'

// ============================================
// Configuration
// ============================================

// Redirect URL after magic link click
const getRedirectUrl = () => {
  // Prefer explicit env var for production stability
  return process.env.NEXT_PUBLIC_SITE_URL || 
         process.env.NEXT_PUBLIC_APP_URL || 
         'http://localhost:3000'
}

// ============================================
// Request Validation
// ============================================

const magicLinkSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(254),
  captchaToken: z.string().optional(), // Optional for magic link (less strict)
})

// ============================================
// Rate Limiting (stricter for magic links) - shared, Redis-backed
// (see lib/rate-limit.ts)
// ============================================

const RATE_LIMIT_IP = 5 // 5 requests per 10 minutes per IP
const RATE_LIMIT_EMAIL = 3 // 3 requests per 10 minutes per email
const RATE_WINDOW = 10 * 60 * 1000 // 10 minutes

async function checkRateLimits(ip: string, emailHash: string): Promise<{ allowed: boolean; reason?: string }> {
  // Check IP limit first - short-circuit so a blocked IP doesn't also
  // consume an attempt against the (possibly unrelated) email's quota
  const ipResult = await checkRateLimitCustom(`magic-link:ip:${ip}`, RATE_LIMIT_IP, RATE_WINDOW)
  if (!ipResult.allowed) {
    return { allowed: false, reason: 'Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 10 phút.' }
  }

  // Check email limit
  const emailResult = await checkRateLimitCustom(`magic-link:email:${emailHash}`, RATE_LIMIT_EMAIL, RATE_WINDOW)
  if (!emailResult.allowed) {
    return { allowed: false, reason: 'Đã gửi quá nhiều link đến email này. Vui lòng kiểm tra hộp thư hoặc thử lại sau.' }
  }

  return { allowed: true }
}

// ============================================
// Main Handler
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get client IP
    const clientIP = getClientIP(request.headers)
    
    // Parse request body
    const body = await request.json()
    
    // Validate input
    const validation = magicLinkSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: createAuthError('INVALID_EMAIL', { message: validation.error.errors[0]?.message }) 
        },
        { status: 400 }
      )
    }
    
    const { email } = validation.data
    const emailHash = hashEmail(email)
    
    // Rate limit check
    const rateCheck = await checkRateLimits(clientIP, emailHash)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          success: false,
          error: createAuthError('RATE_LIMITED', { message: rateCheck.reason }) 
        },
        { status: 429 }
      )
    }
    
    // Get Supabase admin client
    const supabase = getSupabaseAdmin()
    
    // Check if user exists using listUsers
    let userExists = false
    try {
      const { data: usersData } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })
      
      if (usersData?.users) {
        userExists = usersData.users.some(u => u.email?.toLowerCase() === email.toLowerCase())
      }
    } catch (err) {
      console.error('[magic-link] Error checking user:', err)
    }
    
    if (!userExists) {
      // User doesn't exist - still return success to prevent enumeration
      // But we won't actually send an email
      console.log('[magic-link] Email not found, returning fake success:', {
        emailHash: emailHash.slice(0, 8) + '...',
      })
      
      return NextResponse.json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đăng nhập.',
      })
    }
    
    // Send magic link
    const redirectUrl = `${getRedirectUrl()}/auth/callback`
    
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: false, // Don't create new user, only existing
      },
    })
    
    if (otpError) {
      console.error('[magic-link] OTP error:', otpError)
      
      // Don't reveal specific error to client
      return NextResponse.json({
        success: true, // Still say success to prevent enumeration
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đăng nhập.',
      })
    }
    
    // Log success
    console.log('[magic-link] Sent successfully:', {
      emailHash: emailHash.slice(0, 8) + '...',
      duration: Date.now() - startTime,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Link đăng nhập đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (và thư mục spam).',
    })
    
  } catch (error: any) {
    console.error('[magic-link] Error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: createAuthError('SERVER_ERROR') 
      },
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
    endpoint: 'magic-link',
    description: 'Send passwordless login link to email',
  })
}
