# 🚀 HƯỚNG DẪN TRIỂN KHAI CẢI TIẾN XÁC THỰC

## 📋 TỔNG QUAN

Tài liệu này hướng dẫn chi tiết cách triển khai các cải tiến authentication cho Photo Restoration App.

**Các vấn đề đã được khắc phục:**
- ✅ Session race condition khi đăng nhập/đăng ký
- ✅ Thiếu user profile sync giữa auth.users và public.users
- ✅ Email confirmation logic không chính xác
- ✅ Middleware không handle errors properly
- ✅ Thiếu comprehensive logging cho debugging

---

## 🗂️ CÁC FILE ĐÃ THAY ĐỔI

### 1. Files Mới
- ✨ `database/migrations/016_fix_auth_complete.sql` - Migration database hoàn chỉnh
- ✨ `lib/auth-logger.ts` - Hệ thống logging centralized

### 2. Files Đã Sửa
- 🔧 `app/login/page.tsx` - Fix session race condition
- 🔧 `app/register/page.tsx` - Fix session verification
- 🔧 `contexts/AuthContext.tsx` - Cải thiện error handling + logging
- 🔧 `lib/supabase/middleware.ts` - Thêm try/catch error handling

---

## 📝 BƯỚC 1: CHẠY MIGRATION DATABASE

### Option A: Sử dụng Supabase Dashboard (Khuyến nghị)

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** (biểu tượng database ở sidebar)
4. Tạo query mới và copy toàn bộ nội dung file:
   ```
   database/migrations/016_fix_auth_complete.sql
   ```
5. Click **Run** để execute migration
6. Verify kết quả bằng các câu query sau:

```sql
-- Kiểm tra số lượng users
SELECT
  (SELECT count(*) FROM auth.users) as auth_users,
  (SELECT count(*) FROM public.users) as public_users,
  (SELECT count(*) FROM public.user_profiles) as profiles;
-- Kết quả: Tất cả 3 số phải bằng nhau!

-- Kiểm tra trigger
SELECT
  tgname,
  tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created_complete';
-- Phải trả về 1 row với tgenabled = 'O' (enabled)

-- Kiểm tra function
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN ('handle_new_user_complete', 'is_admin', 'get_user_role');
-- Phải trả về 3 rows
```

### Option B: Sử dụng Supabase CLI

```bash
# Install Supabase CLI nếu chưa có
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push database/migrations/016_fix_auth_complete.sql
```

### 🎯 Tạo Admin User Đầu Tiên

Sau khi chạy migration, uncomment và chỉnh sửa dòng cuối trong file migration:

```sql
-- Thay 'your-admin@email.com' bằng email của bạn
INSERT INTO public.admin_users (user_id, granted_by)
SELECT id, id FROM auth.users WHERE email = 'duonghoang@gmail.com'
ON CONFLICT DO NOTHING;
```

Chạy query này riêng trong SQL Editor.

---

## 📝 BƯỚC 2: UPDATE ENVIRONMENT VARIABLES

Kiểm tra file `.env.local` có đầy đủ biến sau:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Emails (Fallback nếu admin_users table empty)
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,another@example.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ LƯU Ý:** Sau khi có `admin_users` table, hệ thống sẽ ưu tiên check database thay vì env variable.

---

## 📝 BƯỚC 3: INSTALL DEPENDENCIES (Nếu cần)

```bash
# Không cần install thêm dependencies mới
# Tất cả đã có trong project

# Verify Supabase packages
bun list | grep supabase
# Phải thấy:
# @supabase/ssr
# @supabase/supabase-js
```

---

## 📝 BƯỚC 4: RESTART DEV SERVER

```bash
# Stop server hiện tại (Ctrl+C)

# Clear cache (Optional nhưng khuyến nghị)
rm -rf .next

# Restart server
bun run dev
```

---

## 🧪 BƯỚC 5: TESTING COMPREHENSIVE

### Test 1: Đăng Ký Email Mới

#### Trường hợp A: Email Confirmation Enabled (Default Supabase)

