# 🔍 Auth Debug Guide

## Hiện tại bạn đang thấy:
```
[Auth] Initializing auth...
```

## Điều này có thể là:

### ✅ **BÌNH THƯỜNG** nếu sau đó thấy:
```
[Auth] Initializing auth...
[Auth] getSession completed in XXXms
[Auth] ✅ Session found: your-email@gmail.com
[Auth] ✅ Init complete
```
→ **OK!** Auth đã hoàn tất, chỉ mất XXX milliseconds

### ⚠️ **CÓ VẤN ĐỀ** nếu:

#### 1. Không thấy log tiếp theo sau 2-3 giây
**Nguyên nhân:** Supabase request bị treo  
**Giải pháp:**
- Check network tab (F12 → Network)
- Verify `.env.local` có đúng SUPABASE_URL và ANON_KEY
- Check Supabase dashboard có online không

#### 2. Thấy lỗi "Session error"
**Nguyên nhân:** Token expired hoặc invalid  
**Giải pháp:**
```javascript
// Paste vào console:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

#### 3. Thấy "Auth error" màu đỏ
**Nguyên nhân:** Network hoặc config issue  
**Giải pháp:**
- Copy full error message
- Check `.env.local` file
- Test Supabase connection: https://your-project.supabase.co

---

## 🧪 Test ngay:

### 1. Mở trang admin
```
http://localhost:3000/admin
```

### 2. Mở Console (F12)
**Bạn sẽ thấy một trong hai:**

#### ✅ Success Flow:
```
[Auth] Initializing auth...
[Auth] getSession completed in 234ms
[Auth] ✅ Session found: your-email@gmail.com
[Auth] ✅ Init complete
[Auth] Auth state changed: SIGNED_IN your-email@gmail.com
```
→ **Total: ~250ms, 4-5 dòng**

#### ❌ Problem Flow:
```
[Auth] Initializing auth...
... (nothing for 3+ seconds)
[Auth] ⚠️ Timeout - forcing completion
```
→ **Có vấn đề!** Cần debug

---

## 🔧 Quick Fixes

### Fix 1: Clear Everything
```javascript
// Console:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Fix 2: Check Supabase
```javascript
// Console:
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Has ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### Fix 3: Hard Refresh
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

---

## 📊 Expected Performance

| Metric | Target | Your Result |
|--------|--------|-------------|
| Init time | < 500ms | ? |
| Log count | 4-5 lines | ? |
| Loading state | < 1s | ? |
| Errors | 0 | ? |

---

## 💡 What Changed

1. **Added timing:** See how long `getSession` takes
2. **Added ✅ markers:** Easy to spot success
3. **Added timeout:** Force finish after 10s if stuck
4. **Better error messages:** Red ❌ for errors

---

## 📝 Next Steps

1. **Refresh page** → http://localhost:3000/admin
2. **Open Console (F12)**
3. **Count logs:**
   - Should see "[Auth] Initializing auth..."
   - Then "[Auth] getSession completed..."
   - Then "[Auth] ✅ Init complete"
4. **Copy all [Auth] logs** nếu có vấn đề
5. **Report:** Paste logs vào chat

---

**Nếu thấy "✅ Init complete" → HOÀN TẤT!** 🎉
