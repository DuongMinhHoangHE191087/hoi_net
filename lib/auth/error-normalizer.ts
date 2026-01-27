/**
 * 🔐 Auth Error Normalizer
 * 
 * Chuẩn hóa tất cả các loại lỗi auth thành format thống nhất.
 * KHÔNG BAO GIỜ render object trực tiếp - luôn trả về string message.
 */

import { AuthError, AuthErrorCode } from './types'

// ============================================
// Extended Error Codes
// ============================================

export type ExtendedAuthErrorCode = AuthErrorCode
  | 'USER_ALREADY_REGISTERED'
  | 'USER_NOT_FOUND'
  | 'ACCOUNT_LOCKED'
  | 'CAPTCHA_REQUIRED'
  | 'CAPTCHA_FAILED'
  | 'MAGIC_LINK_SENT'
  | 'TOO_MANY_ATTEMPTS'
  | 'WEAK_PASSWORD'
  | 'INVALID_EMAIL'

// ============================================
// Error Messages Map (Vietnamese)
// ============================================

const ERROR_MESSAGES: Record<ExtendedAuthErrorCode, string> = {
  // Original codes
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  EMAIL_NOT_CONFIRMED: 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.',
  USER_NOT_FOUND: 'Tài khoản chưa được đăng ký. Vui lòng tạo tài khoản mới.',
  RATE_LIMITED: 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  UNKNOWN: 'Đã xảy ra lỗi. Vui lòng thử lại.',
  
  // Extended codes
  USER_ALREADY_REGISTERED: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.',
  ACCOUNT_LOCKED: 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần.',
  CAPTCHA_REQUIRED: 'Vui lòng hoàn thành xác minh CAPTCHA.',
  CAPTCHA_FAILED: 'Xác minh CAPTCHA thất bại. Vui lòng thử lại.',
  MAGIC_LINK_SENT: 'Link đăng nhập đã được gửi đến email của bạn.',
  TOO_MANY_ATTEMPTS: 'Quá nhiều lần thử. Vui lòng sử dụng magic link để đăng nhập.',
  WEAK_PASSWORD: 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.',
  INVALID_EMAIL: 'Địa chỉ email không hợp lệ.',
}

// ============================================
// Extended AuthError Interface
// ============================================

export interface ExtendedAuthError {
  code: ExtendedAuthErrorCode
  message: string
  lockoutUntil?: string // ISO date string
  remainingAttempts?: number
  requiresCaptcha?: boolean
  originalError?: unknown
}

// ============================================
// Normalizer Functions
// ============================================

/**
 * Normalize ANY error type to ExtendedAuthError
 * This is the main function to use everywhere
 */
export function normalizeAuthError(error: unknown): ExtendedAuthError {
  // Already normalized
  if (isExtendedAuthError(error)) {
    return error
  }

  // AuthError from types.ts
  if (isAuthError(error)) {
    return {
      code: error.code as ExtendedAuthErrorCode,
      message: ERROR_MESSAGES[error.code as ExtendedAuthErrorCode] || error.message,
      originalError: error.originalError,
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return mapErrorMessage(error.message, error)
  }

  // String error
  if (typeof error === 'string') {
    return mapErrorMessage(error)
  }

  // Object with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message
    if (typeof msg === 'string') {
      return mapErrorMessage(msg, error)
    }
  }

  // Unknown error type
  return {
    code: 'UNKNOWN',
    message: ERROR_MESSAGES.UNKNOWN,
    originalError: error,
  }
}

/**
 * Get ONLY the message string - use this for UI display
 * NEVER render the error object directly
 */
export function getErrorMessage(error: unknown): string {
  const normalized = normalizeAuthError(error)
  return normalized.message
}

/**
 * Get error code for conditional logic
 */
export function getErrorCode(error: unknown): ExtendedAuthErrorCode {
  const normalized = normalizeAuthError(error)
  return normalized.code
}

/**
 * Check if error requires captcha
 */
export function requiresCaptcha(error: unknown): boolean {
  const normalized = normalizeAuthError(error)
  return normalized.requiresCaptcha === true || normalized.code === 'CAPTCHA_REQUIRED'
}

/**
 * Check if account is locked
 */
export function isAccountLocked(error: unknown): boolean {
  const code = getErrorCode(error)
  return code === 'ACCOUNT_LOCKED' || code === 'TOO_MANY_ATTEMPTS'
}

/**
 * Get lockout remaining time in human-readable format
 */
export function getLockoutMessage(error: unknown): string | null {
  const normalized = normalizeAuthError(error)
  
  if (!normalized.lockoutUntil) return null
  
  const lockoutDate = new Date(normalized.lockoutUntil)
  const now = new Date()
  const diffMs = lockoutDate.getTime() - now.getTime()
  
  if (diffMs <= 0) return null
  
  const diffMins = Math.ceil(diffMs / 60000)
  
  if (diffMins < 60) {
    return `Tài khoản bị khóa. Vui lòng thử lại sau ${diffMins} phút.`
  }
  
  const diffHours = Math.ceil(diffMins / 60)
  return `Tài khoản bị khóa. Vui lòng thử lại sau ${diffHours} giờ.`
}

