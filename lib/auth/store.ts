/**
 * 🔐 Auth Store - Zustand State Management
 * 
 * Enterprise-grade state management for authentication.
 * Uses Zustand for predictable, performant state updates.
 * 
 * Benefits:
 * - No React Context re-render issues
 * - Singleton by design (perfect for auth)
 * - TypeScript-first
 * - DevTools support
 * - Middleware support (persist, logging, etc.)
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { AuthState, AuthStatus, AuthError, DEFAULT_AUTH_CONFIG } from './types'
import { authLog } from './logger'

// ============================================
// Store Interface
// ============================================

interface AuthStore extends AuthState {
  // Computed
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions - State setters
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setStatus: (status: AuthStatus) => void
  setIsAdmin: (isAdmin: boolean) => void
  setError: (error: AuthError | null) => void
  
  // Actions - Combined
  setAuthenticated: (user: User, session: Session, isAdmin: boolean) => void
  setUnauthenticated: () => void
  reset: () => void
}

// ============================================
// Initial State
// ============================================

const initialState: AuthState = {
  user: null,
  session: null,
  status: 'idle',
  isAdmin: false,
  error: null,
}

// ============================================
// Store Implementation
// ============================================

export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      ...initialState,
      
      // Computed properties
      get isLoading() {
        return get().status === 'loading' || get().status === 'idle'
      },
      
      get isAuthenticated() {
        return get().status === 'authenticated' && get().user !== null
      },
      
      // Simple setters
      setUser: (user) => set({ user }, false, 'setUser'),
      
      setSession: (session) => set({ session }, false, 'setSession'),
      
      setStatus: (status) => set({ status }, false, 'setStatus'),
      
      setIsAdmin: (isAdmin) => set({ isAdmin }, false, 'setIsAdmin'),
      
      setError: (error) => set({ error }, false, 'setError'),
      
      // Combined setters for common operations
      setAuthenticated: (user, session, isAdmin) => {
        authLog.info(`Authenticated: ${user.email}`)
        set({
          user,
          session,
          isAdmin,
          status: 'authenticated',
          error: null,
        }, false, 'setAuthenticated')
      },
      
      setUnauthenticated: () => {
        authLog.info('Unauthenticated')
        set({
          user: null,
          session: null,
          isAdmin: false,
          status: 'unauthenticated',
          error: null,
        }, false, 'setUnauthenticated')
      },
      
      reset: () => {
        authLog.debug('Reset store')
        set(initialState, false, 'reset')
      },
    })),
    {
      name: 'auth-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

// ============================================
// Selectors (for optimized subscriptions)
// ============================================

export const selectUser = (state: AuthStore) => state.user
export const selectSession = (state: AuthStore) => state.session
export const selectStatus = (state: AuthStore) => state.status
export const selectIsAdmin = (state: AuthStore) => state.isAdmin
export const selectError = (state: AuthStore) => state.error
export const selectIsLoading = (state: AuthStore) => state.status === 'loading' || state.status === 'idle'
export const selectIsAuthenticated = (state: AuthStore) => state.status === 'authenticated'

