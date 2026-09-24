# 🚀 Hướng Dẫn Setup Database Supabase

## Bước 1: Tạo Project trên Supabase

1. Truy cập [supabase.com](https://supabase.com)
2. Đăng nhập hoặc tạo tài khoản mới
3. Click "New Project"
4. Điền thông tin:
   - **Project Name**: WEB-SSG
   - **Database Password**: (Lưu password này lại)
   - **Region**: Southeast Asia (Singapore) - gần Việt Nam nhất
5. Click "Create new project" và đợi vài phút

## Bước 2: Lấy Environment Variables

1. Trong project Supabase, vào **Settings** > **API**
2. Copy các giá trị sau:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Cập nhật file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Bước 3: Tạo Database Tables

1. Trong project Supabase, vào **SQL Editor**
2. Click **New Query**
3. Copy toàn bộ nội dung từ file `lib/supabase-schema.sql` và paste vào
4. Click **Run** hoặc nhấn `Ctrl/Cmd + Enter`

Hoặc chạy từng phần sau:

### Phần 1: Tạo Function và Tables cơ bản

```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Phần 2: Tạo tất cả tables

Chạy toàn bộ SQL từ file `lib/supabase-schema.sql`

## Bước 4: Cấu hình Row Level Security (RLS)

RLS đã được enable trong schema. Để admin có quyền truy cập đầy đủ, bạn cần tạo admin policies:

```sql
-- Admin policies for blog_posts
CREATE POLICY "Admins can do everything on blog_posts" ON blog_posts
  FOR ALL USING (true) WITH CHECK (true);

-- Admin policies for team_members
CREATE POLICY "Admins can do everything on team_members" ON team_members
  FOR ALL USING (true) WITH CHECK (true);

-- Admin policies for value_sections
CREATE POLICY "Admins can do everything on value_sections" ON value_sections
  FOR ALL USING (true) WITH CHECK (true);

-- Admin policies for site_settings
CREATE POLICY "Admins can do everything on site_settings" ON site_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Admin policies for feedback
CREATE POLICY "Admins can view all feedback" ON feedback
  FOR SELECT USING (true);
```

**Lưu ý:** Trong production, bạn nên thêm authentication check cho admin, ví dụ:
```sql
-- Thay vì USING (true), dùng:
USING (auth.jwt() ->> 'role' = 'admin')
```

## Bước 5: Insert Dữ liệu Mẫu

### 5.1 Value Sections (Sứ mệnh, Tầm nhìn, Giá trị)

Đã có trong schema. Hoặc thêm từ Admin Panel:
- Vào `/admin` → Tab "Giá Trị"
- Click "Thêm Mới"

### 5.2 Team Members (Đội ngũ)

```sql
INSERT INTO team_members (name, role, bio, display_order, avatar) VALUES
  ('Nguyễn Văn A', 'CEO & Founder', 'Chuyên gia AI với hơn 10 năm kinh nghiệm', 1, 'https://i.pravatar.cc/300?img=12'),
  ('Trần Thị B', 'CTO', 'Kỹ sư phần mềm senior, chuyên về xử lý ảnh', 2, 'https://i.pravatar.cc/300?img=5'),
  ('Lê Văn C', 'Lead Developer', 'Full-stack developer với expertise về AI/ML', 3, 'https://i.pravatar.cc/300?img=33');
```

### 5.3 Blog Posts (Bài viết)

```sql
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, published) VALUES
  (
    'Công nghệ AI trong Khôi Phục Ảnh',
    'cong-nghe-ai-khoi-phuc-anh',
    'Tìm hiểu cách AI giúp khôi phục những bức ảnh cũ một cách kỳ diệu',
    '<h2>Giới thiệu</h2><p>AI đã thay đổi cách chúng ta khôi phục ảnh...</p>',
    'Nguyễn Văn A',
    true
  ),
  (
    'Hướng dẫn Ghép Ảnh Gia Đình',
    'huong-dan-ghep-anh-gia-dinh',
    'Những bí quyết để có bức ảnh gia đình hoàn hảo',
    '<h2>Chuẩn bị</h2><p>Để ghép ảnh gia đình đẹp, bạn cần...</p>',
    'Trần Thị B',
    true
  );
