# 🚨 FIX LỖI 500 INTERNAL SERVER ERROR

## Lỗi hiện tại

```
GET http://localhost:3000/ 500 (Internal Server Error)
GET http://localhost:3000/_next/static/chunks/webpack.js net::ERR_ABORTED 404
Refused to execute script... MIME type ('text/html') is not executable
```

## ✅ CÁCH FIX NHANH (1 phút)

### Bước 1: Xóa cache build

```bash
# Stop dev server (Ctrl+C trong terminal)
# Xóa folder .next
rm -rf .next

# Hoặc trên Windows:
rmdir /s /q .next
```

### Bước 2: Restart dev server

```bash
npm run dev
```

### Bước 3: Clear browser cache

**Chrome/Edge:**
1. Mở DevTools (F12)
2. Click chuột phải vào nút Reload
3. Chọn **"Empty Cache and Hard Reload"**

**Hoặc:**
- Nhấn `Ctrl+Shift+Delete`
- Chọn "Cached images and files"
- Click "Clear data"

### Bước 4: Mở trang mới

```
http://localhost:3000
```

**✅ Trang sẽ load bình thường!**

---

## Nếu vẫn lỗi, thử các bước sau:

### Fix 1: Kill process trên port 3000

```bash
# Kill port 3000
npx kill-port 3000

# Restart
npm run dev
```

### Fix 2: Xóa node_modules và reinstall

```bash
# Stop server
Ctrl+C

# Xóa node_modules và .next
rm -rf node_modules .next

# Reinstall
npm install

# Restart
npm run dev
```

### Fix 3: Thử port khác

Sửa file `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

Rồi:
```bash
npm run dev
```

Truy cập: `http://localhost:3001`

### Fix 4: Disable browser extensions

1. Mở Chrome/Edge Incognito mode (Ctrl+Shift+N)
2. Truy cập `http://localhost:3000`
3. Nếu OK → Có extension đang block

---

## Tại sao lỗi này xảy ra?

### Nguyên nhân 1: Build cache cũ
Next.js cache bị corrupt khi:
- Thay đổi dependencies
- Update code nhiều
- Crash giữa chừng build

**Fix:** Xóa `.next` folder

### Nguyên nhân 2: Browser cache
Browser đang cache response 404/500 cũ

**Fix:** Hard reload (Ctrl+Shift+R)

### Nguyên nhân 3: Port conflict
Có process khác đang chạy port 3000

**Fix:** `npx kill-port 3000`

### Nguyên nhân 4: MIME type error
Server trả HTML thay vì JS file → Browser từ chối execute

**Fix:** Clear cache và rebuild

---

## Kiểm tra server đã chạy OK chưa?

Mở terminal, xem có dòng này không:

```
✓ Ready in 3.2s
○ Local:        http://localhost:3000
```

Nếu thấy → Server OK!

Nếu thấy lỗi → Đọc error message và fix

---

## Debug chi tiết

### Check 1: Server có chạy không?

```bash
curl http://localhost:3000
```

Nếu thấy HTML → Server OK

### Check 2: Webpack files có tồn tại không?

```bash
ls -la .next/static/chunks/
```

Phải thấy các file:
- webpack.js
- main.js
- app-pages-internals.js

Nếu không thấy → Build lỗi → Xóa `.next` và rebuild

### Check 3: Check browser console

F12 → Console → Xem error chi tiết

---

## Sau khi fix thành công

✅ Trang chủ load
✅ Không có lỗi console
✅ UI hiển thị đầy đủ
✅ Animations chạy mượt

---

**TL;DR:**
```bash
# 1. Stop server (Ctrl+C)
# 2. Xóa cache
rm -rf .next
# 3. Restart
npm run dev
# 4. Hard reload browser (Ctrl+Shift+R)
# 5. Mở http://localhost:3000
```

Done! 🎉
