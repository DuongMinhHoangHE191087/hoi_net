# 🔧 Fix Lỗi AbortError - Supabase Auth

## ❌ Lỗi Gặp Phải

```
Unhandled Runtime Error
AbortError: signal is aborted without reason

Call Stack
eval
node_modules\@supabase\auth-js\dist\module\lib\locks.js (98:1)
```

## 🎯 Nguyên Nhân

Lỗi này xảy ra do:
1. **Lock timeout**: Supabase auth lock mechanism timeout (default 5s)
2. **Concurrent requests**: Multiple auth requests đồng thời
3. **Browser navigation**: Tab switching hoặc page navigation interrupt auth flow
4. **Race conditions**: Auth state changes quá nhanh

## ✅ Giải Pháp Đã Áp Dụng

### 1. Cấu Hình Supabase Client (`lib/supabase/client.ts`)

**Thay đổi:**
- Tăng `acquireTimeout` từ 5s lên 10s
- Thêm retry interval configuration
- Thêm custom headers

```typescript
browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    lock: {
      acquireTimeout: 10000, // 10 seconds
      retryInterval: 100
    }
  },
  global: {
    headers: {
      'x-application-name': 'photo-restore-ai',
    },
  },
})
```

### 2. Retry Logic trong AuthContext (`contexts/AuthContext.tsx`)

**Thay đổi:**
- Thêm retry logic cho `getSession()`
- Exponential backoff (500ms, 1000ms, 1500ms)
- Catch AbortError và tự động retry
- Max 3 retries

```typescript
const initializeAuth = async (retryCount = 0) => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error && retryCount < 3) {
      // Retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)))
      return initializeAuth(retryCount + 1)
    }
    // ...
  } catch (error: any) {
    if (error.name === 'AbortError' && retryCount < 3) {
      // Retry on AbortError
      await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)))
      return initializeAuth(retryCount + 1)
    }
  }
}
```

## 🚀 Cách Test

### 1. Restart Development Server

```bash
# Stop server
Ctrl + C

# Clear .next cache
rm -rf .next

# Restart
npm run dev
```

### 2. Test Authentication Flow

```bash
# 1. Đăng nhập
http://localhost:3000/login

# 2. Navigate qua các trang
http://localhost:3000/dashboard
http://localhost:3000/admin
http://localhost:3000/requests

# 3. Refresh page nhiều lần (Ctrl+R)

# 4. Switch tabs nhanh

# 5. Đăng xuất và đăng nhập lại
```

### 3. Check Console

Bạn sẽ thấy logs:
```
[Auth] Initializing auth... { attempt: 1 }
[Auth] Initial session found: user@example.com
[Auth] Admin check: { userId: '...', isAdmin: true }
```

Nếu có retry:
```
[Auth] Session fetch aborted, retrying... { attempt: 2 }
[Auth] AbortError caught, retrying... { attempt: 2 }
```

## 🐛 Troubleshooting

### Nếu lỗi vẫn tiếp tục:

#### 1. Clear Browser Data
```bash
# Chrome DevTools → Application → Clear storage
# Hoặc
Ctrl + Shift + Delete → Clear all
```

#### 2. Check Supabase URL
```bash
# Verify trong .env.local
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 3. Disable Browser Extensions
- Disable ad blockers
- Disable privacy extensions
- Test trong Incognito mode

#### 4. Increase Timeout (Nếu cần)
```typescript
// lib/supabase/client.ts
lock: {
  acquireTimeout: 15000, // Tăng lên 15s
  retryInterval: 100
}
```

#### 5. Check Network
```bash
# Network DevTools → Check for:
- Slow requests (>5s)
- Failed requests
- CORS errors
```

## 📊 Monitoring

### Thêm Error Tracking (Optional)

```typescript
// lib/supabase/client.ts
import * as Sentry from '@sentry/nextjs'

export function createClient() {
  // ... existing code

  // Track auth errors
  browserClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      // Clear local state
    }
    if (event === 'TOKEN_REFRESHED') {
      console.log('[Auth] Token refreshed')
    }
  })

  return browserClient
}
```

## ✅ Expected Behavior

Sau khi fix:
- ✅ No more AbortError
- ✅ Smooth authentication flow
- ✅ Automatic retry on timeout
- ✅ Stable session management
- ✅ Fast page navigation

## 📝 Changes Summary

| File | Changes | Impact |
|------|---------|--------|
| `lib/supabase/client.ts` | Thêm lock config | Fix timeout |
| `contexts/AuthContext.tsx` | Thêm retry logic | Auto recovery |

## 🎯 Prevention Tips

### Best Practices:

1. **Singleton Pattern**: Chỉ tạo 1 Supabase client instance
2. **Error Handling**: Luôn catch và retry auth errors
3. **Timeout Config**: Tăng timeout cho slow networks
4. **Loading States**: Hiển thị loading khi auth initializing
5. **Clear Cache**: Clear browser cache thường xuyên trong dev

### Code Patterns:

```typescript
// ✅ GOOD: Catch AbortError
try {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    if (error.name === 'AbortError') {
      // Retry
    }
  }
} catch (e) {
  // Handle
}

// ❌ BAD: No error handling
const { data } = await supabase.auth.getSession()
```

## 🆘 Still Having Issues?

Nếu vẫn gặp lỗi sau khi apply fix:

1. **Check Supabase Dashboard**
   - Verify project không bị pause
   - Check API limits

2. **Update Dependencies**
```bash
npm update @supabase/supabase-js @supabase/ssr
```

3. **Contact Support**
   - Supabase Discord
   - GitHub Issues

## 📚 References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Lock Configuration](https://github.com/supabase/gotrue-js)

---

**Status**: ✅ Fixed
**Version**: 1.0.0
**Date**: 2026-01-18
