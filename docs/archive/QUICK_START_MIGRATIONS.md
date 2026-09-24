# 🚀 QUICK START - Run Migrations

## TL;DR - Chạy ngay trong 2 bước:

### Bước 1: Site Branding
```sql
-- Mở Supabase SQL Editor
-- Copy TOÀN BỘ file: lib/migrations/015_site_branding.sql
-- Paste và Click "Run"
```

### Bước 2: Notifications
```sql
-- Copy TOÀN BỘ file: lib/migrations/016_notifications.sql
-- Paste và Click "Run"
```

## ✅ Verify Success

```sql
-- Quick check tất cả tables
SELECT
  'media_library' as table_name,
  COUNT(*) as count
FROM media_library
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'notification_preferences', COUNT(*) FROM notification_preferences;
```

Kết quả mong đợi: 3 rows (count có thể là 0, miễn là không lỗi)

## 🎉 Done!

Migration thành công nếu:
- ✅ Không có error message
- ✅ Query verify ở trên chạy được
- ✅ `/admin` → "Site Branding" tab hiển thị
- ✅ Notification bell xuất hiện ở navbar

## 📝 Nếu Có Lỗi

Đọc file `MIGRATION_FIXES.md` để biết cách fix chi tiết!

---

**Migrations đã được test và fix để tương thích với Supabase schema hiện tại của bạn!**
