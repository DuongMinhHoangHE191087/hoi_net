# Hồi Nét - Khôi phục ảnh cũ bằng AI

Ứng dụng khôi phục ảnh và ghép ảnh gia đình bằng AI (Google Gemini), xây dựng trên Next.js App Router.

## 🚀 Tính Năng

- Khôi phục / nâng cấp chất lượng / tô màu ảnh đen trắng bằng Google Gemini AI
- Upload ảnh lên Cloudinary
- Đăng ký/đăng nhập qua Supabase Auth (email + Google OAuth), có hCaptcha chống spam
- Quản lý yêu cầu xử lý ảnh (tạo yêu cầu, theo dõi trạng thái, phản hồi/đánh giá kết quả)
- Admin panel: quản lý người dùng, yêu cầu, blog, trang giới thiệu, đội ngũ, feedback, cấu hình site
- Blog có rich text editor (Tiptap)
- Rate limiting và optimistic locking (chống ghi đè dữ liệu khi nhiều admin sửa cùng lúc)
- Responsive design, single light theme (không hỗ trợ dark mode)

## 📋 Yêu Cầu

- Node.js 18+
- npm
- Tài khoản Supabase (Postgres + Auth)
- Tài khoản Cloudinary
- Google Gemini API Key
- (Tuỳ chọn) Redis - để rate limiting hoạt động đúng khi chạy nhiều instance serverless; nếu bỏ trống, app tự chuyển sang giới hạn theo từng instance (vẫn chạy được, chỉ kém chính xác hơn khi scale)

## 🛠️ Cài Đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd hoi_net
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Environment Variables

```bash
cp .env.example .env.local
```

Các biến bắt buộc để chạy được cơ bản:

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

# (Tuỳ chọn) Redis - PHẢI là connection string dạng redis://..., KHÔNG PHẢI REST API URL
REDIS_URL=redis://default:password@host:port
```

Xem `.env.example` để biết đầy đủ các biến khác (hCaptcha, NextAuth, admin emails, v.v.)

### 4. Thiết lập Supabase Database

> **Lưu ý quan trọng**: repo hiện có 3 thư mục chứa migration SQL không hoàn toàn đồng bộ
> (`lib/migrations/`, `database/migrations/`, `supabase/migrations/`) do lịch sử phát triển
> để lại. `database/migrations/` là bộ đầy đủ và mới nhất (đánh số tới 040+). Trước khi chạy,
> hãy kiểm tra trong Supabase Dashboard xem bảng nào đã tồn tại để tránh chạy trùng - không có
> cách nào xác định tự động migration nào đã áp dụng cho database thật của bạn.

1. Truy cập Supabase SQL Editor: `https://app.supabase.com/project/_/sql`
2. Chạy lần lượt các file trong `database/migrations/` theo thứ tự số, đối chiếu với bảng đã có
3. Xác nhận các bảng chính đã được tạo: `user_profiles`, `user_requests`, `blog_posts`, `feedback`, `team_members`, `site_settings`, `value_sections`, `about_sections`, `features`, `system_prompts`, `notifications`

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

## 📁 Cấu Trúc Dự Án (rút gọn)

```
hoi_net/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── (auth)                      # login, register, forgot-password, reset-password...
│   ├── dashboard/                  # User dashboard
│   ├── requests/                   # Danh sách & chi tiết yêu cầu xử lý ảnh
│   ├── studio/                     # Công cụ chỉnh sửa ảnh (background remover...)
│   ├── admin/                      # Admin panel
│   ├── blog/                       # Blog công khai
│   ├── api/
│   │   ├── process-images/         # Xử lý ảnh bằng Gemini AI
│   │   ├── requests/, admin/, auth/, upload*, notifications/, feedback/, health
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/                     # ui/, layout/, sections/, admin/, editor/, studio/, auth/, blog/
├── lib/                             # auth-server, gemini, rate-limit*, redis, supabase/*, optimistic-lock, api-handler...
├── database/migrations/            # Bộ migration SQL đầy đủ nhất (xem lưu ý ở trên)
├── docs/archive/                   # Tài liệu lịch sử các đợt fix cũ (không còn phản ánh trạng thái hiện tại)
├── .env.example                    # Environment variables template
├── package.json
├── tailwind.config.js              # Design tokens (nguồn màu sắc duy nhất)
└── next.config.js
```

## 🎨 Design System

Nguồn duy nhất cho màu sắc/theme là `tailwind.config.js` (không còn file theme rời rạc khác).

### Colors

- **Primary**: `#FF6B9D` (Hồng)
- **Secondary**: `#FFC837` (Vàng)
- **Success**: `#22C55E`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`
- **Background**: gradient hồng/kem (`bg-gradient-warm`)
- **Text**: `#2D1B2E`

Chỉ dùng 1 theme sáng, không hỗ trợ dark mode (`darkMode: 'class'` trong `tailwind.config.js`, không có cơ chế nào bật class `dark` - đây là chủ đích, tránh `dark:` utility tự kích hoạt theo hệ điều hành).

### Typography

- **Sans**: Plus Jakarta Sans
- **Mono**: JetBrains Mono

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Data fetching**: TanStack React Query (đang mở rộng dần, một số trang vẫn fetch thủ công)
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **Storage**: Cloudinary
- **AI**: Google Gemini (`@google/genai`)
- **Cache/Rate limit**: Redis (tuỳ chọn, có fallback in-memory)
- **Rich text editor**: Tiptap

## 📝 API chính

Tất cả route nằm dưới `app/api/`. Một vài route tiêu biểu:

- `POST /api/process-images` - Xử lý ảnh bằng Gemini AI (có timeout, retry cho lỗi tạm thời)
- `POST /api/secure-upload`, `POST /api/upload` - Upload ảnh
- `POST/PATCH/DELETE /api/requests`, `/api/requests/[id]` - CRUD yêu cầu xử lý ảnh
- `app/api/admin/**` - Các route quản trị (đều yêu cầu xác thực + kiểm tra quyền admin)
- `GET /api/health` - Health check (DB, AI key, storage config, cache)

## 🔐 Security & Data Integrity

- Row Level Security (RLS) bật trên Supabase
- Validation với Zod cho input
- Rate limiting cho các route auth nhạy cảm (đăng ký, quên mật khẩu, magic link), Redis-backed khi có cấu hình `REDIS_URL`, tự fallback in-memory
- Optimistic locking (cột `version` + trigger) cho `blog_posts`, `team_members`, `feedback`, `value_sections` - tránh 2 admin ghi đè dữ liệu của nhau
- API keys lưu trong `.env.local`, không commit lên git

## 🚀 Deployment

### Vercel (Recommended)

1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình Environment Variables (xem mục 3 ở trên)
4. Deploy

## 📄 License

MIT License
