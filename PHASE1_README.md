# Phase 1: Site Settings CRUD - Implementation Complete ✅

## Tổng Quan

Phase 1 đã hoàn thành việc nâng cấp backend với hệ thống quản lý Site Settings toàn diện, cho phép admin điều chỉnh mọi thông tin website từ giao diện Admin Panel.

## Các Tính Năng Đã Implement

### 1. Database Schema ✅
- **Migration File**: `lib/migrations/015_site_branding.sql`
- **Bảng mới**: `media_library` - Quản lý tập trung tất cả file uploads
- **Settings mới**: 18 settings mới được thêm vào bảng `site_settings`

**Settings mới bao gồm:**
```
- site_name: Tên website
- site_tagline: Slogan
- site_logo_url: Logo chính
- site_logo_dark_url: Logo dark mode
- site_favicon_url: Favicon
- site_meta_title: SEO title
- site_meta_description: SEO description
- site_meta_keywords: SEO keywords
- site_og_image: Open Graph image
- theme_primary_color: Màu chủ đạo
- theme_secondary_color: Màu phụ
- google_analytics_id: GA ID
- google_tag_manager_id: GTM ID
- custom_css: Custom CSS
- custom_js: Custom JavaScript
- maintenance_mode: Chế độ bảo trì
- announcement_bar_enabled: Bật announcement bar
- announcement_bar_text: Nội dung announcement
- announcement_bar_color: Màu announcement bar
```

### 2. API Routes ✅

#### `/api/admin/site-settings` - CRUD cho settings
- **GET**: Lấy tất cả site settings
- **PUT**: Cập nhật nhiều settings cùng lúc (batch update)
- **POST**: Tạo setting mới
- **DELETE**: Xóa setting theo key

#### `/api/admin/site-settings/logo` - Upload logo
- **POST**: Upload logo (light & dark mode)
  - Tự động resize và optimize
  - Lưu vào Cloudinary
  - Lưu metadata vào media_library
- **DELETE**: Xóa logo (light/dark)

#### `/api/admin/site-settings/favicon` - Upload favicon
- **POST**: Upload favicon
  - Tự động generate 3 sizes: 16x16, 32x32, 180x180
  - Optimize cho web
  - Lưu tất cả sizes vào Cloudinary
- **DELETE**: Xóa tất cả favicon sizes

#### `/api/admin/media-library` - Quản lý media
- **GET**: Lấy danh sách media (có filter theo category/fileType)
- **POST**: Upload file mới
  - Support: images, videos, documents
  - Max size: 20MB
  - Tự động phát hiện file type
- **DELETE**: Xóa file từ Cloudinary + database
- **PATCH**: Cập nhật metadata (alt_text, category)

### 3. Admin UI Components ✅

#### `AdminSiteBranding.tsx` - Site Branding Manager
**Features:**
- Upload logo chính (light mode)
- Upload logo dark mode
- Upload favicon với auto-generation của nhiều sizes
- Edit site name, tagline
- SEO meta tags editor (title, description, keywords)
- Theme colors picker (primary + secondary)
- Google Analytics/GTM ID input
- Live preview của branding changes
- Drag & drop file upload
- Image preview trước khi upload
- Delete buttons cho logo/favicon

#### `AdminMediaLibrary.tsx` - Media Library Manager
**Features:**
- Grid/List view modes
- Upload files với drag & drop
- Category filter (logo/favicon/banner/content/general)
- File type filter (image/video/document)
- Search by filename/alt text
- Copy URL to clipboard
- Delete files
- Update alt text & category
- File statistics (total files, total size, etc.)
- Responsive design

### 4. Context & State Management ✅

#### Updated `SiteSettingsContext.tsx`
**Các getter mới:**
```typescript
- siteName: string
- siteTagline: string
- siteLogoUrl: string
- siteLogoDarkUrl: string
- siteFaviconUrl: string
- siteMetaTitle: string
- siteMetaDescription: string
- siteMetaKeywords: string
- siteOgImage: string
- themePrimaryColor: string
- themeSecondaryColor: string
- googleAnalyticsId: string
- googleTagManagerId: string
- maintenanceMode: boolean
- announcementBarEnabled: boolean
- announcementBarText: string
- announcementBarColor: string
```

