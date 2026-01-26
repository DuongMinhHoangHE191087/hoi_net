# 🔐 Hệ Thống Xác Thực - Luồng Hoạt Động

## Tổng Quan Các Luồng

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOWS                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  1. ĐĂNG KÝ                    2. ĐĂNG NHẬP                3. QUÊN MẬT KHẨU      │
│  ┌─────────────┐               ┌─────────────┐              ┌─────────────┐      │
│  │  /register  │               │   /login    │              │/forgot-pass │      │
│  └──────┬──────┘               └──────┬──────┘              └──────┬──────┘      │
│         │                             │                            │              │
│         ▼                             ▼                            ▼              │
│  ┌─────────────┐               ┌─────────────┐              ┌─────────────┐      │
│  │ Gửi email   │               │ Kiểm tra    │              │ Gửi email   │      │
│  │ xác nhận    │               │ credentials │              │ recovery    │      │
│  └──────┬──────┘               └──────┬──────┘              └──────┬──────┘      │
│         │                             │                            │              │
│         ▼                             ▼                            ▼              │
│  ┌─────────────┐               ┌─────────────┐              ┌─────────────┐      │
│  │/confirm-    │               │ /dashboard  │              │/reset-      │      │
│  │   email     │               │   hoặc      │              │ password    │      │
│  └──────┬──────┘               │  /admin     │              └──────┬──────┘      │
│         │                      └─────────────┘                     │              │
│         ▼                                                          ▼              │
│  ┌─────────────┐                                            ┌─────────────┐      │
│  │Click link   │                                            │Đặt mật khẩu │      │
│  │trong email  │                                            │    mới      │      │
│  └──────┬──────┘                                            └──────┬──────┘      │
│         │                                                          │              │
│         ▼                                                          ▼              │
│  ┌─────────────┐                                            ┌─────────────┐      │
│  │/auth/       │◄──────────────────────────────────────────►│   /login    │      │
│  │  callback   │                                            │  (success)  │      │
│  └─────────────┘                                            └─────────────┘      │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Luồng Đăng Ký (Registration Flow)

### Các bước:

```
Người dùng                    Frontend                      Supabase                    Email
    │                            │                              │                          │
    │ 1. Nhập thông tin         │                              │                          │
    │──────────────────────────►│                              │                          │
    │                            │ 2. Validate                 │                          │
    │                            │ - Email format              │                          │
    │                            │ - Password strength         │                          │
    │                            │ - Terms accepted            │                          │
    │                            │                              │                          │
    │                            │ 3. signUp()                 │                          │
    │                            │─────────────────────────────►│                          │
    │                            │                              │ 4. Create user          │
    │                            │                              │ 5. Send confirmation    │
    │                            │                              │─────────────────────────►│
    │                            │                              │                          │
    │                            │ 6. needsConfirmation: true  │                          │
    │                            │◄─────────────────────────────│                          │
    │                            │                              │                          │
    │ 7. Redirect /confirm-email│                              │                          │
    │◄──────────────────────────│                              │                          │
    │                            │                              │                          │
    │ 8. Click link trong email │                              │                          │
    │──────────────────────────────────────────────────────────►│                          │
    │                            │                              │ 9. Verify token         │
    │ 10. Redirect /login?message=email-confirmed              │                          │
    │◄─────────────────────────────────────────────────────────│                          │
```

### Các trang liên quan:
- `/register` - Form đăng ký
- `/auth/confirm-email` - Hướng dẫn kiểm tra email
- `/auth/callback` - Xử lý link xác nhận
- `/login` - Đăng nhập sau khi xác nhận

### Validation:
- **Email**: RFC 5321, phát hiện typo, gợi ý sửa
- **Password**: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- **Terms**: Phải đồng ý điều khoản

---

## 2️⃣ Luồng Đăng Nhập (Login Flow)

### Email/Password:

