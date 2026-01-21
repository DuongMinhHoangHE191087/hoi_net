# 🚀 Quick Reference Guide - Developer Cheat Sheet

## Loading System

### Import
```typescript
import { usePageLoading } from '@/components/ui/PageWrapper'
import EnhancedLoading from '@/components/ui/EnhancedLoading'
```

### Basic Usage
```typescript
const { loading: pageLoading, finishLoading } = usePageLoading(true, 1000)

useEffect(() => {
  loadData()
}, [])

const loadData = async () => {
  try {
    // Your data loading logic
  } finally {
    finishLoading() // Call when done
  }
}

if (pageLoading) {
  return <EnhancedLoading variant="minimal" message="Loading..." />
}
```

### Loading Variants

| Variant | Best For | Example |
|---------|----------|---------|
| `photo` | Photo-related pages | Dashboard, Upload |
| `processing` | AI/Processing pages | Requests, Admin |
| `minimal` | Simple pages | Profile, Blog, About |
| `default` | Homepage, General | Landing, Main |

---

## Theme Utilities

### Gradients
```css
.gradient-primary       /* Amber gradient */
.gradient-secondary     /* Indigo gradient */
.gradient-vibrant       /* Multi-color */
.gradient-sunset        /* Warm colors */
.gradient-ocean         /* Blue/Purple */
.gradient-aurora        /* Pastel */
.gradient-mesh          /* Radial mesh background */
.gradient-text          /* Text gradient */
```

### Animations
```css
.animate-fade-in        /* Smooth entrance */
.animate-pulse-glow     /* Glowing pulse */
.animate-shimmer        /* Loading shimmer */
.animate-float          /* Floating effect */
.animate-spin           /* Rotation */
.animate-scale-pulse    /* Scale pulsing */
.animate-gradient-shift /* Animated gradient */
```

### Glass Morphism
```css
.glassmorphism          /* Standard glass */
.glassmorphism-strong   /* Enhanced blur */
```

### Buttons
```css
.btn-glass-primary      /* Amber button */
.btn-glass-secondary    /* Indigo button */
.btn-glass-accent       /* Pink button */
```

### Shadows
```css
.shadow-glow-primary    /* Amber glow */
.shadow-glow-secondary  /* Indigo glow */
.shadow-glow-accent     /* Pink glow */
.shadow-glow-pink       /* Strong pink */
```

### Badges
```css
.badge                  /* Base */
.badge-success          /* Green */
.badge-warning          /* Yellow */
.badge-error            /* Red */
.badge-info             /* Blue */
```

### Hover Effects
```css
.hover-lift             /* Lift up */
.hover-glow             /* Add glow */
.hover-scale            /* Scale up */
.card-hover             /* Card lift + shadow */
```

---

## Example Patterns

### Glass Card with Hover
```tsx
<div className="glassmorphism-strong card-hover p-6">
  <h3 className="gradient-text">Title</h3>
  <p>Content</p>
</div>
```

### Gradient Button
```tsx
<button className="btn-glass-primary hover-glow">
  Click Me
</button>
```

### Animated Header
```tsx
<h1 className="gradient-text animate-gradient-shift">
  Beautiful Title
</h1>
```

### Status Badge
```tsx
<span className="badge badge-success">
  ✓ Completed
</span>
```

### Loading Shimmer
```tsx
<div className="loading-shimmer h-20 bg-gray-200 rounded-lg" />
```

---

## CSS Variables

### Colors
```css
var(--color-primary)        /* #F59E0B */
var(--color-secondary)      /* #6366F1 */
var(--color-accent)         /* #EC4899 */
var(--color-success)        /* #10B981 */
var(--color-warning)        /* #F59E0B */
var(--color-error)          /* #EF4444 */
```

### Spacing
```css
var(--spacing-xs)           /* 0.25rem */
var(--spacing-sm)           /* 0.5rem */
var(--spacing-md)           /* 1rem */
var(--spacing-lg)           /* 1.5rem */
var(--spacing-xl)           /* 2rem */
var(--spacing-2xl)          /* 3rem */
```

### Border Radius
```css
var(--border-radius-sm)     /* 0.375rem */
var(--border-radius-md)     /* 0.5rem */
var(--border-radius-lg)     /* 0.75rem */
var(--border-radius-xl)     /* 1rem */
var(--border-radius-2xl)    /* 1.5rem */
var(--border-radius-full)   /* 9999px */
```

### Transitions
```css
var(--transition-fast)      /* 150ms */
var(--transition-base)      /* 200ms */
var(--transition-slow)      /* 300ms */
```

---

## Component Examples

### Page with Loading
```typescript
'use client'

import { useState, useEffect } from 'react'
import { usePageLoading } from '@/components/ui/PageWrapper'
import EnhancedLoading from '@/components/ui/EnhancedLoading'

export default function MyPage() {
  const { loading: pageLoading, finishLoading } = usePageLoading(true, 1000)
  const [data, setData] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch('/api/data')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      finishLoading()
    }
  }

  if (pageLoading) {
    return <EnhancedLoading variant="minimal" message="Đang tải..." />
  }

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="glassmorphism-strong p-6">
        <h1 className="gradient-text">My Page</h1>
        {/* Content */}
      </div>
    </div>
  )
}
```