```
1. Vào http://localhost:3000/register
2. Nhập email MỚI chưa từng đăng ký
3. Nhập password đủ mạnh (ít nhất 8 ký tự, có chữ hoa, chữ thường, số)
4. Đồng ý terms
5. Click "Đăng Ký Ngay"

✅ EXPECTED BEHAVIOR:
- Toast hiện: "Đăng ký thành công! Vui lòng kiểm tra email..."
- Redirect về /login?message=check-email sau 2s
- Check email → nhận confirmation link
- Click link → Redirect về app → Logged in

✅ VERIFICATION:
- Check console logs: [Auth 📝] SIGNUP_ATTEMPT
- Check console logs: [Auth 🎉] SIGNUP_SUCCESS
- Check console logs: [Auth 📧] EMAIL_CONFIRMATION_SENT
```

#### Trường hợp B: Auto-Confirm Enabled (Tắt email confirmation)

Để test, cần tắt email confirmation trong Supabase:
1. Supabase Dashboard → Authentication → Settings
2. Tắt "Enable email confirmations"

```
1-5. (Giống trường hợp A)

✅ EXPECTED BEHAVIOR:
- Toast hiện: "Đăng ký thành công!"
- Wait 1 second (session verification)
- Redirect về /dashboard
- Dashboard accessible ngay lập tức

✅ VERIFICATION:
- Check console: [Auth ✓] SESSION_VERIFIED
- Check database:
  SELECT * FROM public.users WHERE email = 'your-test-email';
  SELECT * FROM public.user_profiles WHERE id = '...';
  -- Cả 2 queries phải trả về data!
```

### Test 2: Đăng Nhập Email

```
1. Vào http://localhost:3000/login
2. Nhập email/password đã đăng ký
3. Click "Đăng Nhập"

✅ EXPECTED BEHAVIOR:
- Toast: "Đăng nhập thành công! Đang chuyển hướng..."
- Wait 1 second (session verification)
- Console log: [Auth ✓] SESSION_VERIFIED
- Redirect về /dashboard
- Dashboard accessible

✅ VERIFICATION:
- Check browser cookies: sb-access-token, sb-refresh-token (có giá trị)
- Check console:
  [Auth 🔐] LOGIN_ATTEMPT
  [Auth ✅] LOGIN_SUCCESS
  [Auth ✓] SESSION_VERIFIED
- Refresh page → Vẫn logged in (không redirect về login)
```

### Test 3: Đăng Nhập Sai Mật Khẩu

```
1. Login với password SAI
2. Click "Đăng Nhập"

✅ EXPECTED BEHAVIOR:
- Toast error: "Email hoặc mật khẩu không đúng"
- Loading state clear
- Có thể retry

✅ VERIFICATION:
- Check console: [Auth ❌] LOGIN_FAILURE
- No redirect
```

### Test 4: Google OAuth

```
1. Click "Đăng nhập với Google"
2. Chọn Google account
3. Authorize

✅ EXPECTED BEHAVIOR:
- Redirect về Google OAuth
- Sau khi approve → Callback về /auth/callback
- Profile được tạo trong database
- Redirect về /dashboard (hoặc /admin nếu email là admin)

✅ VERIFICATION:
- Check console:
  [Auth 🔐] OAUTH_ATTEMPT
  [Auth Callback] Processing: { hasCode: true }
  [Auth Callback] Session created for: your-email@gmail.com
- Check database:
  SELECT * FROM public.users WHERE email = 'your-google@gmail.com';
  SELECT * FROM public.user_profiles WHERE id = '...';
  -- Cả 2 phải có data với name/avatar từ Google
```

### Test 5: Protected Routes

```
1. Logout (nếu đang login)
2. Thử access http://localhost:3000/dashboard

✅ EXPECTED BEHAVIOR:
- Middleware block
- Redirect về /login?redirect=/dashboard
- Console log: [Middleware 🚫] MIDDLEWARE_BLOCK

3. Login lại
4. Tự động redirect về /dashboard

✅ EXPECTED BEHAVIOR:
- Dashboard accessible
- Console log: [Middleware ✓] MIDDLEWARE_ALLOW
```

### Test 6: Admin Access

