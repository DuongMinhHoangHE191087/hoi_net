# 🔐 Hướng Dẫn Setup Google Authentication

## 📋 Tổng Quan

Hướng dẫn này sẽ giúp bạn:
1. Tạo Google OAuth credentials
2. Cấu hình Supabase Authentication
3. Tích hợp Google Sign-In vào ứng dụng
4. Bảo vệ Admin routes
5. Quản lý user sessions

---

## 🎯 PHẦN 1: TẠO GOOGLE OAUTH CREDENTIALS

### Bước 1: Truy cập Google Cloud Console

1. Vào: https://console.cloud.google.com
2. Đăng nhập bằng Google account
3. Click **Select a project** → **New Project**

### Bước 2: Tạo Project Mới

1. **Project name:** `WEB-SSG-Auth` (hoặc tên bạn muốn)
2. Click **Create**
3. Đợi vài giây

### Bước 3: Enable Google+ API

1. Trong project, vào **APIs & Services** → **Library**
2. Tìm: `Google+ API`
3. Click **Enable**

### Bước 4: Tạo OAuth Consent Screen

1. Vào **APIs & Services** → **OAuth consent screen**
2. Chọn **External** → Click **Create**
3. Điền thông tin:

**App information:**
- App name: `Photo Restoration App`
- User support email: `your-email@gmail.com`
- App logo: (optional)

**App domain:**
- Application home page: `http://localhost:3000`
- Privacy policy: `http://localhost:3000/privacy` (tạo sau)
- Terms of service: `http://localhost:3000/terms` (tạo sau)

**Developer contact:**
- Email: `your-email@gmail.com`

4. Click **Save and Continue**
5. Skip **Scopes** → Click **Save and Continue**
6. Skip **Test users** (hoặc thêm email test)
7. Click **Back to Dashboard**

### Bước 5: Tạo OAuth Client ID

1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Chọn **Application type:** `Web application`
4. **Name:** `WEB-SSG Client`

5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:3001
   https://your-domain.com (khi deploy)
   ```

6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://your-project-id.supabase.co/auth/v1/callback
   ```

   ⚠️ **Quan trọng:** Thay `your-project-id` bằng project ID thật của Supabase

   Ví dụ: `https://jfnexrrdygcxgizzpyxc.supabase.co/auth/v1/callback`

7. Click **Create**

### Bước 6: Lưu Credentials

Sau khi tạo, bạn sẽ thấy:
- **Client ID:** `123456789-abc...apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-abc123...`

⚠️ **LƯU LẠI 2 GIÁ TRỊ NÀY!**

---

## 🔧 PHẦN 2: CẤU HÌNH SUPABASE

### Bước 1: Bật Google Provider

1. Vào Supabase Dashboard
2. Chọn project của bạn
3. Vào **Authentication** → **Providers**
4. Tìm **Google** trong danh sách
5. Click vào Google

### Bước 2: Nhập Credentials

1. Bật **Enable Sign in with Google**
2. Paste **Client ID** từ Google Console
3. Paste **Client Secret** từ Google Console
4. Click **Save**

### Bước 3: Lấy Redirect URL

1. Trong trang Google provider, copy **Redirect URL**
2. Nó sẽ có dạng: `https://your-project.supabase.co/auth/v1/callback`
3. Đảm bảo URL này đã được thêm vào Google Console (Bước 5 phần 1)

---

## 💻 PHẦN 3: TÍCH HỢP VÀO ỨNG DỤNG

### Bước 1: Cài đặt Supabase Auth Helpers

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### Bước 2: Cập nhật Supabase Client

File đã có: `lib/supabase.ts` - Không cần sửa gì!

### Bước 3: Tạo Auth Context

Tôi sẽ tạo file `contexts/AuthContext.tsx` cho bạn.

### Bước 4: Tạo Login Component

Tôi sẽ tạo component đăng nhập đẹp với Google button.

### Bước 5: Tạo Auth Callback Route

Tạo route xử lý callback từ Google.

### Bước 6: Bảo vệ Admin Routes

Tạo middleware để check authentication.

---

## 🎨 PHẦN 4: UI COMPONENTS

