# ⚡ QUICK REFERENCE - Loading System

## 📌 One-Page Cheat Sheet

### 1️⃣ For Page Loading (Server + Client)

**Server Component (page.tsx)**
```tsx
// Fetch all data in parallel
const [data1, data2] = await Promise.all([
  fetchData1(),
  fetchData2(),
])
return <PageClient data1={data1} data2={data2} />
```

**Client Component (PageClient.tsx)**
```tsx
'use client'
import { useMinimumLoadingTime } from '@/lib/hooks/useMinimumLoadingTime'
import UniversalLoading from '@/components/UniversalLoading'

export default function PageClient({ data1, data2 }) {
  const shouldShowLoading = useMinimumLoadingTime()
  if (shouldShowLoading) {
    return <UniversalLoading fullScreen message="Chuẩn bị nội dung..." />
  }
  return <div>{/* Your content */}</div>
}
```

**Loading File (loading.tsx)**
```tsx
import { LoadingPage } from '@/components/LoadingPages'
export default function Loading() {
  return <LoadingPage />
}
```

---

### 2️⃣ Configuration Constants

```typescript
// From lib/loading-config.ts
MINIMUM_PAGE_LOAD_MS: 1500           // Page (1.5s)
MINIMUM_DATA_FETCH_MS: 1200          // Data (1.2s)
MINIMUM_FORM_SUBMIT_MS: 1000         // Form (1s)
MINIMUM_AUTH_MS: 1500                // Auth (1.5s)

// Messages
'PAGE_LOAD': 'Chuẩn bị nội dung...'
'DATA_FETCH': 'Đang tải dữ liệu...'
'FORM_SUBMIT': 'Đang xử lý...'
```

---

### 3️⃣ Import Shortcuts

```typescript
// Loading hook
import { useMinimumLoadingTime } from '@/lib/hooks/useMinimumLoadingTime'

// Config
import { LOADING_CONFIG } from '@/lib/loading-config'

// Components
import UniversalLoading, { 
  FullScreenLoading, 
  MinimalLoading, 
  ProgressLoading 
} from '@/components/UniversalLoading'

import { LoadingPage, AdminLoadingPage } from '@/components/LoadingPages'
```

---

### 4️⃣ Hook Usage

```typescript
// Default: 1.5s minimum
const shouldShowLoading = useMinimumLoadingTime()

// Custom duration: 2s minimum
const shouldShowLoading = useMinimumLoadingTime(true, 2000)

// With initial state: start without loading
const shouldShowLoading = useMinimumLoadingTime(false, 1500)
```

---

### 5️⃣ Component Usage

**UniversalLoading**
```tsx
<UniversalLoading 
  fullScreen 
  message="Loading..."
  variant="default"
  minDurationMs={1500}
/>
```

**Variants**
```tsx
<FullScreenLoading message="..." />           // Full screen
<MinimalLoading message="..." />              // Minimal spinner
<ProgressLoading message="..." progress={50} />  // With progress
```

**LoadingPages**
```tsx
<LoadingPage />              // Generic
<AdminLoadingPage />         // Admin panel
<DashboardLoadingPage />     // Dashboard
<ProfileLoadingPage />       // Profile
<RequestsLoadingPage />      // Requests
<BlogLoadingPage />          // Blog
```

---

### 6️⃣ Best Practices (TL;DR)

✅ **DO:**
- Use server components for data fetching
- Use Promise.all() for parallel fetch
- Enforce minimum 1.5s loading time
- Check `shouldShowLoading` before rendering
- Use configuration constants

❌ **DON'T:**
- Fetch data on client (slower)
- Fetch data sequentially (waterfalls)
- Skip minimum loading time
- Use hardcoded timing values
- Fetch on mount in useEffect

---

### 7️⃣ Testing Locally

```bash
# Run dev server
npm run dev

# In DevTools:
1. Network → Throttle to "Slow 3G"
2. Reload page
3. Should see loading for ~1.5s minimum
4. Then content appears smoothly
```

---

### 8️⃣ Troubleshooting

| Problem | Solution |
|---------|----------|
| Content shows too fast | Add `useMinimumLoadingTime()` hook |
| No loading screen | Check `if (shouldShowLoading)` |
| Wrong message | Use `LOADING_CONFIG.getMessage()` |
| Waterfalls | Use `Promise.all()` |
| Type errors | Check imports |

---

### 9️⃣ Files Reference

| File | Purpose |
|------|---------|
| `lib/loading-config.ts` | Configuration |
| `lib/hooks/useMinimumLoadingTime.ts` | Hook ⭐ |
| `components/UniversalLoading.tsx` | Component |
| `components/LoadingPages.tsx` | Wrappers |
| `app/LandingPageClient.tsx` | Example |
| `docs/LOADING_BEST_PRACTICES.md` | Full guide |

---

### 🔟 Common Tasks

**Update existing page:**
1. Split into `page.tsx` (server) + `PageClient.tsx` (client)
2. Add `useMinimumLoadingTime()` in client
3. Check `if (shouldShowLoading)` and show loading
4. Create `loading.tsx` with wrapper

**Change loading timing:**
1. Edit `lib/loading-config.ts`
2. Update `MINIMUM_PAGE_LOAD_MS` constant
3. All pages automatically use new timing

**Add custom message:**
```tsx
message={LOADING_CONFIG.getMessage('PAGE_LOAD')}
// or
message="Custom message..."
```

---

## 🚀 Deploy Checklist

- [ ] Review all changes
- [ ] Test locally: `npm run dev`
- [ ] Build: `npm run build`
- [ ] Push: `git push`
- [ ] Wait for Vercel
- [ ] Test on Vercel preview
- [ ] Check no console errors
- [ ] Deploy to production

---

## 📞 Quick Help

```
Q: Why 1.5 seconds?
A: Optimal balance - feels professional, not too fast

Q: Can I change it?
A: Yes! Edit LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS

Q: How to use in existing page?
A: Follow pattern in app/LandingPageClient.tsx

Q: What about forms?
A: Use MINIMUM_FORM_SUBMIT_MS (default 1s)

Q: Mobile friendly?
A: Yes! Works on all devices

Q: Performance impact?
A: Improves perceived performance
```

---

**Version:** 1.0.0  
**Updated:** January 29, 2026  
**Status:** ✅ Ready to Use  

For full details: See `docs/LOADING_BEST_PRACTICES.md`