### 5. Admin Panel Integration ✅

**2 tabs mới trong Admin Panel:**
- **Site Branding** (icon: ImageIcon) - Quản lý logo, favicon, site info
- **Media Library** (icon: Layers) - Quản lý tất cả files

## Cách Sử Dụng

### Bước 1: Chạy Migration

```bash
# Kết nối với Supabase và chạy migration
# Copy nội dung file lib/migrations/015_site_branding.sql
# Paste vào Supabase SQL Editor và Execute
```

Hoặc sử dụng Supabase CLI:
```bash
supabase db push
```

### Bước 2: Cài Đặt Dependencies (nếu chưa có)

```bash
npm install sharp
# hoặc
yarn add sharp
```

Sharp được dùng để resize favicon thành nhiều sizes.

### Bước 3: Cấu Hình Environment Variables

Đảm bảo file `.env.local` có đầy đủ:
```env
# Cloudinary (cho upload files)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Bước 4: Khởi Động Development Server

```bash
npm run dev
# hoặc
yarn dev
```

### Bước 5: Truy Cập Admin Panel

1. Đăng nhập với tài khoản admin
2. Vào `/admin`
3. Click tab **"Site Branding"** hoặc **"Media Library"**

## Sử Dụng Site Branding Tab

### Upload Logo
1. Trong card "Logo Chính", click vào khu vực upload
2. Chọn file PNG/SVG (max 5MB)
3. Preview sẽ hiện ngay
4. Click "Upload Logo"
5. Logo được tự động resize và optimize

### Upload Favicon
1. Trong card "Favicon", click vào khu vực upload
2. Chọn file PNG (khuyến nghị 512x512px trở lên)
3. Hệ thống tự động tạo 3 sizes: 16x16, 32x32, 180x180
4. Click "Upload Favicon"

### Chỉnh Sửa Site Info
1. Điền các trường: Site Name, Tagline
2. Cập nhật Meta Title, Meta Description cho SEO
3. Thêm Meta Keywords
4. Thêm Google Analytics ID nếu có
5. Click "Lưu Cài Đặt"

### Chọn Theme Colors
1. Dùng color picker để chọn màu Primary/Secondary
2. Hoặc nhập hex code trực tiếp
3. Preview real-time ở phần "Live Preview"
4. Click "Lưu Cài Đặt"

### Live Preview
- Click "Xem Preview" để xem trước changes
- Preview hiển thị:
  - Logo trong navbar
  - Site name & tagline
  - Hero section với Meta Title/Description
  - Primary & Secondary color buttons

## Sử Dụng Media Library Tab

### Upload File
1. Click vào vùng upload hoặc drag & drop file
2. Chọn category: general/logo/favicon/banner/content
3. (Optional) Thêm alt text cho SEO
4. Click "Upload"

### Quản Lý Files
- **Grid View**: Xem thumbnails, hover để có quick actions
- **List View**: Xem chi tiết file info
- **Search**: Tìm theo filename hoặc alt text
- **Filter**: Lọc theo category hoặc file type

### Copy URL
1. Hover vào file (grid view) hoặc click "Copy URL" (list view)
2. URL được copy vào clipboard
3. Dùng URL này trong content editor hoặc code

### Delete File
1. Click icon Trash hoặc button Delete
2. Confirm deletion
3. File xóa khỏi Cloudinary + database

## API Usage (cho developer)

### Get All Settings
```typescript
const response = await fetch('/api/admin/site-settings')
const { settings } = await response.json()
```

### Update Settings (Batch)
```typescript
await fetch('/api/admin/site-settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    settings: {
      site_name: 'My New Site',
      site_tagline: 'Best Photo Restoration',
      theme_primary_color: '#ec4899'
    }
  })
})
```

### Upload Logo
```typescript
const formData = new FormData()
formData.append('lightLogo', lightLogoFile)
formData.append('darkLogo', darkLogoFile)

await fetch('/api/admin/site-settings/logo', {
  method: 'POST',
  body: formData
})
```

### Upload to Media Library
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('category', 'banner')
formData.append('altText', 'Homepage hero banner')

await fetch('/api/admin/media-library', {
  method: 'POST',
  body: formData
})
```

