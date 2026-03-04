/**
 * Custom Error Classes & Centralized Error Handler
 * 
 * Provides typed error hierarchy for consistent error handling
 * across all API routes and server-side logic.
 */

// ============================================
// Base Application Error
// ============================================

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    this.details = details

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Serialize for JSON response (hides stack in production)
   */
  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      ...(this.details ? { details: this.details } : {}),
      ...(process.env.NODE_ENV === 'development' ? { stack: this.stack } : {}),
    }
  }
}

// ============================================
// Specific Error Types
// ============================================

/** 400 - Invalid request data */
export class ValidationError extends AppError {
  constructor(message: string = 'Dữ liệu không hợp lệ', details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

/** 401 - Not authenticated */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Vui lòng đăng nhập') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

/** 403 - Not authorized */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Bạn không có quyền thực hiện hành động này') {
    super(message, 403, 'FORBIDDEN')
  }
}

/** 404 - Resource not found */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Tài nguyên') {
    super(`${resource} không tìm thấy`, 404, 'NOT_FOUND')
  }
}

/** 409 - Conflict (duplicate, version mismatch) */
export class ConflictError extends AppError {
  constructor(message: string = 'Xung đột dữ liệu', details?: Record<string, any>) {
    super(message, 409, 'CONFLICT', details)
  }
}

/** 422 - Unprocessable entity */
export class UnprocessableError extends AppError {
  constructor(message: string = 'Không thể xử lý yêu cầu', details?: Record<string, any>) {
    super(message, 422, 'UNPROCESSABLE', details)
  }
}

/** 429 - Rate limit exceeded */
export class RateLimitError extends AppError {
  public readonly retryAfter: number

  constructor(retryAfter: number = 60) {
    super(
      `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`,
      429,
      'RATE_LIMITED',
      { retryAfter }
    )
    this.retryAfter = retryAfter
  }
}

/** 429 - AI quota exceeded */
export class QuotaExceededError extends AppError {
  constructor(
    message: string = 'Đã hết lượt sử dụng AI trong tháng',
    details?: Record<string, any>
  ) {
    super(message, 429, 'QUOTA_EXCEEDED', details)
  }
}

/** 500 - Internal server error */
export class InternalError extends AppError {
  constructor(message: string = 'Lỗi hệ thống', originalError?: Error) {
    super(message, 500, 'INTERNAL_ERROR', originalError ? {
      originalMessage: originalError.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: originalError.stack } : {})
    } : undefined)
  }
}

/** 503 - Service unavailable */
export class ServiceUnavailableError extends AppError {
  constructor(service: string = 'Dịch vụ') {
    super(`${service} tạm thời không khả dụng. Vui lòng thử lại sau.`, 503, 'SERVICE_UNAVAILABLE')
  }
}

/** 423 - Resource locked */
export class ResourceLockedError extends AppError {
  constructor(resource: string = 'Tài nguyên') {
    super(
      `${resource} đang được chỉnh sửa bởi người khác. Vui lòng thử lại sau.`,
      423,
      'RESOURCE_LOCKED',
      { retryable: true }
    )
  }
}

// ============================================
// Error Handling Utilities
// ============================================

/**
 * Check if error is an operational (expected) error
 */
export function isOperationalError(error: unknown): error is AppError {
  return error instanceof AppError && error.isOperational
}

/**
 * Convert unknown error to AppError
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error

  if (error instanceof Error) {
    return new InternalError(error.message, error)
  }

  return new InternalError(
    typeof error === 'string' ? error : 'Lỗi không xác định'
  )
}

/**
 * Create error from Supabase error response
 */
export function fromSupabaseError(error: { message: string; code?: string; details?: string }): AppError {
  const message = error.message || 'Database error'

  // Map common Supabase/PostgreSQL error codes
  switch (error.code) {
    case '23505': // unique_violation
      return new ConflictError('Dữ liệu đã tồn tại')
    case '23503': // foreign_key_violation
      return new ValidationError('Tham chiếu dữ liệu không hợp lệ')
    case '23502': // not_null_violation
      return new ValidationError('Thiếu dữ liệu bắt buộc')
    case '42501': // insufficient_privilege
      return new AuthorizationError()
    case 'PGRST116': // not found (PostgREST)
      return new NotFoundError()
    default:
      return new InternalError(message)
  }
}

/**
 * Create a NextResponse from an AppError
 */
export function errorToResponse(error: AppError) {
  const { NextResponse } = require('next/server')

  const headers: Record<string, string> = {}
  if (error instanceof RateLimitError) {
    headers['Retry-After'] = error.retryAfter.toString()
  }

  return NextResponse.json(error.toJSON(), {
    status: error.statusCode,
    headers,
  })
}
