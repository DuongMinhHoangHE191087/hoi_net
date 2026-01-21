# Hướng Dẫn Sử Dụng Admin Panel - Upload Avatar & Quản Lý Thành Viên

## 🎯 Tổng Quan

Hệ thống admin panel đã được nâng cấp với các tính năng mới:
- ✅ Upload avatar/icon từ máy lên Cloudinary
- ✅ Quản lý team members với ảnh đại diện
- ✅ Chỉnh sửa profile người dùng
- ✅ CRUD toàn diện cho members
- ✅ Tối ưu hóa hình ảnh tự động

## 📋 Các Tính Năng Mới

### 1. Upload Avatar cho Team Members

#### Cách sử dụng:
1. Truy cập `/admin` → Tab **Đội Ngũ**
2. Click **Thêm Thành Viên** hoặc **Sửa** thành viên hiện có
3. Trong phần **Avatar**:
   - Click **Tải lên** để chọn ảnh từ máy
   - Hỗ trợ: JPG, PNG, WEBP
   - Kích thước tối đa: 5MB
   - Ảnh sẽ được tự động crop thành hình vuông 500x500px
4. Điền thông tin khác: Tên, Vai trò, Giới thiệu, Social links
5. Click **Lưu**

#### Tính năng tự động:
- **Smart Crop**: Tự động cắt ảnh focus vào khuôn mặt
- **Auto Optimize**: Tự động nén và tối ưu hóa chất lượng
- **Multiple Sizes**: Tạo sẵn thumbnail 150x150 và 50x50
- **Format Conversion**: Tự động chuyển đổi sang định dạng tối ưu

### 2. Upload Avatar cho Users

#### Cách sử dụng:
1. Truy cập `/admin` → Tab **Người Dùng**
2. Tìm user cần chỉnh sửa
3. Click **Sửa hồ sơ**
4. Upload avatar tương tự như team members
5. Cập nhật họ tên và số điện thoại
6. Click **Lưu**

### 3. Quản Lý Team Members (CRUD)

#### Create - Tạo mới:
```
Admin Panel → Đội Ngũ → Thêm Thành Viên
```
- **Tên*** (bắt buộc): Nguyễn Văn A
- **Vai trò*** (bắt buộc): CEO / Giám đốc / Nhà sáng lập
- **Giới thiệu**: Mô tả ngắn gọn
- **Avatar**: Upload ảnh từ máy
- **Social Links**: Twitter, LinkedIn, GitHub

#### Read - Xem danh sách:
```
Admin Panel → Đội Ngũ
```
- Hiển thị tất cả thành viên
- Xem avatar, tên, vai trò
- Thứ tự hiển thị theo display_order

#### Update - Cập nhật:
```
Đội Ngũ → Click icon Edit → Chỉnh sửa → Lưu
```
- Cập nhật mọi thông tin
- Thay đổi avatar
- Sửa social links

#### Delete - Xóa:
```
Đội Ngũ → Click icon Trash → Xác nhận
```
- Xóa vĩnh viễn khỏi database
- Có popup xác nhận trước khi xóa

### 4. Quản Lý Users

#### Các chức năng:
- **Sửa hồ sơ**: Upload avatar, cập nhật tên, SĐT
- **Phân quyền**: user / moderator / admin
- **Reset mật khẩu**: Đặt lại mật khẩu cho user
- **Chặn/Bỏ chặn**: Block user với lý do
- **Tìm kiếm**: Theo tên, email, SĐT
- **Lọc**: Theo role và trạng thái

## 🛠️ Cài Đặt

### Bước 1: Chạy Migration
```bash
# Trong Supabase SQL Editor
psql -f database/migrations/012_admin_panel_avatar_upgrade.sql
```

Hoặc copy và paste nội dung file vào Supabase Dashboard → SQL Editor → Run

### Bước 2: Kiểm tra Cloudinary
Đảm bảo file `.env.local` có:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Bước 3: Test Upload
1. Truy cập `/admin`
2. Tab **Đội Ngũ** → **Thêm Thành Viên**
3. Upload 1 ảnh test
4. Kiểm tra ảnh hiển thị đúng

## 📝 API Endpoints

### Upload Avatar
```typescript
POST /api/upload-avatar

// Request
FormData {
  file: File (image/*, max 5MB)
}

// Response
{
  url: string,           // Main image URL
  public_id: string,     // Cloudinary ID
  format: string,        // jpg, png, webp
  width: number,         // 500
  height: number,        // 500
  thumbnail: string,     // 150x150
  small_thumbnail: string // 50x50
}
```

