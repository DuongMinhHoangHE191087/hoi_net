# 🎨 UnifiedLoading - Hệ Thống Loading Đồng Nhất

## ✨ Tổng Quan

UnifiedLoading là một component loading screen thống nhất được sử dụng trên **tất cả các trang** của ứng dụng Photo Restoration. Component này đảm bảo trải nghiệm người dùng nhất quán với:

- ✅ Logo với hiệu ứng shimmer (chạy sáng)
- ✅ Progress bar từ 0-100%
- ✅ Animations mượt mà
- ✅ Đồng bộ hoàn toàn
- ✅ Không có lỗi async

---

## 🎯 Tính Năng Chính

### 1. Logo Hiển Thị Đầu Tiên
- Logo gradient quay tròn liên tục
- Icon Sparkles ở giữa
- Glow effect xung quanh logo
- Tên app "Photo Restore" dưới logo

### 2. Hiệu Ứng Shimmer/Fade
- Shimmer chạy qua logo (từ trái sang phải)
- Fade in/out mượt mà
- Text opacity pulsing
- Particles animation ở background

### 3. Progress Bar 0-100%
- Tự động tăng từ 0% lên 100%
- Smooth animation trong 1 giây
- Shimmer effect chạy trên progress bar
- Hiển thị % số
- Glow effect theo progress

### 4. Visual Elements
- 6 animated particles floating
- Progress dots indicator (3 dots pulsing)
- Loading tip text
- Gradient background

---

## 📋 Component Structure

```tsx
<UnifiedLoading message="Đang tải..." />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| message | string | "Đang tải..." | Message hiển thị dưới logo |

---

## 🎨 Visual Breakdown

```
┌────────────────────────────────────────┐
│                                        │
│         [Animated Particles]           │
│                                        │
│       ┌──────────────┐                 │
│       │              │ ← Glow Effect   │
│       │   🌟 Logo   │ ← Rotating      │
│       │              │ ← Shimmer       │
│       └──────────────┘                 │
│       Photo Restore   ← Pulsing Text   │
│                                        │
│       Đang tải...     ← Message        │
│                                        │
│    Đang tải        75% ← Percentage    │
│    ████████████░░░░░░  ← Progress Bar  │
│         • • •          ← Dots          │
│                                        │
│    Đang chuẩn bị...    ← Tip          │
│                                        │
└────────────────────────────────────────┘
```

---

## 💻 Implementation Details

### Logo Animation
```tsx
// Rotating logo
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "linear"
  }}
>
  <Sparkles className="w-16 h-16 text-white" />
</motion.div>
```

### Shimmer Effect
```tsx
// Shimmer overlay
<motion.div
  initial={{ x: '-100%' }}
  animate={{ x: '200%' }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut",
    repeatDelay: 0.5
  }}
  style={{
    background: 'linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.6) 50%,
      transparent 100%)'
  }}
/>
```

### Progress Bar Logic
```tsx
useEffect(() => {
  const duration = 1000 // 1 second
  const intervals = 50 // 50 updates
  const increment = 100 / intervals // 2% per update

  let currentProgress = 0
  const timer = setInterval(() => {
    currentProgress += increment
    if (currentProgress >= 100) {
      currentProgress = 100
      clearInterval(timer)
    }
    setProgress(Math.min(currentProgress, 100))
  }, duration / intervals) // Update every 20ms

  return () => clearInterval(timer)
}, [])
```

### Progress Animation
```tsx
<motion.div
  className="progress-fill"
  initial={{ width: '0%' }}
  animate={{ width: `${progress}%` }}
  transition={{
    duration: 0.3,
    ease: "easeOut"
  }}
/>
```

---

## 🚀 Usage in Pages

### Dashboard
```tsx
if (pageLoading || authLoading) {
  return <UnifiedLoading message="Đang tải dashboard..." />
}
```

### Profile
```tsx
if (pageLoading || authLoading) {
  return <UnifiedLoading message="Đang tải hồ sơ..." />
}
```

### Requests
```tsx
if (authLoading || pageLoading) {
  return <UnifiedLoading message="Đang tải yêu cầu..." />
}
```

### Home
```tsx
if (pageLoading) {
  return <UnifiedLoading message="Đang tải trang chủ..." />
}
```

### Blog
```tsx
if (pageLoading) {
  return <UnifiedLoading message="Đang tải blog..." />
}
```

### About
```tsx
if (pageLoading || loading) {
  return <UnifiedLoading message="Đang tải về chúng tôi..." />
}
```

### Contact
```tsx
if (pageLoading) {
  return <UnifiedLoading message="Đang tải trang liên hệ..." />
}
```

### Admin
```tsx
if (pageLoading) {
  return <UnifiedLoading message="Đang tải Admin Panel..." />
}
```

### New Request
```tsx
if (authLoading || pageLoading) {
  return <UnifiedLoading message="Đang chuẩn bị..." />
}
```

---

## 🎨 Color Scheme

```css
/* Primary Gradient */
from-primary via-secondary to-accent
/* #F59E0B → #6366F1 → #EC4899 */

