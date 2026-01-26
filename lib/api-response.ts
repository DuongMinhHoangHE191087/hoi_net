/**
 * Standardized API Response Helpers
 * Ensures consistent response format across all API routes
 */

import { NextResponse } from 'next/server'

// ============================================
// Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    processingTime?: number
    // Version conflict fields
    expectedVersion?: number
    currentVersion?: number
    retryable?: boolean
    // Lock fields
    lockedBy?: string
    lockedAt?: string
    lockExpiresAt?: string
    [key: string]: any
  }
}

export interface PaginationParams {
  page: number
  limit: number
  total: number
}

// ============================================
// Success Responses
// ============================================

/**
 * Return successful response with data
 */
export function successResponse<T>(
  data: T,
  meta?: ApiResponse['meta'],
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta
    },
    { status }
  )
}

/**
 * Return successful response with message
 */
export function messageResponse(
  message: string,
  data?: any,
  status: number = 200
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status }
  )
}

/**
 * Return paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationParams,
  status: number = 200
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total
      }
    },
    { status }
  )
}

/**
 * Return created response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Created successfully'
    },
    { status: 201 }
  )
}

/**
 * Return no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

// ============================================
// Error Responses
// ============================================

/**
 * Return error response
 */
export function errorResponse(
  error: string,
  status: number = 500,
  code?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code
    },
    { status }
  )
}

/**
 * Return 400 Bad Request
 */
export function badRequestResponse(
  error: string = 'Bad Request',
  code?: string
): NextResponse<ApiResponse> {
  return errorResponse(error, 400, code || 'BAD_REQUEST')
}

/**
 * Return 401 Unauthorized
 */
export function unauthorizedResponse(
  error: string = 'Unauthorized'
): NextResponse<ApiResponse> {
  return errorResponse(error, 401, 'UNAUTHORIZED')
}

/**
 * Return 403 Forbidden
 */
export function forbiddenResponse(
  error: string = 'Forbidden'
): NextResponse<ApiResponse> {
  return errorResponse(error, 403, 'FORBIDDEN')
}

/**
 * Return 404 Not Found
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND')
}

/**
 * Return 409 Conflict
 */
export function conflictResponse(
  error: string = 'Resource already exists'
): NextResponse<ApiResponse> {
  return errorResponse(error, 409, 'CONFLICT')
}

/**
 * Return 409 Version Conflict (Optimistic Locking)
 * Used when concurrent updates cause version mismatch
 */
export function versionConflictResponse(
  expectedVersion: number,
  currentVersion: number,
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} was modified by another user. Please refresh and try again.`,
      code: 'VERSION_CONFLICT',
      meta: {
        expectedVersion,
        currentVersion,
        retryable: true
      }
    },
    { status: 409 }
  )
}

/**
 * Return 423 Locked
 * Used when a resource is locked by another user
 */
export function lockedResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} is currently being edited by another user. Please try again later.`,
      code: 'RESOURCE_LOCKED',
      meta: {
        retryable: true
      }
    },
    { status: 423 }
  )
}

/**
 * Return 422 Validation Error
 */
export function validationErrorResponse(
  errors: Record<string, string[]> | string
): NextResponse<ApiResponse> {
  const errorMessage = typeof errors === 'string'
    ? errors
    : Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
        .join('; ')

  return NextResponse.json(
    {
      success: false,
      error: 'Validation Error',
      message: errorMessage,
      code: 'VALIDATION_ERROR',
      data: typeof errors === 'object' ? errors : undefined
    },
    { status: 422 }
  )
}

/**
 * Return 429 Rate Limited
 */
export function rateLimitedResponse(
  retryAfter: number = 60
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Too Many Requests',
      message: `Please retry after ${retryAfter} seconds`,
      code: 'RATE_LIMITED'
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString()
      }
    }
  )
}

/**
 * Return 500 Internal Server Error
 */
export function internalErrorResponse(
  error?: Error | string,
  logError: boolean = true
): NextResponse<ApiResponse> {
  if (logError && error) {
    console.error('[API Error]', error)
  }

  const message = process.env.NODE_ENV === 'development' && error
    ? (typeof error === 'string' ? error : error.message)
    : 'Internal Server Error'

  return errorResponse(message, 500, 'INTERNAL_ERROR')
}

/**
 * Return 503 Service Unavailable
 */
export function serviceUnavailableResponse(
  error: string = 'Service temporarily unavailable'
): NextResponse<ApiResponse> {
  return errorResponse(error, 503, 'SERVICE_UNAVAILABLE')
}

// ============================================
// Utility Functions
// ============================================

/**
 * Wrap async handler with error catching
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiResponse>> {
  return handler().catch((error: Error) => {
    console.error('[API Handler Error]', error)
    return internalErrorResponse(error, false)
  })
}

/**
 * Parse pagination params from URL
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number } = {}
): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || String(defaults.page || 1)))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || String(defaults.limit || 20))))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Add timing header to response
 */
export function withTiming<T extends NextResponse>(
  response: T,
  startTime: number
): T {
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
  return response
}

/**
 * Add cache headers to response
 */
export function withCacheHeaders<T extends NextResponse>(
  response: T,
  maxAge: number = 60,
  staleWhileRevalidate: number = 300
): T {
  response.headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  )
  return response
}

/**
 * Add no-cache headers to response
 */
export function withNoCacheHeaders<T extends NextResponse>(response: T): T {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  return response
}

