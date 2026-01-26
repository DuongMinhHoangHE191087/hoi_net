'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
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

// ✅ Cache admin status to avoid repeated database calls
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>()
const ADMIN_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// ✅ CRITICAL: Global singleton flag to ensure auth only initializes once across ALL mounts
// This survives React Strict Mode unmount/remount cycles
let authGloballyInitialized = false
let authInitInProgress = false

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])

  // ✅ IMPROVED: Check if user is admin with caching
  const checkAdmin = useCallback(async (user: User | null): Promise<boolean> => {
    if (!user?.id) return false

    // Check cache first
    const cached = adminCache.get(user.id)
    if (cached && Date.now() - cached.timestamp < ADMIN_CACHE_TTL) {
      return cached.isAdmin
    }

    try {
      const isAdminUser = await AdminService.isAdmin(user.id, supabase)
      // Cache the result
      adminCache.set(user.id, { isAdmin: isAdminUser, timestamp: Date.now() })
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
    let initStarted = false

    // ✅ CRITICAL: Global singleton check - only one initialization across entire app lifecycle
    if (authGloballyInitialized) {
      // Auth already initialized by another instance, just sync state
      console.log('[Auth] Already globally initialized, skipping')
      if (mounted) setLoading(false)
      return
    }

    if (authInitInProgress) {
      // Another instance is currently initializing, wait for it
      console.log('[Auth] Init in progress by another instance, waiting')
      if (mounted) setLoading(false)
      return
    }

    // ✅ Helper to check if error is AbortError (should be silently ignored)
    const isAbortError = (error: any) => {
      if (!error) return false
      const errorName = error.name?.toLowerCase() || ''
      const errorMessage = error.message?.toLowerCase() || ''
      return (
        errorName === 'aborterror' ||
        errorMessage.includes('abort') ||
        errorMessage.includes('signal')
      )
    }

    // ✅ SIMPLIFIED: Get initial session ONCE
    const initializeAuth = async () => {
      // Double check before starting
      if (authGloballyInitialized || authInitInProgress || initStarted) {
        console.log('[Auth] Init already started/completed, aborting duplicate')
        return
      }
      
      if (!mounted) {
        console.log('[Auth] Component unmounted before init, aborting')
        return
      }
      
      initStarted = true
      authInitInProgress = true
      const startTime = Date.now()
      console.log('[Auth] Initializing auth...')

      try {
        // Only use getSession - simpler and faster
        const { data: { session: existingSession }, error } = await supabase.auth.getSession()
        
        const duration = Date.now() - startTime
        console.log(`[Auth] getSession completed in ${duration}ms`, { hasSession: !!existingSession, hasError: !!error })
        
        if (!mounted) {
          console.log('[Auth] Component unmounted, aborting')
          authInitInProgress = false
          return
        }

        // Silently ignore AbortError
        if (error && isAbortError(error)) {
          console.log('[Auth] Request aborted, finishing')
          setLoading(false)
          authGloballyInitialized = true
          authInitInProgress = false
          return
        }

        if (error) {
          console.log('[Auth] Session error:', error.message)
          setLoading(false)
          authGloballyInitialized = true
          authInitInProgress = false
          return
        }

        if (existingSession?.user) {
          console.log('[Auth] ✅ Session found:', existingSession.user.email)
          setUser(existingSession.user)
          setSession(existingSession)
          
          // ✅ OPTIMIZED: Don't block rendering on admin check
          // Check admin status in background (fire-and-forget)
          console.log('[Auth] Checking admin status (non-blocking)...')
          checkAdmin(existingSession.user)
            .then((adminStatus) => {
              console.log('[Auth] Admin status resolved:', adminStatus)
              if (mounted) {
                setIsAdmin(adminStatus)
              }
            })
            .catch((adminError) => {
              console.error('[Auth] Admin check failed:', adminError)
              if (mounted) {
                setIsAdmin(false)
              }
            })
        } else {
          console.log('[Auth] No session found')
        }

        console.log('[Auth] Setting loading to false (render immediately, admin check in background)...')
        if (mounted) {
          setLoading(false)  // ✅ Don't wait for admin check!
        }
        
        authGloballyInitialized = true
        console.log('[Auth] ✅ Init complete')
      } catch (error: any) {
        // Silently ignore AbortError
        if (isAbortError(error)) {
          console.log('[Auth] Request aborted')
          if (mounted) setLoading(false)
          authGloballyInitialized = true
          authInitInProgress = false
          return
        }

        console.error('[Auth] ❌ Auth error:', error)
        if (mounted) setLoading(false)
        authGloballyInitialized = true
      } finally {
        authInitInProgress = false
      }
    }

    // Start initialization with timeout safety
    initializeAuth()

    // Safety timeout - if auth doesn't complete in 10s, force finish
    const authTimeout = setTimeout(() => {
      if (authInitInProgress && mounted) {
        console.warn('[Auth] ⚠️ Timeout - forcing completion')
        setLoading(false)
        authGloballyInitialized = true
        authInitInProgress = false
      }
    }, 10000)

    // ✅ Listen for auth changes - handles sign in/out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      if (!mounted) return

      // Only log important auth events, not every state change
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('[Auth] Auth state changed:', event, newSession?.user?.email)
      }

      // Update state
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)

      // Check admin status
      if (newSession?.user) {
        const adminStatus = await checkAdmin(newSession.user)
        if (mounted) setIsAdmin(adminStatus)
      } else {
        setIsAdmin(false)
        adminCache.clear() // Clear cache on sign out
      }

      // Handle specific events
      if (event === 'SIGNED_IN') {
        authLogger.login(newSession?.user?.id || '', newSession?.user?.email || '', 'oauth')
      } else if (event === 'SIGNED_OUT') {
        adminCache.clear()
      }
    })

    // Cleanup
    return () => {
      mounted = false
      clearTimeout(authTimeout)
      subscription.unsubscribe()
    }
  }, [supabase, checkAdmin])

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

