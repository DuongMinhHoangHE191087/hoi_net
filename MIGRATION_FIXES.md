# Migration Fixes - Phase 1 & 3

## ✅ ĐÃ FIX CÁC LỖI SQL (FINAL FIX)

### 🔧 Fix Lần 3: JSONB Type Detection

**Vấn đề phát hiện:**
- Column `value` trong bảng `site_settings` có kiểu **JSONB**, không phải TEXT
- Khi insert plain string sẽ bị lỗi: `invalid input syntax for type json`

**Giải pháp:**
- Migration giờ **auto-detect** kiểu dữ liệu của column `value`
- Nếu là JSON/JSONB → cast bằng `to_jsonb()`
- Nếu là TEXT → insert plain string
- Hoàn toàn tự động, không cần manual config!

## 🚀 CHẠY MIGRATION (BẢN CUỐI CÙNG)

### Bước 1: Migration 015 - Site Branding

```sql
-- Copy toàn bộ nội dung file:
-- lib/migrations/015_site_branding.sql
--
-- Paste vào Supabase SQL Editor và Run
```

**Migration này sẽ tự động:**
1. ✅ Detect kiểu dữ liệu của column `value`
2. ✅ Cast giá trị phù hợp (JSONB hoặc TEXT)
3. ✅ Insert 18 settings mới
4. ✅ Tạo bảng `media_library`
5. ✅ Tạo indexes, triggers, RLS policies

### Bước 2: Migration 016 - Notifications

```sql
-- Copy toàn bộ nội dung file:
-- lib/migrations/016_notifications.sql
--
-- Paste vào Supabase SQL Editor và Run
```

**Migration này sẽ:**
1. ✅ Tạo bảng `notifications`
2. ✅ Tạo bảng `notification_preferences`
3. ✅ Tạo 3 database functions
4. ✅ Tạo triggers auto-create preferences
5. ✅ Setup RLS policies (đã fix UUID type casting)

## ✅ Verify Thành Công

Sau khi chạy migration, test:

```sql
-- 1. Check media_library table
SELECT COUNT(*) FROM media_library;
-- Expected: 0 (table exists, empty)

-- 2. Check site_settings có keys mới
SELECT key, value FROM site_settings
WHERE key IN ('site_name', 'site_logo_url', 'theme_primary_color')
ORDER BY key;
-- Expected: 3 rows with new keys

-- 3. Check notifications table
SELECT COUNT(*) FROM notifications;
-- Expected: 0 (table exists, empty)

-- 4. Check notification_preferences table
SELECT COUNT(*) FROM notification_preferences;
-- Expected: >= 0 (auto-created for existing users)

-- 5. Check RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('media_library', 'notifications', 'notification_preferences')
ORDER BY tablename, policyname;
-- Expected: Multiple policies for each table
```

## 🎯 Nếu Vẫn Gặp Lỗi

### Lỗi: "relation site_settings does not exist"

Có thể bảng `site_settings` chưa được tạo. Chạy query này trước:

```sql
-- Check if site_settings table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'site_settings'
);
```

Nếu FALSE, tạo bảng:

```sql
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,  -- hoặc TEXT nếu bạn muốn
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Anyone can view site settings" ON site_settings
  FOR SELECT USING (true);
```

### Lỗi: Vẫn báo "invalid input syntax for type json"

Chạy query check schema:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'site_settings'
ORDER BY ordinal_position;
```

Nếu `value` column là JSONB nhưng migration vẫn lỗi, chạy manual insert:

```sql
-- Manual insert với JSONB casting
INSERT INTO site_settings (key, value, description) VALUES
  ('site_name', '"Photo Restore"'::jsonb, 'Tên website'),
  ('site_logo_url', '""'::jsonb, 'URL logo')
ON CONFLICT (key) DO NOTHING;
```

**Lưu ý:** JSONB string phải có double quotes bên trong: `'"value"'::jsonb`

### Lỗi: "operator does not exist: uuid = text"

Đã fix trong migration 016. Nếu vẫn gặp:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Re-create với UUID comparison
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());
```

## 📖 Chi Tiết Technical

