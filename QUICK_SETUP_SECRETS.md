# 🚀 Quick Setup - Security Keys

## Cách Nhanh Nhất (30 giây)

```bash
# Bước 1: Generate secrets
npm run generate:secrets

# Bước 2: Restart
npm run dev
```

**XONG! Đơn giản vậy thôi!** ✅

---

## Cách Thủ Công (1 phút)

### 1. Generate 2 secrets

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Chạy 2 lần, copy cả 2 kết quả.

### 2. Mở .env.local

**Windows:**
```powershell
notepad .env.local
```

**Mac/Linux:**
```bash
code .env.local
```

### 3. Paste vào cuối file

```env
COOKIE_SECRET=paste-secret-1-here
CSRF_SECRET=paste-secret-2-here
```

### 4. Save & Restart

```bash
npm run dev
```

---

## Kiểm Tra

1. Login: `http://localhost:3000/login`
2. F12 → Application → Cookies
3. Check: HttpOnly ✓, SameSite ✓

---

## ❌ Lỗi Thường Gặp

### "COOKIE_SECRET is not defined"
```bash
# Fix: Restart server
npm run dev
```

### Script không chạy
```bash
# Fix: Chạy trực tiếp
node scripts/generate-secrets.js
```

### File không tồn tại
```bash
# Fix: Tạo file
touch .env.local
npm run generate:secrets
```

---

## 📚 Chi Tiết

Xem đầy đủ tại: **SETUP_SECRETS_GUIDE.md**
