/**
 * Supabase Middleware Client
 * Sử dụng trong middleware.ts để handle auth session refresh
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

          // Ensure proper cookie options with defaults
          const cookieOpts: CookieOptions = {
            ...options,
            path: options?.path || '/',
            sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') || 'lax',
            secure: options?.secure !== undefined ? options.secure : process.env.NODE_ENV === 'production',
            httpOnly: options?.httpOnly !== undefined ? options.httpOnly : false,
            maxAge: options?.maxAge || 7 * 24 * 60 * 60, // 7 days default
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
      console.error('[Middleware] Error getting user:', error.message)
      // Clear invalid session cookies
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      return { supabase, user: null, response }
    }

    return { supabase, user, response }
  } catch (err) {
    console.error('[Middleware] Session check failed:', err)
    return { supabase, user: null, response }
  }
}
