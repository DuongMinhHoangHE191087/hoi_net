/**
 * Authenticated Fetch Utility
 * Automatically adds Authorization header with Supabase access token
 */

import { supabase } from '@/lib/supabase'

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(options.headers)

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
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
