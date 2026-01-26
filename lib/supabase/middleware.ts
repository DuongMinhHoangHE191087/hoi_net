/**
 * Supabase Middleware Client
 * Sử dụng trong middleware.ts để handle auth session refresh
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Token expiry configuration (in seconds) - must match client.ts and server.ts
const TOKEN_CONFIG = {
  ACCESS_TOKEN_MAX_AGE: 3 * 24 * 60 * 60,    // 3 days = 259200 seconds
  REFRESH_TOKEN_MAX_AGE: 29 * 24 * 60 * 60,  // 29 days = 2505600 seconds
  DEFAULT_COOKIE_MAX_AGE: 29 * 24 * 60 * 60, // 29 days for cookies
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Set on request for immediate use
          request.cookies.set(name, value)

          // Determine max-age based on cookie type
          let maxAge = TOKEN_CONFIG.DEFAULT_COOKIE_MAX_AGE
          if (name.includes('access-token') || name.includes('access_token')) {
            maxAge = TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE
          } else if (name.includes('refresh-token') || name.includes('refresh_token')) {
            maxAge = TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE
          }

          // Ensure proper cookie options with defaults
          const cookieOpts: CookieOptions = {
            ...options,
            path: options?.path || '/',
            sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') || 'lax',
            secure: options?.secure !== undefined ? options.secure : process.env.NODE_ENV === 'production',
            httpOnly: options?.httpOnly !== undefined ? options.httpOnly : false,
            maxAge: options?.maxAge || maxAge,
          }

          // Set on response for persistence
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(name, value, cookieOpts)
        })
      },
    },
  })

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      // Only log actual errors, not expired tokens (which are normal)
      if (!error.message?.includes('expired') && !error.message?.includes('invalid')) {
        console.error('[Middleware] Error getting user:', error.message)
      }
      
      // Try to refresh the session before giving up
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (session?.user) {
        // Session was refreshed successfully
        return { supabase, user: session.user, response }
      }
      
      // Clear invalid session cookies only if refresh also failed
      if (refreshError) {
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
      }
      
      return { supabase, user: null, response }
    }

    return { supabase, user, response }
  } catch (err) {
    console.error('[Middleware] Session check failed:', err)
    return { supabase, user: null, response }
  }
}

