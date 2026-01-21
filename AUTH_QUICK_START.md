# ✅ GOOGLE AUTH - TÓM TẮT SETUP

## 🎯 Đã Tạo Files

### 1. Documentation
- ✅ `GOOGLE_AUTH_SETUP.md` - Hướng dẫn chi tiết setup Google OAuth

### 2. Code Files
- ✅ `contexts/AuthContext.tsx` - Auth context provider
- ✅ `app/auth/callback/page.tsx` - OAuth callback handler
- ✅ `app/login/page.tsx` - CẬP NHẬT với Google Sign-In button
- ✅ `app/layout.tsx` - CẬP NHẬT wrap AuthProvider

## 📋 CÁC BƯỚC THỰC HIỆN

### BƯỚC 1: Setup Google Cloud Console (5 phút)

1. Vào https://console.cloud.google.com
2. Tạo project mới
3. Enable Google+ API
4. Tạo OAuth consent screen
5. Tạo OAuth Client ID
6. **LƯU LẠI:**
   - Client ID
   - Client Secret

**Chi tiết:** Xem `GOOGLE_AUTH_SETUP.md` - Phần 1

### BƯỚC 2: Cấu hình Supabase (2 phút)

1. Vào Supabase Dashboard
2. **Authentication** → **Providers** → **Google**
3. Bật "Enable Sign in with Google"
4. Paste Client ID và Client Secret
5. Click **Save**
6. Copy **Redirect URL**

**Chi tiết:** Xem `GOOGLE_AUTH_SETUP.md` - Phần 2

### BƯỚC 3: Cập nhật Google Console (1 phút)

1. Quay lại Google Console
2. Edit OAuth Client
3. Thêm Redirect URI từ Supabase:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
4. Save

### BƯỚC 4: Cài đặt Dependencies (1 phút)

```bash
npm install @supabase/auth-helpers-nextjs
```

**LƯU Ý:** Có thể đã cài rồi, nhưng chạy lại để chắc chắn.

### BƯỚC 5: Test Authentication (2 phút)

1. Chạy dev server:
   ```bash
   npm run dev
   ```

2. Vào http://localhost:3000/login

3. Click "Đăng nhập bằng Google"

4. Chọn Google account

5. Nếu thành công → Redirect về `/admin`

6. Nếu lỗi → Xem phần Troubleshooting dưới

## 🔍 Kiểm Tra

### Test Login Flow

- [ ] Click "Đăng nhập bằng Google"
- [ ] Redirect đến Google login page
- [ ] Chọn account
- [ ] Redirect về app
- [ ] Tự động đến `/admin`

### Test Session

- [ ] Reload trang → Vẫn logged in
- [ ] User info hiển thị trong console
- [ ] Session persist sau khi đóng tab

## 🐛 Troubleshooting Nhanh

### Lỗi: "redirect_uri_mismatch"
```
❌ Redirect URI không khớp
✅ Fix: Kiểm tra lại URI trong Google Console
      Phải chính xác: https://xxx.supabase.co/auth/v1/callback
```

### Lỗi: "Access blocked: This app's request is invalid"
```
❌ OAuth consent screen chưa đúng
✅ Fix: Thêm email của bạn vào Test users
      Hoặc publish app (cho production)
```

### Lỗi: "Invalid client: no application name"
```
❌ OAuth consent screen thiếu thông tin
✅ Fix: Điền đầy đủ App name và support email
```

### Login thành công nhưng không redirect
```
❌ Callback page có vấn đề
✅ Fix: Check console logs
      Đảm bảo file auth/callback/page.tsx đúng
```

## 🎨 Tùy Chỉnh Thêm (Optional)

### 1. Cập nhật Navbar với User Info

Navbar cần hiển thị:
- User avatar khi đã login
- Dropdown menu với Logout
- Link đến Admin panel

**File cần sửa:** `components/layout/Navbar.tsx`

```typescript
import { useAuth } from '@/contexts/AuthContext'

const { user, signOut } = useAuth()

// Hiển thị avatar nếu user login
{user ? (
  <UserDropdown user={user} onSignOut={signOut} />
) : (
  <LoginButton />
)}
```

### 2. Protected Routes

Tạo middleware để bảo vệ `/admin`:

**File mới:** `middleware.ts` (root folder)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

### 3. Update RLS Policies

```sql
-- Only authenticated users can access admin features
CREATE POLICY "Authenticated only" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Specific admins only (replace with your email)
CREATE POLICY "Admin only" ON value_sections
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'your-email@gmail.com'
    )
  );
```

## 📚 Files Structure

```
D:\GITHUB\WEB-SSG\
├── contexts/
│   └── AuthContext.tsx           ← MỚI - Auth provider
├── app/
│   ├── layout.tsx                ← CẬP NHẬT - Wrap AuthProvider
│   ├── login/
│   │   └── page.tsx             ← CẬP NHẬT - Google button
│   └── auth/
│       └── callback/
│           └── page.tsx          ← MỚI - OAuth callback
├── components/
│   └── layout/
│       └── Navbar.tsx            ← CẦN CẬP NHẬT - User dropdown
├── middleware.ts                 ← CẦN TẠO - Protected routes
└── GOOGLE_AUTH_SETUP.md          ← Hướng dẫn chi tiết
```

## ✅ Checklist Hoàn Thành

### Setup (Bắt buộc)
- [ ] Tạo Google OAuth Client
- [ ] Cấu hình Supabase Google Provider
- [ ] Thêm Redirect URIs
- [ ] Test login flow
- [ ] Verify session persistence

### Code (Đã xong)
- [x] AuthContext provider
- [x] Login page với Google button
- [x] Auth callback handler
- [x] Wrap app với AuthProvider

### Tùy chỉnh (Optional)
- [ ] Update Navbar với user info
- [ ] Protected routes middleware
- [ ] User profile page
- [ ] Admin RLS policies

## 🚀 Next Steps

1. **Làm theo 5 bước trên** (tổng 11 phút)
2. **Test login** → Nếu OK, DONE! 🎉
3. **Nếu lỗi** → Xem Troubleshooting
4. **(Optional)** Cập nhật Navbar và protected routes

## 💡 Tips

- **Development:** Dùng Test mode, thêm email vào Test users
- **Production:** Publish app để public sử dụng
- **Security:** Luôn check RLS policies trước deploy
- **Backup:** Export database trước khi thay đổi policies

---

**🎯 Mục tiêu: Login bằng Google và truy cập Admin panel!**

**⏱️ Thời gian: ~15 phút (11 phút setup + 4 phút test)**

Bắt đầu từ **BƯỚC 1** trong `GOOGLE_AUTH_SETUP.md`! 🚀
