/**
 * Supabase Browser Client
 * Sử dụng cho các client components (use client)
 * Với cookie security và bảo mật toàn diện
 */

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton pattern để tránh multiple instances
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []

          return document.cookie.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=')
            return { name, value: rest.join('=') }
          }).filter(cookie => cookie.name)
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return

          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = [
              `${name}=${value}`,
              options?.maxAge ? `max-age=${options.maxAge}` : '',
              options?.path ? `path=${options.path}` : 'path=/',
              options?.domain ? `domain=${options.domain}` : '',
              options?.sameSite ? `samesite=${options.sameSite}` : 'samesite=lax',
              options?.secure ? 'secure' : '',
            ].filter(Boolean).join('; ')

            document.cookie = cookieOptions
          })
        },
      },
    }
  )

  return browserClient
}

// Export singleton instance
export const supabase = createClient()
