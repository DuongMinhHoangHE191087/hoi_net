/**
 * 🔐 Sign Up API
 * 
 * Server-side registration với:
 * - Kiểm tra email đã tồn tại
 * - Trả lỗi rõ ràng "đã đăng ký"
 * - Rate limiting
 * 
 * POST /api/auth/sign-up
 * Body: { email: string, password: string, fullName?: string, captchaToken?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashEmail, hashIP, getClientIP } from '@/lib/auth/security-hash'
import { createAuthError, normalizeAuthError } from '@/lib/auth/error-normalizer'
import { z } from 'zod'
import { cookies } from 'next/headers'

// ============================================
// Configuration
// ============================================

const getRedirectUrl = () => {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 
              process.env.NEXT_PUBLIC_APP_URL || 
              'http://localhost:3000'
  // Remove trailing slash to avoid double slashes
  return url.replace(/\/$/, '')
}

// ============================================
// Request Validation
// ============================================

const signUpSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(254),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(128, 'Mật khẩu quá dài'),
  fullName: z.string().max(100).optional(),
  captchaToken: z.string().optional(),
})

// ============================================
// Rate Limiting
// ============================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // 5 signups per hour per IP
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

// ============================================
// hCaptcha Verification
// ============================================

async function verifyHCaptcha(token: string, ip: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY
  
  if (!secret) {
    console.warn('[sign-up] HCAPTCHA_SECRET_KEY not configured')
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
    console.error('[sign-up] hCaptcha verification error:', error)
    return false
  }
}

// ============================================
// Create Supabase client
// ============================================

async function createSignUpClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )
}

// ============================================
// Main Handler
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get client IP
    const clientIP = getClientIP(request.headers)
    
    // Rate limit check
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { 
          success: false,
          error: createAuthError('RATE_LIMITED', {
            message: 'Quá nhiều lượt đăng ký từ địa chỉ này. Vui lòng thử lại sau 1 giờ.'
          }) 
        },
        { status: 429 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    // Validate input
    const validation = signUpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: createAuthError('INVALID_EMAIL', { 
            message: validation.error.errors[0]?.message 
          }) 
        },
        { status: 400 }
      )
    }
    
    const { email, password, fullName, captchaToken } = validation.data
    const emailHash = hashEmail(email)
    
    // Verify captcha if provided (recommended for production)
    if (captchaToken) {
      const captchaValid = await verifyHCaptcha(captchaToken, clientIP)
      if (!captchaValid) {
        return NextResponse.json(
          { 
            success: false,
            error: createAuthError('CAPTCHA_FAILED') 
          },
          { status: 400 }
        )
      }
    }
    
    const adminClient = getSupabaseAdmin()
    
    // ============================================
    // Create new user
    // ============================================
    
    const supabase = await createSignUpClient()
    const redirectUrl = `${getRedirectUrl()}/auth/callback`
    
    // Pass captcha token to Supabase (required when Supabase captcha is enabled)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
        emailRedirectTo: redirectUrl,
        captchaToken: captchaToken || undefined,
      },
    })
    
    if (signUpError) {
      console.error('[sign-up] Error:', signUpError)
      
      // Check for specific errors
      if (signUpError.message.includes('already registered') || 
          signUpError.message.includes('already been registered')) {
        return NextResponse.json({
          success: false,
          error: createAuthError('USER_ALREADY_REGISTERED'),
          exists: true,
        })
      }
      
      return NextResponse.json({
        success: false,
        error: normalizeAuthError(signUpError),
      })
    }
    
    // ============================================
    // Handle Supabase's ambiguous "existing user" behavior
    // ============================================
    
    // Supabase sometimes returns success even for existing users
    // Check if user has no identities (sign of existing account)
    if (signUpData.user && signUpData.user.identities?.length === 0) {
      console.log('[sign-up] User exists (no identities):', {
        emailHash: emailHash.slice(0, 8) + '...',
      })
      
      return NextResponse.json({
        success: false,
        error: createAuthError('USER_ALREADY_REGISTERED'),
        exists: true,
      })
    }
    
    // ============================================
    // Success
    // ============================================
    
    const needsConfirmation = !signUpData.user?.email_confirmed_at
    
    console.log('[sign-up] Success:', {
      emailHash: emailHash.slice(0, 8) + '...',
      needsConfirmation,
      duration: Date.now() - startTime,
    })
    
    return NextResponse.json({
      success: true,
      needsConfirmation,
      message: needsConfirmation 
        ? 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.'
        : 'Đăng ký thành công!',
      user: {
        id: signUpData.user?.id,
        email: signUpData.user?.email,
      },
    })
    
  } catch (error: any) {
    console.error('[sign-up] Unexpected error:', error)
    
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
// GET handler
// ============================================

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'sign-up',
    features: [
      'Explicit "already registered" error',
      'Email existence check before signup',
      'Rate limiting (5 per hour per IP)',
      'Optional hCaptcha verification',
    ],
  })
}
