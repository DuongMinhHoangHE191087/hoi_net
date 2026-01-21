# 🚀 PKCE Fix - Quick Reference

## ❌ Error
```
PKCE code verifier not found in storage
```

## ✅ Solution

### The Problem
- Browser was using **localStorage** for PKCE verifier
- Server was looking in **cookies**
- Mismatch caused error

### The Fix
All 3 files now use **cookie-based storage**:

1. ✅ `lib/supabase/client.ts` - Browser client uses document.cookie
2. ✅ `lib/supabase/server.ts` - Server client uses Next.js cookies
3. ✅ `lib/supabase/middleware.ts` - Middleware handles cookie persistence

## 🧪 Test It

```bash
# 1. Clear browser cookies
F12 → Application → Cookies → Clear All

# 2. Restart server
rm -rf .next
npm run dev

# 3. Test login
http://localhost:3000/login → Login with Google

# ✅ Should work without PKCE error!
```

## 🔍 Verify Cookies

**DevTools → Application → Cookies → localhost:3000**

Should see:
- `sb-...-auth-token` - Session cookie ✅
- During OAuth: `sb-...-auth-token-code-verifier` ✅

**Attributes:**
- Path: `/`
- SameSite: `Lax`
- Max-Age: `604800` (7 days)

## 🐛 Still Not Working?

### 1. Clear Everything
```bash
# Clear .next cache
rm -rf .next

# Clear browser data
Settings → Privacy → Clear all cookies

# Restart
npm run dev
```

### 2. Check .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Check Supabase Dashboard
Authentication → Settings:
- ✅ Redirect URL: `http://localhost:3000/auth/callback`
- ✅ PKCE flow enabled

### 4. Check for errors
**Should NOT see:**
- ❌ "document is not defined"
- ❌ "this.lock is not a function"
- ❌ "PKCE code verifier not found"

**Should see:**
- ✅ "[Middleware] User authenticated"
- ✅ "Session refreshed"

## 📚 Full Documentation

See `FIX_PKCE_ERROR.md` for detailed explanation.

---

**Done! OAuth login should work now!** 🎉
