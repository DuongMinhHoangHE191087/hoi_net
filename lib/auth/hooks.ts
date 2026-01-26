/**
 * 🔐 useAuth Hook - The Main API for Components
 * 
 * This hook provides a stable interface for components to use auth.
 * It wraps the Zustand store and AuthService for clean usage.
 * 
 * Usage:
 * ```tsx
 * const { user, isLoading, signIn, signOut } = useAuth()
 * ```
 */

'use client'

import { useCallback, useMemo } from 'react'
import { useAuthStore, selectUser, selectSession, selectStatus, selectIsAdmin, selectError } from './store'
import { AuthService } from './service'
import { SignInCredentials, SignUpCredentials } from './types'

export function useAuth() {
  // Subscribe to specific slices to prevent unnecessary re-renders
  const user = useAuthStore(selectUser)
  const session = useAuthStore(selectSession)
  const status = useAuthStore(selectStatus)
  const isAdmin = useAuthStore(selectIsAdmin)
  const error = useAuthStore(selectError)

  // Computed values
  const isLoading = status === 'loading' || status === 'idle'
  const isAuthenticated = status === 'authenticated' && user !== null

  // Memoized actions
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    return AuthService.signInWithEmail({ email, password })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    return AuthService.signInWithGoogle()
  }, [])

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    return AuthService.signUp({ email, password, metadata })
  }, [])

  const signOut = useCallback(async () => {
    return AuthService.signOut()
  }, [])

  const refreshSession = useCallback(async () => {
    return AuthService.refreshSession()
  }, [])

  const updateProfile = useCallback(async (updates: any) => {
    return AuthService.updateProfile(updates)
  }, [])

  // Return stable object
  return useMemo(() => ({
    // State
    user,
    session,
    status,
    isAdmin,
    error,
    
    // Computed
    isLoading,
    isAuthenticated,
    loading: isLoading, // Alias for backward compatibility
    
    // Actions
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signUpWithEmail: signUp, // Alias for backward compatibility
    signOut,
    refreshSession,
    updateProfile,
  }), [
    user, 
    session, 
    status, 
    isAdmin, 
    error, 
    isLoading, 
    isAuthenticated,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signOut,
    refreshSession,
    updateProfile,
  ])
}

// ============================================
// Specialized Hooks
// ============================================

/**
 * Hook to only get auth loading state
 * Useful for loading indicators
 */
export function useAuthLoading() {
  const status = useAuthStore(selectStatus)
  return status === 'loading' || status === 'idle'
}

/**
 * Hook to only get auth status
 * Useful for route guards
 */
export function useAuthStatus() {
  return useAuthStore(selectStatus)
}

/**
 * Hook to only get admin status
 * Useful for admin-only features
 */
export function useIsAdmin() {
  return useAuthStore(selectIsAdmin)
}

/**
 * Hook to only get user
 * Useful when you only need user data
 */
export function useUser() {
  return useAuthStore(selectUser)
}

/**
 * Hook to only get session
 */
export function useSession() {
  return useAuthStore(selectSession)
}