```
Người dùng                    Frontend                      Supabase
    │                            │                              │
    │ 1. Nhập email/password    │                              │
    │──────────────────────────►│                              │
    │                            │ 2. Validate email format    │
    │                            │                              │
    │                            │ 3. signInWithPassword()     │
    │                            │─────────────────────────────►│
    │                            │                              │
    │                            │ 4a. Success → session       │
    │                            │◄─────────────────────────────│
    │                            │                              │
    │                            │ 4b. Error handling:         │
    │                            │  - Invalid credentials      │
    │                            │  - Email not confirmed      │
    │                            │  - Too many attempts        │
    │                            │                              │
    │ 5. Redirect /dashboard    │                              │
    │◄──────────────────────────│                              │
```

### Google OAuth:

```
Người dùng                    Frontend                      Supabase                   Google
    │                            │                              │                          │
    │ 1. Click "Đăng nhập Google"│                              │                          │
    │──────────────────────────►│                              │                          │
    │                            │ 2. signInWithOAuth()        │                          │
    │                            │─────────────────────────────►│                          │
    │                            │                              │ 3. Redirect to Google   │
    │◄──────────────────────────────────────────────────────────────────────────────────►│
    │                            │                              │                          │
    │ 4. Authorize              │                              │                          │
    │──────────────────────────────────────────────────────────────────────────────────►│
    │                            │                              │                          │
    │                            │                              │ 5. Callback with code   │
    │                            │                              │◄─────────────────────────│
    │                            │                              │                          │
    │ 6. Redirect /auth/callback?code=xxx                      │                          │
    │◄─────────────────────────────────────────────────────────│                          │
    │                            │                              │                          │
    │                            │ 7. exchangeCodeForSession() │                          │
    │                            │─────────────────────────────►│                          │
    │                            │                              │                          │
    │ 8. Redirect /dashboard or /admin                         │                          │
    │◄─────────────────────────────────────────────────────────│                          │
```

---

## 3️⃣ Luồng Quên Mật Khẩu (Password Reset Flow)

```
Người dùng                    Frontend                      Supabase                    Email
    │                            │                              │                          │
    │ 1. Nhập email             │                              │                          │
    │──────────────────────────►│                              │                          │
    │                            │ 2. Validate email           │                          │
    │                            │                              │                          │
    │                            │ 3. resetPasswordForEmail()  │                          │
    │                            │─────────────────────────────►│                          │
    │                            │                              │ 4. Send recovery email  │
    │                            │                              │─────────────────────────►│
    │                            │                              │                          │
    │ 5. "Email đã được gửi"    │                              │                          │
    │◄──────────────────────────│                              │                          │
    │                            │                              │                          │
    │ 6. Click link trong email │                              │                          │
    │───────────────────────────────────────────────────────────────────────────────────►│
    │                            │                              │                          │
    │ 7. Redirect /auth/callback?token_hash=xxx&type=recovery  │                          │
    │◄─────────────────────────────────────────────────────────│                          │
    │                            │                              │                          │
    │ 8. Redirect /reset-password                              │                          │
    │◄─────────────────────────────────────────────────────────│                          │
    │                            │                              │                          │
    │ 9. Nhập mật khẩu mới      │                              │                          │
    │──────────────────────────►│                              │                          │
    │                            │ 10. updateUser({password})  │                          │
    │                            │─────────────────────────────►│                          │
    │                            │                              │                          │
    │ 11. Redirect /login?message=password-reset               │                          │
    │◄─────────────────────────────────────────────────────────│                          │
```

---

## 4️⃣ Luồng Gửi Lại Email Xác Nhận (Resend Confirmation)

