'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { 
  UserRole, 
  Permission, 
  hasPermission, 
  canAccessAdmin,
  ROLE_PERMISSIONS 
} from '@/lib/permissions'

interface UseUserRoleResult {
  role: UserRole
  isLoading: boolean
  error: string | null
  hasPermission: (permission: Permission) => boolean
  canAccessAdmin: boolean
  canProcessRequests: boolean
  canManageBlog: boolean
  canPublishBlog: boolean
  canManageUsers: boolean
  isAdmin: boolean
  isModerator: boolean
  isEditor: boolean
  permissions: Permission[]
  refetch: () => Promise<void>
}

export function useUserRole(): UseUserRoleResult {
  const { user, isLoading: authLoading } = useAuth()
  const [role, setRole] = useState<UserRole>('user')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRole = async () => {
    if (!user) {
      setRole('user')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const supabase = createClient()
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        // Profile might not exist yet
        console.warn('Could not fetch user role:', profileError)
        setRole('user')
      } else {
        setRole((profile?.role as UserRole) || 'user')
      }
      
      setError(null)
    } catch (err) {
      console.error('Error fetching user role:', err)
      setError('Không thể tải thông tin phân quyền')
      setRole('user')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchRole()
    }
  }, [user, authLoading])

  // Memoized permission checks
  const checkPermission = useMemo(() => {
    return (permission: Permission) => hasPermission(role, permission)
  }, [role])

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[role] || []
  }, [role])

  return {
    role,
    isLoading: authLoading || isLoading,
    error,
    hasPermission: checkPermission,
    canAccessAdmin: canAccessAdmin(role),
    canProcessRequests: hasPermission(role, 'requests.process'),
    canManageBlog: hasPermission(role, 'blog.create'),
    canPublishBlog: hasPermission(role, 'blog.publish'),
    canManageUsers: hasPermission(role, 'admin.users.manage'),
    isAdmin: role === 'admin',
    isModerator: role === 'moderator',
    isEditor: role === 'editor',
    permissions,
    refetch: fetchRole
  }
}
