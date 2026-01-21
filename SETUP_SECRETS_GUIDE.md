# 🔑 Setup Security Keys - Hướng Dẫn Chi Tiết

## 🎯 Mục Đích

Tạo 2 secret keys để bảo mật cookies:
- `COOKIE_SECRET` - Encrypt và sign cookies
- `CSRF_SECRET` - CSRF token generation

## ⚡ Cách 1: Tự Động (Khuyến Nghị)

### Bước 1: Chạy Script

```bash
npm run generate:secrets
```

**Output sẽ như:**
```
🎉 Secrets đã được tạo và lưu vào .env.local!

📋 Generated Secrets:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COOKIE_SECRET=a7f8d9e2c4b6f1e3d5c8a9b7f4e6d2c1a8b9f7e5d3c2a1b8f6e4d7c5a3b1f9e8
CSRF_SECRET=b3e5f7a9d2c4e6f8a1b3d5c7e9f2a4b6d8c1e3f5a7b9d2c4e6f8a1b3d5c7e9f2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Next Steps:
1. Restart dev server: npm run dev
2. Verify trong browser DevTools → Application → Cookies
3. Check flags: HttpOnly ✓, Secure ✓, SameSite ✓

🔒 IMPORTANT: Không commit .env.local lên Git!
```

### Bước 2: Restart Server

```bash
# Clear cache
rm -rf .next

# Restart
npm run dev
```

### Bước 3: Verify

1. Mở browser: `http://localhost:3000/login`
2. Login vào hệ thống
3. Mở DevTools (F12)
4. Application → Cookies → `http://localhost:3000`
5. Check cookie có flags:
   - ✅ HttpOnly
   - ✅ Secure (if production)
   - ✅ SameSite = Lax

**XONG! Đơn giản vậy thôi!** 🎉

---

## 🔧 Cách 2: Thủ Công

### Bước 1: Generate Secret 1

Mở terminal và chạy:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output (ví dụ):**
```
a7f8d9e2c4b6f1e3d5c8a9b7f4e6d2c1a8b9f7e5d3c2a1b8f6e4d7c5a3b1f9e8
```

Copy kết quả này.

### Bước 2: Generate Secret 2

Chạy lại lệnh:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output (ví dụ):**
```
b3e5f7a9d2c4e6f8a1b3d5c7e9f2a4b6d8c1e3f5a7b9d2c4e6f8a1b3d5c7e9f2
```

Copy kết quả này.

### Bước 3: Mở File .env.local

**Windows (PowerShell):**
```powershell
notepad .env.local
```

**Windows (VSCode):**
```powershell
code .env.local
```

**Mac/Linux:**
```bash
nano .env.local
# hoặc
vim .env.local
# hoặc
code .env.local
```

### Bước 4: Thêm Secrets

Paste vào cuối file `.env.local`:

```env
# ========================================
# Cookie Security Configuration
# ========================================
COOKIE_SECRET=a7f8d9e2c4b6f1e3d5c8a9b7f4e6d2c1a8b9f7e5d3c2a1b8f6e4d7c5a3b1f9e8
CSRF_SECRET=b3e5f7a9d2c4e6f8a1b3d5c7e9f2a4b6d8c1e3f5a7b9d2c4e6f8a1b3d5c7e9f2
```

### Bước 5: Save File

- **Notepad**: File → Save
- **VSCode**: Ctrl + S (hoặc Cmd + S trên Mac)
- **Nano**: Ctrl + O → Enter → Ctrl + X
- **Vim**: :wq

### Bước 6: Restart Server

```bash
rm -rf .next
npm run dev
```

---

## 📋 Full .env.local Example

Sau khi thêm, file `.env.local` sẽ trông như này:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dt6p7wm6i
CLOUDINARY_API_KEY=657978587875257
CLOUDINARY_API_SECRET=u8pLkME7boFIspfEjvVWxxaCrMU

# Admin Emails
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,user@example.com

# Gemini AI
GEMINI_API_KEY=your_api_key_here