### Animated Card Grid
```tsx
<div className="grid grid-cols-3 gap-4">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glassmorphism-strong card-hover p-6"
    >
      <h3 className="text-gradient-primary">{item.title}</h3>
      <p>{item.description}</p>
      <span className="badge badge-success">{item.status}</span>
    </motion.div>
  ))}
</div>
```

### Button Group
```tsx
<div className="flex gap-4">
  <button className="btn-glass-primary">
    Primary Action
  </button>
  <button className="btn-glass-secondary">
    Secondary
  </button>
  <button className="btn-glass-accent">
    Accent
  </button>
</div>
```

---

## Tips & Best Practices

### Loading
- Always use minimum 1s on pages with data fetching
- Choose variant based on page context
- Use Vietnamese messages
- Call `finishLoading()` in finally block

### Animations
- Use sparingly for important elements
- Stagger animations for lists (delay: index * 0.1)
- Combine with Framer Motion for complex animations
- Test on low-end devices

### Glass Morphism
- Use `glassmorphism-strong` for important cards
- Combine with hover effects
- Works best on gradient backgrounds
- Consider mobile blur support

### Gradients
- Use text gradients for headings
- Combine with animations for dynamic effects
- Use mesh backgrounds for full-page layouts
- Keep text readable on gradients

### Performance
- Minimize blur effects on low-end devices
- Use CSS animations (GPU accelerated)
- Lazy load heavy components
- Clean up animations in useEffect

---

## Common Patterns

### Hero Section
```tsx
<div className="gradient-mesh min-h-screen flex items-center justify-center">
  <div className="text-center">
    <h1 className="text-6xl font-bold gradient-text animate-gradient-shift mb-4">
      Welcome
    </h1>
    <p className="text-xl text-gray-600 mb-8">
      Beautiful Photo Restoration
    </p>
    <button className="btn-glass-primary animate-pulse-glow">
      Get Started
    </button>
  </div>
</div>
```

### Feature Card
```tsx
<div className="glassmorphism-strong card-hover p-8 animate-fade-in">
  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 animate-float">
    <Icon className="w-8 h-8 text-white" />
  </div>
  <h3 className="text-xl font-bold mb-2 gradient-text">Feature Title</h3>
  <p className="text-gray-600">Feature description goes here...</p>
</div>
```

### Status Indicator
```tsx
<div className="flex items-center gap-2">
  <span className={`badge ${
    status === 'success' ? 'badge-success' :
    status === 'warning' ? 'badge-warning' :
    status === 'error' ? 'badge-error' :
    'badge-info'
  }`}>
    {statusText}
  </span>
</div>
```

---

## Quick Troubleshooting

### Loading not showing minimum 1s
- Check if `finishLoading()` is called
- Ensure it's in the `finally` block
- Verify minimum time param (default 1000)

### Animations not working
- Check if theme.css is imported
- Verify class name spelling
- Check for conflicting styles
- Ensure browser supports animations

### Glass effect not visible
- Check background is not solid white
- Verify backdrop-filter support
- Use gradient-mesh background
- Increase blur value if needed

### Gradients not showing
- Check text gradient uses text-fill
- Verify gradient syntax
- Use -webkit- prefix for Safari
- Check background-clip support

---

**Happy Coding! 🚀**

---

# 🚀 PHASE 3 FEATURES - QUICK REFERENCE

## 1. ImageOptimized Component

### Basic Usage
```typescript
import ImageOptimized from '@/components/ImageOptimized'

<ImageOptimized
  src="/images/photo.jpg"
  alt="My Photo"
  width={800}
  height={600}
/>
```

### Fill Container
```typescript
<div className="relative w-full h-64">
  <ImageOptimized
    src="/images/photo.jpg"
    alt="Background"
    fill
    objectFit="cover"
  />
</div>
```

### Priority Loading
```typescript
<ImageOptimized
  src="/images/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority
/>
```

---

## 2. Infinite Scroll Hook

### Usage
```typescript
import { useInfiniteUserRequests } from '@/hooks/useRequests'

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteUserRequests(user?.id, 20)

const allRequests = data?.pages.flatMap(page => page.requests) ?? []

// Load more button
{hasNextPage && (
  <button onClick={() => fetchNextPage()}>
    {isFetchingNextPage ? 'Loading...' : 'Load More'}
  </button>
)}
```

---

## 3. Real-Time Updates

### Basic Usage
```typescript
import { useRealtimeRequests } from '@/hooks/useRealtime'

const { isConnected } = useRealtimeRequests({
  userId: user?.id,
  enabled: !!user
})
```

### With Callbacks
```typescript
useRealtimeRequests({
  userId: user?.id,
  onUpdate: (request) => console.log('Updated:', request),
  onDelete: (id) => console.log('Deleted:', id)
})
```

---

## 4. Lazy Loading

### Extract and Lazy Load Component
```typescript
import { lazy, Suspense } from 'react'

const HeavyModal = lazy(() => import('./HeavyModal'))

<Suspense fallback={<LoadingSkeleton />}>
  <HeavyModal {...props} />
</Suspense>
```

---

## Performance Tips
- ✅ Use ImageOptimized for all external images
- ✅ Lazy load modals and heavy components
- ✅ Enable real-time for user-facing pages
- ✅ Use infinite scroll for lists with 50+ items
- ✅ Test with Lighthouse (target 90+)

---

**Phase 3 Complete! 🎉**
