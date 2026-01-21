# UI Components - Loading & Confirmation

## 📚 Tổng Quan

Các components UI được tạo để cải thiện trải nghiệm người dùng với animations mượt mà và xác nhận rõ ràng.

## 🎨 Components

### 1. PageLoading

Component loading toàn diện với nhiều biến thể animation.

**Vị trí**: `components/ui/PageLoading.tsx`

**Sử dụng**:
```tsx
import PageLoading from '@/components/ui/PageLoading'

// Full screen loading
<PageLoading message="Đang tải..." variant="sparkle" />

// Các variants khác nhau
<PageLoading variant="spinner" />  // Vòng tròn xoay
<PageLoading variant="dots" />     // 3 chấm nhảy
<PageLoading variant="pulse" />    // Hiệu ứng pulse
<PageLoading variant="sparkle" />  // Sparkle với particles (mặc định)

// Inline loading (không full screen)
<PageLoading fullScreen={false} message="Đang xử lý..." />
```

**Props**:
- `message?: string` - Thông điệp hiển thị (mặc định: "Đang tải...")
- `fullScreen?: boolean` - Full screen mode (mặc định: true)
- `variant?: 'spinner' | 'dots' | 'pulse' | 'sparkle'` - Kiểu animation

**Inline Components**:
```tsx
import { InlineLoading, SkeletonLoading } from '@/components/ui/PageLoading'

// Loading nhỏ gọn
<InlineLoading message="Đang tải..." />

// Skeleton placeholder
<SkeletonLoading />
```

### 2. AIConfirmDialog

Dialog xác nhận với preview và thông tin chi tiết cho AI processing.

**Vị trí**: `components/ui/AIConfirmDialog.tsx`

**Sử dụng**:
```tsx
import AIConfirmDialog from '@/components/ui/AIConfirmDialog'

const [showDialog, setShowDialog] = useState(false)

<AIConfirmDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={async () => {
    await processImages()
  }}
  title="Xác nhận xử lý ảnh"
  description="Bạn có chắc muốn tiếp tục?"
  confirmText="Xác Nhận & Xử Lý"
  cancelText="Hủy"
  variant="default"
  showPreview={true}
  previewImages={['url1.jpg', 'url2.jpg']}
  promptName="General Restore"
  promptDescription="Restore ảnh với chất lượng cao"
/>
```

**Props**:
- `isOpen: boolean` - Trạng thái hiển thị
- `onClose: () => void` - Callback khi đóng
- `onConfirm: () => void | Promise<void>` - Callback khi xác nhận
- `title?: string` - Tiêu đề dialog
- `description?: string` - Mô tả
- `confirmText?: string` - Text nút xác nhận
- `cancelText?: string` - Text nút hủy
- `variant?: 'default' | 'warning' | 'success'` - Kiểu màu sắc
- `showPreview?: boolean` - Hiển thị preview ảnh
- `previewImages?: string[]` - Danh sách URL ảnh preview
- `promptName?: string` - Tên system prompt
- `promptDescription?: string` - Mô tả prompt

**Variants**:
- `default` - Xanh primary (AI processing)
- `warning` - Vàng cam (cảnh báo)
- `success` - Xanh lá (thành công)

### 3. PageTransition

Component wrapper để thêm transition khi chuyển trang.

**Vị trí**: `components/ui/PageTransition.tsx`

**Sử dụng**:
```tsx
import PageTransition from '@/components/ui/PageTransition'

// Trong layout hoặc page component
<PageTransition>
  {children}
</PageTransition>

// Các variants khác
import { FadeTransition, SlideTransition } from '@/components/ui/PageTransition'

<FadeTransition>{children}</FadeTransition>
<SlideTransition>{children}</SlideTransition>
```

**Variants**:
- `PageTransition` - Fade + scale + slide down (mặc định)
- `FadeTransition` - Chỉ fade
- `SlideTransition` - Slide ngang

## 🎯 Ví Dụ Sử Dụng

### Example 1: Loading State trong Page

```tsx
'use client'

import { useState, useEffect } from 'react'
import PageLoading from '@/components/ui/PageLoading'

export default function MyPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await fetchData()
      setData(result)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <PageLoading message="Đang tải dữ liệu..." variant="sparkle" />
  }

  return <div>{/* Your content */}</div>
}
```

### Example 2: AI Confirmation Flow

```tsx
'use client'

import { useState } from 'react'
import AIConfirmDialog from '@/components/ui/AIConfirmDialog'

export default function ImageProcessing() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])

  const handleProcess = async () => {
    // Show confirmation dialog
    setShowConfirm(true)
  }

  const confirmProcess = async () => {
    setShowConfirm(false)
    // Process images
    await processWithAI(selectedImages)
  }

  return (
    <>
      <button onClick={handleProcess}>
        Xử Lý Ảnh
      </button>

      <AIConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmProcess}
        showPreview={true}
        previewImages={selectedImages}
        promptName="Photo Restore Advanced"
        promptDescription="Khôi phục ảnh với AI chuyên nghiệp"
      />
    </>
  )
}
```

### Example 3: Inline Loading

```tsx
import { InlineLoading } from '@/components/ui/PageLoading'

export default function Component() {
  const [saving, setSaving] = useState(false)

  return (
    <div>
      {saving ? (
        <InlineLoading message="Đang lưu..." />
      ) : (
        <button onClick={handleSave}>Lưu</button>
      )}
    </div>
  )
}
```

## 🎨 Tùy Chỉnh

### Custom Loading Animation

```tsx
// Trong globals.css hoặc component styles
.custom-loading {
  /* Your custom styles */
}

// Sử dụng với className
<PageLoading
  message="Custom loading"
  variant="spinner"
  // Có thể extend component để thêm custom className
/>
```

### Custom Confirmation Dialog

```tsx
// Tạo wrapper với defaults riêng
const DangerConfirmDialog = (props) => (
  <AIConfirmDialog
    {...props}
    variant="warning"
    confirmText={props.confirmText || "Xóa"}
    title={props.title || "Cảnh báo"}
  />
)
```

## 🚀 Best Practices

### 1. Loading States
- Luôn hiển thị loading state khi fetch data
- Sử dụng variant phù hợp với context
- Full screen cho page loads, inline cho actions

### 2. Confirmation Dialogs
- Luôn xác nhận trước khi thực hiện actions quan trọng
- Show preview khi có thể
- Cung cấp thông tin đầy đủ cho user

### 3. Animations
- Giữ animations mượt mà (< 500ms)
- Tránh quá nhiều animations cùng lúc
- Sử dụng easing phù hợp

## 📝 Changelog

### Version 1.0.0 (2026-01-16)
- ✅ Tạo PageLoading component với 4 variants
- ✅ Tạo AIConfirmDialog với preview và variants
- ✅ Tạo PageTransition cho page animations
- ✅ Tích hợp vào requests, dashboard, profile pages
- ✅ Thêm InlineLoading và SkeletonLoading

## 🔗 Related

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: Các components này sử dụng Framer Motion cho animations. Đảm bảo `framer-motion` đã được cài đặt trong project.
