# Database Migrations

## ⚠️ Lỗi "policy already exists"?

Nếu bạn gặp lỗi `policy "Anyone can read active features" for table "features" already exists`, làm theo các bước sau:

### Giải pháp 1: Cleanup và chạy lại (Khuyến nghị)

1. **Chạy cleanup script trước:**
   - Mở SQL Editor trong Supabase Dashboard
   - Copy toàn bộ nội dung file `CLEANUP_features.sql`
   - Run để xóa bảng features cũ

2. **Sau đó chạy migration chính:**
   - Copy toàn bộ nội dung file `003_features_and_team_fixes.sql`
   - Run để tạo mới hoàn toàn

### Giải pháp 2: Tạo features thủ công (Nếu cleanup không hoạt động)

Nếu vẫn gặp lỗi, bỏ qua migration và làm thủ công:

1. **Tạo bảng features trong Supabase Dashboard:**
   - Table Editor → New Table
   - Table name: `features`
   - Thêm các columns sau:

   | Column | Type | Settings |
   |--------|------|----------|
   | id | uuid | Primary Key, Default: gen_random_uuid() |
   | title | text | Required |
   | description | text | Required |
   | icon_type | text | Required, Default: 'lucide' |
   | icon_value | text | Required |
   | display_order | int4 | Required, Default: 0 |
   | is_active | bool | Required, Default: true |
   | created_at | timestamptz | Default: now() |
   | updated_at | timestamptz | Default: now() |

2. **Bật RLS và tạo policies:**
   ```sql
   ALTER TABLE features ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Enable read access for all users" ON features
     FOR SELECT USING (true);

   CREATE POLICY "Enable all access for authenticated users" ON features
     FOR ALL USING (auth.role() = 'authenticated');
   ```

3. **Insert dữ liệu mẫu:**
   ```sql
   INSERT INTO features (title, description, icon_type, icon_value, display_order, is_active)
   VALUES
     ('Khôi Phục Ảnh Bằng AI', 'Sử dụng công nghệ AI tiên tiến để khôi phục ảnh cũ, phai màu, hư hỏng một cách hoàn hảo.', 'lucide', 'Sparkles', 0, true),
     ('Ghép Ảnh Gia Đình', 'Ghép ảnh của bạn vào các bức ảnh gia đình một cách tự nhiên và chuyên nghiệp.', 'lucide', 'ImagePlus', 1, true),
     ('Tăng Cường Độ Phân Giải', 'Nâng cao độ phân giải ảnh lên 4K/8K với công nghệ AI upscaling hiện đại.', 'lucide', 'TrendingUp', 2, true),
     ('Xử Lý Nhanh Chóng', 'Nhận kết quả trong vài phút với hệ thống xử lý AI tốc độ cao.', 'lucide', 'Zap', 3, true),
     ('Màu Sắc Tự Nhiên', 'Tô màu tự động cho ảnh đen trắng với độ chính xác cao, màu sắc tự nhiên.', 'lucide', 'Palette', 4, true),
     ('Loại Bỏ Nhiễu & Vết', 'Tự động phát hiện và loại bỏ nhiễu, vết xước, vết bẩn trên ảnh cũ.', 'lucide', 'Filter', 5, true),
     ('Dễ Dàng Sử Dụng', 'Giao diện đơn giản, chỉ cần tải ảnh lên và AI làm phần còn lại.', 'lucide', 'Users', 6, true),
     ('Bảo Mật Tuyệt Đối', 'Ảnh của bạn được mã hóa và bảo vệ an toàn, tự động xóa sau khi xử lý.', 'lucide', 'Shield', 7, true);
   ```

4. **Sửa bảng team_members (nếu cần):**
   ```sql
   ALTER TABLE team_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
   ```

## Cách Chạy Migrations Bình Thường

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of the migration file
5. Click **Run** to execute the migration

### Option 2: Supabase CLI

```bash
# Make sure Supabase CLI is installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push database changes
supabase db push
```

## Migration Files

### 003_features_and_team_fixes.sql

This migration:
- Creates the `features` table for dynamic features management
- Adds `avatar_url` column to `team_members` table
- Sets up Row Level Security (RLS) policies
- Inserts 12 default features data (8 active, 4 inactive)
- Creates indexes for better performance

**Run this migration immediately** to fix the current errors with:
- Features API (500 error)
- Team members API (avatar_url missing)

### CLEANUP_features.sql

Use this ONLY if you encounter errors with existing policies or tables.
This will drop the features table and all dependencies, allowing you to start fresh.

### After Running the Migration

1. Reload your application
2. Go to Admin Panel > Tính Năng tab
3. You should see 8 active features + 4 inactive features
4. You can now add, edit, or delete features
5. Upload image icons for features
6. Choose from 57 Lucide icons

## Troubleshooting

### Error: "policy already exists"
- Use `CLEANUP_features.sql` to remove the table
- Then run `003_features_and_team_fixes.sql` again

### Error: "permission denied"
- Make sure you're logged in as the project owner
- Check that RLS policies are properly applied
- Verify your service role key is set in `.env.local`

### Table already exists but empty
- Just run the INSERT statements from the migration
- Or manually add features through Admin Panel

### Features not showing on homepage
- Check that `is_active = true` for features you want to display
- Reload the page (hard refresh: Ctrl+Shift+R)
- Check browser console for errors
