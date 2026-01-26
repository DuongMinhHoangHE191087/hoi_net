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