# ========================================
# Cookie Security Configuration
# ========================================
COOKIE_SECRET=a7f8d9e2c4b6f1e3d5c8a9b7f4e6d2c1a8b9f7e5d3c2a1b8f6e4d7c5a3b1f9e8
CSRF_SECRET=b3e5f7a9d2c4e6f8a1b3d5c7e9f2a4b6d8c1e3f5a7b9d2c4e6f8a1b3d5c7e9f2
```

---

## 🚨 Common Mistakes

### ❌ Sai: Dùng secrets yếu
```env
COOKIE_SECRET=123456
CSRF_SECRET=password
```

### ✅ Đúng: Dùng random hex 64 chars
```env
COOKIE_SECRET=a7f8d9e2c4b6f1e3d5c8a9b7f4e6d2c1a8b9f7e5d3c2a1b8f6e4d7c5a3b1f9e8
CSRF_SECRET=b3e5f7a9d2c4e6f8a1b3d5c7e9f2a4b6d8c1e3f5a7b9d2c4e6f8a1b3d5c7e9f2
```

### ❌ Sai: Có spaces
```env
COOKIE_SECRET = a7f8d9e2...   (có spaces)
```

### ✅ Đúng: Không có spaces
```env
COOKIE_SECRET=a7f8d9e2...
```

### ❌ Sai: Dùng cùng secret
```env
COOKIE_SECRET=abc123
CSRF_SECRET=abc123   (giống nhau!)
```

### ✅ Đúng: Mỗi secret khác nhau
```env
COOKIE_SECRET=a7f8d9e2...
CSRF_SECRET=b3e5f7a9...   (khác nhau)
```

---

## 🔍 Verification Checklist

### 1. Check File Exists
```bash
# Windows
dir .env.local

# Mac/Linux
ls -la .env.local
```

Should show: `.env.local`

### 2. Check Secrets Are Set
```bash
# Windows PowerShell
Get-Content .env.local | Select-String COOKIE_SECRET

# Mac/Linux
grep COOKIE_SECRET .env.local
```

Should show:
```
COOKIE_SECRET=a7f8d9e2c4b6f1e3d5c8a9b7f4e6d2c1...
```

### 3. Check Server Loaded Secrets

Trong terminal khi chạy `npm run dev`, không nên thấy errors về missing env vars.

### 4. Check Browser Cookies

1. Login tại `http://localhost:3000/login`
2. F12 → Application → Cookies
3. Find `sb-auth-token` cookie
4. Verify flags:
   - ✅ HttpOnly
   - ✅ SameSite = Lax
   - ✅ Secure (chỉ trong production)

---

## 🐛 Troubleshooting

### Lỗi: "COOKIE_SECRET is not defined"

**Nguyên nhân:** File .env.local chưa được load

**Fix:**
```bash
# 1. Check file tồn tại
ls .env.local

# 2. Restart server
npm run dev
```

### Lỗi: "Invalid secret length"

**Nguyên nhân:** Secret quá ngắn hoặc không đúng format

**Fix:**
```bash
# Generate lại secret 32 bytes = 64 hex chars
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### File .env.local không tồn tại

**Fix:**
```bash
# Tạo file mới
touch .env.local

# Hoặc Windows
type nul > .env.local

# Sau đó chạy
npm run generate:secrets
```

### Script không chạy được

**Fix:**
```bash
# Ensure script file có quyền execute
# Mac/Linux:
chmod +x scripts/generate-secrets.js

# Chạy trực tiếp
node scripts/generate-secrets.js
```

---

## 🔒 Security Tips

### ✅ DO (Nên Làm)

1. **Generate random secrets**
   ```bash
   npm run generate:secrets
   ```

2. **Keep secrets secret**
   - Không share secrets
   - Không commit lên Git
   - Không hardcode trong code

3. **Use different secrets per environment**
   ```
   Development: .env.local
   Production: .env.production.local
   ```

4. **Rotate secrets regularly**
   - Mỗi 3-6 tháng
   - Khi có security incident
   - Khi team member rời đi

### ❌ DON'T (Không Nên)

1. **Dùng secrets yếu**
   ```env
   COOKIE_SECRET=123456  ❌
   ```

2. **Commit .env.local**
   ```bash
   git add .env.local  ❌
   ```

3. **Share secrets qua email/chat**
   - Dùng password manager
   - Hoặc encrypted channels

4. **Dùng cùng secret ở nhiều projects**

---

## 📚 Additional Resources

- **Generate Secrets Online**: [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) (if Node.js not available)
- **Password Manager**: 1Password, LastPass, Bitwarden
- **Docs**: `COOKIE_SECURITY_GUIDE.md`

---

## ✅ Summary

**Fastest Way:**
```bash
npm run generate:secrets
npm run dev
```

**Manual Way:**
```bash
# 1. Generate
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output

# 2. Add to .env.local
echo "COOKIE_SECRET=paste-here" >> .env.local
echo "CSRF_SECRET=paste-here" >> .env.local

# 3. Restart
npm run dev
```

**That's it! Simple! 🎉**