```
Người dùng                    Frontend                      Supabase                    Email
    │                            │                              │                          │
    │ 1. Vào /auth/resend-confirmation                         │                          │
    │──────────────────────────►│                              │                          │
    │                            │                              │                          │
    │ 2. Nhập email             │                              │                          │
    │──────────────────────────►│                              │                          │
    │                            │ 3. resend({type: 'signup'}) │                          │
    │                            │─────────────────────────────►│                          │
    │                            │                              │ 4. Send email           │
    │                            │                              │─────────────────────────►│
    │                            │                              │                          │
    │ 5. "Email đã được gửi"    │                              │                          │
    │◄──────────────────────────│                              │                          │
    │                            │                              │                          │
    │ 6. Click link → /auth/callback → /login                  │                          │
```

---

## 5️⃣ Auth Callback Handler

### File: `/app/auth/callback/route.ts`

```typescript
// Xử lý các loại callback:

type CallbackType = 
  | 'signup'        // Xác nhận đăng ký → /login?message=email-confirmed
  | 'recovery'      // Reset mật khẩu → /reset-password
  | 'magiclink'     // Magic link login → /dashboard
  | 'email_change'  // Thay đổi email → /settings?message=email-changed
  | 'invite'        // Mời người dùng → /onboarding
  | 'oauth'         // Google OAuth → /dashboard hoặc /admin
```

### Error Handling:

| Error | Redirect | Message |
|-------|----------|---------|
| Link hết hạn (signup) | `/auth/resend-confirmation` | Yêu cầu gửi lại |
| Link hết hạn (recovery) | `/forgot-password` | Yêu cầu link mới |
| Invalid credentials | `/login` | Email/password sai |
| Email not confirmed | `/login` | Hiển thị nút resend |
| OAuth denied | `/login` | Từ chối quyền truy cập |

---

## 📁 Cấu Trúc Files

```
app/
├── auth/
│   ├── callback/
│   │   └── route.ts          # Xử lý tất cả auth callbacks
│   ├── confirm-email/
│   │   └── page.tsx          # Hướng dẫn kiểm tra email
│   └── resend-confirmation/
│       └── page.tsx          # Gửi lại email xác nhận
├── login/
│   └── page.tsx              # Đăng nhập
├── register/
│   └── page.tsx              # Đăng ký
├── forgot-password/
│   └── page.tsx              # Quên mật khẩu
└── reset-password/
    └── page.tsx              # Đặt lại mật khẩu

lib/
├── auth/
│   ├── validation.ts         # Email & password validation
│   ├── service.ts            # Auth service
│   ├── store.ts              # Zustand store
│   └── types.ts              # Type definitions
└── supabase/
    ├── client.ts             # Browser client
    └── server.ts             # Server client
```

---

## ⚙️ Cấu Hình Supabase

### Authentication Settings:

```
Project Settings → Authentication
```

| Setting | Giá trị |
|---------|---------|
| Enable email signup | ✓ |
| Confirm email | ✓ |
| Secure email change | ✓ |
| Enable Google OAuth | ✓ |

### URL Configuration:

```
Site URL: https://yourdomain.com
Redirect URLs:
  - https://yourdomain.com/auth/callback
  - http://localhost:3000/auth/callback
```

### Email Templates:
Xem file `docs/EMAIL_TEMPLATES_GUIDE.md` để cấu hình email templates.

---

## 🔒 Security Best Practices

1. **PKCE Flow**: Sử dụng cho OAuth để tránh CSRF
2. **HttpOnly Cookies**: Session được lưu trong secure cookies
3. **Rate Limiting**: Giới hạn số lần gửi email
4. **Token Expiry**: 
   - Confirmation: 24 giờ
   - Recovery: 1 giờ
   - Magic Link: 1 giờ

---

## 🧪 Test Checklist

- [ ] Đăng ký với email mới
- [ ] Xác nhận email qua link
- [ ] Đăng nhập với email/password
- [ ] Đăng nhập với Google
- [ ] Quên mật khẩu → nhận email → đặt mật khẩu mới
- [ ] Gửi lại email xác nhận
- [ ] Validation email sai format
- [ ] Validation password yếu
- [ ] Link hết hạn
- [ ] Email đã đăng ký
