# Hệ Thống Phân Quyền - Hồi Nét

## Tổng Quan Các Vai Trò

### 1. Admin (Quản trị viên)
- **Badge**: Đỏ - `ADMIN`
- **Quyền**: Toàn quyền quản lý hệ thống
- **Tab hiển thị**: Tất cả 20+ tabs trong Admin Panel

### 2. Moderator (Kiểm duyệt viên)  
- **Badge**: Tím - `MODERATOR`
- **Quyền**: Xử lý yêu cầu, quản lý blog, phản hồi người dùng
- **Tab hiển thị**: 
  - ✅ Yêu Cầu (requests)
  - ✅ Blog
  - ✅ Phản Hồi (feedback/testimonials)

### 3. Editor (Biên tập viên)
- **Badge**: Xanh - `EDITOR`
- **Quyền**: Chỉ tạo/sửa bài viết blog (không được xuất bản)
- **Tab hiển thị**:
  - ✅ Blog (chỉ tạo/sửa, không publish)

### 4. User (Người dùng)
- **Quyền**: Gửi yêu cầu, xem yêu cầu của mình
- **Không có quyền truy cập Admin Panel**

---

## Chi Tiết Permissions

### Admin Access
| Permission | Admin | Moderator | Editor | User |
|------------|-------|-----------|--------|------|
| `admin.access` | ✅ | ✅ | ✅ | ❌ |
| `admin.users.manage` | ✅ | ❌ | ❌ | ❌ |
| `admin.settings.manage` | ✅ | ❌ | ❌ | ❌ |
| `admin.roles.manage` | ✅ | ❌ | ❌ | ❌ |

### Request Management
| Permission | Admin | Moderator | Editor | User |
|------------|-------|-----------|--------|------|
| `requests.view_all` | ✅ | ✅ | ❌ | ❌ |
| `requests.process` | ✅ | ✅ | ❌ | ❌ |
| `requests.delete` | ✅ | ❌ | ❌ | ❌ |
| `requests.create` | ✅ | ✅ | ✅ | ✅ |
| `requests.view_own` | ✅ | ✅ | ✅ | ✅ |

### Blog Management
| Permission | Admin | Moderator | Editor | User |
|------------|-------|-----------|--------|------|
| `blog.create` | ✅ | ✅ | ✅ | ❌ |
| `blog.edit` | ✅ | ✅ | ✅ | ❌ |
| `blog.delete` | ✅ | ❌ | ❌ | ❌ |
| `blog.publish` | ✅ | ✅ | ❌ | ❌ |

### Feedback Management
| Permission | Admin | Moderator | Editor | User |
|------------|-------|-----------|--------|------|
| `feedback.view` | ✅ | ✅ | ❌ | ❌ |
| `feedback.respond` | ✅ | ✅ | ❌ | ❌ |

### Media Management
| Permission | Admin | Moderator | Editor | User |
|------------|-------|-----------|--------|------|
| `media.manage` | ✅ | ❌ | ❌ | ❌ |

---

## API Endpoints & Permissions

### Admin-Only Endpoints
```
POST/PUT/DELETE /api/admin/users/*
POST/PUT/DELETE /api/admin/site-settings/*
POST/PUT/DELETE /api/admin/team-members/*
POST/PUT/DELETE /api/admin/values/*
POST/PUT/DELETE /api/admin/features/*
POST/PUT/DELETE /api/admin/site-content/*
POST/PUT/DELETE /api/admin/homepage-sections/*
```

### Moderator + Admin
```
GET/POST/PATCH /api/admin/requests/*
POST /api/admin/requests/[id]/process-ai
POST /api/admin/requests/[id]/deliver
GET/PATCH/DELETE /api/admin/feedback/*
GET/POST/PATCH /api/admin/blog-posts/* (publish requires blog.publish)
```

### Editor + Moderator + Admin
```
GET /api/admin/blog-posts (publishedOnly=false requires blog.edit)
POST /api/admin/blog-posts (publish=true requires blog.publish)
PATCH /api/admin/blog-posts/[id] (publish requires blog.publish)
```

---

## Default Tab Per Role

| Role | Default Tab | Lý do |
|------|-------------|-------|
| Admin | `homepage` | Xem tổng quan toàn hệ thống |
| Moderator | `requests` | Ưu tiên xử lý yêu cầu người dùng |
| Editor | `blog` | Chỉ có quyền quản lý blog |

---

## Cập Nhật Lần Cuối
- **Ngày**: 27/01/2026
- **Phiên bản**: 2.0 (Role-based Permission System)
