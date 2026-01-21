'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { authLogger } from '@/lib/auth-logger'
import { AdminService } from '@/lib/admin-service'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUpWithEmail: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ success: false }),
  signUpWithEmail: async () => ({ success: false }),
  signOut: async () => {},
  updateProfile: async () => {},
  refreshSession: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])

  // ✅ IMPROVED: Check if user is admin using centralized AdminService
  const checkAdmin = useCallback(async (user: User | null) => {
    if (!user?.id) return false

    try {
      const isAdminUser = await AdminService.isAdmin(user.id, supabase)
      console.log('[Auth] Admin check:', { userId: user.id, isAdmin: isAdminUser })
      return isAdminUser
    } catch (error) {
      console.error('[Auth] Error checking admin:', error)
      return false
    }
  }, [supabase])

  // Refresh session - useful for manual refresh
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('[Auth] Refresh session error:', error)
        return
      }
      if (newSession) {
        setSession(newSession)
        setUser(newSession.user)
        // ✅ IMPROVED: checkAdmin is now async
        const adminStatus = await checkAdmin(newSession.user)
        setIsAdmin(adminStatus)
      }
    } catch (error) {
      console.error('[Auth] Refresh session failed:', error)
    }
  }, [supabase, checkAdmin])

  useEffect(() => {
    let mounted = true
    let retryTimeout: NodeJS.Timeout | null = null

    // Get initial session with retry logic
    const initializeAuth = async (retryCount = 0) => {
      if (!mounted) return

      try {
        console.log('[Auth] Initializing auth...', { attempt: retryCount + 1 })

        // First check if there's an existing session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          // Retry on AbortError or timeout (max 3 retries)
          if ((error.message?.includes('abort') || error.message?.includes('timeout')) && retryCount < 3) {
            console.warn('[Auth] Session fetch aborted, retrying...', { attempt: retryCount + 1 })
            retryTimeout = setTimeout(() => {
              if (mounted) {
                initializeAuth(retryCount + 1)
              }
            }, 500 * (retryCount + 1))
            return
          }

          console.error('[Auth] Error getting session:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (initialSession) {
          console.log('[Auth] Initial session found:', initialSession.user?.email)
          if (mounted) {
            setSession(initialSession)
            setUser(initialSession.user)
          }
          // Check admin is now async
          const adminStatus = await checkAdmin(initialSession.user)
          if (mounted) {
            setIsAdmin(adminStatus)
          }
        } else {
          console.log('[Auth] No initial session found')
        }

        if (mounted) {
          setLoading(false)
        }
      } catch (error: any) {
        if (!mounted) return

        // Catch AbortError and retry (max 3 retries)
        if ((error.name === 'AbortError' || error.message?.includes('abort')) && retryCount < 3) {
          console.warn('[Auth] AbortError caught, retrying...', { attempt: retryCount + 1 })
          retryTimeout = setTimeout(() => {
            if (mounted) {
              initializeAuth(retryCount + 1)
            }
          }, 500 * (retryCount + 1))
          return
        }

        console.error('[Auth] Auth initialization error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      if (!mounted) return

      console.log('[Auth] Auth state changed:', event, newSession?.user?.email)

      // Update state based on event
      if (mounted) {
        setSession(newSession)
        setUser(newSession?.user ?? null)
      }

      // Check admin is now async
      const adminStatus = await checkAdmin(newSession?.user ?? null)
      if (mounted) {
        setIsAdmin(adminStatus)
      }

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('[Auth] User signed in:', newSession?.user?.email)
          // Refresh router to update server components
          router.refresh()
          break

        case 'SIGNED_OUT':
          console.log('[Auth] User signed out')
          setUser(null)
          setSession(null)
          setIsAdmin(false)
          router.refresh()
          break

        case 'TOKEN_REFRESHED':
          console.log('[Auth] Token refreshed')
          break

        case 'USER_UPDATED':
          console.log('[Auth] User updated')
          break

        case 'PASSWORD_RECOVERY':
          console.log('[Auth] Password recovery requested')
          break

        default:
          break
      }

      setLoading(false)
    })

    // Cleanup function
    return () => {
      mounted = false
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      subscription.unsubscribe()
    }
  }, [supabase, router, checkAdmin])

  // Memoize all handler functions to prevent child re-renders
  const signInWithGoogle = useCallback(async () => {
    try {
      console.log('[Auth] Starting Google sign in...')
      authLogger.oauthAttempt('google')

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('[Auth] Error signing in with Google:', error.message)
        authLogger.oauthFailure('google', error.message, error.name)
        throw error
      }

      authLogger.oauthAttempt('google', { redirectInitiated: true })
    } catch (error) {
      console.error('[Auth] Sign in error:', error)
      throw error
    }
  }, [supabase])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      console.log('[Auth] Attempting email sign in:', email)
      authLogger.loginAttempt(email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        console.error('[Auth] Email sign in error:', error)
        authLogger.loginFailure(email, error.message, error.name)
        return { success: false, error: error.message }
      }

      console.log('[Auth] Sign in API call successful:', data.user?.email)

      // ✅ CRITICAL: Verify session was actually created
      const { data: { session: verifiedSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !verifiedSession) {
        console.error('[Auth] Session verification failed:', sessionError)
        authLogger.loginFailure(email, 'Session verification failed', sessionError?.name)
        return {
          success: false,
          error: 'Không thể tạo phiên đăng nhập. Vui lòng thử lại.'
        }
      }

      console.log('[Auth] Session verified successfully')
      authLogger.loginSuccess(data.user.id, email)
      authLogger.sessionVerified(data.user.id)

      // State will be updated by onAuthStateChange
      return { success: true }
    } catch (error: any) {
      console.error('[Auth] Email sign in error:', error)
      authLogger.loginFailure(email, error.message, error.name)
      return { success: false, error: error.message }
    }
  }, [supabase])

  const signUpWithEmail = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      console.log('[Auth] Attempting email sign up:', email)
      authLogger.signupAttempt(email, metadata)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('[Auth] Sign up error:', error)
        authLogger.signupFailure(email, error.message, error.name, metadata)
        return { success: false, error: error.message }
      }

      // ✅ IMPROVED: Better email confirmation detection
      // Check the email_confirmed_at field which is the source of truth
      const needsConfirmation = !data.user?.email_confirmed_at

      console.log('[Auth] Sign up successful', {
        userId: data.user?.id,
        email: data.user?.email,
        needsConfirmation,
        emailConfirmedAt: data.user?.email_confirmed_at,
        identitiesCount: data.user?.identities?.length || 0
      })

      authLogger.signupSuccess(data.user!.id, email, needsConfirmation, metadata)

      if (needsConfirmation) {
        authLogger.emailConfirmationSent(email)
      }

      return {
        success: true,
        needsConfirmation
      }
    } catch (error: any) {
      console.error('[Auth] Sign up error:', error)
      authLogger.signupFailure(email, error.message, error.name, metadata)
      return { success: false, error: error.message }
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      console.log('[Auth] Starting logout process...')
      setLoading(true)

      const currentUserId = user?.id
      const currentEmail = user?.email

      // Sign out from Supabase - this clears ALL cookies automatically
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from ALL sessions
      })

      if (error) {
        console.error('[Auth] Logout error:', error)
        throw error
      }

      console.log('[Auth] Supabase signout successful')

      if (currentUserId && currentEmail) {
        authLogger.logout(currentUserId, currentEmail)
      }

      // Clear local state
      setUser(null)
      setSession(null)
      setIsAdmin(false)

      // Clear any local storage items related to auth
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_cache')
        sessionStorage.clear()
      }

      console.log('[Auth] Local state cleared')

      // Hard redirect to home for clean state
      window.location.href = '/'

    } catch (error) {
      console.error('[Auth] Error signing out:', error)
      // Even if error, try to clear local state
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      throw error
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  const updateProfile = useCallback(async (updates: any) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      })

      if (error) throw error

      setUser(data.user)
      router.refresh()
    } catch (error) {
      console.error('[Auth] Profile update error:', error)
      throw error
    }
  }, [user, supabase, router])

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isAdmin,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    refreshSession,
  }), [user, session, loading, isAdmin, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, updateProfile, refreshSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
