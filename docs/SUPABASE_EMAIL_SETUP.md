# Hướng Dẫn Cấu Hình Supabase Email

## 1. Kiểm Tra Site URL

Trong **Supabase Dashboard** → **Authentication** → **URL Configuration**:

- **Site URL**: `https://your-domain.com` (hoặc `http://localhost:3000` cho dev)
- **Redirect URLs**: Thêm tất cả các URL này:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback`
  - `http://localhost:3000/**`
  - `https://your-domain.com/**`

## 2. Cấu Hình Email Templates

Trong **Supabase Dashboard** → **Authentication** → **Email Templates**:

### Confirm signup
```html
<h2>Xác Nhận Email</h2>
<p>Xin chào,</p>
<p>Cảm ơn bạn đã đăng ký. Nhấn link bên dưới để xác nhận email:</p>
<p><a href="{{ .ConfirmationURL }}">Xác nhận email</a></p>
```

### Reset password
```html
<h2>Khôi Phục Mật Khẩu</h2>
<p>Xin chào,</p>
<p>Bạn đã yêu cầu khôi phục mật khẩu. Nhấn link bên dưới:</p>
<p><a href="{{ .ConfirmationURL }}">Đặt lại mật khẩu</a></p>
<p>Link này sẽ hết hạn sau 1 giờ.</p>
```

## 3. Kiểm Tra SMTP Settings

**Supabase Dashboard** → **Project Settings** → **Authentication** → **SMTP Settings**

**Nếu dùng Supabase Email (mặc định):**
- Giới hạn: 4 emails/giờ (Free tier)
- Không cần cấu hình thêm

**Nếu dùng Custom SMTP (khuyến nghị cho production):**

### Gmail SMTP:
```
Host: smtp.gmail.com
Port: 587
User: your-email@gmail.com
Pass: App Password (16 ký tự - tạo từ Google Account → Security → App passwords)
Sender: noreply@your-domain.com
```

### SendGrid:
```
Host: smtp.sendgrid.net
Port: 587
User: apikey
Pass: SG.xxxxxxxxxxxx (API Key)
```

## 4. Kiểm Tra Trong Logs

**Supabase Dashboard** → **Logs** → **Auth Logs**

Tìm các entry với:
- `signup` hoặc `recovery`
- Xem error message chi tiết

## 5. Test Gửi Email

Trong terminal:
```bash
# Test với curl
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/auth/v1/recover' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email": "your-email@example.com"}'
```

## 6. Common Errors

### "Rate limit exceeded"
- Free tier: Chỉ 4 emails/giờ
- Solution: Đợi hoặc upgrade plan

### "Email not sent"
- Kiểm tra SMTP settings
- Kiểm tra spam folder

### "Invalid token"
- Link đã hết hạn (mặc định 1 giờ)
- Link đã được sử dụng

### "signups not allowed"
- **Authentication** → **Providers** → **Email** → Bật "Enable Email Signup"

## 7. Cấu Hình Trong .env.local

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# For redirect URLs
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: Custom email
HCAPTCHA_SECRET_KEY=your-key (nếu dùng captcha)
```

## 8. Kiểm Tra Authentication Settings

**Supabase Dashboard** → **Authentication** → **Providers** → **Email**:

- ✅ Enable Email provider: ON
- ✅ Confirm email: ON (khuyến nghị) hoặc OFF (cho dev)
- ✅ Secure email change: ON
- ✅ Double confirm email changes: ON/OFF tùy nhu cầu