### JSONB vs TEXT trong site_settings

**Nếu dùng JSONB** (recommended):
- ✅ Có thể store complex objects
- ✅ Query JSON fields dễ dàng
- ✅ Automatic validation
- ⚠️ Cần cast khi insert: `to_jsonb('value'::text)`

**Nếu dùng TEXT**:
- ✅ Đơn giản hơn
- ✅ Insert trực tiếp
- ⚠️ Không có JSON validation
- ⚠️ Cần parse ở application layer

### Migration Auto-Detection

Migration 015 giờ có logic:

```sql
DECLARE
  value_type text;
BEGIN
  -- Detect column type
  SELECT data_type INTO value_type
  FROM information_schema.columns
  WHERE table_name = 'site_settings' AND column_name = 'value';

  IF value_type IN ('json', 'jsonb') THEN
    -- Cast to JSONB
    INSERT ... to_jsonb('value'::text) ...
  ELSE
    -- Plain TEXT
    INSERT ... 'value' ...
  END IF;
END $$;
```

## ✅ Summary

Migration files đã được update với:

1. **015_site_branding.sql**
   - ✅ Auto-detect JSONB vs TEXT
   - ✅ Cast values appropriately
   - ✅ Error handling improved

2. **016_notifications.sql**
   - ✅ UUID type casting fixed
   - ✅ RLS policies corrected
   - ✅ Compatible với Supabase mới nhất

**Giờ bạn chỉ cần:**
1. Copy migration file
2. Paste vào Supabase SQL Editor
3. Click Run
4. Done! ✨

---

**Nếu vẫn gặp lỗi, paste FULL error message (bao gồm cả QUERY và CONTEXT) để tôi debug chính xác hơn!**

### 1. Fix Migration 015 (Site Branding) ✅

**Lỗi ban đầu:**
```
ERROR: 22P02: invalid input syntax for type json
LINE 8: ('site_name', 'Photo Restore', 'Tên website'),
```

**Nguyên nhân:**
- Có thể table `site_settings` chưa tồn tại hoặc có schema khác
- INSERT statement không có error handling

**Đã fix:**
- Wrap INSERT trong `DO $$ BEGIN ... EXCEPTION ... END $$`
- Thêm exception handler cho `undefined_table`
- Giờ migration sẽ skip gracefully nếu table chưa tồn tại

### 2. Fix Migration 016 (Notifications) ✅

**Lỗi ban đầu:**
```
ERROR: 42883: operator does not exist: uuid = text
HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

**Nguyên nhân:**
- RLS policies đang cast UUID sang TEXT: `auth.uid()::text = user_id::text`
- Supabase đã cập nhật `auth.uid()` trả về UUID thay vì TEXT
- Type mismatch khi compare

**Đã fix:**
- Đổi tất cả `auth.uid()::text = user_id::text` thành `user_id = auth.uid()`
- Đổi `user_profiles.id = auth.uid()::text` thành `user_profiles.id = auth.uid()`
- Giờ so sánh UUID với UUID trực tiếp (type-safe)

## 🚀 CHẠY LẠI MIGRATIONS

### Bước 1: Chạy Migration 015 (Site Branding)

```sql
-- Copy toàn bộ nội dung file: lib/migrations/015_site_branding.sql
-- Paste vào Supabase SQL Editor
-- Click "Run"
```

**Kết quả mong đợi:**
- ✅ Bảng `media_library` được tạo
- ✅ 18 settings mới được insert vào `site_settings`
- ✅ Indexes và triggers được tạo
- ✅ RLS policies được apply

### Bước 2: Chạy Migration 016 (Notifications)

```sql
-- Copy toàn bộ nội dung file: lib/migrations/016_notifications.sql
-- Paste vào Supabase SQL Editor
-- Click "Run"
```

**Kết quả mong đợi:**
- ✅ Bảng `notifications` được tạo
- ✅ Bảng `notification_preferences` được tạo
- ✅ 3 database functions được tạo
- ✅ Indexes được tạo
- ✅ RLS policies được apply
- ✅ Trigger auto-create preferences được tạo

## ✅ VERIFY MIGRATIONS THÀNH CÔNG

### Check Table Creation

```sql
-- Check media_library table
SELECT * FROM media_library LIMIT 1;