```
1. Login bằng email KHÔNG phải admin
2. Thử access http://localhost:3000/admin

✅ EXPECTED BEHAVIOR:
- Redirect về /unauthorized
- Console log: [Middleware] Non-admin tried to access admin route

3. Logout
4. Login bằng email ADMIN (trong admin_users table)
5. Access /admin

✅ EXPECTED BEHAVIOR:
- /admin accessible
- Console log: [Middleware] User is admin: true
```

### Test 7: Session Persistence

```
1. Login thành công
2. Refresh page (F5)

✅ EXPECTED BEHAVIOR:
- Vẫn logged in
- Không redirect về login
- Dashboard data load OK

3. Close browser
4. Open browser lại
5. Vào app

✅ EXPECTED BEHAVIOR:
- Vẫn logged in (nếu chưa hết session expiry - default 7 days)
```

### Test 8: Logout

```
1. Đang logged in
2. Click Logout

✅ EXPECTED BEHAVIOR:
- Console log: [Auth 👋] LOGOUT
- Redirect về homepage /
- Cookies cleared
- Try access /dashboard → Redirect về /login

✅ VERIFICATION:
- Check browser cookies: sb-access-token, sb-refresh-token (KHÔNG còn)
- localStorage.admin_cache (KHÔNG còn)
```

### Test 9: Concurrent Sessions

```
1. Login ở browser A (Chrome)
2. Login cùng account ở browser B (Firefox)
3. Cả 2 browsers đều hoạt động OK
4. Logout ở browser A với scope: 'global'

✅ EXPECTED BEHAVIOR:
- Browser A logout
- Browser B VẪN logged in (nếu dùng scope: 'local')
- Hoặc cả 2 đều logout (nếu scope: 'global')

Note: Hiện tại code dùng scope: 'global'
```

---

## 🐛 TROUBLESHOOTING

### Problem 1: "Session không được tạo. Vui lòng thử lại"

**Nguyên nhân:** Session cookies không được set kịp

**Giải pháp:**
1. Check browser cookies: sb-access-token có tồn tại không?
2. Check Supabase Dashboard → Authentication → URL Configuration
   - Site URL: http://localhost:3000
   - Redirect URLs: http://localhost:3000/auth/callback
3. Clear browser cookies và thử lại
4. Tăng timeout trong code (hiện tại là 1000ms):
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 2000)) // Tăng lên 2s
   ```

### Problem 2: "User profile not found" 406 Error

**Nguyên nhân:** Trigger không chạy hoặc migration chưa run

**Giải pháp:**
```sql
-- 1. Check trigger tồn tại
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_complete';

-- 2. Check function tồn tại
SELECT * FROM pg_proc WHERE proname = 'handle_new_user_complete';

-- 3. Manually backfill existing users
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)),
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, full_name, avatar_url, created_at, updated_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)),
  raw_user_meta_data->>'avatar_url',
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;
```

### Problem 3: Middleware redirect loop

**Triệu chứng:** Login → Dashboard → Login → Dashboard → ...

**Nguyên nhân:** Middleware không nhận được user từ session

**Giải pháp:**
1. Check console logs trong middleware
2. Verify cookies được set:
   ```javascript
   // Browser console
   document.cookie
   // Phải thấy sb-access-token và sb-refresh-token
   ```
3. Check Supabase project settings:
   - Authentication → Settings → "Disable email confirmations" nếu testing

### Problem 4: OAuth callback error

**Error:** "No code" hoặc "Session exchange error"

**Giải pháp:**
1. Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Set Client ID và Client Secret từ Google Cloud Console
2. Google Cloud Console → APIs & Services → Credentials
   - Authorized redirect URIs: https://YOUR_PROJECT.supabase.co/auth/v1/callback
3. Test lại OAuth flow

### Problem 5: Admin detection không hoạt động

**Nguyên nhân:** Email không có trong admin_users table

**Giải pháp:**
```sql
-- Check admin
SELECT * FROM public.admin_users;

-- Grant admin cho user
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'your-admin@example.com'
ON CONFLICT DO NOTHING;

