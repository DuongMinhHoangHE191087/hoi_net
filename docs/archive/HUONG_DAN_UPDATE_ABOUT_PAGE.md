# Hướng Dẫn Cập Nhật Nội Dung Trang "Về Chúng Tôi"

## Tổng Quan

Đã hoàn thành việc làm lại nội dung trang "Về Chúng Tôi" với các cải tiến sau:

### ✅ Những gì đã hoàn thành:

1. **Database Schema** - Đã có sẵn table `about_sections` với đầy đủ fields
2. **Database Functions** - Đã có sẵn các functions trong `lib/supabase.ts`:
   - `getAboutSections()` - Lấy sections active
   - `getAllAboutSections()` - Lấy tất cả sections
   - `createAboutSection()` - Tạo section mới
   - `updateAboutSection()` - Cập nhật section
   - `deleteAboutSection()` - Xóa section

3. **Admin Interface** - Component `AdminAbout` đã có đầy đủ chức năng:
   - Thêm/sửa/xóa sections
   - Sắp xếp thứ tự hiển thị
   - Ẩn/hiện sections
   - Upload hình ảnh
   - Chọn vị trí hình ảnh (trái/phải)

4. **UI Improvements**:
   - Cải thiện responsive design
   - Thêm support cho markdown đơn giản (bold, bullet points)
   - Cải thiện typography và spacing
   - Tối ưu SEO metadata

5. **Content** - Tạo file SQL với nội dung chất lượng cao hơn:
   - Sứ mệnh: Bảo tồn ký ức, kết nối thế hệ
   - Tầm nhìn: Dẫn đầu công nghệ khôi phục ảnh AI tại Việt Nam
   - Giá trị cốt lõi: 5 giá trị chính
   - Công nghệ: Giới thiệu về AI/ML được sử dụng

## Cách Cập Nhật Database

### Bước 1: Chạy SQL Script

Truy cập Supabase Dashboard và chạy file:
```
database/update_about_content.sql
```

Hoặc có thể chạy trực tiếp SQL sau trong Supabase SQL Editor:

```sql
-- Xóa dữ liệu cũ
TRUNCATE TABLE about_sections CASCADE;

-- Import dữ liệu mới từ file update_about_content.sql
-- (Copy nội dung từ file và paste vào SQL Editor)
```

### Bước 2: Verify Data

Kiểm tra dữ liệu đã được import:
```sql
SELECT id, title, display_order, is_active FROM about_sections ORDER BY display_order;
```

### Bước 3: Chỉnh Sửa Nội Dung qua Admin

1. Đăng nhập vào Admin Panel: `/admin`
2. Chọn tab "Về Chúng Tôi"
3. Tại đây bạn có thể:
   - Chỉnh sửa tiêu đề, tiêu đề phụ, mô tả
   - Thay đổi hình ảnh
   - Sắp xếp lại thứ tự
   - Ẩn/hiện các sections
   - Thêm sections mới

## Cấu Trúc Content

### Format Mô Tả
Mô tả hỗ trợ các format sau:

1. **Text in đậm**: Sử dụng `**text**`
   ```
   **Chất lượng là ưu tiên hàng đầu** - Giải thích...
   ```

2. **Bullet points**: Sử dụng `•` ở đầu dòng
   ```
   • Điểm thứ nhất
   • Điểm thứ hai
   • Điểm thứ ba
   ```

3. **Đoạn văn**: Ngăn cách bằng dòng trống (2 xuống dòng)
   ```
   Đoạn văn thứ nhất.

   Đoạn văn thứ hai.
   ```

### Hình Ảnh

- Sử dụng URL từ Unsplash hoặc upload lên Media Library
- Khuyến nghị kích thước: 800x600px hoặc lớn hơn
- Format: JPG, PNG (tối ưu cho web)

## Tính Năng Admin

### Quản Lý Sections

1. **Thêm Section Mới**:
   - Điền tiêu đề (bắt buộc)
   - Điền tiêu đề phụ (tùy chọn)
   - Điền mô tả chi tiết (bắt buộc)
   - Nhập URL hình ảnh hoặc để trống
   - Chọn vị trí hình (trái/phải)
   - Click "Thêm Mới"

2. **Chỉnh Sửa Section**:
   - Click nút "Sửa" trên section cần chỉnh sửa
   - Form sẽ load dữ liệu hiện tại
   - Chỉnh sửa và click "Cập Nhật"

3. **Sắp Xếp Thứ Tự**:
   - Dùng nút mũi tên lên/xuống bên phải mỗi section
   - Thứ tự sẽ được lưu tự động

4. **Ẩn/Hiện Section**:
   - Click nút "Ẩn" hoặc "Hiện"
   - Section ẩn sẽ không hiển thị trên trang About

5. **Xóa Section**:
   - Click nút "Xóa"
   - Xác nhận trong popup
   - Lưu ý: Xóa vĩnh viễn, không thể khôi phục

## Deploy lên Vercel

### Chuẩn Bị

1. Đảm bảo database đã được cập nhật với content mới
2. Test local bằng `npm run dev`
3. Build thành công: `npm run build`

### Deploy

```bash
# Commit changes
git add .
git commit -m "feat: Improve About page content and UI

- Add high-quality content for mission, vision, values
- Improve responsive design
- Add markdown support for descriptions
- Enhance SEO metadata
- Optimize UI/UX"

# Push to main branch
git push origin main
```

Vercel sẽ tự động detect và deploy changes.

### Kiểm Tra Sau Deploy

1. Truy cập trang `/about` trên production
2. Kiểm tra responsive trên mobile/tablet
3. Verify tất cả sections hiển thị đúng
4. Kiểm tra images load correctly
5. Test admin panel `/admin` tab "Về Chúng Tôi"

## Troubleshooting

### Sections không hiển thị

1. Kiểm tra `is_active = true` trong database
2. Verify API calls trong DevTools Network tab
3. Check console errors

### Hình ảnh không load

1. Verify URL hình ảnh hợp lệ
2. Check CORS settings nếu dùng external images
3. Thử upload vào Media Library thay vì dùng external URL

### Lỗi khi chỉnh sửa trong Admin

1. Check authentication - đảm bảo đăng nhập với tài khoản admin
2. Verify Supabase RLS policies cho table `about_sections`
3. Check browser console cho error details

## Files Đã Thay Đổi

```
modified:   app/about/page.tsx
modified:   app/about/AboutPageClient.tsx
modified:   components/sections/AboutSections.tsx
modified:   lib/supabase.ts (đã có sẵn functions)
modified:   hooks/useOptimizedQuery.ts (fix import path)
modified:   lib/query-optimizer.ts (fix iterator issue)
new file:   database/update_about_content.sql
```

## Tóm Tắt

✅ Tất cả đã sẵn sàng để deploy
✅ Admin có thể tự chỉnh sửa content mà không cần code
✅ UI responsive và đẹp mắt
✅ SEO optimized
✅ Build thành công không lỗi

Chúc bạn deploy thành công! 🚀
