# ⚡ QUICK START - Fix Users Display

## 🎯 3 BƯỚC ĐỂ FIX (5 PHÚT)

### BƯỚC 1: Restart Dev Server (2 phút)

```bash
# Xóa cache .next
rd /s /q .next

# Restart server
bun run dev
```

**Chờ server khởi động xong!**

---

### BƯỚC 2: Clear Browser Cache (30 giây)

1. Mở browser
2. Nhấn `Ctrl + Shift + R` (hard reload)
3. Hoặc `Ctrl + F5`

---

### BƯỚC 3: Test Admin Panel (1 phút)

1. Login vào `/admin`
2. Click tab "Người Dùng"
3. **Expected:** Thấy ALL users:
   - ✅ duongminhhoanggame@gmail.com
   - ✅ cutevui403@gmail.com (Google user)
   - ✅ Tất cả users khác

---

## ✅ NHỮNG GÌ ĐÃ FIX

### 1. Fixed 406 Error
- Changed `.single()` → `.maybeSingle()` (3 chỗ)
- File: `lib/admin-service.ts`

### 2. Fixed Admin Users API
- Changed từ relationship query → application-layer join
- Query `users` table first, sau đó enrich với `user_profiles`
- File: `app/api/admin/users/route.ts`

---

## 🧪 VERIFY THÀNH CÔNG

### Console (F12 → Console):
- ❌ Trước: `406 Not Acceptable`, `Cannot coerce to single JSON object`
- ✅ Sau: Không còn lỗi

### Admin Panel:
- ❌ Trước: Không hiển thị users, hoặc chỉ hiển thị 1 số
- ✅ Sau: Hiển thị TẤT CẢ users

### Google OAuth Users:
- ❌ Trước: Không hiển thị trong admin panel
- ✅ Sau: Hiển thị cả Google users với avatar

---

## 🐛 NẾU VẪN CÒN LỖI

### Vấn đề: User profiles empty

**Fix:**
1. Mở **Supabase Dashboard** → **SQL Editor**
2. Run file `CHECK_USER_PROFILES.sql`
3. Script sẽ tự động tạo missing profiles

### Vấn đề: Avatar upload lỗi "Bucket not found"

**Fix:**
1. Mở **Supabase Dashboard** → **SQL Editor**
2. Run file `CREATE_STORAGE_BUCKET.sql`
3. Script sẽ tạo storage bucket cho avatars

### Vấn đề: Vẫn lỗi infinite recursion

**Fix:**
1. Run file `FIX_INFINITE_RECURSION_V3_FINAL.sql`
2. Restart server

---

## 📊 CHECK DATABASE (Optional)

Nếu muốn verify toàn bộ setup:

```bash
# Run in Supabase SQL Editor
VERIFY_COMPLETE_SETUP.sql
```

Script này sẽ check:
- ✅ Users trong all tables
- ✅ Admin users setup
- ✅ is_admin() function
- ✅ Storage buckets
- ✅ Triggers
- ✅ RLS policies

---

## 📁 DOCS ĐẦY ĐỦ

Xem chi tiết trong:
- `FIX_COMPLETE_SUMMARY.md` - Full documentation
- `FIX_AVATAR_OAUTH_GUIDE.md` - Avatar & OAuth guide
- `VERIFY_COMPLETE_SETUP.sql` - Database verification

---

## ✨ THAT'S IT!

**Just 3 steps:**
1. ✅ Restart server
2. ✅ Clear cache
3. ✅ Test

**Expected:** Everything works! 🎉