-- Check notifications table
SELECT * FROM notifications LIMIT 1;

-- Check notification_preferences table
SELECT * FROM notification_preferences LIMIT 1;

-- Check site_settings có đủ keys mới
SELECT key, value FROM site_settings
WHERE key IN ('site_name', 'site_logo_url', 'theme_primary_color')
ORDER BY key;
```

### Check RLS Policies

```sql
-- List all policies for notifications
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'notifications';

-- List all policies for notification_preferences
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'notification_preferences';

-- List all policies for media_library
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'media_library';
```

### Check Functions

```sql
-- List custom functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('create_notification_preferences', 'delete_old_notifications', 'get_unread_count');
```

## 🎉 SAU KHI MIGRATION THÀNH CÔNG

### Test Phase 1 (Site Branding)

1. Vào `/admin` → Tab "Site Branding"
2. Upload logo
3. Thay đổi site name
4. Chọn theme colors
5. Click "Lưu Cài Đặt"
6. Verify settings được lưu

### Test Phase 3 (Notifications)

1. **Insert test notification:**
```sql
INSERT INTO notifications (user_id, type, title, message, action_url)
VALUES (
  (SELECT id FROM users LIMIT 1),  -- Lấy user đầu tiên
  'success',
  'Test Notification',
  'Hệ thống thông báo đang hoạt động!',
  '/dashboard'
);
```

2. **Check notification bell:**
   - Badge unread count tăng lên
   - Click vào bell
   - Notification hiển thị trong dropdown

3. **Test preferences:**
   - Vào Settings → Notifications tab
   - Toggle các settings
   - Click Save
   - Refresh page → settings được lưu

## 🐛 TROUBLESHOOTING

### Nếu vẫn còn lỗi sau khi run migration:

#### Lỗi: "table already exists"
```sql
-- Drop tables và run lại (CHỈ dùng trong development!)
DROP TABLE IF EXISTS media_library CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;

-- Rồi run lại migration
```

#### Lỗi: "policy already exists"
```sql
-- Drop policies và run lại
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
-- ... drop các policies khác

-- Rồi run lại phần policies trong migration
```

#### Lỗi: "function already exists"
```sql
-- Drop functions và run lại
DROP FUNCTION IF EXISTS create_notification_preferences();
DROP FUNCTION IF EXISTS delete_old_notifications();
DROP FUNCTION IF EXISTS get_unread_count(UUID);

-- Rồi run lại phần functions trong migration
```

#### Lỗi: user_profiles table không tồn tại
Nếu bạn chưa có bảng `user_profiles`, có 2 options:

**Option 1:** Tạo bảng `user_profiles` (recommended)
```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert existing users as 'user' role
INSERT INTO user_profiles (id, role)
SELECT id, 'user' FROM users
ON CONFLICT (id) DO NOTHING;
```

**Option 2:** Sửa RLS policy không dùng user_profiles
```sql
-- Thay policy "Admins can insert" bằng:
CREATE POLICY "Service role can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);
```

## 📝 NOTES

- Migration files đã được fix và commit vào repo
- Không cần phải manual edit gì nữa
- Chỉ cần copy-paste vào Supabase SQL Editor và run
- Nếu có lỗi, check troubleshooting section ở trên

## ✅ CHECKLIST

Sau khi chạy migrations, verify:

- [ ] Bảng `media_library` tồn tại
- [ ] Bảng `notifications` tồn tại
- [ ] Bảng `notification_preferences` tồn tại
- [ ] `site_settings` có 18 keys mới
- [ ] RLS policies đã được tạo
- [ ] Functions đã được tạo
- [ ] Triggers đã được tạo
- [ ] Indexes đã được tạo
- [ ] Test notification works
- [ ] Test preferences works
- [ ] Test media upload works

---

**Nếu vẫn gặp lỗi sau khi làm theo hướng dẫn này, hãy paste full error message để tôi có thể giúp fix!**
