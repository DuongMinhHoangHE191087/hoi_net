/**
 * 🔐 Auth Service - Business Logic Layer
 * 
 * Handles all authentication operations with proper error handling,
 * retries, and logging. Completely decoupled from React.
 * 
 * This is the core of the authentication system.
 */

import { SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { 
  AuthConfig, 
  DEFAULT_AUTH_CONFIG, 
  AuthError, 
  AuthErrorCode,
  SignInCredentials,
  SignUpCredentials,
  SignInResult,
  SignUpResult,
  AdminCacheEntry,
} from './types'
import { useAuthStore } from './store'
import { authLog } from './logger'
import { AdminService } from '@/lib/admin-service'

// ============================================
// Singleton Guard
// ============================================

let isInitialized = false
let isInitializing = false
let initPromise: Promise<void> | null = null

// ============================================
// Admin Cache - with localStorage persistence
// ============================================

const adminCache = new Map<string, AdminCacheEntry>()

// Load admin cache from localStorage on startup
function loadAdminCacheFromStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem('admin_status_cache')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Only use if not expired (1 hour max)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
        adminCache.set(parsed.userId, {
          isAdmin: parsed.isAdmin,
          timestamp: parsed.timestamp,
          userId: parsed.userId,
        })
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
}

// Save admin status to localStorage
function saveAdminCacheToStorage(entry: AdminCacheEntry): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('admin_status_cache', JSON.stringify(entry))
  } catch (e) {
    // Ignore storage errors
  }
}

// Clear admin cache from storage
function clearAdminCacheFromStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('admin_status_cache')
  } catch (e) {
    // Ignore storage errors
  }
}

// Initialize cache from storage
if (typeof window !== 'undefined') {
  loadAdminCacheFromStorage()
}

// ============================================
// Auth Service Class
// ============================================

