/**
 * 🔐 Sign In API with Lockout Protection
 * 
 * Server-side sign in endpoint với:
 * - Lockout check trước khi thử đăng nhập
 * - Record failed attempts
 * - Exponential backoff lockout
 * - hCaptcha verification sau nhiều lần fail
 * 
 * POST /api/auth/sign-in
 * Body: { email: string, password: string, captchaToken?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashEmail, hashIP, hashEmailIP, getClientIP } from '@/lib/auth/security-hash'
import { 
  createAuthError, 
  createLockoutError, 
  normalizeAuthError,
  type ExtendedAuthError 
} from '@/lib/auth/error-normalizer'
import { z } from 'zod'
import { cookies } from 'next/headers'

// ============================================
// Configuration
// ============================================

const CAPTCHA_THRESHOLD = 3 // Require captcha after 3 failed attempts
const LOCKOUT_THRESHOLD = 5 // Lock after 5 failed attempts

// ============================================
// Request Validation
// ============================================

const signInSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(254),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  captchaToken: z.string().optional(),
})

// ============================================
// hCaptcha Verification
// ============================================

async function verifyHCaptcha(token: string, ip: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY
  
  if (!secret) {
    console.warn('[sign-in] HCAPTCHA_SECRET_KEY not configured')
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
    console.error('[sign-in] hCaptcha verification error:', error)
    return false
  }
}

// ============================================
// Create Supabase client for sign in (with cookies)
// ============================================

async function createSignInClient() {
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
            // Ignore if called from Server Component
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
    
    // Parse request body
    const body = await request.json()
    
    // Validate input
    const validation = signInSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: createAuthError('INVALID_CREDENTIALS', { 
            message: validation.error.errors[0]?.message 
          }) 
        },
        { status: 400 }
      )
    }
    
    const { email, password, captchaToken } = validation.data
    
    // Hash identifiers
    const emailHash = hashEmail(email)
    const ipHash = hashIP(clientIP)
    const emailIPHash = hashEmailIP(email, clientIP)
    
    // Get admin client for lockout checks
    const adminClient = getSupabaseAdmin()
    
    // ============================================
    // Step 1: Check Lockout Status
    // ============================================
    
    let requiresCaptcha = false
    let remainingAttempts = LOCKOUT_THRESHOLD
    
    try {
      const { data: lockoutData } = await adminClient
        .rpc('check_auth_lockout', {
          p_email_ip_hash: emailIPHash,
          p_email_hash: emailHash,
        })
      
      if (lockoutData && lockoutData.length > 0) {
        const lockout = lockoutData[0]
        
        // Check if locked
        if (lockout.is_locked || lockout.is_globally_locked) {
          console.log('[sign-in] Account locked:', {
            emailHash: emailHash.slice(0, 8) + '...',
            until: lockout.lockout_until,
          })
          
          return NextResponse.json({
            success: false,
            error: createLockoutError(lockout.lockout_until),
            locked: true,
            lockoutUntil: lockout.lockout_until,
            canUseMagicLink: true,
          })
        }
        
        remainingAttempts = lockout.remaining_attempts || LOCKOUT_THRESHOLD
        
        // Require captcha if close to lockout
        if (remainingAttempts <= (LOCKOUT_THRESHOLD - CAPTCHA_THRESHOLD)) {
          requiresCaptcha = true
        }
      }
    } catch (lockoutCheckError) {
      // Log but don't block - lockout is a security enhancement, not critical
      console.warn('[sign-in] Lockout check failed:', lockoutCheckError)
    }
    
    // ============================================
    // Step 2: Verify Captcha if Required
    // ============================================
    
    if (requiresCaptcha) {
      if (!captchaToken) {
        return NextResponse.json({
          success: false,
          error: createAuthError('CAPTCHA_REQUIRED'),
          requiresCaptcha: true,
          remainingAttempts,
        })
      }
      
      const captchaValid = await verifyHCaptcha(captchaToken, clientIP)
      if (!captchaValid) {
        return NextResponse.json(
          { 
            success: false,
            error: createAuthError('CAPTCHA_FAILED'),
            requiresCaptcha: true,
          },
          { status: 400 }
        )
      }
    }
    
    // ============================================
    // Step 3: Attempt Sign In
    // ============================================
    
    const supabase = await createSignInClient()
    
    // Pass captcha token to Supabase if available (required when Supabase captcha is enabled)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
      options: captchaToken ? {
        captchaToken,
      } : undefined,
    })
    
    // ============================================
    // Step 4: Handle Result
    // ============================================
    
    if (signInError) {
      console.log('[sign-in] Failed:', {
        emailHash: emailHash.slice(0, 8) + '...',
        error: signInError.message,
      })
      
      // Record failed attempt
      try {
        const { data: failData } = await adminClient
          .rpc('record_failed_auth_attempt', {
            p_email_ip_hash: emailIPHash,
            p_email_hash: emailHash,
            p_ip_hash: ipHash,
          })
        
        if (failData && failData.length > 0) {
          const result = failData[0]
          
          if (result.is_now_locked) {
            return NextResponse.json({
              success: false,
              error: createLockoutError(result.lockout_until),
              locked: true,
              lockoutUntil: result.lockout_until,
              canUseMagicLink: true,
            })
          }
          
          remainingAttempts = result.remaining_attempts
        }
      } catch (recordError) {
        console.warn('[sign-in] Failed to record attempt:', recordError)
      }
      
      // Check if user exists (for better error message)
      let errorResponse: ExtendedAuthError = normalizeAuthError(signInError)
      
      // If credentials invalid, try to determine if user exists
      if (signInError.message.includes('Invalid login credentials')) {
        try {
          const { data: usersData } = await adminClient.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          })
          
          const userExists = usersData?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase())
          
          if (!userExists) {
            // User doesn't exist
            errorResponse = createAuthError('USER_NOT_FOUND')
          } else {
            // User exists but wrong password
            errorResponse = createAuthError('INVALID_CREDENTIALS')
          }
        } catch {
          // Fallback to generic error
          errorResponse = createAuthError('INVALID_CREDENTIALS')
        }
      }
      
      return NextResponse.json({
        success: false,
        error: errorResponse,
        remainingAttempts,
        requiresCaptcha: remainingAttempts <= (LOCKOUT_THRESHOLD - CAPTCHA_THRESHOLD),
      })
    }
    
    // ============================================
    // Step 5: Success - Record and Return
    // ============================================
    
    console.log('[sign-in] Success:', {
      emailHash: emailHash.slice(0, 8) + '...',
      duration: Date.now() - startTime,
    })
    
    // Record successful login (resets lockout)
    try {
      await adminClient.rpc('record_successful_auth', {
        p_email_ip_hash: emailIPHash,
        p_email_hash: emailHash,
      })
    } catch (recordError) {
      console.warn('[sign-in] Failed to record success:', recordError)
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: signInData.user?.id,
        email: signInData.user?.email,
        emailVerified: signInData.user?.email_confirmed_at !== null,
      },
      session: {
        accessToken: signInData.session?.access_token,
        refreshToken: signInData.session?.refresh_token,
        expiresAt: signInData.session?.expires_at,
      },
    })
    
  } catch (error: any) {
    console.error('[sign-in] Unexpected error:', error)
    
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
    endpoint: 'sign-in',
    features: [
      'Lockout protection (5 attempts -> 1h, exponential backoff)',
      'hCaptcha after 3 failed attempts',
      'Explicit "not registered" message',
      'Magic link fallback when locked',
    ],
  })
}