### Delete Avatar
```typescript
DELETE /api/upload-avatar

// Request
{
  public_id: string
}

// Response
{
  success: true,
  message: "Đã xóa avatar"
}
```

## 🎨 Component Usage

### AvatarUpload Component

```tsx
import AvatarUpload from '@/components/ui/AvatarUpload'

<AvatarUpload
  label="Avatar"
  currentAvatar={member.avatar}
  onUploadSuccess={(url) => setMember({ ...member, avatar: url })}
  onRemove={() => setMember({ ...member, avatar: '' })}
  size="lg" // 'sm' | 'md' | 'lg'
  required={false}
  uploading={uploading}
  setUploading={setUploading}
/>
```

### Props:
- `currentAvatar`: URL hiện tại (optional)
- `onUploadSuccess`: Callback khi upload thành công
- `onRemove`: Callback khi xóa avatar
- `size`: Kích thước preview ('sm' | 'md' | 'lg')
- `label`: Label hiển thị
- `required`: Có bắt buộc không
- `uploading`: Trạng thái upload (controlled)
- `setUploading`: Set trạng thái upload

## 🔒 Security

### Validation
- File type: Chỉ chấp nhận `image/*`
- File size: Max 5MB
- Authentication: Yêu cầu đăng nhập

### RLS Policies
```sql
-- Team members: Everyone can read, only admins can modify
-- User profiles: Users can update own, admins can update all
```

## 🚀 Best Practices

### 1. Kích thước ảnh
- **Recommended**: 500x500px - 1000x1000px
- **Min**: 200x200px
- **Format**: JPG hoặc PNG
- Cloudinary sẽ tự động optimize

### 2. Upload Flow
```
1. User chọn ảnh
2. Validate file type & size
3. Show preview ngay lập tức
4. Upload to Cloudinary
5. Update database với URL
6. Show success message
```

### 3. Error Handling
- Hiển thị lỗi rõ ràng với toast
- Rollback preview nếu upload thất bại
- Log errors để debug

## 📊 Database Schema

### team_members
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
role            TEXT NOT NULL
bio             TEXT
avatar          TEXT              -- Cloudinary URL
social_links    JSONB DEFAULT '{}'
display_order   INTEGER DEFAULT 0
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### user_profiles
```sql
id          UUID PRIMARY KEY
email       TEXT
full_name   TEXT
phone       TEXT
avatar_url  TEXT  -- Cloudinary URL
role        TEXT  -- user/moderator/admin
is_blocked  BOOLEAN
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

## 🐛 Troubleshooting

### Upload không hoạt động
```bash
# Check Cloudinary credentials
echo $NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY

# Check API endpoint
curl -X POST http://localhost:3000/api/upload-avatar \
  -H "Cookie: ..." \
  -F "file=@test.jpg"
```

### Lỗi 401 Unauthorized
- Kiểm tra đã đăng nhập
- Kiểm tra cookies được gửi đi
- Check `credentials: 'include'` trong fetch

### Lỗi 400 Bad Request
- File quá lớn (>5MB)
- File không phải ảnh
- FormData không đúng format

### Avatar không hiển thị
- Check URL trong database
- Kiểm tra CORS policy
- Verify Cloudinary URL accessible

## 📚 Tài Liệu Tham Khảo

- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## ✅ Checklist Hoàn Thành

- [x] API endpoint upload avatar
- [x] Component AvatarUpload
- [x] Tích hợp vào AdminTeam
- [x] Tích hợp vào AdminUsers
- [x] Database migration
- [x] RLS policies
- [x] Error handling
- [x] Loading states
- [x] Toast notifications
- [x] Tài liệu hướng dẫn

## 🎉 Kết Luận

Hệ thống upload avatar và quản lý members đã hoàn thiện với:
- **Upload dễ dàng**: Kéo thả hoặc click để chọn ảnh
- **Tối ưu tự động**: Cloudinary xử lý resize, crop, optimize
- **UX tốt**: Preview ngay lập tức, loading states rõ ràng
- **Security**: Validation đầy đủ, authentication required
- **Performance**: Thumbnails được tạo sẵn cho mọi kích thước

Chúc bạn sử dụng hiệu quả! 🚀
