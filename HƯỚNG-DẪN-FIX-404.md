# 🚨 FIX LỖI 404 - MISSING DATABASE TABLES

## Lỗi hiện tại

```
GET http://localhost:3000/ 404 (Not Found)
```

**Nguyên nhân**: App đang thiếu 3 bảng quan trọng trong Supabase database:
- ❌ `blog_posts` - Bảng blog posts
- ❌ `team_members` - Bảng team members
- ❌ `value_sections` - Bảng mission/vision/values

## ✅ Cách fix (3 phút)

### Bước 1: Mở Supabase SQL Editor

1. Truy cập: https://supabase.com/dashboard
2. Chọn project: `jfnexrrdygcxgizzpyxc`
3. Click **SQL Editor** (thanh bên trái)
4. Click **New Query**

### Bước 2: Chạy SQL Migration

1. Mở file: `FIX-ALL-DATABASE-TABLES.sql`
2. Copy **TOÀN BỘ** nội dung (Ctrl+A → Ctrl+C)
3. Paste vào Supabase SQL Editor
4. Click **Run** (hoặc nhấn Ctrl+Enter)

### Bước 3: Kiểm tra kết quả

Bạn sẽ thấy:
```
✅ blog_posts: 1 row
✅ team_members: 3 rows
✅ value_sections: 3 rows
```

### Bước 4: Restart Dev Server

```bash
# Stop server hiện tại (Ctrl+C)
npm run dev
```

### Bước 5: Mở trình duyệt

Truy cập: http://localhost:3000

**✅ Trang chủ sẽ hiển thị bình thường!**

## Những gì SQL file tạo ra

### 1. Blog Posts Table
- ✅ Cấu trúc bảng với các cột: title, slug, content, author...
- ✅ Indexes cho truy vấn nhanh
- ✅ Row Level Security (RLS)
- ✅ 1 blog post mẫu

### 2. Team Members Table
- ✅ Cấu trúc bảng: name, role, bio, avatar...
- ✅ 3 thành viên mẫu với ảnh đại diện

### 3. Value Sections Table
- ✅ Cấu trúc bảng: title, description, icon, gradient...
- ✅ 3 sections: Sứ Mệnh, Tầm Nhìn, Giá Trị Cốt Lõi

### 4. Triggers & Functions
- ✅ Auto-update `updated_at` timestamp
- ✅ Permissions cho authenticated & anon users

## Kiểm tra chi tiết

Sau khi chạy migration, kiểm tra các trang:

| Trang | URL | Mô tả |
|-------|-----|-------|
| 🏠 Trang chủ | `/` | Hiển thị value sections & team |
| 📝 Blog | `/blog` | Danh sách blog posts |
| 👥 Team | `/about` | Team members |
| 🎯 Admin | `/admin` | Admin panel |

## Troubleshooting

### Lỗi: "relation already exists"
✅ **OK!** Bảng đã tồn tại, bỏ qua lỗi này

### Lỗi: "permission denied"
❌ Đảm bảo bạn đăng nhập đúng account owner trong Supabase

### Vẫn thấy 404 sau khi chạy SQL?
1. Xóa folder `.next`: `rm -rf .next` (Windows: `rmdir /s .next`)
2. Restart dev server: `npm run dev`
3. Hard refresh trình duyệt: `Ctrl+Shift+R`

### Dev server không khởi động được?
```bash
# Kill process đang chạy port 3000
npx kill-port 3000

# Restart
npm run dev
```

## Xác nhận database đã OK

Vào Supabase Dashboard → Table Editor → Kiểm tra:
- ✅ `blog_posts` có 1 row
- ✅ `team_members` có 3 rows
- ✅ `value_sections` có 3 rows

---

## Tại sao lỗi này xảy ra?

App Next.js đang cố **prerender** các trang tĩnh (SSG) nhưng không có dữ liệu từ database. Khi build/dev, nó gặp lỗi:

```
Error loading data: {
  code: 'PGRST205',
  message: "Could not find the table 'public.blog_posts' in the schema cache"
}
```

→ Dẫn đến trang trả về 404.

Sau khi tạo bảng, app sẽ fetch được data và render bình thường! 🎉

---

**Sau khi hoàn thành**, trang web sẽ hoạt động 100%!
