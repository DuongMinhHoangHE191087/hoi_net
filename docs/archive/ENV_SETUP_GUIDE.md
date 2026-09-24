# 📋 Setup .env.local - Hướng Dẫn Hoàn Chỉnh

## 🚀 Quick Start (3 bước)

### Bước 1: Copy Template

```bash
cp .env.example .env.local
```

### Bước 2: Generate Secrets

```bash
npm run generate:secrets
```

### Bước 3: Điền Thông Tin

Mở `.env.local` và điền các giá trị **Required**:

```env
# SUPABASE (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...

# CLOUDINARY (Required)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dt6p7wm6i
CLOUDINARY_API_KEY=657978587875257
CLOUDINARY_API_SECRET=u8pLkME7boFIspfEjvVWxxaCrMU

# ADMIN (Required)
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com

# AI (Required)
GEMINI_API_KEY=your-gemini-api-key

# COOKIE & SECURITY (Auto-generated bởi script)
COOKIE_SECRET=a7f8d9e2c4b6f1e3d5c8a9b7f4e6d2c1...
CSRF_SECRET=b3e5f7a9d2c4e6f8a1b3d5c7e9f2a4b6...
```

---

## 📝 Chi Tiết Từng Phần

### 1️⃣ SUPABASE Configuration

**Lấy từ đâu:**
1. Truy cập: https://supabase.com/dashboard
2. Chọn project của bạn
3. Settings → API
4. Copy **URL** và **anon public** key

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Service Role Key (Optional):**
- Chỉ cần cho server-side operations
- Copy từ cùng trang API settings

---

### 2️⃣ CLOUDINARY Configuration

**Lấy từ đâu:**
1. Truy cập: https://cloudinary.com/console
2. Dashboard → Account Details
3. Copy **Cloud Name**, **API Key**, **API Secret**

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dt6p7wm6i
CLOUDINARY_API_KEY=657978587875257
CLOUDINARY_API_SECRET=u8pLkME7boFIspfEjvVWxxaCrMU
```

**Note:** Đã có sẵn trong project hiện tại (giữ nguyên)

---

### 3️⃣ ADMIN Configuration

**Email của admin:**

```env
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,another@example.com
```

- Dùng dấu phẩy để ngăn cách nhiều emails
- Không có khoảng trắng
- Emails này sẽ có quyền admin

---

### 4️⃣ AI Configuration

**Gemini API Key:**

**Lấy từ đâu:**
1. Truy cập: https://makersuite.google.com/app/apikey
2. Create API Key
3. Copy key

```env
GEMINI_API_KEY=AIzaSyABC123...
```

---

### 5️⃣ Cookie & Security

**Tự động generate:**

```bash
npm run generate:secrets
```

Script sẽ tự động thêm vào `.env.local`:

```env
COOKIE_SECRET=a7f8d9e2c4b6f1e3d5c8a9b7f4e6d2c1a8b9f7e5d3c2a1b8f6e4d7c5a3b1f9e8
CSRF_SECRET=b3e5f7a9d2c4e6f8a1b3d5c7e9f2a4b6d8c1e3f5a7b9d2c4e6f8a1b3d5c7e9f2
```

**Hoặc thủ công:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Chạy 2 lần, paste vào file.

---

### 6️⃣ Google OAuth (Optional)

**Nếu dùng Google Sign-In:**

1. Truy cập: https://console.cloud.google.com/
2. Create Project hoặc chọn project
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Copy **Client ID** và **Client Secret**

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...
```

---

### 7️⃣ Rate Limiting (Optional)

**Nếu muốn rate limiting:**

1. Truy cập: https://upstash.com/
2. Create Redis Database
3. Copy **REST URL** và **REST TOKEN**

```env
UPSTASH_REDIS_REST_URL=https://abc-123.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXYxabc123...
```

**Để trống nếu không dùng:**

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 📋 Full Example .env.local

Sau khi hoàn thành, file sẽ trông như:

