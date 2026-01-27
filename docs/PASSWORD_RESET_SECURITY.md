# 🔐 Password Reset Security - Hồi Nét

## Tổng quan

Hệ thống đặt lại mật khẩu được nâng cấp với các tính năng bảo mật cao nhất để bảo vệ người dùng khỏi các cuộc tấn công.

---

## ✅ Các Tính Năng Bảo Mật

### 1. One-Time Token (Sử dụng 1 lần)

- Mỗi link khôi phục **chỉ có thể sử dụng một lần duy nhất**
- Token được hash bằng SHA-256 trước khi lưu trữ
- Ngăn chặn tấn công replay (sử dụng lại link cũ)

```sql
-- Bảng theo dõi token đã sử dụng
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  token_hash TEXT UNIQUE,  -- SHA-256 hash
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### 2. Rate Limiting

- **Giới hạn 5 lần/15 phút** cho mỗi IP
- Ngăn chặn brute force attacks
- Hiển thị thời gian còn lại khi bị block

### 3. Server-Side Password Validation

Kiểm tra mật khẩu phía server với các tiêu chuẩn:
- ✅ Ít nhất 8 ký tự
- ✅ Ít nhất 1 chữ thường (a-z)
- ✅ Ít nhất 1 chữ hoa (A-Z)
- ✅ Ít nhất 1 số (0-9)
- ✅ Không chứa mật khẩu phổ biến
- ✅ Tối đa 128 ký tự

### 4. Session Invalidation

- Sau khi đổi mật khẩu, **tự động đăng xuất**
- Vô hiệu hóa recovery session ngay lập tức
- Yêu cầu đăng nhập lại với mật khẩu mới

### 5. Audit Logging

- Ghi lại IP address và User-Agent
- Theo dõi thời gian sử dụng token
- Hỗ trợ điều tra nếu có vấn đề bảo mật

### 6. Token Expiration

- Link hết hạn sau **1 giờ** (Supabase default)
- Không thể sử dụng link đã hết hạn
- Thông báo rõ ràng cho người dùng

---

## 🛡️ Bảo Vệ Khỏi Các Tấn Công

| Tấn công | Biện pháp bảo vệ |
|----------|------------------|
| **Replay Attack** | One-time token, hash storage |
| **Brute Force** | Rate limiting (5/15min) |
| **Token Theft** | Token hash, 1 hour expiry |
| **Weak Password** | Server-side validation |
| **Session Hijack** | Auto sign-out after reset |
| **CSRF** | Supabase built-in protection |

---

## 📁 Cấu Trúc Files

```
app/
├── reset-password/
│   └── page.tsx              # UI trang đặt lại mật khẩu
├── forgot-password/
│   └── page.tsx              # UI trang quên mật khẩu
├── api/
│   └── auth/
│       └── reset-password/
│           └── route.ts      # API endpoint bảo mật

database/
└── migrations/
    └── 015_password_reset_tokens.sql  # Migration table
```

---

## 🔧 Cài Đặt

### 1. Chạy Migration

```sql
-- Chạy trong Supabase SQL Editor
-- File: database/migrations/015_password_reset_tokens.sql
```

### 2. Kiểm Tra

1. Vào `/forgot-password` và nhập email
2. Kiểm tra email và click link
3. Đặt mật khẩu mới
4. Thử sử dụng lại link → Phải hiển thị lỗi "Link đã được sử dụng"

---

## 🎨 UI/UX Features

- **Animated Background**: Consistent với login page
- **Password Strength Indicator**: Realtime validation
- **Visual Feedback**: Loading states, success/error animations
- **Security Info Box**: Thông báo về tính năng bảo mật
- **Responsive Design**: Hoạt động tốt trên mobile
- **Accessibility**: ARIA labels, keyboard navigation

---

## 📊 Flow Diagram

```
┌─────────────────┐
│ Forgot Password │
│     Page        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send Reset Email│
│ via Supabase    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User clicks     │
│ email link      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /auth/callback  │
│ type=recovery   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /reset-password │
│ Enter new pass  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│ API validates:  │───▶│ Check token     │
│ - Rate limit    │    │ used?           │
│ - Session       │    └────────┬────────┘
│ - Password      │             │
└────────┬────────┘             │
         │                      ▼
         │             ┌─────────────────┐
         │             │ Token used?     │
         │             └────────┬────────┘
         │                      │
         ├──────────────────────┼─────────────────┐
         │                      │                 │
         ▼                      ▼                 ▼
┌─────────────────┐    ┌─────────────────┐  ┌─────────────┐
│ Update Password │    │ Return Error:   │  │ Show Error  │
│ via Supabase    │    │ "Link đã sử     │  │ UI          │
└────────┬────────┘    │  dụng"          │  └─────────────┘
         │             └─────────────────┘
         ▼
┌─────────────────┐
│ Mark token used │
│ in database     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sign out user   │
│ (invalidate     │
│  session)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ /login          │
└─────────────────┘
```

---

## 🔍 Kiểm Tra Bảo Mật

### Checklist

- [ ] Link chỉ dùng được 1 lần
- [ ] Rate limiting hoạt động (5/15min)
- [ ] Mật khẩu yếu bị reject
- [ ] Session bị invalidate sau reset
- [ ] Link hết hạn sau 1 giờ
- [ ] Token không thể đoán được
- [ ] Không lộ thông tin nhạy cảm trong response

---

## 📞 Liên Hệ

| | |
|---|---|
| **Email** | duongminhhoanginwork@gmail.com |
| **Hotline** | 039 449 7949 |
| **Trưởng dự án** | Dương Minh Hoàng |

---

*Cập nhật lần cuối: Tháng 1/2026*
