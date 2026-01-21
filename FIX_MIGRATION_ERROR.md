# 🚨 FIX LỖI MIGRATION - HƯỚNG DẪN NHANH

## ⚠️ VẤN ĐỀ

Bạn gặp 2 lỗi khi chạy migration ban đầu:
1. `cannot change name of input parameter "user_id"` - Function conflict
2. `relation "public.admin_users" does not exist` - Table chưa được tạo

## ✅ GIẢI PHÁP: CHẠY 2 MIGRATIONS RIÊNG BIỆT

### BƯỚC 1: Chạy Migration Phần A (Tables & Triggers)

1. Vào Supabase Dashboard → SQL Editor
2. Copy toàn bộ nội dung file: **`database/migrations/016a_tables_triggers.sql`**
3. Paste vào SQL Editor
4. Click **Run**

✅ **Verify thành công:**
```sql
-- Chạy query này để verify
SELECT
  (SELECT count(*) FROM auth.users) as auth_users,
  (SELECT count(*) FROM public.users) as public_users,
  (SELECT count(*) FROM public.user_profiles) as profiles;
```

**Expected:** Tất cả 3 số phải bằng nhau!

---

### BƯỚC 2: Chạy Migration Phần B (Admin Users)

1. Vẫn trong SQL Editor
2. **New Query** (hoặc clear editor)
3. Copy toàn bộ nội dung file: **`database/migrations/016b_admin_users.sql`**
4. Paste vào SQL Editor
5. Click **Run**

✅ **Verify thành công:**
```sql
-- Check admin_users table tồn tại
SELECT * FROM public.admin_users;
-- Sẽ trả về empty table (0 rows) - OK!

-- Check functions tồn tại
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('is_admin', 'get_user_role');
-- Phải trả về 2 rows
```

---

### BƯỚC 3: Tạo Admin User Đầu Tiên

Trong cùng SQL Editor, chạy query này (thay email của bạn):

```sql
-- Thay 'your-email@gmail.com' bằng email thực của bạn
INSERT INTO public.admin_users (user_id, granted_by)
SELECT id, id FROM auth.users WHERE email = 'your-email@gmail.com'
ON CONFLICT DO NOTHING;
```

✅ **Verify admin được tạo:**
```sql
-- Check admin user
SELECT
  u.email,
  au.granted_at,
  public.is_admin(u.id) as is_admin_check
FROM public.admin_users au
JOIN auth.users u ON au.user_id = u.id;
```

**Expected:** Phải thấy email của bạn và `is_admin_check = true`

---

### BƯỚC 4: Kiểm Tra Trigger Hoạt Động

Test trigger bằng cách tạo user mới:

1. Vào app (http://localhost:3000/register)
2. Đăng ký với email MỚI
3. Sau khi đăng ký, chạy query:

```sql
-- Thay 'new-test@email.com' bằng email vừa đăng ký
SELECT
  au.email,
  u.id as in_users,
  up.id as in_profiles
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'new-test@email.com';
```

**Expected:** Cả 3 columns đều có giá trị (không null)

---

## 🎯 CHECKLIST HOÀN THÀNH

- [ ] Migration 016a chạy thành công
- [ ] Verify: users count = user_profiles count = auth.users count
- [ ] Migration 016b chạy thành công
- [ ] Verify: admin_users table tồn tại
- [ ] Verify: Functions is_admin và get_user_role tồn tại
- [ ] Tạo admin user đầu tiên thành công
- [ ] Verify: public.is_admin(user_id) return true
- [ ] Test trigger: Đăng ký user mới → profile tự động được tạo

---

## 🐛 NẾU VẪN GẶP LỖI

### Lỗi: "relation already exists"
**Giải pháp:** Bỏ qua - table đã tồn tại là OK

### Lỗi: "trigger already exists"
**Giải pháp:** Migration đã có `DROP TRIGGER IF EXISTS`, chạy lại migration

### Lỗi: "function already exists with different signature"
**Giải pháp:** Chạy query này trước:
```sql
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
```
Sau đó chạy lại migration 016b

### Lỗi: "permission denied for schema auth"
**Giải pháp:** Bạn đang dùng wrong user. Đảm bảo chạy trong Supabase Dashboard SQL Editor (có quyền cao nhất)

---

## ✅ SAU KHI HOÀN TẤT

1. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   rm -rf .next
   bun run dev
   ```

2. **Test login/register:**
   - Register với email mới
   - Check console logs: `[Auth 📝] SIGNUP_SUCCESS`
   - Login với email đã register
   - Check console logs: `[Auth ✅] LOGIN_SUCCESS`

3. **Test admin access:**
   - Login với email admin
   - Access http://localhost:3000/admin
   - Should work! ✅

---

## 📞 NẾU VẪN CẦN TRỢ GIÚP

Gửi cho tôi:
1. Screenshot lỗi từ SQL Editor
2. Kết quả của query verify
3. Logs từ browser console

Tôi sẽ giúp bạn debug!
