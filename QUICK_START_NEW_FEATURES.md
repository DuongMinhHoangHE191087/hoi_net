# ⚡ Quick Start - Hệ Thống Upload & AI Processing

## 🎯 Bắt Đầu Nhanh (5 phút)

### 1. User: Gửi Yêu Cầu với AI

```bash
# Truy cập
http://localhost:3000/requests/new

# Các bước:
1. Chọn loại: "Phục Hồi Ảnh Cũ"
2. Nhập mô tả
3. Kéo thả 3 ảnh vào vùng upload
4. Chờ upload xong (hiển thị ✅)
5. Check ✅ "Xử lý tự động với AI"
6. Check ✅ "Gửi cho Admin xem xét"
7. Click "Gửi yêu cầu"

# Kết quả:
✅ Request được tạo
✅ AI tự động xử lý 3 ảnh
✅ Admin sẽ review và deliver
```

### 2. Admin: Xem & Xử Lý Yêu Cầu

```bash
# Truy cập
http://localhost:3000/admin

# Các bước:
1. Click tab "Requests"
2. Thấy yêu cầu mới với badge "Chờ xử lý"
3. Click "Chi tiết"
4. Xem thông tin user, ảnh gốc, AI results
5. Review admin notes với kết quả AI
6. Click "Đánh dấu hoàn thành"

# Hoặc xử lý thêm với AI:
1. Chọn action "enhance"
2. Click "Xử lý với AI"
3. Chờ kết quả
4. Review và deliver
```

---

## 🔥 Tính Năng Nổi Bật

### 1. Enhanced Upload
- Kéo thả file
- Preview real-time
- Upload progress per image
- Retry failed uploads

### 2. AI Auto-Processing
- Tự động phân tích ảnh
- Đề xuất cải thiện
- Lưu kết quả vào admin notes
- 5 action types: restore, enhance, colorize, upscale, harmonize

### 3. Request Detail Modal
- Full info: user, request, images
- AI processing section
- Status management
- Download images

---

## 📝 Components Chính

### EnhancedUpload

```tsx
import EnhancedUpload from '@/components/ui/EnhancedUpload'

<EnhancedUpload
  maxFiles={5}
  maxSize={10}
  onUploadComplete={(urls) => setUploadedUrls(urls)}
  label="Ảnh"
  required
/>
```

### RequestDetailModal

```tsx
import RequestDetailModal from '@/components/admin/RequestDetailModal'

<RequestDetailModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  request={selectedRequest}
  onUpdate={fetchRequests}
/>
```

---

## 🔌 API Endpoints

### AI Processing
```bash
POST /api/admin/requests/{id}/process-ai
{
  "action": "restore",
  "prompt": "Professional restore"
}
```

### Response
```json
{
  "success": true,
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "processing_time": "2.5s"
  }
}
```

---

## ✅ Checklist Setup

- [x] GEMINI_API_KEY trong .env.local
- [x] CLOUDINARY credentials
- [x] Supabase configured
- [x] Database migrations run
- [x] npm run dev

---

## 🐛 Troubleshooting

### Upload không hoạt động?
```bash
# Check .env.local
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### AI processing fails?
```bash
# Check .env.local
GEMINI_API_KEY=...

# Check quota
GET /api/process-images
```

### Modal không mở?
```bash
# Check imports
import RequestDetailModal from '@/components/admin/RequestDetailModal'

# Check state
const [showDetailModal, setShowDetailModal] = useState(false)
```

---

## 📚 Docs Đầy Đủ

Xem `COMPREHENSIVE_UPGRADE_COMPLETE.md` cho:
- Chi tiết từng component
- API documentation
- Workflow examples
- Configuration
- Testing guide

---

## 🎉 Done!

**Hệ thống đã sẵn sàng!**

Test ngay:
1. Submit request → `/requests/new`
2. Admin review → `/admin`
3. View details → Click "Chi tiết"
4. AI process → Click "Xử lý với AI"

**Happy coding!** 🚀
