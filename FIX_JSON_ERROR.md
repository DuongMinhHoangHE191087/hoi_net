# 🔧 Fix Lỗi JSON - site_settings Table

## ❌ Lỗi Gặp Phải

```
ERROR: 22P02: invalid input syntax for type json
LINE 305: ('mission', 'Khôi phục và bảo tồn...
Token "Khôi" is invalid.
```

## 🎯 Nguyên Nhân

File migration `011_complete_system_upgrade.sql` có vấn đề với bảng `site_settings`. PostgreSQL đang cố parse giá trị TEXT như JSON.

## ✅ Giải Pháp

### Option 1: Chạy Migration Đơn Giản (Khuyến Nghị)

**Chỉ thêm avatar upload, không động đến các bảng khác:**

```bash
# Trong Supabase Dashboard → SQL Editor
# Copy và paste file này:
database/migrations/SIMPLE_AVATAR_ONLY.sql
```

File này chỉ:
- ✅ Thêm column `avatar` vào `team_members`
- ✅ Thêm column `avatar_url` vào `user_profiles`
- ✅ KHÔNG động đến `site_settings` hay bảng khác

### Option 2: Fix Lỗi site_settings

Nếu bạn muốn fix lỗi site_settings:

```bash
# Chạy file fix này trước:
database/migrations/013_fix_site_settings_json_error.sql
```

## 🚀 Sau Khi Chạy Migration

### Kiểm Tra

```sql
-- Kiểm tra column đã được thêm
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'team_members'
AND column_name = 'avatar';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'avatar_url';
```

Kết quả mong đợi:
```
column_name | data_type
------------+----------
avatar      | text
avatar_url  | text
```

### Test Upload Avatar

1. Chạy dev server:
```bash
npm run dev
```

2. Truy cập admin panel:
```
http://localhost:3000/admin
```

3. Test upload:
   - Tab **Đội Ngũ** → **Thêm Thành Viên** → Upload ảnh test
   - Tab **Người Dùng** → Chọn user → **Sửa hồ sơ** → Upload avatar

## 📝 Tóm Tắt Files Migration

### File Gốc (Có Lỗi)
- `011_complete_system_upgrade.sql` - File gốc có lỗi JSON

### File Fix Lỗi
- `013_fix_site_settings_json_error.sql` - Fix lỗi site_settings

### File Đơn Giản (Khuyến Nghị)
- `SIMPLE_AVATAR_ONLY.sql` - Chỉ thêm avatar, không lỗi

### File Avatar Đầy Đủ
- `012_admin_panel_avatar_upgrade.sql` - Full migration với RLS policies

## 🎯 Khuyến Nghị

**Chạy theo thứ tự:**

1. Chạy `SIMPLE_AVATAR_ONLY.sql` để có ngay tính năng upload avatar
2. Nếu cần fix các bảng khác, chạy `013_fix_site_settings_json_error.sql`
3. Sau đó có thể chạy `012_admin_panel_avatar_upgrade.sql` để có RLS policies

## ✅ Verification

Sau khi chạy migration thành công, bạn sẽ thấy:

```
✅ Added avatar column to team_members
✅ Added avatar_url column to user_profiles

🎉 Avatar upload feature is ready!

📝 Next steps:
1. Go to /admin panel
2. Tab "Đội Ngũ" → Upload avatar for team members
3. Tab "Người Dùng" → Edit profile → Upload avatar

✨ Features:
- Upload from computer
- Auto resize to 500x500px
- Smart crop (face detection)
- Thumbnails: 150x150 and 50x50
- Max size: 5MB
- Formats: JPG, PNG, WEBP
```

## 🐛 Troubleshooting

### Nếu vẫn gặp lỗi JSON:

```sql
-- Reset site_settings table
DROP TABLE IF EXISTS public.site_settings CASCADE;

-- Chạy lại migration 013
```

### Nếu column đã tồn tại:

```sql
-- Check existing columns
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('team_members', 'user_profiles')
ORDER BY table_name, column_name;
```

Nếu column đã có rồi → Bỏ qua migration, test trực tiếp upload avatar.

## 🎉 Kết Luận

Lỗi JSON **không ảnh hưởng** đến tính năng upload avatar. Bạn có thể:

1. **Bỏ qua lỗi** và chạy `SIMPLE_AVATAR_ONLY.sql`
2. Hoặc **fix lỗi** với `013_fix_site_settings_json_error.sql`

Cả hai cách đều cho phép bạn sử dụng upload avatar ngay! 🚀
