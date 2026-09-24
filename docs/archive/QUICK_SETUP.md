# 🎯 HƯỚNG DẪN SETUP DATABASE NHANH

## 📋 Các Bước Thực Hiện

### 1️⃣ Tạo Project Supabase

1. Truy cập: https://supabase.com
2. Đăng nhập/Đăng ký
3. Click **"New Project"**
4. Điền thông tin:
   - Name: `WEB-SSG`
   - Password: (Lưu lại)
   - Region: `Southeast Asia (Singapore)`
5. Đợi 2-3 phút để project được tạo

### 2️⃣ Lấy API Keys

1. Vào **Settings** → **API**
2. Copy 2 giá trị:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Cập nhật file `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3️⃣ Chạy Database Script

1. Vào **SQL Editor** trong Supabase
2. Click **"New Query"**
3. Copy **TOÀN BỘ** nội dung file `database-complete-setup.sql`
4. Paste vào SQL Editor
5. Click **"Run"** (hoặc `Ctrl + Enter`)
6. Đợi 5-10 giây
7. Thấy thông báo ✅ là thành công!

### 4️⃣ Kiểm Tra Database

Vào **Table Editor**, bạn sẽ thấy 7 tables:

- ✅ `users`
- ✅ `requests`
- ✅ `blog_posts` (có 3 bài mẫu)
- ✅ `team_members` (có 4 người)
- ✅ `feedback`
- ✅ `site_settings` (có 6 settings)
- ✅ `value_sections` (có 3 sections)

### 5️⃣ Chạy Ứng Dụng

```bash
npm run dev
```

Truy cập:
- Trang chủ: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## 📊 Dữ Liệu Có Sẵn

### Blog Posts (3 bài)
1. "Công Nghệ AI Trong Khôi Phục Ảnh"
2. "Hướng Dẫn Ghép Ảnh Gia Đình"
3. "5 Mẹo Bảo Quản Ảnh Cũ"

### Team Members (4 người)
1. Nguyễn Văn A - CEO & Founder
2. Trần Thị B - CTO
3. Lê Văn C - Lead Developer
4. Phạm Thị D - UI/UX Designer

### Value Sections (3 phần)
1. Sứ Mệnh
2. Tầm Nhìn
3. Giá Trị Cốt Lõi

### Site Settings (6 cài đặt)
- Mission
- Vision
- About
- Company Name
- Email
- Phone

---

## ⚙️ Quản Lý Từ Admin Panel

Truy cập `/admin` để quản lý:

| Tab | Chức năng |
|-----|-----------|
| **Yêu Cầu** | Xem yêu cầu khôi phục/ghép ảnh |
| **Blog** | Tạo/sửa/xóa bài viết |
| **Đội Ngũ** | Quản lý thành viên |
| **Giá Trị** | Sửa sứ mệnh/tầm nhìn |
| **Phản Hồi** | Xem feedback khách hàng |
| **Cài Đặt** | Cập nhật thông tin website |

---

## 🐛 Xử Lý Lỗi

### Lỗi: "relation does not exist"
➡️ Chưa chạy SQL script. Làm lại bước 3.

### Lỗi: "Invalid API key"
➡️ Kiểm tra lại `.env.local`, đảm bảo:
- URL đúng
- Anon key đúng
- Restart dev server: `npm run dev`

### Không kết nối được
➡️ Kiểm tra:
1. Internet connection
2. Supabase project đã chạy chưa
3. File `.env.local` có đúng vị trí không (root folder)

### Database trống
➡️ Vào Table Editor, check từng table xem có data không. Nếu không có, chạy lại phần INSERT trong SQL script.

---

## 📚 Chi Tiết Hơn

Xem file `SUPABASE_SETUP.md` để có hướng dẫn chi tiết về:
- Cấu trúc database
- Row Level Security
- Admin policies
- Thêm data mới

---

## ✅ Hoàn Thành!

Sau khi setup xong, bạn có thể:

1. ✏️ Chỉnh sửa tất cả nội dung từ Admin Panel
2. 📝 Thêm/xóa blog posts
3. 👥 Quản lý team members
4. 🎯 Tùy chỉnh sứ mệnh/tầm nhìn
5. ⚙️ Cập nhật settings website

**Không cần code nữa, chỉ cần dùng Admin Panel! 🎉**
