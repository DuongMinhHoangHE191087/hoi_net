/**
 * Centralized Admin Service
 * Single source of truth for admin checks across the entire app
 *
 * Usage:
 * - Server: import { AdminService } from '@/lib/admin-service'
 * - Client: import { useAdminCheck } from '@/lib/admin-service'
 */

// Note: Do NOT import browser client here as this file is used in middleware
// import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import React from 'react'

// ==========================================
// Types
// ==========================================

export interface AdminPermissions {
  full_access?: boolean
  manage_users?: boolean
  manage_content?: boolean
  view_analytics?: boolean
  manage_settings?: boolean
}

export interface AdminUser {
  user_id: string
  granted_at: string
  granted_by: string | null
  permissions: AdminPermissions
}

// ==========================================
// Cache Management
// ==========================================

class AdminCache {
  private cache = new Map<string, { isAdmin: boolean; expiry: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  set(userId: string, isAdmin: boolean) {
    this.cache.set(userId, {
      isAdmin,
      expiry: Date.now() + this.TTL
    })
  }

  get(userId: string): boolean | null {
    const cached = this.cache.get(userId)
    if (!cached) return null

    if (cached.expiry < Date.now()) {
      this.cache.delete(userId)
      return null
    }

    return cached.isAdmin
  }

  clear(userId?: string) {
    if (userId) {
      this.cache.delete(userId)
    } else {
      this.cache.clear()
    }
  }

  clearAll() {
    this.cache.clear()
  }
}

const adminCache = new AdminCache()

// ==========================================
// Environment Fallback
// ==========================================

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

function isAdminByEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// ==========================================
// Core Admin Service
// ==========================================

export class AdminService {
  static async getRole(
    userId: string,
    supabase: any
  ): Promise<'admin' | 'moderator' | 'editor' | 'user'> {
    // 1) Prefer user_profiles.role (this is what the Admin UI edits)
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (!error) {
        const role = (profile?.role || 'user') as string
        if (role === 'admin' || role === 'moderator' || role === 'editor' || role === 'user') {
          return role
        }
        return 'user'
      }
    } catch {
      // ignore
    }

    // 2) Fallback to admin_users table (legacy)
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!error && data) {
        return 'admin'
      }
    } catch {
      // ignore
    }

    // 3) Final fallback: env-based email list (dev/bootstrap only)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email
      if (email && isAdminByEmail(email)) {
        return 'admin'
      }
    } catch {
      // ignore
    }

    return 'user'
  }

  /**
   * Check if user is admin (Server-side with Supabase client)
   * Use this in API routes, server components, middleware
   */
  static async isAdmin(userId: string, supabase: any): Promise<boolean> {
    try {
      // Check cache first
      const cached = adminCache.get(userId)
      if (cached !== null) {
        console.log('[AdminService] Cache hit:', { userId, isAdmin: cached })
        return cached
      }

      const role = await this.getRole(userId, supabase)
      const isAdmin = role === 'admin'
      adminCache.set(userId, isAdmin)
      return isAdmin
    } catch (error) {
      console.error('[AdminService] Error checking admin:', error)
      return false
    }
  }

  /**
   * Check if user is admin by User object (Server-side)
   */
  static async isAdminByUser(user: User | null, supabase: any): Promise<boolean> {
    if (!user) return false
    return this.isAdmin(user.id, supabase)
  }

  /**
   * Get admin permissions
   */
  static async getAdminPermissions(userId: string, supabase: any): Promise<AdminPermissions | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('permissions')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) return null
      return data?.permissions as AdminPermissions || null
    } catch (error) {
      console.error('[AdminService] Error getting permissions:', error)
      return null
    }
  }

  /**
   * Grant admin to user
   */
  static async grantAdmin(
    userId: string,
    grantedBy: string,
    permissions: AdminPermissions = { full_access: true },
    supabase: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          granted_by: grantedBy,
          permissions
        })

      if (error) {
        return { success: false, error: error.message }
      }

      // Clear cache
      adminCache.clear(userId)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Revoke admin from user
   */
  static async revokeAdmin(userId: string, supabase: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Clear cache
      adminCache.clear(userId)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Clear admin cache for user
   */
  static clearCache(userId?: string) {
    adminCache.clear(userId)
  }

  /**
   * Clear all admin caches
   */
  static clearAllCache() {
    adminCache.clearAll()
  }
}

// ==========================================
// Client-side Hook
// ==========================================

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    async function checkAdmin() {
      try {
        // Dynamic import to avoid loading browser client in server/middleware context
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setIsAdmin(false)
          setLoading(false)
          return
        }

        setUser(user)

        // Check cache first
        const cached = adminCache.get(user.id)
        if (cached !== null) {
          setIsAdmin(cached)
          setLoading(false)
          return
        }

        // Query database
        const { data, error } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          // Fallback to env
          const isAdminByEnv = isAdminByEmail(user.email || '')
          setIsAdmin(isAdminByEnv)
          adminCache.set(user.id, isAdminByEnv)
        } else {
          const isAdminResult = !!data
          setIsAdmin(isAdminResult)
          adminCache.set(user.id, isAdminResult)
        }
      } catch (error) {
        console.error('[useAdminCheck] Error:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  return { isAdmin, loading, user }
}

export default AdminService