-- Verify
SELECT public.is_admin((SELECT id FROM auth.users WHERE email = 'your-admin@example.com'));
-- Phải trả về true
```

---

## 📊 MONITORING & DEBUGGING

### View Auth Logs (Browser Console)

```javascript
// Import logger trong browser console
// (Chỉ work nếu đang ở trang có AuthContext)

// Xem 20 logs gần nhất
authLogger.getRecentLogs(20)

// Xem failed events
authLogger.getFailedEvents()

// Xem logs của 1 user
authLogger.getLogsByUser('user-uuid-here')

// Xem logs theo event type
authLogger.getLogsByEvent('LOGIN_FAILURE')
```

### Database Queries Hữu Ích

```sql
-- Xem tất cả users và auth status
SELECT
  u.id,
  u.email,
  u.name,
  au.email_confirmed_at,
  au.last_sign_in_at,
  EXISTS(SELECT 1 FROM admin_users WHERE user_id = u.id) as is_admin
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY au.created_at DESC;

-- Xem users thiếu profile
SELECT au.id, au.email
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users);

-- Xem users thiếu user_profiles
SELECT au.id, au.email
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.user_profiles);

-- Xem admin users
SELECT
  u.email,
  au.granted_at,
  au.permissions
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id;
```

---

## ✅ CHECKLIST HOÀN THÀNH

Sau khi triển khai, đảm bảo tất cả items sau đều ✅:

### Database
- [ ] Migration 016 đã chạy thành công
- [ ] Trigger `on_auth_user_created_complete` tồn tại và enabled
- [ ] Function `handle_new_user_complete` tồn tại
- [ ] Function `is_admin` và `get_user_role` tồn tại
- [ ] Tables: users, user_profiles, admin_users đều tồn tại
- [ ] RLS policies enabled cho tất cả tables
- [ ] Ít nhất 1 admin user đã được tạo

### Code
- [ ] File `lib/auth-logger.ts` đã tạo
- [ ] AuthContext đã import authLogger
- [ ] Login page có session verification
- [ ] Register page có session verification
- [ ] Middleware có try/catch error handling
- [ ] Middleware clear invalid cookies

### Testing
- [ ] Đăng ký email mới thành công
- [ ] Đăng nhập email thành công
- [ ] Session persist sau refresh
- [ ] Google OAuth thành công
- [ ] Protected routes block unauthorized
- [ ] Admin routes chỉ admin access được
- [ ] Logout clear session hoàn toàn
- [ ] User profile được tạo tự động

### Logs
- [ ] Console logs hiển thị auth events với emoji
- [ ] Failed events được log rõ ràng
- [ ] Middleware logs accessible paths
- [ ] authLogger.getRecentLogs() hoạt động

---

## 🎯 NEXT STEPS (Optional)

Sau khi Phase 1 hoàn tất, có thể implement các features nâng cao:

### Phase 2 Features
1. **Password Reset Flow**
   - Forgot password page
   - Email với reset link
   - Reset password form

2. **Email Verification Reminder**
   - Banner cho unconfirmed users
   - Resend confirmation email button

3. **Session Management Dashboard**
   - Xem active sessions
   - Revoke sessions remotely

4. **2FA Authentication**
   - TOTP (Google Authenticator)
   - SMS verification

### Phase 3 Features
1. **Audit Logs Table**
   - Store auth events vào database thay vì memory
   - Admin panel để xem logs

2. **Rate Limiting Per User**
   - Track failed login attempts
   - Temporary account lock sau N failures

3. **Security Enhancements**
   - Password strength meter advanced
   - Breach detection (Have I Been Pwned API)
   - Device fingerprinting

---

## 📞 SUPPORT

Nếu gặp vấn đề không có trong troubleshooting guide, check:
1. Supabase Logs: Dashboard → Logs → Auth Logs
2. Browser DevTools → Network tab → Check auth API calls
3. Browser DevTools → Application → Cookies → Check session cookies
4. Console logs với keyword [Auth] hoặc [Middleware]

---

**Chúc mừng! 🎉 Auth system của bạn đã được nâng cấp toàn diện.**
