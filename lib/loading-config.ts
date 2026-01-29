/**
 * 🎯 LOADING SYSTEM CONFIGURATION
 * 
 * Cấu hình toàn bộ loading behavior cho app
 * Đảm bảo UX mượt mà trên Vercel
 */

const LOADING_CONFIG_OBJECT = {
  // ============================================
  // TIMING CONFIGURATION
  // ============================================

  // Minimum duration loading page (1.5s)
  // Tạo cảm giác app đang chuẩn bị dữ liệu tốt
  MINIMUM_PAGE_LOAD_MS: 1500,

  // Minimum duration cho data fetching
  MINIMUM_DATA_FETCH_MS: 1200,

  // Minimum duration cho form submission
  MINIMUM_FORM_SUBMIT_MS: 1000,

  // Minimum duration cho authentication
  MINIMUM_AUTH_MS: 1500,

  // ============================================
  // ANIMATION CONFIGURATION
  // ============================================

  // Fade in/out duration
  FADE_DURATION_MS: 300,

  // Target FPS for smooth animations
  ANIMATION_TARGET_FPS: 60,

  // Use CSS transforms (GPU accelerated)
  USE_GPU_ACCELERATION: true,

  // ============================================
  // DEFAULT MESSAGES
  // ============================================

  MESSAGES: {
    DEFAULT: 'Đang tải...',
    PAGE_LOAD: 'Chuẩn bị nội dung...',
    DATA_FETCH: 'Đang tải dữ liệu...',
    FORM_SUBMIT: 'Đang xử lý...',
    AUTH: 'Đang xác thực...',
    UPLOAD: 'Đang tải lên...',
    PROCESSING: 'Đang xử lý...',
  } as const,

  // ============================================
  // COMPONENT CONFIGURATION
  // ============================================

  // Disable animations on reduced motion preference
  RESPECT_REDUCE_MOTION: true,

  // Use hardware acceleration
  USE_WILL_CHANGE: true,

  // ============================================
  // VERCEL OPTIMIZATION
  // ============================================

  // Enable prefetch on hover/focus
  ENABLE_PREFETCH: true,

  // Preload critical resources
  ENABLE_PRELOAD: true,

  // Use Next.js Image optimization
  OPTIMIZE_IMAGES: true,
} as const

export type LoadingConfigType = typeof LOADING_CONFIG_OBJECT

export const LOADING_CONFIG: LoadingConfigType & {
  getMinimumDelay(context?: keyof typeof LOADING_CONFIG_OBJECT.MESSAGES): number
  getMessage(context?: keyof typeof LOADING_CONFIG_OBJECT.MESSAGES): string
} = {
  ...LOADING_CONFIG_OBJECT,

  /**
   * Get minimum delay based on context
   */
  getMinimumDelay(context: keyof typeof LOADING_CONFIG_OBJECT.MESSAGES = 'DEFAULT'): number {
    const contextMap: Record<string, number> = {
      DEFAULT: LOADING_CONFIG_OBJECT.MINIMUM_PAGE_LOAD_MS,
      PAGE_LOAD: LOADING_CONFIG_OBJECT.MINIMUM_PAGE_LOAD_MS,
      DATA_FETCH: LOADING_CONFIG_OBJECT.MINIMUM_DATA_FETCH_MS,
      FORM_SUBMIT: LOADING_CONFIG_OBJECT.MINIMUM_FORM_SUBMIT_MS,
      AUTH: LOADING_CONFIG_OBJECT.MINIMUM_AUTH_MS,
      UPLOAD: LOADING_CONFIG_OBJECT.MINIMUM_FORM_SUBMIT_MS,
      PROCESSING: LOADING_CONFIG_OBJECT.MINIMUM_FORM_SUBMIT_MS,
    }
    return contextMap[context] || LOADING_CONFIG_OBJECT.MINIMUM_PAGE_LOAD_MS
  },

  /**
   * Get message for context
   */
  getMessage(context: keyof typeof LOADING_CONFIG_OBJECT.MESSAGES = 'DEFAULT'): string {
    return LOADING_CONFIG_OBJECT.MESSAGES[context]
  },
}

// ============================================
// BEST PRACTICES - RULE BOOK
// ============================================

/**
 * ✅ LOADING BEST PRACTICES
 *
 * 1. PAGE STRUCTURE:
 *    - app/page.tsx = Server Component (fetch ALL data)
 *    - app/PageClient.tsx = Client Component (with hooks)
 *    - app/loading.tsx = Server Component (show UniversalLoading)
 *
 * 2. DATA FETCHING:
 *    - Use Promise.all() for parallel fetching
 *    - Cache data with Redis (2-hour TTL)
 *    - Fallback to database on cache miss
 *
 * 3. LOADING DISPLAY:
 *    - Page loading: 1.5s minimum
 *    - Form submit: 1.0s minimum
 *    - Data fetch: 1.2s minimum
 *
 * 4. CLIENT-SIDE PREPARATION:
 *    - Always use useMinimumLoadingDelay hook
 *    - Set 1.5s timeout before showing content
 *    - Prevents UI jumping/flashing
 *
 * 5. PERFORMANCE:
 *    - Use CSS transforms for animations
 *    - GPU acceleration: will-change
 *    - Reduce motion: respect prefers-reduced-motion
 *
 * 6. USER EXPERIENCE:
 *    - Show meaningful messages
 *    - Use progress bar for long operations
 *    - Show security badge on auth pages
 */

export type LoadingContext = keyof typeof LOADING_CONFIG.MESSAGES
