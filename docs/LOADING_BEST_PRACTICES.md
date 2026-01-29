/**
 * 📚 BEST PRACTICES GUIDE - Loading & Performance Optimization
 * 
 * Hướng dẫn đầy đủ để implement loading system tối ưu cho Vercel deployment
 */

// ============================================
// 1. PAGE STRUCTURE - Server vs Client Components
// ============================================

/**
 * ✅ CORRECT PATTERN:
 * 
 * app/example/page.tsx (Server Component)
 * - Fetch ALL data needed for page
 * - Use Promise.all() for parallel fetching
 * - Pass data to Client Component
 * 
 * app/example/ExampleClient.tsx (Client Component)
 * - Render content
 * - Handle user interactions
 * - Use minimum loading time hook if needed
 */

// Example: app/example/page.tsx
/*
import { getFeatures } from '@/lib/api'
import { getUser } from '@/lib/auth'
import ExampleClient from './ExampleClient'

export default async function ExamplePage() {
  try {
    // ✅ Parallel fetching - faster than sequential
    const [features, user] = await Promise.all([
      getFeatures(),
      getUser(),
    ])

    return <ExampleClient features={features} user={user} />
  } catch (error) {
    return <ExampleClient features={[]} user={null} />
  }
}
*/

// Example: app/example/ExampleClient.tsx
/*
'use client'

import { useMinimumLoadingTime } from '@/lib/hooks/useMinimumLoadingTime'
import { LOADING_CONFIG } from '@/lib/loading-config'
import UniversalLoading from '@/components/UniversalLoading'

export default function ExampleClient({ features, user }) {
  // ✅ Enforce minimum 1.5s loading time
  const shouldShowLoading = useMinimumLoadingTime(true, LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS)

  if (shouldShowLoading) {
    return (
      <UniversalLoading
        fullScreen
        message={LOADING_CONFIG.getMessage('PAGE_LOAD')}
        variant="default"
        minDurationMs={LOADING_CONFIG.MINIMUM_PAGE_LOAD_MS}
      />
    )
  }

  return (
    <div>
      {/* Content */}
    </div>
  )
}
*/

// ============================================
// 2. DATA FETCHING BEST PRACTICES
// ============================================

/**
 * ✅ DO: Parallel fetching
 * ❌ DON'T: Sequential fetching
 */

// ✅ GOOD - Parallel (fast)
/*
const [data1, data2, data3] = await Promise.all([
  fetch1(),
  fetch2(),
  fetch3(),
])
*/

// ❌ BAD - Sequential (slow, waterfalls)
/*
const data1 = await fetch1()
const data2 = await fetch2()
const data3 = await fetch3()
*/

// ============================================
// 3. LOADING.TSX - Server Component
// ============================================

/**
 * app/example/loading.tsx (Server Component)
 * - Must be server component in Next.js 13+ App Router
 * - Shows while page is loading
 * - Uses LoadingPages wrapper for client rendering
 */

// ✅ Example:
/*
import { ExampleLoadingPage } from '@/components/LoadingPages'

export default function Loading() {
  return <ExampleLoadingPage />
}
*/

// ============================================
// 4. MINIMUM LOADING TIME - WHY 1.5 SECONDS?
// ============================================

/**
 * 1.5 seconds (1500ms) is optimal because:
 * 
 * - Under 500ms: Too fast, user doesn't feel anything (confusing)
 * - 500-1000ms: User feels something is loading, but seems quick
 * - 1000-1500ms: "Goldilocks zone" - feels professional & smooth
 * - 1500-2000ms: Still good, but pushing it
 * - Over 2000ms: Feels slow even if data is ready
 * 
 * Benefits of 1.5s minimum:
 * ✅ Prevents UI flashing
 * ✅ Makes app feel more polished
 * ✅ Gives user time to perceive action
 * ✅ Reduces cognitive load
 * ✅ Better perceived performance
 */

// ============================================
// 5. FORM SUBMISSION LOADING
// ============================================

/**
 * For form submissions, use shorter minimum time
 * since user just clicked a button
 */

// ✅ Example:
/*
import { useCallback, useState } from 'react'
import { LOADING_CONFIG } from '@/lib/loading-config'
import UniversalLoading, { FullScreenLoading } from '@/components/UniversalLoading'

export function ExampleForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStartTime(Date.now())
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      // Enforce minimum loading time
      const elapsed = Date.now() - (startTime || Date.now())
      const remaining = LOADING_CONFIG.MINIMUM_FORM_SUBMIT_MS - elapsed
      
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <FullScreenLoading message={LOADING_CONFIG.getMessage('FORM_SUBMIT')} />
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  )
}
*/

// ============================================
// 6. COMPONENT CHECKLIST
// ============================================