class AuthServiceClass {
  private supabase: SupabaseClient
  private config: AuthConfig
  private unsubscribe: (() => void) | null = null

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_AUTH_CONFIG, ...config }
    this.supabase = createClient()
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize auth - only runs once across entire app lifecycle
   */
  async initialize(): Promise<void> {
    // Already initialized
    if (isInitialized) {
      authLog.debug('Already initialized, skipping')
      return
    }

    // Currently initializing - wait for it
    if (isInitializing && initPromise) {
      authLog.debug('Init in progress, waiting...')
      return initPromise
    }

    // Start initialization
    isInitializing = true
    const store = useAuthStore.getState()
    store.setStatus('loading')

    initPromise = this.doInitialize()
    
    try {
      await initPromise
    } finally {
      isInitializing = false
    }
  }

  private async doInitialize(): Promise<void> {
    const startTime = Date.now()
    authLog.initStart()

    try {
      // ⚡ FAST PATH: Get session without blocking UI
      // Use Promise.race with immediate timeout for instant response
      const sessionPromise = this.supabase.auth.getSession()
      
      // Give user immediate feedback - don't block
      const quickTimeout = new Promise<null>((resolve) => 
        setTimeout(() => resolve(null), 100) // 100ms max wait
      )

      // Try to get session quickly
      const quickResult = await Promise.race([sessionPromise, quickTimeout])
      
      if (quickResult === null) {
        // Session is slow, let it continue in background
        authLog.debug('Session check slow, continuing in background')
        
        // Check if we have cached session info from localStorage
        // Don't set as unauthenticated immediately - wait a bit more
        
        // Continue fetching in background with longer timeout
        sessionPromise.then(async ({ data: { session }, error }) => {
          if (session?.user && !error) {
            // Check cached admin status first
            const cachedAdmin = adminCache.get(session.user.id)
            const initialIsAdmin = cachedAdmin?.isAdmin || false
            
            useAuthStore.getState().setAuthenticated(session.user, session, initialIsAdmin)
            authLog.sessionFound(session.user.email || 'unknown')
            
            // Verify admin status if not cached
            if (!cachedAdmin) {
              const isAdmin = await this.checkAdmin(session.user)
              if (isAdmin !== initialIsAdmin) {
                useAuthStore.getState().setIsAdmin(isAdmin)
              }
            }
          } else {
            useAuthStore.getState().setUnauthenticated()
          }
          isInitialized = true
        }).catch((err) => {
          // Ignore AbortError - this is normal when component unmounts
          if (this.isAbortError(err)) {
            authLog.debug('Background session check aborted (normal)')
            return
          }
          authLog.error('Background session check failed', err)
          useAuthStore.getState().setUnauthenticated()
          isInitialized = true
        })
        
        // Wait a bit more before giving up
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // If still not initialized, set as unauthenticated for now
        if (!isInitialized) {
          useAuthStore.getState().setStatus('unauthenticated')
          isInitialized = true
        }
        
        authLog.initComplete(Date.now() - startTime)
        return
      }

      // ✅ Got session quickly
      const { data: { session }, error } = quickResult

      if (error) {
        // Ignore AbortError
        if (this.isAbortError(error)) {
          authLog.debug('Session check aborted')
          this.finishInit(startTime)
          return
        }

        authLog.error('Session check error', error.message)
        useAuthStore.getState().setError(this.mapError(error))
        this.finishInit(startTime)
        return
      }

      if (session?.user) {
        authLog.sessionFound(session.user.email || 'unknown')
        
        // Check if we have cached admin status first (instant)
        const cachedAdmin = adminCache.get(session.user.id)
        const initialIsAdmin = cachedAdmin?.isAdmin || false
        
        // Set authenticated immediately with cached admin status
        useAuthStore.getState().setAuthenticated(session.user, session, initialIsAdmin)
        
        // If no cached admin status, check in background
        if (!cachedAdmin) {
          this.checkAdmin(session.user).then(isAdmin => {
            if (isAdmin !== initialIsAdmin) {
              useAuthStore.getState().setIsAdmin(isAdmin)
            }
          })
        }
      } else {
        authLog.noSession()
        useAuthStore.getState().setUnauthenticated()
      }

      // Setup auth state listener
      this.setupAuthListener()

      this.finishInit(startTime)

    } catch (error: any) {
      if (this.isAbortError(error)) {
        authLog.debug('Init aborted')
      } else {
        authLog.error('Init error', error)
        useAuthStore.getState().setError(this.mapError(error))
      }
      
      useAuthStore.getState().setStatus('unauthenticated')
      isInitialized = true
    }
  }

  private finishInit(startTime: number): void {
    isInitialized = true
    const duration = Date.now() - startTime
    authLog.initComplete(duration)
  }

  // ============================================
  // Auth State Listener
  // ============================================

  private setupAuthListener(): void {
    // Cleanup existing listener
    if (this.unsubscribe) {
      this.unsubscribe()
    }

    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        authLog.stateChange(event, session?.user?.email)

        const store = useAuthStore.getState()

        if (session?.user) {
          const isAdmin = await this.checkAdmin(session.user)
          store.setAuthenticated(session.user, session, isAdmin)
        } else {
          store.setUnauthenticated()
          this.clearAdminCache()
        }
      }
    )

    this.unsubscribe = () => subscription.unsubscribe()
  }

  // ============================================
  // Sign In Methods
  // ============================================

  async signInWithEmail(credentials: SignInCredentials): Promise<SignInResult> {
    authLog.signInStart('email')
    const store = useAuthStore.getState()

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      })

      if (error) {
        authLog.signInError(error.message)
        return { 
          success: false, 
          error: this.mapError(error) 
        }
      }

      // Verify session
      const { data: { session } } = await this.supabase.auth.getSession()
      
      if (!session) {
        authLog.signInError('Session verification failed')
        return {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Không thể tạo phiên đăng nhập. Vui lòng thử lại.',
          }
        }
      }

      authLog.signInSuccess(data.user?.email || 'unknown')
      
      // Check admin
      const isAdmin = await this.checkAdmin(data.user!)
      store.setAuthenticated(data.user!, session, isAdmin)

      return { success: true }

    } catch (error: any) {
      authLog.signInError(error.message)
      return { 
        success: false, 
        error: this.mapError(error) 
      }
    }
  }

  async signInWithGoogle(): Promise<void> {
    authLog.signInStart('google')

    const { error } = await this.supabase.auth.signInWithOAuth({
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
      authLog.signInError(error.message)
      throw error
    }
  }

  // ============================================
  // Sign Up
  // ============================================

  async signUp(credentials: SignUpCredentials): Promise<SignUpResult> {
    authLog.info('Sign up started')

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        options: {
          data: credentials.metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        authLog.error('Sign up failed', error.message)
        return { 
          success: false, 
          error: this.mapError(error) 
        }
      }

      const needsConfirmation = !data.user?.email_confirmed_at
      
      authLog.info('Sign up successful', { 
        needsConfirmation,
        email: data.user?.email 
      })

      return {
        success: true,
        needsConfirmation,
      }

    } catch (error: any) {
      authLog.error('Sign up error', error.message)
      return { 
        success: false, 
        error: this.mapError(error) 
      }
    }
  }

  // ============================================
  // Sign Out
  // ============================================

  async signOut(): Promise<void> {
    authLog.signOutStart()

    try {
      await this.supabase.auth.signOut({ scope: 'global' })
      
      // Clear state
      useAuthStore.getState().setUnauthenticated()
      this.clearAdminCache()

      // Clear storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_cache')
        sessionStorage.clear()
      }

      authLog.signOutComplete()

      // Hard redirect for clean state
      window.location.href = '/'

    } catch (error: any) {
      authLog.error('Sign out error', error.message)
      // Still clear local state
      useAuthStore.getState().setUnauthenticated()
      throw error
    }
  }

  // ============================================
  // Session Management
  // ============================================

  async refreshSession(): Promise<void> {
    const { data: { session }, error } = await this.supabase.auth.refreshSession()
    
    if (error) {
      authLog.error('Session refresh failed', error.message)
      return
    }

    if (session) {
      const isAdmin = await this.checkAdmin(session.user)
      useAuthStore.getState().setAuthenticated(session.user, session, isAdmin)
    }
  }

  async updateProfile(updates: any): Promise<void> {
    const { data, error } = await this.supabase.auth.updateUser({
      data: updates,
    })

    if (error) throw error

    const store = useAuthStore.getState()
    store.setUser(data.user)
  }

  // ============================================
  // Admin Check with Cache
  // ============================================

  private async checkAdmin(user: User): Promise<boolean> {
    if (!user?.id) return false

    // Check memory cache first
    const cached = adminCache.get(user.id)
    if (cached && Date.now() - cached.timestamp < this.config.adminCacheTTL) {
      authLog.debug('Admin status from cache', cached.isAdmin)
      return cached.isAdmin
    }

    try {
      const isAdmin = await this.withTimeout(
        AdminService.isAdmin(user.id, this.supabase),
        this.config.adminCheckTimeout,
        'Admin check timeout'
      )

      // Cache result in memory and storage
      const cacheEntry: AdminCacheEntry = {
        isAdmin,
        timestamp: Date.now(),
        userId: user.id,
      }
      adminCache.set(user.id, cacheEntry)
      saveAdminCacheToStorage(cacheEntry)

      authLog.adminCheck(isAdmin)
      return isAdmin

    } catch (error) {
      authLog.warn('Admin check failed, assuming false')
      return false
    }
  }

  private clearAdminCache(): void {
    adminCache.clear()
    clearAdminCacheFromStorage()
    authLog.debug('Admin cache cleared')
  }

  // ============================================
  // Utility Methods
  // ============================================

  private async withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    timeoutMessage: string
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(timeoutMessage))
      }, ms)
    })

    try {
      const result = await Promise.race([promise, timeoutPromise])
      clearTimeout(timeoutId!)
      return result
    } catch (error) {
      clearTimeout(timeoutId!)
      throw error
    }
  }

  private isAbortError(error: any): boolean {
    if (!error) return false
    const name = (error.name || '').toLowerCase()
    const message = (error.message || '').toLowerCase()
    return name.includes('abort') || message.includes('abort') || message.includes('signal')
  }

  private mapError(error: any): AuthError {
    const message = error.message || 'Unknown error'
    
    // Map common Supabase errors
    if (message.includes('Invalid login credentials')) {
      return { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng' }
    }
    if (message.includes('Email not confirmed')) {
      return { code: 'EMAIL_NOT_CONFIRMED', message: 'Vui lòng xác nhận email trước khi đăng nhập' }
    }
    if (message.includes('rate limit')) {
      return { code: 'RATE_LIMITED', message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }
    }
    if (message.includes('network') || message.includes('fetch')) {
      return { code: 'NETWORK_ERROR', message: 'Lỗi kết nối. Vui lòng kiểm tra mạng.' }
    }

    return { 
      code: 'UNKNOWN', 
      message,
      originalError: error 
    }
  }

  // ============================================
  // Getters
  // ============================================

  get client(): SupabaseClient {
    return this.supabase
  }

  get initialized(): boolean {
    return isInitialized
  }
}

// ============================================
// Singleton Export
// ============================================

export const AuthService = new AuthServiceClass()

