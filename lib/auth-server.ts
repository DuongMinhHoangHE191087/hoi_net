/**
 * Server-side Authentication Utilities
 * For API routes and server components
 */

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AdminService } from '@/lib/admin-service'
import type { Permission, UserRole } from '@/lib/permissions'
import { hasPermission as roleHasPermission } from '@/lib/permissions'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  isAdmin: boolean
}

/**
 * Create Supabase client for server-side use with cookies
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
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
            // Ignore if called from Server Component
          }
        },
      },
    }
  )
}

/**
 * Get user from server (for API routes and server components)
 */
export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    const role = await AdminService.getRole(user.id, supabase)
    const isAdmin = role === 'admin'

    return {
      id: user.id,
      email: user.email || '',
      role,
      isAdmin,
    }
  } catch {
    return null
  }
}

/**
 * Verify authentication from request headers (for API routes)
 * This creates a Supabase client using the request cookies
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for verification
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log('[Auth] Verification failed:', error?.message)
      return null
    }

    const role = await AdminService.getRole(user.id, supabase)
    const isAdmin = role === 'admin'

    return {
      id: user.id,
      email: user.email || '',
      role,
      isAdmin,
    }
  } catch (err) {
    console.error('[Auth] Verification error:', err)
    return null
  }
}

/**
 * Check if user has a permission (server-side)
 */
export function hasServerPermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user) return false
  return roleHasPermission(user.role, permission)
}

/**
 * Require a permission for API routes
 */
export async function requirePermissionAuth(
  request: NextRequest,
  permission: Permission,
  handler: (user: AuthUser, request: NextRequest) => Promise<Response>
): Promise<Response> {
  const user = await verifyAuth(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Vui lòng đăng nhập để tiếp tục' },
      { status: 401 }
    )
  }

  if (!hasServerPermission(user, permission)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Bạn không có quyền truy cập' },
      { status: 403 }
    )
  }

  return handler(user, request)
}

/**
 * Check if user has required role
 */
export function requireRole(user: AuthUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false
  return user.isAdmin || user.role === 'admin'
}

/**
 * Middleware helper to require authentication
 */
export async function requireAuth(
  request: NextRequest,
  handler: (user: AuthUser, request: NextRequest) => Promise<Response>
): Promise<Response> {
  const user = await verifyAuth(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Vui lòng đăng nhập để tiếp tục' },
      { status: 401 }
    )
  }

  return handler(user, request)
}

/**
 * Middleware helper to require admin role
 */
export async function requireAdminAuth(
  request: NextRequest,
  handler: (user: AuthUser, request: NextRequest) => Promise<Response>
): Promise<Response> {
  const user = await verifyAuth(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Vui lòng đăng nhập để tiếp tục' },
      { status: 401 }
    )
  }

  if (!user.isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Bạn không có quyền truy cập' },
      { status: 403 }
    )
  }

  return handler(user, request)
}

/**
 * Get user ID from request (utility function for API routes)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const user = await verifyAuth(request)
  return user?.id || null
}

// Export helpers
export const authServer = {
  verifyAuth,
  getServerUser,
  requireRole,
  isAdmin,
  requireAuth,
  requireAdminAuth,
  createClient,
  getUserIdFromRequest,
}

export default authServer