/* Background */
bg-gradient-to-br from-white via-primary/5 to-secondary/5

/* Progress Bar */
bg-gradient-to-r from-primary via-secondary to-accent
```

---

## ⚡ Performance

### Optimizations
- CSS animations (GPU accelerated)
- Single component reused everywhere
- Minimal state updates (only progress)
- Clean interval cleanup
- Efficient re-renders

### Timing
- Total duration: 1000ms (1 second)
- Progress updates: Every 20ms (50 updates)
- Shimmer cycle: 1500ms + 500ms delay
- Logo rotation: 3000ms per cycle
- Particles: 3000ms with stagger

---

## 📊 Animation Timeline

```
0ms     ────────────────────────────────── 1000ms
│                                              │
├─ Logo fade in (500ms)
├─ Progress 0% ──────────────────────► 100%
├─ Shimmer #1 ─────► pause ─────► Shimmer #2
├─ Logo rotate (continuous)
├─ Particles float (continuous)
├─ Text pulse (continuous)
└─ Dots pulse (staggered)
```

---

## 🔧 Technical Details

### State Management
```tsx
const [progress, setProgress] = useState(0)
const [showLogo, setShowLogo] = useState(true)
```

### Props Interface
```tsx
interface UnifiedLoadingProps {
  message?: string
}
```

### Dependencies
- `framer-motion`: Animations
- `lucide-react`: Sparkles icon
- React hooks: useState, useEffect

---

## 🎯 Benefits

### User Experience
✅ Nhất quán trên tất cả các trang
✅ Professional và polished
✅ Clear progress feedback
✅ Engaging animations
✅ No jarring transitions

### Developer Experience
✅ Single component to maintain
✅ Easy to customize message
✅ Drop-in replacement
✅ No configuration needed
✅ Clean API

### Performance
✅ Lightweight (minimal state)
✅ GPU accelerated animations
✅ Proper cleanup
✅ Optimized re-renders
✅ No memory leaks

---

## 🐛 Troubleshooting

### Progress không chạy
- Kiểm tra useEffect dependencies
- Verify timer cleanup
- Check interval logic

### Shimmer không hiển thị
- Verify gradient syntax
- Check animation transition
- Ensure overflow is handled

### Logo không quay
- Check Framer Motion import
- Verify animation props
- Test browser support

### Particles không float
- Check Array.map logic
- Verify motion.div props
- Test animation delays

---

## 📚 Comparison: Before vs After

### Before (Multiple Variants)
```tsx
// Dashboard
<EnhancedLoading variant="photo" message="..." />

// Profile
<EnhancedLoading variant="minimal" message="..." />

// Requests
<EnhancedLoading variant="processing" message="..." />

// Home
<EnhancedLoading variant="default" message="..." />
```

❌ Không nhất quán
❌ Khó maintain
❌ 4 variants khác nhau
❌ Confusing user experience

### After (Unified)
```tsx
// ALL PAGES
<UnifiedLoading message="..." />
```

✅ Hoàn toàn nhất quán
✅ Dễ maintain
✅ 1 component duy nhất
✅ Smooth & professional
✅ Better UX

---

## 🎨 Customization Options

### Change Logo
```tsx
// Replace Sparkles with your logo
<YourLogo className="w-16 h-16 text-white" />
```

### Adjust Duration
```tsx
const duration = 1500 // 1.5 seconds instead of 1
```

### Change Colors
```tsx
// Update gradient classes
className="bg-gradient-to-r from-blue-500 to-purple-500"
```

### Modify Progress Steps
```tsx
const intervals = 100 // More smooth updates
```

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Add sound effects
- [ ] Preload resources
- [ ] Skeleton screens
- [ ] Custom logo support
- [ ] Theme variants
- [ ] Reduced motion support

---

## ✅ Checklist: All Pages Updated

- ✅ Dashboard (`app/dashboard/page.tsx`)
- ✅ Profile (`app/profile/page.tsx`)
- ✅ Requests (`app/requests/page.tsx`)
- ✅ New Request (`app/requests/new/page.tsx`)
- ✅ Admin (`app/admin/page.tsx`)
- ✅ Home (`app/page.tsx`)
- ✅ Blog (`app/blog/page.tsx`)
- ✅ About (`app/about/page.tsx`)
- ✅ Contact (`app/contact/page.tsx`)

**Total: 9/9 pages** ✅

---

## 📖 Summary

UnifiedLoading cung cấp:
- 🎨 Beautiful logo với shimmer effect
- 📊 Progress bar 0-100%
- ✨ Smooth animations
- 🔄 Đồng bộ hoàn toàn
- 🎯 Consistent UX across all pages

**Kết quả: Professional, polished, và user-friendly loading experience!** 🚀
