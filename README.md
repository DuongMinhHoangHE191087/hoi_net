# Hồi Nét - Khôi phục ảnh cũ bằng AI

Ứng dụng khôi phục ảnh và ghép ảnh gia đình bằng AI - phiên bản 1.1

## 🚀 Tính Năng

- ✅ Khôi phục ảnh cũ bằng AI
- ✅ Ghép ảnh gia đình tự nhiên
- ✅ **System Prompts AI** - Quản lý và tùy chỉnh prompts cho AI (mới)
- ✅ **Gemini API Integration** - Xử lý ảnh với Google Gemini AI (mới)
- ✅ Upload ảnh lên Cloudinary
- ✅ Quản lý dữ liệu với Supabase
- ✅ Animation mượt mà với Framer Motion
- ✅ Admin panel quản lý yêu cầu
- ✅ Responsive design
- ✅ Dark mode support (coming soon)

## 📋 Yêu Cầu

- Node.js 18+
- npm hoặc yarn
- Tài khoản Supabase
- Tài khoản Cloudinary
- **Google Gemini API Key** (cho AI image processing)

## 🛠️ Cài Đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd WEB-SSG
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Environment Variables

Copy file `.env.example` thành `.env.local` và điền các thông tin:

```bash
cp .env.example .env.local
```

Cập nhật các biến môi trường trong `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Thiết lập Supabase Database

Chạy các SQL script trên Supabase SQL Editor:

1. Truy cập: https://app.supabase.com/project/_/sql
2. Chạy script `lib/supabase-schema.sql` cho database chính
3. **Chạy script `database/system_prompts.sql` cho System Prompts** (mới)
4. Xác nhận tất cả tables đã được tạo

> **Lưu ý**: System Prompts table chứa 7 prompts mặc định cho AI image processing

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

## 📁 Cấu Trúc Dự Án

```
WEB-SSG/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── pricing/page.tsx            # Pricing page
│   ├── login/page.tsx              # Login page
│   ├── register/page.tsx           # Register page
│   ├── onboarding/page.tsx         # Onboarding wizard
│   ├── dashboard/page.tsx          # User dashboard
│   ├── request-photo/page.tsx      # Photo restoration request
│   ├── requests/page.tsx           # User requests list (mới)
│   ├── admin/page.tsx              # Admin panel
│   ├── settings/page.tsx           # User settings
│   ├── api/
│   │   ├── upload/route.ts         # Cloudinary upload API
│   │   └── process-images-v2/      # AI image processing (mới)
│   │       └── route.ts            # Gemini API integration
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # Button with animations
│   │   ├── Input.tsx               # Form input
│   │   ├── Card.tsx                # Card with hover effects
│   │   ├── LoadingSpinner.tsx      # Loading spinner
│   │   ├── Skeleton.tsx            # Skeleton loaders
│   │   └── Alert.tsx               # Alert messages
│   ├── layout/
│   │   ├── Navbar.tsx              # Navigation bar
│   │   ├── Sidebar.tsx             # Sidebar menu
│   │   └── Footer.tsx              # Footer
│   └── admin/
│       └── AdminSystemPrompts.tsx  # System Prompts admin UI (mới)
├── lib/
│   ├── supabase.ts                 # Supabase client & utilities
│   └── supabase-schema.sql         # Database schema
├── database/
│   └── system_prompts.sql          # System prompts table (mới)
├── docs/                           # Documentation (mới)
│   ├── SYSTEM_PROMPTS.md           # Full system prompts docs
│   └── QUICK_START_SYSTEM_PROMPTS.md # Quick start guide
├── .env.local                      # Environment variables
├── .env.example                    # Environment variables template
├── package.json                    # Dependencies
├── tailwind.config.js              # Tailwind configuration
└── next.config.js                  # Next.js configuration
```

## 🎨 Design System

### Colors

- **Primary**: `#F4C542` (Vàng ấm)
- **Secondary**: `#9E9E9E` (Xám nhạt)
- **Success**: `#22C55E` (Xanh lá)
- **Warning**: `#F59E0B` (Vàng nhạt)
- **Error**: `#EF4444` (Đỏ)
- **Background**: `#FFFFFF` (Trắng)
- **Text**: `#0F172A` (Đen)

### Typography

- **Heading**: Plus Jakarta Sans
- **Body**: Plus Jakarta Sans
- **Mono**: JetBrains Mono

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudinary
- **Authentication**: NextAuth.js (mock)

## 📝 API Routes

### POST /api/upload

Upload ảnh lên Cloudinary.

