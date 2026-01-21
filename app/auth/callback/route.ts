import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Admin emails list (fallback)
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  console.log('[Auth Callback] Processing:', {
    hasCode: !!code,
    hasError: !!error,
    next,
    url: requestUrl.pathname + requestUrl.search
  })

  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, request.url)
    )
  }

  // If no code, redirect to login (hash-based tokens are handled client-side)
  if (!code) {
    console.log('[Auth Callback] No code, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  try {
    console.log('[Auth Callback] Exchanging code for session...')
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('[Auth Callback] Session exchange error:', sessionError)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(sessionError.message)}`, request.url)
      )
    }

    if (!session?.user) {
      console.error('[Auth Callback] No session after exchange')
      return NextResponse.redirect(new URL('/login?error=no_session', request.url))
    }

    console.log('[Auth Callback] Session created for:', session.user.email)

    // ✅ IMPROVED: Check admin from database first, then fallback to env
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