// ============================================
// Internal Helpers
// ============================================

function isAuthError(error: unknown): error is AuthError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    typeof (error as AuthError).code === 'string' &&
    typeof (error as AuthError).message === 'string'
  )
}

function isExtendedAuthError(error: unknown): error is ExtendedAuthError {
  return isAuthError(error)
}

/**
 * Map Supabase/common error messages to our error codes
 */
function mapErrorMessage(message: string, originalError?: unknown): ExtendedAuthError {
  const lowerMessage = message.toLowerCase()
  
  // Invalid credentials
  if (lowerMessage.includes('invalid login credentials') || 
      lowerMessage.includes('invalid password') ||
      lowerMessage.includes('wrong password')) {
    return {
      code: 'INVALID_CREDENTIALS',
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      originalError,
    }
  }
  
  // Email not confirmed
  if (lowerMessage.includes('email not confirmed') ||
      lowerMessage.includes('email chưa xác nhận')) {
    return {
      code: 'EMAIL_NOT_CONFIRMED',
      message: ERROR_MESSAGES.EMAIL_NOT_CONFIRMED,
      originalError,
    }
  }
  
  // Already registered
  if (lowerMessage.includes('already registered') ||
      lowerMessage.includes('already been registered') ||
      lowerMessage.includes('user already exists') ||
      lowerMessage.includes('duplicate') ||
      lowerMessage.includes('email đã được đăng ký')) {
    return {
      code: 'USER_ALREADY_REGISTERED',
      message: ERROR_MESSAGES.USER_ALREADY_REGISTERED,
      originalError,
    }
  }
  
  // User not found
  if (lowerMessage.includes('user not found') ||
      lowerMessage.includes('no user') ||
      lowerMessage.includes('không tìm thấy')) {
    return {
      code: 'USER_NOT_FOUND',
      message: ERROR_MESSAGES.USER_NOT_FOUND,
      originalError,
    }
  }
  
  // Rate limited
  if (lowerMessage.includes('rate limit') ||
      lowerMessage.includes('too many requests') ||
      lowerMessage.includes('quá nhiều')) {
    return {
      code: 'RATE_LIMITED',
      message: ERROR_MESSAGES.RATE_LIMITED,
      originalError,
    }
  }
  
  // Network errors
  if (lowerMessage.includes('network') ||
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('kết nối')) {
    return {
      code: 'NETWORK_ERROR',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      originalError,
    }
  }
  
  // Weak password
  if (lowerMessage.includes('weak password') ||
      lowerMessage.includes('password') && lowerMessage.includes('weak')) {
    return {
      code: 'WEAK_PASSWORD',
      message: ERROR_MESSAGES.WEAK_PASSWORD,
      originalError,
    }
  }
  
  // Invalid email
  if (lowerMessage.includes('invalid email') ||
      lowerMessage.includes('email không hợp lệ')) {
    return {
      code: 'INVALID_EMAIL',
      message: ERROR_MESSAGES.INVALID_EMAIL,
      originalError,
    }
  }
  
  // Session expired
  if (lowerMessage.includes('session') && 
      (lowerMessage.includes('expired') || lowerMessage.includes('invalid'))) {
    return {
      code: 'SESSION_EXPIRED',
      message: ERROR_MESSAGES.SESSION_EXPIRED,
      originalError,
    }
  }
  
  // Default: return original message if it's user-friendly, otherwise generic
  const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(message)
  
  return {
    code: 'UNKNOWN',
    message: isVietnamese ? message : ERROR_MESSAGES.UNKNOWN,
    originalError,
  }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create a standardized auth error
 */
export function createAuthError(
  code: ExtendedAuthErrorCode,
  overrides?: Partial<ExtendedAuthError>
): ExtendedAuthError {
  return {
    code,
    message: ERROR_MESSAGES[code],
    ...overrides,
  }
}

/**
 * Create account locked error with lockout info
 */
export function createLockoutError(lockoutUntil: Date | string): ExtendedAuthError {
  const lockoutDate = typeof lockoutUntil === 'string' ? new Date(lockoutUntil) : lockoutUntil
  const now = new Date()
  const diffMins = Math.ceil((lockoutDate.getTime() - now.getTime()) / 60000)
  
  let message = ERROR_MESSAGES.ACCOUNT_LOCKED
  if (diffMins > 0 && diffMins < 60) {
    message += ` Vui lòng thử lại sau ${diffMins} phút hoặc sử dụng Magic Link.`
  } else if (diffMins >= 60) {
    const hours = Math.ceil(diffMins / 60)
    message += ` Vui lòng thử lại sau ${hours} giờ hoặc sử dụng Magic Link.`
  }
  
  return {
    code: 'ACCOUNT_LOCKED',
    message,
    lockoutUntil: lockoutDate.toISOString(),
  }
}

export default {
  normalizeAuthError,
  getErrorMessage,
  getErrorCode,
  requiresCaptcha,
  isAccountLocked,
  getLockoutMessage,
  createAuthError,
  createLockoutError,
}
