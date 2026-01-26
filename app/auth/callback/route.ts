import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Admin emails list (fallback)
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

/**
 * Auth Callback Handler
 * 
 * Handles all authentication flows:
 * 1. Email confirmation (signup)
 * 2. Password reset (recovery)
 * 3. Magic link login
 * 4. Email change confirmation
 * 5. OAuth (Google) callback
 * 6. Invite acceptance
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  
  // Handle email confirmation tokens (type=signup, recovery, etc.)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as 
    'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | null

  console.log('[Auth Callback] Processing:', {
    hasCode: !!code,
    hasError: !!error,
    hasTokenHash: !!token_hash,
    type,
    next,
    url: requestUrl.pathname + requestUrl.search
  })

  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, error_description)
    const errorMessage = error_description || error
    
    // Vietnamese error messages
    let userMessage = errorMessage
    if (errorMessage.includes('access_denied')) {
      userMessage = 'Bạn đã từ chối quyền truy cập. Vui lòng thử lại.'
    } else if (errorMessage.includes('temporarily_unavailable')) {
      userMessage = 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.'
    }
    
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(userMessage)}`, request.url)
    )
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
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
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )

  try {
    // ==========================================
    // Handle email confirmation with token_hash
    // ==========================================
    if (token_hash && type) {
      console.log('[Auth Callback] Verifying OTP with token_hash, type:', type)
      
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type,
      })

      if (verifyError) {
        console.error('[Auth Callback] OTP verification error:', verifyError)
        
        // User-friendly error messages
        let errorMessage = verifyError.message
        
        if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
          switch (type) {
            case 'signup':
              errorMessage = 'Link xác nhận đã hết hạn. Vui lòng đăng ký lại hoặc yêu cầu gửi lại email.'
              return NextResponse.redirect(
                new URL(`/auth/resend-confirmation?error=${encodeURIComponent(errorMessage)}`, request.url)
              )
            case 'recovery':
              errorMessage = 'Link khôi phục mật khẩu đã hết hạn. Vui lòng yêu cầu link mới.'
              return NextResponse.redirect(
                new URL(`/forgot-password?error=${encodeURIComponent(errorMessage)}`, request.url)
              )
            case 'magiclink':
              errorMessage = 'Link đăng nhập đã hết hạn. Vui lòng yêu cầu link mới.'
              break
            case 'email_change':
              errorMessage = 'Link xác nhận email đã hết hạn. Vui lòng thử lại trong cài đặt.'
              return NextResponse.redirect(
                new URL(`/settings?error=${encodeURIComponent(errorMessage)}`, request.url)
              )
            case 'invite':
              errorMessage = 'Link mời đã hết hạn. Vui lòng liên hệ người mời để nhận link mới.'
              break
          }
        }
        
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
        )
      }

      const session = data?.session
      const user = data?.user

      if (session || user) {
        console.log('[Auth Callback] OTP verified successfully for:', session?.user?.email || user?.email)
        
        // Redirect based on type
        switch (type) {
          case 'signup':
            // Email confirmed - redirect to login with success message
            return NextResponse.redirect(
              new URL('/login?message=email-confirmed', request.url)
            )
            
          case 'recovery':
            // Password reset - redirect to reset password page
            // The session is already set, user can now update password
            return NextResponse.redirect(
              new URL('/reset-password', request.url)
            )
            
          case 'magiclink':
            // Magic link login - go to dashboard
            return NextResponse.redirect(
              new URL('/dashboard?message=welcome', request.url)
            )
            
          case 'email_change':
            // Email changed - go to settings with success
            return NextResponse.redirect(
              new URL('/settings?message=email-changed', request.url)
            )
            
          case 'invite':
            // Invite accepted - go to onboarding or dashboard
            return NextResponse.redirect(
              new URL('/onboarding?message=welcome', request.url)
            )
            
          default:
            return NextResponse.redirect(
              new URL('/dashboard', request.url)
            )
        }
      }
    }

    // ==========================================
    // Handle OAuth code exchange
    // ==========================================
    if (!code) {
      console.log('[Auth Callback] No code or token_hash, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('[Auth Callback] Exchanging code for session...')
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('[Auth Callback] Session exchange error:', sessionError)
      
      let errorMessage = sessionError.message
      if (sessionError.message.includes('invalid')) {
        errorMessage = 'Phiên đăng nhập không hợp lệ. Vui lòng thử lại.'
      }
      
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
      )
    }

    if (!session?.user) {
      console.error('[Auth Callback] No session after exchange')
      return NextResponse.redirect(
        new URL('/login?error=Không%20thể%20tạo%20phiên%20đăng%20nhập', request.url)
      )
    }

    console.log('[Auth Callback] Session created for:', session.user.email)

    // ==========================================
    // Check admin status
    // ==========================================
    let isAdmin = false

    try {
      // Check admin_users table
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single()

      isAdmin = !!adminData
      console.log('[Auth Callback] Database admin check:', isAdmin)
    } catch (dbError) {
      // Fallback to env variable if table doesn't exist or query fails
      console.log('[Auth Callback] Database check failed, using env fallback')
      isAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')
    }

    const defaultRedirect = isAdmin ? '/admin' : next

    console.log('[Auth Callback] User is admin:', isAdmin)
    console.log('[Auth Callback] Redirecting to:', defaultRedirect)

    // Redirect to appropriate page
    return NextResponse.redirect(new URL(defaultRedirect, request.url))

  } catch (err: any) {
    console.error('[Auth Callback] Unexpected error:', err)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message || 'Authentication failed')}`, request.url)
    )
  }
}