**Request:**
- `Content-Type`: `multipart/form-data`
- `file`: File ảnh

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "photo-restoration/abc123",
  "format": "jpg",
  "width": 1920,
  "height": 1080
}
```

### DELETE /api/upload

Xóa ảnh từ Cloudinary.

**Request:**
```json
{
  "public_id": "photo-restoration/abc123"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /api/process-images-v2 (mới)

Xử lý ảnh với Gemini AI sử dụng system prompts.

**Request:**
```json
{
  "request_id": "uuid",
  "images": ["https://..."],
  "prompt": "Custom user prompt",
  "system_prompt_name": "general_restore",
  "options": {
    "upscale": 2,
    "denoise": true,
    "enhanceFaces": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "processed_images": ["https://..."],
  "system_prompt_used": "general_restore",
  "processing_time": "2s"
}
```

> **Xem thêm**: `docs/SYSTEM_PROMPTS.md` cho chi tiết đầy đủ về API

## 🗄️ Database Schema

### Table: users

| Column     | Type      | Description        |
|------------|-----------|-------------------|
| id         | UUID      | Primary key       |
| email      | TEXT      | User email        |
| name       | TEXT      | User name         |
| company    | TEXT      | Company (optional)|
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

### Table: requests

| Column      | Type      | Description                    |
|-------------|-----------|--------------------------------|
| id          | UUID      | Primary key                    |
| user_id     | UUID      | Foreign key -> users.id        |
| type        | TEXT      | 'restore' hoặc 'family'        |
| status      | TEXT      | pending/processing/completed   |
| description | TEXT      | Mô tả yêu cầu                  |
| image_urls  | TEXT[]    | Array URL ảnh                  |
| result_url  | TEXT      | URL kết quả (optional)         |
| created_at  | TIMESTAMP | Created timestamp              |
| updated_at  | TIMESTAMP | Updated timestamp              |

### Table: system_prompts (mới)

| Column               | Type      | Description                           |
|---------------------|-----------|---------------------------------------|
| id                  | UUID      | Primary key                           |
| name                | TEXT      | Internal identifier (unique)          |
| display_name        | TEXT      | User-facing name                      |
| category            | TEXT      | Category (restoration, enhancement)   |
| system_prompt       | TEXT      | Main AI instruction                   |
| user_prompt_template| TEXT      | Template with {variables}             |
| description         | TEXT      | Description for users                 |
| parameters          | JSONB     | Processing parameters                 |
| is_active           | BOOLEAN   | Show/hide from users                  |
| is_default          | BOOLEAN   | Default prompt flag                   |
| display_order       | INTEGER   | Sort order                            |
| created_at          | TIMESTAMP | Created timestamp                     |
| updated_at          | TIMESTAMP | Updated timestamp                     |

> **Xem thêm**: `docs/SYSTEM_PROMPTS.md` cho full schema và documentation

## 🤖 System Prompts & AI Processing (Mới)

### Tính Năng

Hệ thống quản lý prompts linh hoạt cho AI image processing với Gemini API:

- ✅ **Database-driven prompts** - Tất cả prompts được lưu trong database, dễ dàng chỉnh sửa
- ✅ **7 prompts mặc định** - Từ basic restoration đến 4K upscaling
- ✅ **Admin UI** - Giao diện quản lý CRUD đầy đủ cho prompts
- ✅ **Custom variables** - Hỗ trợ biến động trong prompt templates
- ✅ **Advanced options** - Upscale, denoise, face enhancement, color accuracy
- ✅ **Category organization** - Phân loại theo restoration, enhancement, colorization
- ✅ **Quick processing** - One-click processing với preset prompts
- ✅ **Mock mode** - Chạy được mà không cần Gemini API key (demo)

### Quick Start

1. **Setup Database**:
```bash
# Chạy script tạo bảng system_prompts
# File: database/system_prompts.sql
```

2. **Add Gemini API Key**:
```env
GEMINI_API_KEY=your-api-key
```

3. **Access Admin Panel**:
```
/admin → AI Prompts tab
```

4. **Process Images**:
```
/requests → Click vào request → Chọn AI preset
```

### 7 Prompts Mặc Định

| Prompt | Mục Đích | Tính Năng |
|--------|----------|-----------|
| `general_restore` | Default cho mọi restoration | Balanced, tự nhiên |
| `photo_restore_advanced` | Ảnh lịch sử | Phân tích chi tiết |
| `colorize_bw` | Ảnh đen trắng | Tô màu tự nhiên |
| `enhance_quality` | Nâng cao chất lượng | Sharpening, details |
| `upscale_4k` | 4K upscaling | 4x độ phân giải |
| `portrait_enhance` | Chân dung | Tối ưu khuôn mặt |
| `denoise_photo` | Ảnh nhiễu | Khử nhiễu |

### Documentation

- **Full Documentation**: `docs/SYSTEM_PROMPTS.md`
- **Quick Start Guide**: `docs/QUICK_START_SYSTEM_PROMPTS.md`
- **API Reference**: Xem phần API Routes ở trên

### Custom Prompts

Tạo prompts riêng trong Admin Panel:

```
System Prompt: You are a photo restoration expert...
User Prompt Template: Restore {image_type} from {era}
Parameters: { "upscale": 2, "denoise": true }
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình Environment Variables
4. Deploy

### Docker

```bash
# Build image
docker build -t photo-restoration-app .

# Run container
docker run -p 3000:3000 photo-restoration-app
```

## 🔐 Security

- Tất cả API keys được lưu trong `.env.local` (không commit lên git)
- Row Level Security (RLS) được enable trên Supabase
- Validation với Zod cho tất cả form inputs
- CORS protection trên API routes

## 📄 License

MIT License

## 👥 Team

- **Developer**: Vibecode Kit v4.0
- **Version**: 1.1
- **Date**: 2026-01-16
