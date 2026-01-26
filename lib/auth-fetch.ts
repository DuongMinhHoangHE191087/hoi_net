/**
 * Authenticated Fetch Utility
 * Automatically adds Authorization header with Supabase access token
 */

import { supabase } from '@/lib/supabase'

/**
 * Wait for auth session to be ready (with timeout)
 */
async function waitForSession(maxWait = 3000): Promise<string | null> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWait) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      return session.access_token
    }
    
    // Wait 100ms before retrying
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Final attempt
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Try to get session immediately first
  let { data: { session } } = await supabase.auth.getSession()
  
  // If no session, wait a bit for auth to hydrate (race condition fix)
  if (!session?.access_token) {
    console.log('[authFetch] Session not ready, waiting...')
    const token = await waitForSession(2000)
    if (token) {
      console.log('[authFetch] Session ready after wait')
    } else {
      console.warn('[authFetch] No session after wait - request may fail')
    }
  }
  
  // Get fresh session after wait
  const { data: { session: freshSession } } = await supabase.auth.getSession()

  const headers = new Headers(options.headers)

  if (freshSession?.access_token) {
    headers.set('Authorization', `Bearer ${freshSession.access_token}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Wrapper for common HTTP methods with auth
 */
export const authFetch = {
  async get(url: string, options?: RequestInit): Promise<Response> {
    return fetchWithAuth(url, { ...options, method: 'GET' })
  },

  async post(url: string, data?: unknown, options?: RequestInit): Promise<Response> {
    const headers = new Headers(options?.headers)
    if (!headers.has('Content-Type') && data) {
      headers.set('Content-Type', 'application/json')
    }

    return fetchWithAuth(url, {
      ...options,
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  async put(url: string, data?: unknown, options?: RequestInit): Promise<Response> {
    const headers = new Headers(options?.headers)
    if (!headers.has('Content-Type') && data) {
      headers.set('Content-Type', 'application/json')
    }

    return fetchWithAuth(url, {
      ...options,
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  async patch(url: string, data?: unknown, options?: RequestInit): Promise<Response> {
    const headers = new Headers(options?.headers)
    if (!headers.has('Content-Type') && data) {
      headers.set('Content-Type', 'application/json')
    }

    return fetchWithAuth(url, {
      ...options,
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  async delete(url: string, options?: RequestInit): Promise<Response> {
    return fetchWithAuth(url, { ...options, method: 'DELETE' })
  },
}

export default authFetch

