# 🔧 FIX LỖI: "Cannot drop function because other objects depend on it"

## ⚠️ VẤN ĐỀ

Function `is_admin` đang được dùng bởi nhiều RLS policies:
- user_requests policies
- user_profiles policies
- blog_posts policies
- feedback policies
- admin_actions policies

Không thể DROP function vì sẽ break tất cả policies này.

---

## ✅ GIẢI PHÁP: SỬ DỤNG CREATE OR REPLACE

Thay vì DROP function, ta sẽ **UPDATE** function với `CREATE OR REPLACE`.

---

## 📝 HƯỚNG DẪN MỚI

### BƯỚC 1: Chạy Migration A (Tables & Triggers)

**File:** `database/migrations/016a_tables_triggers.sql`

```
1. Supabase Dashboard → SQL Editor
2. Copy TOÀN BỘ nội dung file 016a_tables_triggers.sql
3. Paste vào SQL Editor
4. Click Run
```

✅ **Verify:**
```sql
SELECT
  (SELECT count(*) FROM auth.users) as auth_users,
  (SELECT count(*) FROM public.users) as public_users,
  (SELECT count(*) FROM public.user_profiles) as profiles;
-- Tất cả 3 số phải bằng nhau!
```

---

### BƯỚC 2: Chạy Migration B SAFE VERSION (Admin Users)

**File:** `database/migrations/016b_admin_users_safe.sql` ← **DÙNG FILE NÀY**

```
1. New Query trong SQL Editor
2. Copy TOÀN BỘ nội dung file 016b_admin_users_safe.sql
3. Paste vào SQL Editor
4. Click Run
```

✅ **Verify:**
```sql
-- 1. Check table tạo thành công
SELECT * FROM public.admin_users;
-- Expected: 0 rows (table empty - OK!)

-- 2. Check functions vẫn hoạt động
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'is_admin';
-- Expected: 1 row

-- 3. Check policies vẫn work
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%admin%'
ORDER BY tablename;
-- Expected: Nhiều rows, không có lỗi
```

---

### BƯỚC 3: Grant Admin Cho User Đầu Tiên

Chạy query riêng này (thay email của bạn):

```sql
-- Thay 'your-email@gmail.com' bằng email THỰC của bạn
INSERT INTO public.admin_users (user_id, granted_by)
SELECT id, id FROM auth.users
WHERE email = 'your-email@gmail.com'
ON CONFLICT DO NOTHING;
```

✅ **Verify admin được grant:**
```sql
-- Check admin user
SELECT
  u.email,
  au.granted_at,
  public.is_admin(u.id) as is_admin_check
FROM public.admin_users au
JOIN auth.users u ON au.user_id = u.id;

-- Expected:
-- email: your-email@gmail.com
-- is_admin_check: true
```

---

## 🎯 SAO PHƯƠNG PHÁP NÀY HOẠT ĐỘNG?

### CREATE OR REPLACE vs DROP + CREATE

**DROP + CREATE (Lỗi):**
```sql
DROP FUNCTION is_admin(UUID);  -- ❌ Error: policies depend on it
CREATE FUNCTION is_admin(...);
```

**CREATE OR REPLACE (OK):**
```sql
CREATE OR REPLACE FUNCTION is_admin(UUID) ... -- ✅ Updates function body
-- Policies continue to work!
```

### Function Signature Cũ vs Mới

**Function hiện tại (có thể):**
```sql
CREATE FUNCTION is_admin(user_id UUID) ...
-- Parameter tên: user_id
```

**Function mới (matching signature):**
```sql
CREATE OR REPLACE FUNCTION is_admin(user_id UUID) ...
-- Cùng parameter name → Safe to replace
```

---

## 🔍 NẾU VẪN CÓ LỖI

### Lỗi: "function is_admin does not exist"
**Nguyên nhân:** Parameter name không khớp

**Fix:** Kiểm tra function hiện tại:
```sql
SELECT pg_get_functiondef('public.is_admin'::regproc);
```

Nếu thấy parameter name khác (vd: `check_user_id` thay vì `user_id`), sửa trong migration:
```sql
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID) ...
```

### Lỗi: "table admin_users already exists"
**Giải pháp:** Bỏ qua - table đã tồn tại là OK!

### Lỗi khi INSERT admin user: "violates foreign key constraint"
**Nguyên nhân:** Email không tồn tại trong auth.users

**Fix:** Check user tồn tại:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@gmail.com';
-- Nếu empty → User chưa đăng ký
-- → Đăng ký trước, sau đó grant admin
```

---

## ✅ CHECKLIST CUỐI CÙNG

- [ ] Migration 016a chạy OK
- [ ] Verify: user counts match
- [ ] Migration 016b_safe chạy OK
- [ ] Verify: admin_users table exists
- [ ] Verify: is_admin function updated
- [ ] Grant admin cho user đầu tiên
- [ ] Verify: public.is_admin(user_id) = true
- [ ] Restart dev server
- [ ] Test login với admin user
- [ ] Access /admin → Should work!

---

## 🚀 SAU KHI HOÀN TẤT

```bash
# 1. Clear cache
rm -rf .next

# 2. Restart server
bun run dev

# 3. Test admin login
# - Login với email admin
# - Navigate to http://localhost:3000/admin
# - Should see admin panel! ✅
```

---

Bây giờ hãy thử lại với file **`016b_admin_users_safe.sql`**! 🎯
