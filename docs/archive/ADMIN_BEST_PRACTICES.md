# 🛡️ ADMIN SYSTEM BEST PRACTICES

## 📚 Hướng Dẫn Sử Dụng AdminService

### 1. Server-Side Admin Check (API Routes, Server Components)

#### ✅ ĐÚNG - Sử dụng AdminService

```typescript
// app/api/admin/some-action/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AdminService } from '@/lib/admin-service'

export async function POST(request: NextRequest) {
  try {
    // Get Supabase client
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    // ✅ Check admin using AdminService
    const isAdmin = await AdminService.isAdmin(user.id, supabase)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Chỉ admin mới có quyền truy cập' },
        { status: 403 }
      )
    }

    // Proceed with admin action
    // ...

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

#### ✅ ĐÚNG - Sử dụng requireAdminAuth Helper

```typescript
// app/api/admin/users/route.ts
import { NextRequest } from 'next/server'
import { requireAdminAuth } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (user, req) => {
    // user.isAdmin is guaranteed to be true here

    // Your admin logic
    const users = await fetchAllUsers()

    return Response.json({ users })
  })
}
```

#### ❌ SAI - Không nên check trực tiếp ADMIN_EMAILS

```typescript
// ❌ KHÔNG LÀM NHƯ NÀY
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')
const isAdmin = ADMIN_EMAILS?.includes(user.email)

// Vấn đề:
// - Không đồng bộ với database
// - Không có cache
// - Không có fallback logic
```

---

### 2. Client-Side Admin Check (React Components)

#### ✅ ĐÚNG - Sử dụng useAuth Hook

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth()

  // Show loading state
  if (loading) {
    return <Loading />
  }

  // ✅ Check admin from context
  if (!user || !isAdmin) {
    return <AccessDenied />
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  )
}
```

#### ✅ ĐÚNG - Conditional Rendering

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'

export function Navbar() {
  const { isAdmin } = useAuth()

  return (
    <nav>
      {/* Regular nav items */}

      {/* ✅ Only show admin button if user is admin */}
      {isAdmin && (
        <Link href="/admin">
          <Button>Admin Panel</Button>
        </Link>
      )}
    </nav>
  )
}
```

#### ❌ SAI - Không nên tự check trong component

```typescript
// ❌ KHÔNG LÀM NHƯ NÀY
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      // ❌ Custom admin check
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')
      setIsAdmin(adminEmails?.includes(data.user?.email))
    })
  }, [])

  // Vấn đề:
  // - Duplicate logic
  // - Không đồng bộ với AuthContext
  // - Không có cache
}
```

---

### 3. Middleware Admin Check

#### ✅ ĐÚNG - Middleware đã được update

```typescript
// middleware.ts
import { AdminService } from '@/lib/admin-service'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  const { user, supabase } = await updateSession(req)

  // ✅ Use AdminService
  const isAdmin = user ? await AdminService.isAdmin(user.id, supabase) : false

  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return res
}
```

---

## 🔐 Security Checklist

### API Routes Protection

Mỗi admin API route PHẢI có:

```typescript
// 1. Authentication check
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// 2. Admin authorization check
const isAdmin = await AdminService.isAdmin(user.id, supabase)
if (!isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// 3. Input validation
const { data } = await request.json()
if (!data || !validateInput(data)) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
}