/**
 * Before deploying to Vercel:
 * 
 * ✅ Page Components:
 *   [ ] Server component fetches all data
 *   [ ] Uses Promise.all() for parallel fetching
 *   [ ] Has proper error handling & fallback
 *   [ ] Passes data to Client component
 * 
 * ✅ Client Components:
 *   [ ] Has useMinimumLoadingTime hook
 *   [ ] Shows UniversalLoading if shouldShowLoading
 *   [ ] Uses LOADING_CONFIG messages
 *   [ ] Has minimum 1.5s loading time
 * 
 * ✅ Loading.tsx Files:
 *   [ ] Server component (no 'use client')
 *   [ ] Uses LoadingPages wrapper
 *   [ ] Shows appropriate message
 *   [ ] Matches theme
 * 
 * ✅ Performance:
 *   [ ] No waterfalls (sequential fetching)
 *   [ ] Images are optimized with next/image
 *   [ ] Heavy components use dynamic import
 *   [ ] No console errors
 * 
 * ✅ UX:
 *   [ ] No UI flashing/jumping
 *   [ ] Smooth transitions
 *   [ ] Clear loading messages
 *   [ ] Professional appearance
 */

// ============================================
// 7. TESTING ON VERCEL
// ============================================

/**
 * How to test loading behavior:
 * 
 * 1. Deploy to Vercel staging environment
 * 2. Throttle network to "Slow 3G" in DevTools
 * 3. Reload page and observe:
 *    - Loading screen should appear
 *    - Minimum 1.5s should pass before content shows
 *    - No UI jumping or flashing
 *    - Messages should be clear
 * 
 * 4. Check performance:
 *    - First Contentful Paint (FCP)
 *    - Largest Contentful Paint (LCP)
 *    - Cumulative Layout Shift (CLS)
 *    - Total Blocking Time (TBT)
 */

// ============================================
// 8. MIGRATION CHECKLIST - Update Old Pages
// ============================================

/**
 * If you have old pages without proper loading:
 * 
 * Step 1: Create server page component
 *   - Fetch all data with Promise.all()
 *   - Add error handling
 *   - Pass data to client component
 * 
 * Step 2: Create client component
 *   - Rename old page to PageClient.tsx
 *   - Add 'use client' directive
 *   - Add useMinimumLoadingTime hook
 *   - Add loading UI
 * 
 * Step 3: Create loading.tsx
 *   - Use LoadingPages wrapper
 *   - Add appropriate message
 * 
 * Step 4: Update old page to be server component
 *   - Remove 'use client'
 *   - Fetch data
 *   - Return client component
 * 
 * Step 5: Test
 *   - Local: npm run dev
 *   - Preview: vercel deploy --prod
 *   - Check loading times and UI
 */

// ============================================
// 9. COMMON MISTAKES TO AVOID
// ============================================

/**
 * ❌ MISTAKE 1: Sequential fetching
 * const data1 = await fetch()
 * const data2 = await fetch()  // Waits for data1!
 * 
 * ✅ FIX: Use Promise.all()
 * const [data1, data2] = await Promise.all([fetch(), fetch()])
 */

/**
 * ❌ MISTAKE 2: Loading time too short
 * return <UniversalLoading minDurationMs={300} />  // Too fast!
 * 
 * ✅ FIX: Use minimum 1.5s
 * return <UniversalLoading minDurationMs={1500} />
 */

/**
 * ❌ MISTAKE 3: Client component fetching data
 * export default function MyPage() {
 *   const [data, setData] = useState(null)
 *   useEffect(() => {
 *     fetch(...).then(setData)  // Waterfalls!
 *   }, [])
 * }
 * 
 * ✅ FIX: Server component fetches
 * export default async function MyPage() {
 *   const data = await fetch(...)  // Fast!
 *   return <MyPageClient data={data} />
 * }
 */

/**
 * ❌ MISTAKE 4: Forgetting to check shouldShowLoading
 * return (
 *   <div>Content immediately shown</div>  // No loading screen!
 * )
 * 
 * ✅ FIX: Check loading state
 * if (shouldShowLoading) {
 *   return <UniversalLoading />
 * }
 * return <div>Content</div>
 */

// ============================================
// 10. FILES TO REFERENCE
// ============================================

/**
 * Key files for reference:
 * 
 * lib/loading-config.ts
 *   - LOADING_CONFIG object with all settings
 *   - Helper methods
 *   - Best practices documentation
 * 
 * lib/hooks/useMinimumLoadingTime.ts
 *   - Hook to enforce minimum loading time
 *   - withMinimumLoading HOC
 * 
 * lib/hooks/useMinimumLoadingDelay.ts
 *   - Alternative hook for more control
 * 
 * components/UniversalLoading.tsx
 *   - Main loading component
 *   - Variants: FullScreenLoading, MinimalLoading, ProgressLoading
 * 
 * components/LoadingPages.tsx
 *   - Client wrappers for loading.tsx files
 *   - Used by app/[route]/loading.tsx
 * 
 * app/page.tsx & app/LandingPageClient.tsx
 *   - Example implementation
 *   - Server component with data fetching
 *   - Client component with minimum loading time
 */

export const BEST_PRACTICES = {
  title: 'LOADING & PERFORMANCE BEST PRACTICES',
  version: '1.0.0',
  lastUpdated: '2026-01-29',
}
