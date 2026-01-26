# 🔐 Enterprise Auth System - Documentation

## Overview

Hệ thống xác thực mới được xây dựng theo kiến trúc enterprise-grade, học hỏi từ:
- **Auth0** - Separation of concerns, service layer
- **Firebase Auth** - Singleton pattern, state management
- **Supabase** - React integration, TypeScript first

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         REACT COMPONENTS                      │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    useAuth()                         │   │
│   │  • user, session, isAdmin                           │   │
│   │  • signIn, signOut, signUp                         │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      AUTH STORE (Zustand)                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  • State: user, session, status, isAdmin, error     │   │
│   │  • Actions: setAuthenticated, setUnauthenticated   │   │
│   │  • Selectors: selectUser, selectIsLoading          │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      AUTH SERVICE                            │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  • Singleton instance                               │   │
│   │  • Business logic (sign in, sign out, etc.)        │   │
│   │  • Admin cache                                      │   │
│   │  • Error mapping                                    │   │
│   │  • Timeout handling                                 │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      SUPABASE CLIENT                         │
└──────────────────────────────────────────────────────────────┘
```

## Files Structure

```
lib/auth/
├── index.ts        # Public API exports
├── types.ts        # TypeScript types
├── store.ts        # Zustand state management
├── service.ts      # Business logic (singleton)
├── provider.tsx    # React provider (minimal)
├── hooks.ts        # useAuth and specialized hooks
└── logger.ts       # Structured logging
```

## Usage

### Basic Usage

```tsx
import { useAuth } from '@/lib/auth'

function MyComponent() {
  const { user, isLoading, isAdmin, signOut } = useAuth()
  
  if (isLoading) return <Loading />
  if (!user) return <LoginButton />
  
  return (
    <div>
      Welcome {user.email}
      {isAdmin && <AdminPanel />}
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### Specialized Hooks (Performance Optimized)

```tsx
// Only re-render when loading state changes
import { useAuthLoading } from '@/lib/auth'
const isLoading = useAuthLoading()

// Only re-render when admin status changes
import { useIsAdmin } from '@/lib/auth'
const isAdmin = useIsAdmin()

// Only re-render when user changes
import { useUser } from '@/lib/auth'
const user = useUser()
```

### Direct Store Access (Advanced)

```tsx
import { useAuthStore, selectUser } from '@/lib/auth'

// Subscribe to specific slice
const user = useAuthStore(selectUser)

// Get entire state
const state = useAuthStore.getState()
```

### Service Layer (Non-React)

```tsx
import { AuthService } from '@/lib/auth'

// Use in API routes, middleware, etc.
await AuthService.signInWithEmail({ email, password })
await AuthService.signOut()
```

## Benefits

### 1. No Re-render Issues
- Zustand only re-renders when subscribed state changes
- No Context provider re-render cascading
- Selectors for granular subscriptions

### 2. Singleton Guarantee
- Auth initializes exactly once
- Survives React Strict Mode
- No race conditions

### 3. Clean Separation
- **Types**: Only type definitions
- **Store**: Only state management
- **Service**: Only business logic
- **Hooks**: Only React integration
- **Provider**: Only initialization

### 4. Production Ready
- Structured logging (dev only)
- Error mapping to user-friendly messages
- Timeout protection
- Admin caching
- DevTools support

### 5. TypeScript First
- Full type safety
- Autocomplete everywhere
- No any types

## Configuration

```typescript
// lib/auth/types.ts
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  sessionCheckTimeout: 5000,    // 5s timeout for session check
  adminCheckTimeout: 3000,      // 3s timeout for admin check  
  adminCacheTTL: 5 * 60 * 1000, // 5 min cache
  enableLogging: process.env.NODE_ENV === 'development',
  logLevel: 'info',
}
```

## Auth States

```
idle           → Initial, not yet checked
loading        → Currently checking session
authenticated  → User is logged in
unauthenticated → No user session
```

## Error Handling

```typescript
const { error } = useAuth()

if (error) {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      // Email/password wrong
    case 'EMAIL_NOT_CONFIRMED':
      // Need to verify email
    case 'NETWORK_ERROR':
      // Connection issue
    case 'RATE_LIMITED':
      // Too many requests
    case 'SERVER_ERROR':
      // Server issue
  }
}
```

## Migration from Old AuthContext

```diff
- import { useAuth } from '@/contexts/AuthContext'
+ import { useAuth } from '@/lib/auth'

// API is backward compatible!
const { user, loading, isAdmin, signOut } = useAuth()
```

## Console Output (Dev)

```
[Auth] Initializing...
[Auth] Session found: user@email.com
[Auth] ✅ Initialized in 234ms
[Auth] State changed: SIGNED_IN
```

## Best Practices

### 1. Use Specialized Hooks
```tsx
// ❌ Bad - re-renders on any auth change
const { isAdmin } = useAuth()

// ✅ Good - only re-renders when isAdmin changes
const isAdmin = useIsAdmin()
```

### 2. Handle Loading State
```tsx
// ❌ Bad - may flash wrong content
if (!user) return <Login />

// ✅ Good - wait for auth to finish
const { user, isLoading } = useAuth()
if (isLoading) return <Loading />
if (!user) return <Login />
```

### 3. Use Store for Derived State
```tsx
// ❌ Bad - recalculates every render
const isLoggedIn = user !== null && status === 'authenticated'

// ✅ Good - use built-in computed
const { isAuthenticated } = useAuth()
```

---

## Summary

| Feature | Old AuthContext | New Auth System |
|---------|-----------------|-----------------|
| Re-renders | Every state change | Only subscribed |
| Init calls | Multiple possible | Exactly once |
| Error handling | Basic | Typed + mapped |
| Logging | Console spam | Structured, dev only |
| TypeScript | Partial | Full coverage |
| Testing | Hard to mock | Easy to mock |
| Caching | Basic | With TTL |
| Timeouts | None | Configurable |

**The new auth system is production-ready!** 🚀
