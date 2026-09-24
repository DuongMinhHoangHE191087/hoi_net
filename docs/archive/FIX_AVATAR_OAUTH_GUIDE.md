# 🚨 FIX AVATAR & GOOGLE OAUTH USER ISSUES

## 📋 VẤN ĐỀ ĐANG GẶP

### ❌ Lỗi 1: Avatar Upload
```
StorageApiError: Bucket not found
```
**Nguyên nhân:** Chưa tạo Storage bucket cho avatars trong Supabase

### ❌ Lỗi 2: Google OAuth User Không Hiển Thị
- User login Google thành công
- Nhưng KHÔNG hiển thị trong Admin User Management
- Avatar không hiển thị

**Nguyên nhân có thể:**
1. Trigger `handle_new_user_complete` không chạy
2. User profiles không được tạo tự động
3. Storage bucket không tồn tại

---

## 🔧 FIX TOÀN BỘ (3 BƯỚC)

### BƯỚC 1: Check User Data (2 phút)

**Chạy SQL này để kiểm tra:**

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Copy nội dung file `CHECK_USER_PROFILES.sql`
3. Paste và **RUN**

**Kết quả sẽ cho biết:**
- ✅ User có trong auth.users không?
- ✅ User có trong public.users không?
- ✅ User có trong public.user_profiles không?
- ✅ Trigger có tồn tại và enabled không?
- ✅ Storage bucket có tồn tại không?

**Nếu thấy:**
```
❌ user_profiles record MISSING - Trigger did not run!
❌ users record MISSING - Trigger did not run!
```

→ Trigger KHÔNG chạy! Scroll xuống để xem fix.

---

### BƯỚC 2: Create Storage Bucket (1 phút)

**Chạy SQL:**

1. Vẫn trong SQL Editor
2. Copy nội dung file `CREATE_STORAGE_BUCKET.sql`
3. Paste và **RUN**

**Kết quả:**
```
✅ STORAGE BUCKET CREATED!
- Name: avatars
- Public: Yes
- Max size: 5MB
- 5 policies created
```

**Verify:**
Vào **Storage** tab → Phải thấy bucket `avatars`

---

### BƯỚC 3: Fix Missing User Profiles (Nếu cần)

**Nếu Bước 1 cho thấy user_profiles MISSING:**

#### Option A: Trigger Đã Chạy Tự Động (Bước 1)

Script `CHECK_USER_PROFILES.sql` đã tự động tạo profile cho user mới:

```sql
-- Script đã chạy phần này:
INSERT INTO public.user_profiles (id, full_name, avatar_url, ...)
VALUES (user_id, name, avatar, ...)
```

Check lại:
```sql
SELECT * FROM public.user_profiles
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8';
```

Nếu có data → **DONE!** ✅

#### Option B: Manual Fix Nếu Vẫn Empty

```sql
-- Fix for specific user
INSERT INTO public.user_profiles (
  id,
  full_name,
  avatar_url,
  created_at,
  updated_at
)
SELECT
  id,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    email
  ) as full_name,
  raw_user_meta_data->>'avatar_url' as avatar_url,
  NOW(),
  NOW()
FROM auth.users
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8'
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- Also create users record
INSERT INTO public.users (
  id,
  email,
  name,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    email
  ) as name,
  created_at,
  NOW()
FROM auth.users
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, users.name),
  updated_at = NOW();
```

---

### BƯỚC 4: Restart & Test (1 phút)

```bash
# Restart dev server
rd /s /q .next
bun run dev
```

**Test:**
1. Login với Google account mới
2. Check Admin → Users → Phải thấy user mới
3. Upload avatar → Không còn "Bucket not found"

---

## 🎯 VERIFY CHECKLIST

Sau khi fix, verify:

### Database
- [ ] `SELECT * FROM public.users WHERE id = 'e9fd...'` → Có data
- [ ] `SELECT * FROM public.user_profiles WHERE id = 'e9fd...'` → Có data
- [ ] `SELECT * FROM storage.buckets WHERE name = 'avatars'` → Có bucket

### Admin Panel
- [ ] Vào `/admin` → Tab "Người Dùng"
- [ ] Thấy user mới (cutevui403@gmail.com hoặc email Google)
- [ ] Avatar hiển thị (nếu có từ Google)

### Avatar Upload
- [ ] Click upload avatar
- [ ] Chọn file ảnh
- [ ] Upload thành công (không còn "Bucket not found")
- [ ] Ảnh hiển thị ngay

---

## 🐛 TROUBLESHOOTING

### Issue 1: "User profiles vẫn empty sau khi chạy SQL"