### Use Settings in Components
```tsx
import { useSiteSettingsContext } from '@/contexts/SiteSettingsContext'

function MyComponent() {
  const {
    siteName,
    siteLogoUrl,
    themePrimaryColor,
    maintenanceMode
  } = useSiteSettingsContext()

  return (
    <div style={{ color: themePrimaryColor }}>
      {siteLogoUrl && <img src={siteLogoUrl} alt={siteName} />}
      <h1>{siteName}</h1>
    </div>
  )
}
```

## Security

### Row Level Security (RLS)
- **media_library**: Chỉ admin mới có quyền CRUD
- Public có thể view media có category: logo/favicon/banner
- Settings được protect bởi middleware admin check

### File Upload Security
- Validate file type (chỉ accept images/videos/documents)
- Validate file size (max 5MB cho logo, 20MB cho media)
- Cloudinary tự động scan malware
- File được store trên CDN, không lưu trực tiếp trên server

### API Protection
- Tất cả API routes đều có `verifyAuth()` middleware
- Check `user.isAdmin` trước khi cho phép thao tác
- CSRF protection enabled
- Rate limiting (via middleware)

## Performance Optimization

### Image Optimization
- Cloudinary auto-optimization: quality=auto, format=auto
- Lazy loading images
- Responsive images với srcset
- WebP/AVIF format cho modern browsers

### Caching
- Site settings cached với React Query (staleTime: 10 minutes)
- Cloudinary CDN caching
- Media library pagination để giảm load

### Database Indexes
```sql
- idx_media_library_user_id
- idx_media_library_category
- idx_media_library_file_type
- idx_media_library_created_at
```

## Troubleshooting

### Lỗi "Unauthorized" khi upload
**Giải pháp:**
- Kiểm tra user đã login và có role admin
- Check middleware config
- Xem browser console/network tab

### Upload fails với 500 error
**Giải pháp:**
- Check Cloudinary credentials trong .env
- Kiểm tra file size < 20MB
- Xem server logs

### Favicon không hiển thị
**Giải pháp:**
- Clear browser cache (Ctrl+Shift+R)
- Check site_favicon_url trong site_settings
- Verify favicon URL accessible

### Sharp installation error
**Giải pháp:**
```bash
# Rebuild sharp
npm rebuild sharp
# hoặc
yarn add sharp --force
```

## Next Steps (Phase 2-6)

Phase 1 hoàn thành! Tiếp theo có thể implement:

**Phase 2: Payment Integration** (Stripe/PayPal)
**Phase 3: Notification System** (In-app + Email)
**Phase 4: Advanced Analytics** (Charts + Reports)
**Phase 5: Email Service** (Nodemailer + Templates)
**Phase 6: Advanced Features** (i18n, Audit Logs, Backup)

## Files Created/Modified

### Created:
- `lib/migrations/015_site_branding.sql`
- `app/api/admin/site-settings/route.ts`
- `app/api/admin/site-settings/logo/route.ts`
- `app/api/admin/site-settings/favicon/route.ts`
- `app/api/admin/media-library/route.ts`
- `components/admin/AdminSiteBranding.tsx`
- `components/admin/AdminMediaLibrary.tsx`

### Modified:
- `app/admin/page.tsx` - Added 2 new tabs
- `contexts/SiteSettingsContext.tsx` - Added 18 new getters
- `hooks/useSiteSettings.ts` - (No changes needed, already compatible)

## Summary

Phase 1 implementation thành công! Bạn giờ có:

✅ Full CRUD cho site settings
✅ Upload & manage logo (light/dark)
✅ Auto-generate favicon multiple sizes
✅ Centralized media library
✅ Live preview của branding
✅ SEO meta tags management
✅ Theme color customization
✅ Secure file uploads với Cloudinary
✅ Admin UI hoàn chỉnh và user-friendly

Admin giờ có thể tùy chỉnh TOÀN BỘ branding và content của website mà không cần code!

---

**Ngày hoàn thành**: 2026-01-19
**Thời gian implement**: Phase 1 Complete
**Developer**: Claude Code + User
