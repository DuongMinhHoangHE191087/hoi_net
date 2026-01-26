/**
 * 🔐 Auth Types - Enterprise Authentication System
 * 
 * Centralized type definitions for the authentication system.
 * Following best practices from Auth0, Firebase, and Supabase.
 */

import { User, Session } from '@supabase/supabase-js'

// ============================================
// Auth State Types
// ============================================

export type AuthStatus = 
  | 'idle'           // Initial state, not yet checked
  | 'loading'        // Currently checking auth
  | 'authenticated'  // User is logged in
  | 'unauthenticated' // No user session

export interface AuthState {
  user: User | null
  session: Session | null
  status: AuthStatus
  isAdmin: boolean
  error: AuthError | null
}

// ============================================
// Error Types
// ============================================

export type AuthErrorCode = 
  | 'NETWORK_ERROR'
  | 'SESSION_EXPIRED'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'USER_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'UNKNOWN'

export interface AuthError {
  code: AuthErrorCode
  message: string
  originalError?: Error
}

// ============================================
// Auth Actions
// ============================================

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  metadata?: {
    full_name?: string
    avatar_url?: string
    [key: string]: any
  }
}

export interface SignInResult {
  success: boolean
  error?: AuthError
  needsConfirmation?: boolean
}

export interface SignUpResult {
  success: boolean
  error?: AuthError
  needsConfirmation?: boolean
}

// ============================================
// Auth Events
// ============================================

export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'

export interface AuthEventPayload {
  event: AuthEvent
  session: Session | null
  user: User | null
  timestamp: number
}

// ============================================
// Admin Cache
// ============================================

export interface AdminCacheEntry {
  isAdmin: boolean
  timestamp: number
  userId: string
}

// ============================================
// Auth Config
// ============================================

export interface AuthConfig {
  // Timeouts
  sessionCheckTimeout: number  // Max time to wait for session check
  adminCheckTimeout: number    // Max time to wait for admin check
  
  // Cache TTL
  adminCacheTTL: number       // How long to cache admin status
  
  // Retry config
  maxRetries: number
  retryDelay: number
  
  // Features
  enableLogging: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  sessionCheckTimeout: 5000,
  adminCheckTimeout: 3000,
  adminCacheTTL: 5 * 60 * 1000, // 5 minutes
  maxRetries: 2,
  retryDelay: 1000,
  enableLogging: process.env.NODE_ENV === 'development',
  logLevel: 'info',
}

