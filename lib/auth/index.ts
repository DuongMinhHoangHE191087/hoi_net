/**
 * 🔐 Auth Module - Public API
 * 
 * This is the main entry point for the auth system.
 * Import everything from here.
 * 
 * Usage:
 * ```tsx
 * import { AuthProvider, useAuth, AuthService } from '@/lib/auth'
 * ```
 */

// Provider
export { AuthProvider } from './provider'

// Hooks
export { 
  useAuth, 
  useAuthLoading, 
  useAuthStatus, 
  useIsAdmin,
  useUser,
  useSession,
} from './hooks'

// Store (for advanced usage)
export { 
  useAuthStore,
  selectUser,
  selectSession,
  selectStatus,
  selectIsAdmin,
  selectError,
  selectIsLoading,
  selectIsAuthenticated,
} from './store'

// Service (for non-React usage)
export { AuthService } from './service'

// Error Normalizer (for consistent error handling)
export {
  normalizeAuthError,
  getErrorMessage,
  getErrorCode,
  requiresCaptcha,
  isAccountLocked,
  getLockoutMessage,
  createAuthError,
  createLockoutError,
  type ExtendedAuthError,
  type ExtendedAuthErrorCode,
} from './error-normalizer'

// Security Hash (server-side only)
// Note: Only import these in server components/API routes
// export { hashEmail, hashIP, hashEmailIP, getClientIP } from './security-hash'

// Types
export type {
  AuthState,
  AuthStatus,
  AuthError,
  AuthErrorCode,
  SignInCredentials,
  SignUpCredentials,
  SignInResult,
  SignUpResult,
  AuthConfig,
} from './types'

// Logger
export { authLog } from './logger'