```

### 5.4 Site Settings (Cài đặt website)

Đã có trong schema. Bạn có thể update:

```sql
UPDATE site_settings SET value = 'Nội dung mới' WHERE key = 'mission';
```

## Bước 6: Kiểm tra Database

Vào **Table Editor** trong Supabase để xem:

- ✅ `users` - Người dùng
- ✅ `requests` - Yêu cầu khôi phục/ghép ảnh
- ✅ `blog_posts` - Bài viết blog
- ✅ `team_members` - Thành viên đội ngũ
- ✅ `feedback` - Phản hồi khách hàng
- ✅ `site_settings` - Cài đặt website
- ✅ `value_sections` - Phần sứ mệnh/tầm nhìn/giá trị

## Bước 7: Test Kết nối

1. Chạy ứng dụng: `npm run dev`
2. Truy cập `http://localhost:3000`
3. Kiểm tra:
   - Trang chủ hiển thị sections từ database
   - Admin panel (`/admin`) có thể quản lý dữ liệu

## 📊 Cấu trúc Database

### Tables và Chức năng

| Table | Mục đích | Có thể chỉnh sửa từ Admin |
|-------|----------|---------------------------|
| `value_sections` | Sứ mệnh, Tầm nhìn, Giá trị | ✅ Có - Tab "Giá Trị" |
| `team_members` | Đội ngũ công ty | ✅ Có - Tab "Đội Ngũ" |
| `blog_posts` | Bài viết blog | ✅ Có - Tab "Blog" |
| `site_settings` | Cài đặt chung | ✅ Có - Tab "Cài Đặt" |
| `feedback` | Phản hồi khách hàng | ✅ Có - Tab "Phản Hồi" |
| `requests` | Yêu cầu dịch vụ | ✅ Có - Tab "Yêu Cầu" |
| `users` | Người dùng hệ thống | ⏳ Cần auth trước |

## 🔒 Bảo mật

### RLS Policies đã có:

- **Public read**: Ai cũng có thể đọc blog posts, team members, value sections
- **User-specific**: Users chỉ có thể xem/sửa data của mình
- **Admin**: Cần thêm admin role để quản lý toàn bộ

### Thêm Admin User (Optional)

```sql
-- Tạo function kiểm tra admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT auth.jwt() ->> 'email') IN ('admin@yourdomain.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🎨 Các Trường Có Thể Tùy Chỉnh

### Value Sections
- ✏️ Tiêu đề (title)
- ✏️ Mô tả (description)
- 🎨 Icon (Target, Eye, Heart, Sparkles, Users, Zap, Star)
- 🌈 Gradient (6 màu khác nhau)
- ⬆️⬇️ Thứ tự hiển thị (display_order)
- 👁️ Hiển thị/Ẩn (is_active)

### Team Members
- ✏️ Tên (name)
- ✏️ Vai trò (role)
- ✏️ Tiểu sử (bio)
- 🖼️ Avatar (avatar URL)
- 🔗 Social links (Twitter, LinkedIn, GitHub)
- ⬆️⬇️ Thứ tự hiển thị (display_order)

### Blog Posts
- ✏️ Tiêu đề (title)
- 🔗 Slug (URL-friendly)
- ✏️ Tóm tắt (excerpt)
- 📝 Nội dung (content - HTML)
- ✍️ Tên tác giả (author_name)
- 🖼️ Ảnh đại diện (featured_image)
- 📅 Xuất bản (published)

### Site Settings
- ✏️ Mission (Sứ mệnh)
- ✏️ Vision (Tầm nhìn)
- ✏️ About (Về chúng tôi)
- ➕ Có thể thêm settings mới

## 🐛 Troubleshooting

### Lỗi "relation does not exist"
→ Chưa chạy schema SQL. Vào SQL Editor và chạy lại.

### Lỗi "permission denied"
→ Check RLS policies. Có thể cần disable RLS tạm thời để test:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Không connect được
→ Kiểm tra lại `.env.local` có đúng URL và key không

### Data không hiển thị
→ Vào Table Editor, check có data trong table không

## 📚 Tài liệu Tham khảo

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

✅ Sau khi hoàn tất, bạn có thể quản lý toàn bộ nội dung website từ Admin Panel tại `/admin`
