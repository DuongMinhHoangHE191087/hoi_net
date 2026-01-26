/**
 * Supabase Server Client
 * Sử dụng cho Server Components, Server Actions, và Route Handlers
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Token expiry configuration (in seconds) - must match client.ts
const TOKEN_CONFIG = {
  ACCESS_TOKEN_MAX_AGE: 3 * 24 * 60 * 60,    // 3 days = 259200 seconds
  REFRESH_TOKEN_MAX_AGE: 29 * 24 * 60 * 60,  // 29 days = 2505600 seconds
  DEFAULT_COOKIE_MAX_AGE: 29 * 24 * 60 * 60, // 29 days for cookies
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Determine max-age based on cookie type
            let maxAge = TOKEN_CONFIG.DEFAULT_COOKIE_MAX_AGE
            if (name.includes('access-token') || name.includes('access_token')) {
              maxAge = TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE
            } else if (name.includes('refresh-token') || name.includes('refresh_token')) {
              maxAge = TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE
            }
            
            // Ensure consistent cookie options
            const cookieOptions: CookieOptions = {
              ...options,
              path: options?.path || '/',
              sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') || 'lax',
              secure: options?.secure !== undefined ? options.secure : process.env.NODE_ENV === 'production',
              httpOnly: options?.httpOnly !== undefined ? options.httpOnly : false,
              maxAge: options?.maxAge || maxAge,
            }
            cookieStore.set(name, value, cookieOptions)
          })
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.warn('[Server] Failed to set cookies:', error)
        }
      },
    },
  })
}

