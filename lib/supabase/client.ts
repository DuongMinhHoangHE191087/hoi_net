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

// Token expiry configuration (in seconds)
const TOKEN_CONFIG = {
  ACCESS_TOKEN_MAX_AGE: 3 * 24 * 60 * 60,    // 3 days = 259200 seconds
  REFRESH_TOKEN_MAX_AGE: 29 * 24 * 60 * 60,  // 29 days = 2505600 seconds
  DEFAULT_COOKIE_MAX_AGE: 29 * 24 * 60 * 60, // 29 days for cookies
}

// Singleton pattern để tránh multiple instances
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing client if available
  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        debug: false, // Disable debug to avoid Symbol errors in Edge runtime
      },
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []

          try {
            const cookies = document.cookie.split(';').map(cookie => {
              const [name, ...rest] = cookie.trim().split('=')
              return { name, value: rest.join('=') }
            }).filter(cookie => cookie.name && cookie.name.length > 0)
            
            return cookies
          } catch (e) {
            console.error('[Supabase Client] Error reading cookies:', e)
            return []
          }
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return

          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Determine max-age based on cookie type
              let maxAge = TOKEN_CONFIG.DEFAULT_COOKIE_MAX_AGE
              if (name.includes('access-token') || name.includes('access_token')) {
                maxAge = TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE
              } else if (name.includes('refresh-token') || name.includes('refresh_token')) {
                maxAge = TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE
              }
              
              const cookieOptions = [
                `${name}=${value}`,
                options?.maxAge ? `max-age=${options.maxAge}` : `max-age=${maxAge}`,
                options?.path ? `path=${options.path}` : 'path=/',
                options?.domain ? `domain=${options.domain}` : '',
                options?.sameSite ? `samesite=${options.sameSite}` : 'samesite=lax',
                process.env.NODE_ENV === 'production' ? 'secure' : '',
              ].filter(Boolean).join('; ')

              document.cookie = cookieOptions
            })
          } catch (e) {
            console.error('[Supabase Client] Error setting cookies:', e)
          }
        },
      },
    }
  )

  return browserClient
}

// Reset client (useful for testing or logout)
export function resetClient() {
  browserClient = null
}

// Lazy singleton getter - only creates client when called in browser context
export function getSupabase() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabase() can only be called in browser context')
  }
  return createClient()
}

// Create a lazy proxy that only initializes in browser context
// This prevents errors when the module is imported in middleware/server
const createLazySupabase = () => {
  // Return a proxy that creates the client on first access
  return new Proxy({} as ReturnType<typeof createClient>, {
    get(target, prop) {
      if (typeof window === 'undefined') {
        // In server/middleware context, return a no-op function for methods
        // or undefined for properties
        if (typeof prop === 'symbol') {
          return undefined
        }
        // Return a mock that throws on actual use
        return function() {
          throw new Error(`supabase.${String(prop)}() called in server context. Use createClient() instead.`)
        }
      }
      // In browser context, create the actual client
      const client = createClient()
      return (client as any)[prop]
    }
  })
}

// Export the lazy proxy for backward compatibility
export const supabase = createLazySupabase()

