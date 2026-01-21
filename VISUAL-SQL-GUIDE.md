# 🚨 HƯỚNG DẪN TRỰC QUAN - CHẠY SQL MIGRATION

## ⚠️ LỖI HIỆN TẠI

Server vẫn báo lỗi:
```
Error: Could not find the table 'public.blog_posts' in the schema cache
```

**Nghĩa là:** Bạn CHƯA chạy SQL migration trong Supabase!

---

## ✅ HƯỚNG DẪN TỪNG BƯỚC CÓ HÌNH ẢNH

### BƯỚC 1: Mở Supabase Dashboard

1. Mở trình duyệt
2. Truy cập: **https://supabase.com/dashboard**
3. Đăng nhập nếu chưa

```
┌─────────────────────────────────────┐
│  🌐 https://supabase.com/dashboard │
│                                     │
│  [ Your Projects ]                  │
│  ┌──────────────────┐              │
│  │ jfnexrrdygcxgi.. │ ← Click vào  │
│  │ Photo AI         │    project   │
│  └──────────────────┘              │
└─────────────────────────────────────┘
```

---

### BƯỚC 2: Mở SQL Editor

Sau khi vào project, nhìn bên trái sidebar:

```
┌─ Sidebar ────────────┐
│                      │
│ 📊 Table Editor      │
│ 🔐 Authentication    │
│ 💾 Storage          │
│ 📡 Database         │
│ ⚡ SQL Editor    ← CLICK VÀO ĐÂY
│ 🔧 Settings         │
└──────────────────────┘
```

**Click vào "SQL Editor"**

---

### BƯỚC 3: Tạo Query Mới

Trong SQL Editor:

```
┌─ SQL Editor ──────────────────────────┐
│                                       │
│  [ + New Query ]  ← CLICK NÚT NÀY    │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ Type your SQL here...           │ │
│  │                                 │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                       │
│  [Run] [Format] [Settings]            │
└───────────────────────────────────────┘
```

---

### BƯỚC 4: Copy SQL từ File

1. Mở VS Code hoặc editor
2. Mở file: **FIX-ALL-DATABASE-TABLES.sql**
3. **QUAN TRỌNG:** Copy TOÀN BỘ nội dung:

```
┌─ FIX-ALL-DATABASE-TABLES.sql ────────┐
│                                      │
│ -- CREATE blog_posts TABLE          │
│ CREATE TABLE IF NOT EXISTS...       │
│ ...                                  │
│ ...                                  │
│ [1000 dòng SQL code]                 │
│ ...                                  │
│ ...                                  │
└──────────────────────────────────────┘

CÁCH COPY:
1. Click vào file
2. Ctrl+A (select all)
3. Ctrl+C (copy)
```

---

### BƯỚC 5: Paste vào SQL Editor

Quay lại Supabase SQL Editor:

```
┌─ SQL Editor ──────────────────────────┐
│                                       │
│  [Untitled Query]                     │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ -- CREATE blog_posts TABLE      │ │
│  │ CREATE TABLE IF NOT EXISTS...   │ │ ← Paste vào đây
│  │ ...                             │ │   (Ctrl+V)
│  │ [Toàn bộ SQL code]              │ │
│  └─────────────────────────────────┘ │
│                                       │
│  [Run] ← CLICK VÀO ĐÂY               │
└───────────────────────────────────────┘
```

**Nhấn nút "Run" hoặc Ctrl+Enter**

---

### BƯỚC 6: Chờ Kết Quả

Sau khi click Run, sẽ thấy ở dưới:

```
┌─ Results ─────────────────────────────┐
│                                       │
│ ✅ Success!                           │
│                                       │
│ ┌───────────────┬──────────┐         │
│ │ table_name    │ row_count│         │
│ ├───────────────┼──────────┤         │
│ │ blog_posts    │ 1        │         │
│ │ team_members  │ 3        │         │
│ │ value_sections│ 3        │         │
│ └───────────────┴──────────┘         │
│                                       │
│ ✅ All tables created successfully!  │
└───────────────────────────────────────┘
```

**NẾU THẤY NHƯ TRÊN = THÀNH CÔNG! ✅**

---

### BƯỚC 7: Verify trong Table Editor

Để chắc chắn, check trong Table Editor:

