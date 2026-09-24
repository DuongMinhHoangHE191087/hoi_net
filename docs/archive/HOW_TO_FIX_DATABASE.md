# 🚨 FIX LỖI DATABASE - HOÀN CHỈNH

## Lỗi Gặp Phải:
1. ❌ `column "request_type" does not exist` - Index sai tên cột
2. ❌ `Could not find the 'original_images' column` - Thiếu cột images

---

## ✅ CÁCH SỬA (1 BƯỚC DUY NHẤT)

### Bước 1: Chạy SQL Này Trong Supabase

1. **Vào Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Chọn project
   - Click "SQL Editor"

2. **Copy toàn bộ SQL bên dưới và chạy:**

```sql
-- ============================================
-- COMPLETE FIX: user_requests table
-- Fixes: Missing columns + Wrong index names
-- ============================================

-- Add missing columns
ALTER TABLE user_requests
ADD COLUMN IF NOT EXISTS original_images TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS restored_images TEXT[],
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Drop old wrong indexes
DROP INDEX IF EXISTS idx_user_requests_type;

-- Create correct indexes
CREATE INDEX IF NOT EXISTS idx_user_requests_user_status
ON user_requests(user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_requests_created
ON user_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_requests_status
ON user_requests(status);

CREATE INDEX IF NOT EXISTS idx_user_requests_user_created
ON user_requests(user_id, created_at DESC);

-- FIXED: Use correct column name 'type' (not 'request_type')
CREATE INDEX IF NOT EXISTS idx_user_requests_type
ON user_requests(type);

-- Add documentation
COMMENT ON COLUMN user_requests.original_images IS 'Array of Cloudinary URLs for original images';
COMMENT ON COLUMN user_requests.restored_images IS 'Array of Cloudinary URLs for restored images';

-- Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_requests'
ORDER BY column_name;
```

3. **Click "Run"**

4. **Kiểm tra kết quả cuối cùng phải có:**
   ```
   ✅ admin_id
   ✅ admin_notes
   ✅ completed_at
   ✅ created_at
   ✅ description
   ✅ id
   ✅ original_images  ← QUAN TRỌNG
   ✅ restored_images  ← QUAN TRỌNG
   ✅ status
   ✅ type             ← Tên đúng (không phải request_type)
   ✅ updated_at
   ✅ user_id
   ```

---

### Bước 2: Rebuild & Test

```bash
cd D:\GITHUB\WEB-SSG

# Clear cache
rmdir /s /q .next

# Rebuild
npm run build

# Run dev
npm run dev
```

**Test tại:** http://localhost:3000/requests/new

1. Upload 1-2 ảnh
2. Click "Gửi yêu cầu"
3. ✅ Phải thành công, KHÔNG còn lỗi!

---

## 📝 Vấn Đề Là Gì?

### Lỗi 1: Index sai tên cột
```sql
❌ ON user_requests(request_type)  -- Cột này không tồn tại
✅ ON user_requests(type)           -- Cột đúng
```

### Lỗi 2: Thiếu cột images
Bảng `user_requests` chưa có:
- `original_images` - Lưu URLs ảnh gốc từ Cloudinary
- `restored_images` - Lưu URLs ảnh đã xử lý

---

## ✅ Sau Khi Chạy SQL

**Upload flow hoạt động:**
```
Browser → Cloudinary Upload → Get URLs → Insert to Database
                                           ↓
                                   original_images: [
                                     "https://res.cloudinary.com/...",
                                     "https://res.cloudinary.com/..."
                                   ]
```

**Database nhẹ, scalable, performant!** 🚀

---

## 🎯 Checklist

- [ ] SQL chạy thành công trong Supabase
- [ ] Thấy cột `original_images` và `restored_images`
- [ ] Build lại không lỗi
- [ ] Upload test thành công
- [ ] Không còn lỗi console

---

**File SQL đầy đủ:** `FIX_USER_REQUESTS_COMPLETE.sql`

**Chỉ cần chạy 1 lần là xong tất cả!**
