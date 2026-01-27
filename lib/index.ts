/**
 * Central Backend Exports
 * Import all backend utilities from this single file
 */

// ============================================
// Database & Supabase
// ============================================
export { supabase, db } from './supabase'
export type {
  User,
  Request,
  BlogPost,
  TeamMember,
  Feedback,
  SiteSetting,
  FooterLink,
  NavigationLink,
  ValueSection,
  AboutSection,
  SystemPrompt,
  AIUsageLog,
  UserQuota,
  QuotaTier
} from './supabase'

export { supabaseAdmin } from './supabase-admin'

export {
  dbOptimized,
  getCachedSiteSettings,
  getCachedSiteSetting,
  getCachedFooterLinks,
  getCachedNavigationLinks,
  getCachedBlogPosts,
  getCachedBlogPost,
  parallelQueries
} from './db-optimized'

// ============================================
// Authentication
// ============================================
export {
  verifyAuth,
  getServerUser,
  requireRole,
  isAdmin,
  getUserIdFromRequest,
  requireAuth,
  requireAdminAuth,
  authServer
} from './auth-server'
export type { AuthUser } from './auth-server'
export type { UserRole } from './permissions'

// ============================================
// API Response Helpers
// ============================================
export {
  successResponse,
  messageResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  validationErrorResponse,
  rateLimitedResponse,
  internalErrorResponse,
  serviceUnavailableResponse,
  withErrorHandler,
  parsePagination,
  withTiming,
  withCacheHeaders,
  withNoCacheHeaders
} from './api-response'
export type { ApiResponse, PaginationParams } from './api-response'

// ============================================
// Caching
// ============================================
export {
  LRUCache,
  apiCache,
  dbCache,
  settingsCache,
  sessionCache,
  cacheKeys,
  invalidateSiteCache,
  invalidateUserCache,
  invalidateBlogCache,
  invalidateContentCache
} from './lru-cache'

export {
  getCachedResult,
  cacheResult
} from './cache'

// ============================================
// Rate Limiting
// ============================================
export {
  checkRateLimit,
  getRateLimitType,
  createRateLimitHeaders,
  generateRateLimitKey,
  rateLimit,
  RATE_LIMITS
} from './rate-limit'
export type { RateLimitType } from './rate-limit'

// ============================================
// AI & Processing
// ============================================
export {
  analyzeImage,
  processImageWithGemini,
  processImagesInBatch,
  validateGeminiKey,
  getAvailableModels,
  gemini
} from './gemini'
export type {
  ProcessingOptions,
  ProcessedResult,
  ImageAnalysis,
  DetectedObject
} from './gemini'

// ============================================
// Quota Management
// ============================================
export {
  checkQuota,
  logUsage,
  getQuotaInfo,
  isUserAdmin,
  getUsageHistory,
  getAvailableTiers,
  quota
} from './quota'
export type {
  QuotaInfo,
  QuotaCheckResult,
  UsageLogEntry
} from './quota'

// ============================================
// Logging
// ============================================
export { logger } from './logger'
export type { LogLevel, LogEntry } from './logger'

// ============================================
// Validation Schemas
// ============================================
export {
  AIProcessingSchema,
  ApiKeyValidationSchema,
  loginSchema,
  profileSchema,
  requestSchema,
  registerSchema,
  blogPostSchema
} from './validation'
export type {
  AIProcessingRequest,
  LoginRequest,
  ProfileInput,
  RegisterInput,
  BlogPostInput
} from './validation'