**Check trigger:**
```sql
-- Verify trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_complete';
```

**Nếu trigger không tồn tại:**
```sql
-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_complete ON auth.users;

CREATE TRIGGER on_auth_user_created_complete
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_complete();
```

**Test trigger:**
```sql
-- Update user to trigger
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8';

-- Check if profile created
SELECT * FROM public.user_profiles WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8';
```

---

### Issue 2: "Storage bucket tạo nhưng vẫn lỗi"

**Check bucket name in code:**

File cần check: Tìm nơi upload avatar (có thể là `app/profile` hoặc component)

```typescript
// Phải dùng đúng bucket name
const { data, error } = await supabase.storage
  .from('avatars')  // ← Phải đúng tên này
  .upload(`${userId}/avatar.jpg`, file)
```

**Common mistakes:**
```typescript
// ❌ Sai
.from('user-avatars')
.from('avatar')
.from('public/avatars')

// ✅ Đúng
.from('avatars')
```

---

### Issue 3: "Admin panel không thấy users"

**Check API endpoint:**

File: `app/api/admin/users/route.ts`

```typescript
// Query phải join cả 2 tables
const { data } = await supabase
  .from('users')  // hoặc 'user_profiles'
  .select(`
    *,
    user_profiles (*)
  `)
```

**Or direct query:**
```sql
-- Test query trực tiếp
SELECT
  u.id,
  u.email,
  u.name,
  up.full_name,
  up.avatar_url
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;
```

---

## 📊 ROOT CAUSE ANALYSIS

### Tại Sao Trigger Không Chạy?

**Có thể do:**

1. **Trigger chưa được tạo**
   - Migration 016a chưa chạy
   - Hoặc chạy nhưng lỗi

2. **RLS policies block trigger**
   - Trigger dùng SECURITY DEFINER nên OK
   - Nhưng nếu thiếu có thể fail

3. **Function bị lỗi**
   - Check logs: `SELECT * FROM pg_stat_activity`
   - Check errors: `SELECT * FROM pg_stat_statements`

### Tại Sao Storage Bucket Không Tồn Tại?

**Supabase KHÔNG tự động tạo buckets!**

Phải:
1. Tạo qua Dashboard (Storage tab → New bucket)
2. Hoặc qua SQL (script đã có)
3. Set RLS policies cho bucket

---

## 🔄 FULL FLOW SHOULD BE

### Google OAuth Login Flow

```
User clicks "Login with Google"
         ↓
Google OAuth consent
         ↓
Redirect to /auth/callback
         ↓
Supabase creates user in auth.users
         ↓
TRIGGER: on_auth_user_created_complete fires
         ↓
Function: handle_new_user_complete() runs
         ↓
INSERT into public.users (email, name)
         ↓
INSERT into public.user_profiles (full_name, avatar_url)
         ↓
User redirected to /dashboard or /admin
         ↓
Admin panel queries public.users JOIN public.user_profiles
         ↓
✅ User appears in list with avatar
```

**If any step fails:**
- User in auth.users ✅
- But NOT in public.users ❌
- NOT in public.user_profiles ❌
- → Trigger didn't run or failed!

---

## ✅ EXPECTED RESULTS

### After Fix

**Database:**
```sql
SELECT
  au.email,
  u.name,
  up.full_name,
  up.avatar_url,
  CASE
    WHEN u.id IS NULL THEN '❌'
    ELSE '✅'
  END as has_users_record,
  CASE
    WHEN up.id IS NULL THEN '❌'
    ELSE '✅'
  END as has_profile_record
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email LIKE '%cutevui%';

-- Expected:
-- has_users_record: ✅
-- has_profile_record: ✅
```

**Admin Panel:**
- Vào `/admin` → Tab "Người Dùng"
- Thấy tất cả users
- Có avatar (từ Google)
- Có tên (từ Google profile)

**Avatar Upload:**
- No errors
- Ảnh upload thành công
- Hiển thị ngay

---

## 🚀 QUICK START

```bash
# 1. Check data
# Run: CHECK_USER_PROFILES.sql in Supabase SQL Editor

# 2. Create storage
# Run: CREATE_STORAGE_BUCKET.sql

# 3. Restart
rd /s /q .next && bun run dev

# 4. Test
# Login Google → Check admin panel → Upload avatar

# Expected: ALL WORK! ✅
```

---

**CHẠY 2 SQL FILES NGAY:**
1. `CHECK_USER_PROFILES.sql` - Diagnostic + auto-fix
2. `CREATE_STORAGE_BUCKET.sql` - Create bucket

Sau đó restart và test! 🎉
