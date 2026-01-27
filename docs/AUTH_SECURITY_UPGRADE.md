# 🔐 Auth Security Upgrade - Hướng dẫn cài đặt

## Tổng quan

Hệ thống authentication đã được nâng cấp toàn diện với:

1. **Thông báo "Tài khoản chưa đăng ký" rõ ràng** - Có bảo vệ bởi hCaptcha
2. **Lockout Email+IP** - Khóa sau 5 lần sai, backoff tăng dần (1h → 2h → 4h → ...)
3. **Aggregate theo email** - Chống attacker đổi IP bypass
4. **Magic Link fallback** - Cho phép đăng nhập khi bị khóa
5. **Error normalization** - Không còn hiển thị `[object Object]`

## 📋 Các bước cài đặt

### 1. Thêm biến môi trường

Thêm vào file `.env.local`:

```env
# ============================================
# AUTH SECURITY (Bắt buộc cho production)
# ============================================

# Pepper cho HMAC-SHA256 hash email/IP
# Tạo mới: openssl rand -base64 32
AUTH_SECURITY_PEPPER=your-random-pepper-32-chars-here

# hCaptcha (đăng ký tại https://www.hcaptcha.com/)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
HCAPTCHA_SECRET_KEY=your-hcaptcha-secret-key

# URL ổn định cho redirect (production)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Chạy database migration

Trong Supabase SQL Editor, chạy file:
```
database/migrations/auth_security_lockouts.sql
```

File này sẽ tạo:
- Bảng `auth_security_lockouts` (theo email+IP)
- Bảng `auth_security_email_aggregate` (aggregate theo email)
- Indexes tối ưu cho tra cứu nhanh
- Functions: `check_auth_lockout()`, `record_failed_auth_attempt()`, `record_successful_auth()`

### 3. Cấu hình hCaptcha trong Supabase (tùy chọn)

Supabase có tích hợp sẵn hCaptcha. Để bật:

1. Vào Supabase Dashboard → Authentication → Providers
2. Bật "Enable Captcha protection"
3. Chọn "hCaptcha"
4. Nhập hCaptcha Secret Key

**Lưu ý**: Ứng dụng đã implement hCaptcha riêng ở frontend/API level, nên bước này là tùy chọn.

### 4. Thiết lập cron job cleanup (khuyến nghị)

Để tự động dọn dẹp records lockout cũ, tạo scheduled job trong Supabase:

```sql
-- Chạy mỗi ngày lúc 3:00 AM
SELECT cron.schedule(
  'cleanup-old-lockouts',
  '0 3 * * *',
  $$SELECT cleanup_old_auth_lockouts(30)$$
);
```

## 🔧 Cấu hình Policy

Các hằng số lockout có thể điều chỉnh trong migration file:

| Hằng số | Giá trị mặc định | Mô tả |
|---------|-----------------|-------|
| `auth_lockout_threshold()` | 5 | Số lần fail trước khi khóa |
| `auth_lockout_base_minutes()` | 60 | Thời gian khóa cơ bản (phút) |
| `auth_lockout_max_level()` | 5 | Level tối đa (cap exponential) |
| `auth_global_lockout_ip_threshold()` | 10 | Số IP khác nhau trigger global lockout |

### Exponential Backoff

- Level 1: 1 giờ
- Level 2: 2 giờ
- Level 3: 4 giờ
- Level 4: 8 giờ
- Level 5 (max): 32 giờ

## 📁 Files mới được tạo

```
lib/auth/
├── error-normalizer.ts      # Chuẩn hóa lỗi, không còn [object Object]
├── security-hash.ts         # HMAC-SHA256 hash cho email/IP

app/api/auth/
├── sign-in/route.ts         # Login với lockout protection
├── sign-up/route.ts         # Register với explicit "đã đăng ký"
├── check-account/route.ts   # Kiểm tra tài khoản tồn tại (với hCaptcha)
├── magic-link/route.ts      # Gửi magic link khi bị khóa

components/auth/
├── HCaptcha.tsx             # Component hCaptcha wrapper

database/migrations/
├── auth_security_lockouts.sql  # Schema cho lockout tracking
```

## 📁 Files được cập nhật

```
lib/auth/
├── types.ts                 # Thêm error codes mới
├── index.ts                 # Export error normalizer

app/
├── login/page.tsx           # UI lockout, captcha, magic link
├── register/page.tsx        # Thông báo "đã đăng ký" rõ ràng
```

## 🔒 Security Features

### 1. Lockout Protection

```
Login fail lần 1-2: Hiện warning
Login fail lần 3+: Yêu cầu hCaptcha
Login fail lần 5+: Khóa 1h, hiện Magic Link option
```

### 2. Anti-Griefing

- Lockout theo **email+IP**, không chỉ email
- Attacker không thể khóa account bằng cách spam login từ IP khác
- Chỉ có email aggregate lockout khi có 10+ IP khác nhau fail

### 3. Magic Link Fallback

Khi bị khóa, user có thể:
1. Nhấn "Gửi Magic Link"
2. Nhận link đăng nhập qua email
3. Đăng nhập không cần mật khẩu

### 4. Error Messages

Tất cả error đều được normalize:

```typescript
// ❌ Trước (có thể hiện [object Object])
toast.error(error)

// ✅ Sau (luôn là string)
import { getErrorMessage } from '@/lib/auth'
toast.error(getErrorMessage(error))
```

## 🧪 Testing

### Test lockout

```bash
# Fail 5 lần liên tiếp với email test
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Sau lần 5, response sẽ có locked=true
```

### Test magic link

```bash
curl -X POST http://localhost:3000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Check lockout status

```sql
SELECT * FROM check_auth_lockout(
  'email_ip_hash_here',
  'email_hash_here'
);
```

## 📊 Monitoring

### View active lockouts

```sql
SELECT 
  email_hash,
  ip_hash,
  failed_count,
  lockout_until,
  lockout_level
FROM auth_security_lockouts
WHERE lockout_until > NOW()
ORDER BY lockout_until DESC;
```

### View email aggregates

```sql
SELECT 
  email_hash,
  total_failed_count,
  distinct_ips_count,
  global_lockout_until
FROM auth_security_email_aggregate
ORDER BY total_failed_count DESC
LIMIT 20;
```

## ⚠️ Notes

1. **HMAC Pepper**: Không được thay đổi sau khi có data, sẽ làm invalid tất cả hash
2. **hCaptcha**: Trong development, nếu không có key sẽ tự skip
3. **Rate Limiting**: API routes có rate limit riêng, independent với middleware
4. **Session**: Login API tự set cookies, frontend không cần handle

## 🆘 Troubleshooting

### "Function check_auth_lockout does not exist"

Chưa chạy migration. Chạy file SQL trong Supabase Editor.

### "hCaptcha not loading"

Kiểm tra `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` trong `.env.local`

### Lockout không hoạt động

1. Kiểm tra SUPABASE_SERVICE_ROLE_KEY có đúng không
2. Kiểm tra RLS policy cho phép service role

### Magic link không gửi

1. Kiểm tra Supabase email templates đã cấu hình
2. Kiểm tra `NEXT_PUBLIC_SITE_URL` cho redirect URL đúng