```env
# =============================================
# SUPABASE
# =============================================
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================
# CLOUDINARY
# =============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dt6p7wm6i
CLOUDINARY_API_KEY=657978587875257
CLOUDINARY_API_SECRET=u8pLkME7boFIspfEjvVWxxaCrMU

# =============================================
# ADMIN
# =============================================
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com

# =============================================
# AI
# =============================================
GEMINI_API_KEY=AIzaSyABC123...

# =============================================
# COOKIE & SECURITY
# =============================================
COOKIE_SECRET=a7f8d9e2c4b6f1e3d5c8a9b7f4e6d2c1a8b9f7e5d3c2a1b8f6e4d7c5a3b1f9e8
CSRF_SECRET=b3e5f7a9d2c4e6f8a1b3d5c7e9f2a4b6d8c1e3f5a7b9d2c4e6f8a1b3d5c7e9f2

# =============================================
# NEXTAUTH
# =============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generated-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# =============================================
# GOOGLE OAUTH (Optional)
# =============================================
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

# =============================================
# RATE LIMITING (Optional)
# =============================================
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# =============================================
# FEATURE FLAGS
# =============================================
NEXT_PUBLIC_ENABLE_AI_PROCESSING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_FEEDBACK=true
```

---

## ✅ Verification Checklist

### Bước 1: Check File Tồn Tại

```bash
ls -la .env.local
```

Should show: `.env.local`

### Bước 2: Check Required Variables

```bash
# Check Supabase
grep NEXT_PUBLIC_SUPABASE_URL .env.local

# Check Cloudinary
grep CLOUDINARY_API_KEY .env.local

# Check Secrets
grep COOKIE_SECRET .env.local
```

All should return values (not empty).

### Bước 3: Start Server

```bash
npm run dev
```

No errors về missing env vars.

### Bước 4: Test Features

1. **Login**: http://localhost:3000/login
2. **Upload**: Test upload avatar
3. **Admin**: http://localhost:3000/admin
4. **AI**: Test AI processing

---

## 🐛 Troubleshooting

### Lỗi: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Fix:**
```bash
# 1. Check file name
ls -la | grep env

# Should be .env.local NOT .env

# 2. Restart server
npm run dev
```

### Lỗi: "Invalid API Key"

**Fix:**
- Kiểm tra lại key từ dashboard
- Không có khoảng trắng trước/sau key
- Copy đúng toàn bộ key

### File .env.local không load

**Fix:**
```bash
# 1. Check file location (phải ở root)
pwd
ls .env.local

# 2. Check permissions
chmod 644 .env.local

# 3. Restart
npm run dev
```

### Secrets không được generate

**Fix:**
```bash
# Chạy trực tiếp script
node scripts/generate-secrets.js

# Hoặc manual
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔒 Security Best Practices

### ✅ DO

1. **Use .env.local for local development**
   ```bash
   .env.local  # ✅ Correct
   .env        # ❌ Don't use
   ```

2. **Never commit secrets**
   ```bash
   # .gitignore already has:
   .env.local
   .env*.local
   ```

3. **Generate unique secrets**
   ```bash
   npm run generate:secrets
   ```

4. **Use different secrets per environment**
   - Development: `.env.local`
   - Production: `.env.production.local`

### ❌ DON'T

1. **Don't share .env.local**
   - Use password manager
   - Or encrypted channels

2. **Don't use weak secrets**
   ```env
   COOKIE_SECRET=123456  ❌ Weak
   ```

3. **Don't commit to Git**
   ```bash
   git add .env.local  ❌ Never do this
   ```

4. **Don't hardcode in code**
   ```typescript
   const apiKey = "abc123"  ❌ Bad
   const apiKey = process.env.API_KEY  ✅ Good
   ```

---

## 📚 References

- **Supabase Docs**: https://supabase.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Next.js Env Vars**: https://nextjs.org/docs/basic-features/environment-variables
- **Security Guide**: See `COOKIE_SECURITY_GUIDE.md`

---

## 🎉 Summary

**Minimum Required (để chạy được):**

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_ADMIN_EMAILS=...
GEMINI_API_KEY=...
COOKIE_SECRET=...
CSRF_SECRET=...
```

**Setup Command:**

```bash
# All in one
cp .env.example .env.local && npm run generate:secrets && npm run dev
```

**Done! Simple!** 🚀