### Login Page Features:
- ✅ Google Sign-In button đẹp
- ✅ Logo và branding
- ✅ Redirect sau khi login
- ✅ Error handling
- ✅ Loading states

### Navbar Updates:
- ✅ Hiển thị user avatar khi đã login
- ✅ Dropdown menu với Logout
- ✅ Link đến Admin (nếu authenticated)

### Protected Routes:
- ✅ `/admin` - Yêu cầu đăng nhập
- ✅ `/profile` - Trang profile user
- ✅ Auto redirect đến `/login` nếu chưa đăng nhập

---

## 🔒 PHẦN 5: SECURITY

### Row Level Security (RLS) với Auth

Sau khi có auth, cập nhật policies:

```sql
-- Only authenticated users can access admin features
CREATE POLICY "Authenticated users can manage blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Admin role check (optional - set custom claims)
CREATE POLICY "Admin users only" ON value_sections
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'your-admin-email@gmail.com',
      'another-admin@gmail.com'
    )
  );
```

---

## 📝 TESTING CHECKLIST

Sau khi setup, test các tình huống:

- [ ] Click "Login with Google" → Redirect đến Google
- [ ] Chọn account → Redirect về app
- [ ] Thấy user info trong navbar
- [ ] Truy cập `/admin` → Thấy admin panel
- [ ] Logout → Quay về trang chủ
- [ ] Thử truy cập `/admin` khi chưa login → Redirect `/login`

---

## 🐛 TROUBLESHOOTING

### Lỗi: "redirect_uri_mismatch"
**Nguyên nhân:** Redirect URI không khớp

**Giải pháp:**
1. Vào Google Console → Credentials
2. Edit OAuth client
3. Thêm chính xác URL: `https://your-project.supabase.co/auth/v1/callback`
4. Đợi vài phút để Google cập nhật

### Lỗi: "Access blocked"
**Nguyên nhân:** App chưa verified hoặc email không trong test users

**Giải pháp:**
1. Vào OAuth consent screen
2. Thêm email của bạn vào Test users
3. Hoặc publish app (cần verification cho production)

### Lỗi: "Invalid client"
**Nguyên nhân:** Client ID hoặc Secret sai

**Giải pháp:**
1. Check lại Client ID và Secret trong Supabase
2. Copy lại từ Google Console
3. Paste chính xác (không có khoảng trắng thừa)

### User không thể truy cập admin
**Nguyên nhân:** RLS policies quá strict

**Giải pháp tạm thời (dev):**
```sql
-- Disable RLS để test
ALTER TABLE value_sections DISABLE ROW LEVEL SECURITY;
```

**Giải pháp production:**
Tạo admin role trong custom claims hoặc admin table riêng.

---

## 🚀 DEPLOYMENT

### Khi Deploy lên Production:

1. **Cập nhật Google Console:**
   - Thêm production domain vào Authorized JavaScript origins
   - Thêm production callback URL
   - Ví dụ: `https://yourdomain.com/auth/callback`

2. **Cập nhật Environment Variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

3. **OAuth Consent Screen:**
   - Publish app để public có thể dùng
   - Hoặc giữ ở Test mode (max 100 users)

---

## 📚 NEXT STEPS

Sau khi có authentication, bạn có thể:

1. **User Profile Page**
   - Hiển thị thông tin user
   - Lịch sử requests
   - Upload history

2. **Admin Dashboard**
   - Chỉ admin mới vào được
   - Quản lý users
   - View analytics

3. **Role-Based Access**
   - Admin, Editor, Viewer roles
   - Different permissions
   - Custom claims in JWT

4. **Email Notifications**
   - Welcome email
   - Request status updates
   - Newsletter

---

## 🎯 SUMMARY

**Bạn đã setup:**
- ✅ Google OAuth trong Google Console
- ✅ Google provider trong Supabase
- ✅ Auth context trong app
- ✅ Login/Logout UI
- ✅ Protected routes
- ✅ User session management

**Bây giờ có thể:**
- 🔐 Login bằng Google
- 👤 Quản lý user sessions
- 🛡️ Bảo vệ admin routes
- 📊 Track user actions
- 🎨 Personalized UX

---

**Sẵn sàng implement? Tôi sẽ tạo code cho bạn ngay! 🚀**
