/**
 * Supabase Server Client
 * Sử dụng cho Server Components, Server Actions, và Route Handlers
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
            // Ensure consistent cookie options
            const cookieOptions: CookieOptions = {
              ...options,
              path: options?.path || '/',
              sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') || 'lax',
              secure: options?.secure !== undefined ? options.secure : process.env.NODE_ENV === 'production',
              httpOnly: options?.httpOnly !== undefined ? options.httpOnly : false,
              maxAge: options?.maxAge || 7 * 24 * 60 * 60, // 7 days default
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