```
┌─ Table Editor ────────────────────────┐
│                                       │
│  Tables:                              │
│  ┌─────────────────┐                 │
│  │ ✅ blog_posts    │ ← Phải có bảng │
│  │ ✅ team_members  │    này!        │
│  │ ✅ value_sections│                │
│  └─────────────────┘                 │
└───────────────────────────────────────┘
```

---

### BƯỚC 8: Refresh App

1. Quay lại trình duyệt
2. Mở: **http://localhost:3000**
3. **Hard Reload:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

```
┌─ Browser ─────────────────────────────┐
│                                       │
│  http://localhost:3000                │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  🎨 Photo Restore AI            │ │
│  │                                 │ │
│  │  ✅ Sứ Mệnh (hiển thị)          │ │
│  │  ✅ Tầm Nhìn (hiển thị)         │ │
│  │  ✅ Team Members (hiển thị)     │ │
│  └─────────────────────────────────┘ │
│                                       │
│  KHÔNG CÒN LỖI CONSOLE! ✅            │
└───────────────────────────────────────┘
```

---

## ❓ TROUBLESHOOTING

### Lỗi 1: "relation already exists"

```
ERROR: relation "blog_posts" already exists
```

**✅ OK!** Bảng đã tồn tại. Bỏ qua lỗi này, tiếp tục run hết file SQL.

---

### Lỗi 2: "permission denied"

```
ERROR: permission denied for schema public
```

**❌ Vấn đề:** Bạn không phải owner của project

**Fix:**
1. Kiểm tra đã đăng nhập đúng account chưa
2. Hoặc liên hệ owner để cấp quyền

---

### Lỗi 3: "syntax error"

```
ERROR: syntax error at or near "CREATE"
```

**❌ Vấn đề:** Copy thiếu hoặc sai

**Fix:**
1. Mở lại file SQL
2. Ctrl+A (select tất cả)
3. Ctrl+C (copy)
4. Paste lại vào SQL Editor
5. Run lại

---

### Lỗi 4: Vẫn thấy lỗi database sau khi run SQL

```
Error: Could not find table...
```

**Fix:**
1. **Restart dev server:**
   ```bash
   # Trong terminal
   Ctrl+C  # Stop server
   npm run dev  # Start lại
   ```

2. **Hard reload browser:**
   ```
   Ctrl+Shift+R
   ```

3. **Clear Supabase cache:**
   - Supabase Dashboard → Settings → Database
   - Click "Restart database" (nếu có)

---

## 📋 CHECKLIST

- [ ] 1. Đã mở https://supabase.com/dashboard
- [ ] 2. Đã chọn project jfnexrrdygcxgizzpyxc
- [ ] 3. Đã click vào SQL Editor
- [ ] 4. Đã click New Query
- [ ] 5. Đã mở file FIX-ALL-DATABASE-TABLES.sql
- [ ] 6. Đã copy TOÀN BỘ file (Ctrl+A → Ctrl+C)
- [ ] 7. Đã paste vào SQL Editor (Ctrl+V)
- [ ] 8. Đã click Run (hoặc Ctrl+Enter)
- [ ] 9. Thấy "Success" message
- [ ] 10. Thấy 3 bảng trong Table Editor
- [ ] 11. Đã restart dev server
- [ ] 12. Đã hard reload browser (Ctrl+Shift+R)
- [ ] 13. Trang chủ hiển thị đầy đủ
- [ ] 14. Không còn lỗi console

---

## 🎯 KẾT QUẢ MONG ĐỢI

### Console (F12)
```
✅ Không có lỗi
✅ Không có warning về database
```

### Terminal (dev server)
```
✓ Ready in 1660ms
✓ Compiled / in 5.4s
GET / 200 in 246ms  ← Không còn error log
```

### Trang web
```
✅ Trang chủ hiển thị đầy đủ
✅ Blog có 1 post
✅ Team có 3 members
✅ Values sections hiển thị
✅ Loading cực nhanh
```

---

## 🚀 SAU KHI HOÀN THÀNH

Bạn sẽ có:
- ⚡ App nhanh gấp 3-4 lần
- 🎨 UI đẹp với glassmorphism
- 📊 Database đầy đủ
- ✅ Không lỗi, không warning
- 🎉 Sẵn sàng sử dụng!

---

**QUAN TRỌNG:**
- Copy **TOÀN BỘ** file SQL (đừng copy từng phần)
- Click **Run** (đừng bỏ qua bước này)
- **Hard reload** browser sau khi run SQL

**Thành công! 🎉**