// 4. Try-catch error handling
try {
  // Your logic
} catch (error) {
  console.error('[API Error]:', error)
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
```

### Page Protection

Mỗi admin page PHẢI có:

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth()

  // 1. Loading state
  if (loading) {
    return <Loading />
  }

  // 2. Auth check (middleware is primary, this is backup)
  if (!user || !isAdmin) {
    return <AccessDenied />
  }

  // 3. Actual page content
  return <div>Admin Content</div>
}
```

---

## 🚫 Common Mistakes to Avoid

### ❌ Mistake 1: Checking admin in multiple ways

```typescript
// ❌ BAD - Different checks in different places
// File A:
const isAdmin = ADMIN_EMAILS.includes(user.email)

// File B:
const isAdmin = await supabase.from('admin_users').select('*').eq('user_id', user.id)

// File C:
const isAdmin = user.role === 'admin'

// Problem: Inconsistent, hard to maintain
```

```typescript
// ✅ GOOD - Use AdminService everywhere
import { AdminService } from '@/lib/admin-service'

const isAdmin = await AdminService.isAdmin(user.id, supabase)
```

---

### ❌ Mistake 2: Relying only on client-side checks

```typescript
// ❌ BAD - Client-only protection
'use client'

export default function AdminPage() {
  const { isAdmin } = useAuth()

  if (!isAdmin) return <div>Access Denied</div>

  // Attacker can bypass this by modifying client-side code
  return <div>Admin Content</div>
}
```

```typescript
// ✅ GOOD - Server + Client protection
// middleware.ts - Server-side check (primary)
if (isAdminRoute && !isAdmin) {
  return NextResponse.redirect('/unauthorized')
}

// page.tsx - Client-side check (backup UX)
if (!isAdmin) return <AccessDenied />
```

---

### ❌ Mistake 3: Not handling async properly

```typescript
// ❌ BAD - AdminService.isAdmin is async but not awaited
const checkAdmin = (user) => {
  const isAdmin = AdminService.isAdmin(user.id, supabase) // Missing await!
  setIsAdmin(isAdmin) // Will be a Promise, not boolean
}
```

```typescript
// ✅ GOOD - Properly await async function
const checkAdmin = async (user) => {
  const isAdmin = await AdminService.isAdmin(user.id, supabase)
  setIsAdmin(isAdmin)
}
```

---

### ❌ Mistake 4: Forgetting to clear cache after granting/revoking admin

```typescript
// ❌ BAD - Grant admin without clearing cache
await supabase.from('admin_users').insert({ user_id: userId })
// User won't be admin for 5 minutes (cache TTL)
```

```typescript
// ✅ GOOD - Clear cache after changes
await AdminService.grantAdmin(userId, grantedBy, permissions, supabase)
// Cache is automatically cleared inside grantAdmin()

// Or manually:
await supabase.from('admin_users').insert({ user_id: userId })
AdminService.clearCache(userId) // Clear specific user cache
```

---

## 📋 Testing Checklist

### Database Tests

```sql
-- 1. User exists
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- 2. Admin granted
SELECT * FROM public.admin_users WHERE user_id = '...';

-- 3. Function works
SELECT public.is_admin('user-id-here');
-- Should return: true

-- 4. Role function works
SELECT public.get_user_role('user-id-here');
-- Should return: 'admin'
```

### API Tests

```bash
# 1. Test admin API without auth - Should return 401
curl http://localhost:3000/api/admin/users

# 2. Test admin API with non-admin user - Should return 403
curl -H "Authorization: Bearer <non-admin-token>" \
  http://localhost:3000/api/admin/users

# 3. Test admin API with admin user - Should return 200
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3000/api/admin/users
```

### Frontend Tests

```
1. Login as non-admin user
   - ✓ Admin button KHÔNG hiển thị trong navbar
   - ✓ Truy cập /admin bị redirect về /unauthorized

2. Login as admin user
   - ✓ Admin button hiển thị trong navbar
   - ✓ Badge "Admin" hiển thị trong dropdown
   - ✓ Truy cập /admin thành công
   - ✓ Tất cả admin tabs load được

3. Logout và login lại
   - ✓ Admin status vẫn được giữ
```

---

## 🔄 Admin Management Operations

### Grant Admin

```typescript
// API route: app/api/admin/grant-admin/route.ts
import { AdminService } from '@/lib/admin-service'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if current user is admin
  const isCurrentUserAdmin = await AdminService.isAdmin(user.id, supabase)
  if (!isCurrentUserAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Grant admin to target user
  const { targetUserId } = await request.json()

  const result = await AdminService.grantAdmin(
    targetUserId,
    user.id, // granted_by
    { full_access: true },
    supabase
  )

  if (result.success) {
    return NextResponse.json({ message: 'Admin granted successfully' })
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
}
```

### Revoke Admin

```typescript
// API route: app/api/admin/revoke-admin/route.ts
import { AdminService } from '@/lib/admin-service'

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isCurrentUserAdmin = await AdminService.isAdmin(user.id, supabase)
  if (!isCurrentUserAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { targetUserId } = await request.json()

  // Prevent self-revocation
  if (targetUserId === user.id) {
    return NextResponse.json(
      { error: 'Cannot revoke your own admin privileges' },
      { status: 400 }
    )
  }

  const result = await AdminService.revokeAdmin(targetUserId, supabase)

  if (result.success) {
    return NextResponse.json({ message: 'Admin revoked successfully' })
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
}
```

### List All Admins

```typescript
// API route: app/api/admin/list-admins/route.ts
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAdmin = await AdminService.isAdmin(user.id, supabase)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Query admin_users with user info
  const { data, error } = await supabase
    .from('admin_users')
    .select(`
      user_id,
      granted_at,
      granted_by,
      permissions,
      users:user_id (
        email,
        created_at
      )
    `)
    .order('granted_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ admins: data })
}
```

---

## 🎯 Performance Best Practices

### 1. Cache is Your Friend

AdminService automatically caches admin status for 5 minutes:

```typescript
// First call - queries database
const isAdmin = await AdminService.isAdmin(userId, supabase) // ~50ms

// Subsequent calls within 5 min - from cache
const isAdmin = await AdminService.isAdmin(userId, supabase) // ~1ms
```

### 2. Clear Cache When Needed

```typescript
// After granting admin
await AdminService.grantAdmin(userId, grantedBy, permissions, supabase)
// Cache automatically cleared

// After revoking admin
await AdminService.revokeAdmin(userId, supabase)
// Cache automatically cleared

// Manual cache clear (if needed)
AdminService.clearCache(userId) // Clear specific user
AdminService.clearAllCache()    // Clear all admin caches
```

### 3. Avoid Repeated Checks

```typescript
// ❌ BAD - Checking admin multiple times
async function myFunction(userId) {
  const isAdmin1 = await AdminService.isAdmin(userId, supabase)
  // ... some code ...
  const isAdmin2 = await AdminService.isAdmin(userId, supabase)
  // ... some code ...
  const isAdmin3 = await AdminService.isAdmin(userId, supabase)
}
```

```typescript
// ✅ GOOD - Check once, reuse
async function myFunction(userId) {
  const isAdmin = await AdminService.isAdmin(userId, supabase)

  // Reuse isAdmin variable
  if (isAdmin) { /* ... */ }
  // ...
  if (isAdmin) { /* ... */ }
}
```

---

## 📖 Reference

### AdminService API

```typescript
class AdminService {
  // Check if user is admin
  static async isAdmin(userId: string, supabase: any): Promise<boolean>

  // Check if user is admin by User object
  static async isAdminByUser(user: User | null, supabase: any): Promise<boolean>

  // Get admin permissions
  static async getAdminPermissions(userId: string, supabase: any): Promise<AdminPermissions | null>

  // Grant admin to user
  static async grantAdmin(
    userId: string,
    grantedBy: string,
    permissions: AdminPermissions,
    supabase: any
  ): Promise<{ success: boolean; error?: string }>

  // Revoke admin from user
  static async revokeAdmin(userId: string, supabase: any): Promise<{ success: boolean; error?: string }>

  // Clear admin cache
  static clearCache(userId?: string): void
  static clearAllCache(): void
}

// Client-side hook
function useAdminCheck(): {
  isAdmin: boolean
  loading: boolean
  user: User | null
}
```

### Helper Functions (lib/auth-server.ts)

```typescript
// Verify auth from request
async function verifyAuth(request: NextRequest): Promise<AuthUser | null>

// Get user from server
async function getServerUser(): Promise<AuthUser | null>

// Require authentication
async function requireAuth(
  request: NextRequest,
  handler: (user: AuthUser, request: NextRequest) => Promise<Response>
): Promise<Response>

// Require admin authentication
async function requireAdminAuth(
  request: NextRequest,
  handler: (user: AuthUser, request: NextRequest) => Promise<Response>
): Promise<Response>
```

---

**Prepared by:** Claude Code Assistant
**Date:** 2026-01-18
**Version:** 3.0.0
**Status:** ✅ PRODUCTION READY
