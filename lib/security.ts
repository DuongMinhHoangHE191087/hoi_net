import DOMPurify from 'isomorphic-dompurify'

/**
 * Security utilities for input sanitization and validation
 * Prevents XSS, SQL injection, and other security vulnerabilities
 */

// XSS Prevention - Sanitize HTML content
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre',
      'img', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
  })
}

// Sanitize plain text input (remove HTML tags)
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input) return ''

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < >
    .replace(/\\/g, '') // Remove backslashes
    .substring(0, maxLength) // Limit length
}

// Email validation (basic)
export function validateEmail(email: string): boolean {
  if (!email) return false

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Additional checks
  if (email.length > 254) return false
  if (email.includes('..')) return false

  return emailRegex.test(email)
}

// Detailed email validation with bit-hash checking
export function validateEmailDetailed(email: string): { 
  valid: boolean
  error?: string 
} {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email không được để trống' }
  }

  email = email.trim().toLowerCase()

  // Basic length check
  if (email.length < 5 || email.length > 254) {
    return { valid: false, error: 'Email không hợp lệ' }
  }

  // Split email into local and domain parts
  const atIndex = email.indexOf('@')
  if (atIndex === -1 || atIndex === 0 || atIndex === email.length - 1) {
    return { valid: false, error: 'Email phải chứa @' }
  }

  const localPart = email.substring(0, atIndex)
  const domainPart = email.substring(atIndex + 1)

  // Check local part
  if (localPart.length === 0 || localPart.length > 64) {
    return { valid: false, error: 'Phần trước @ không hợp lệ' }
  }

  // Check domain part - must have at least one dot
  const dotIndex = domainPart.lastIndexOf('.')
  if (dotIndex === -1 || dotIndex === 0 || dotIndex === domainPart.length - 1) {
    return { valid: false, error: `'.' bị sử dụng sai vị trí trong '${domainPart}'.` }
  }

  // Domain must have valid TLD (at least 2 chars)
  const tld = domainPart.substring(dotIndex + 1)
  if (tld.length < 2) {
    return { valid: false, error: 'Tên miền email không hợp lệ' }
  }

  // Check for consecutive dots
  if (email.includes('..')) {
    return { valid: false, error: 'Email không được có dấu chấm liên tiếp' }
  }

  // Bit-hash character validation using regex
  const validLocalChars = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/
  const validDomainChars = /^[a-zA-Z0-9.-]+$/

  if (!validLocalChars.test(localPart)) {
    return { valid: false, error: 'Email chứa ký tự không hợp lệ' }
  }

  if (!validDomainChars.test(domainPart)) {
    return { valid: false, error: 'Tên miền chứa ký tự không hợp lệ' }
  }

  // Check each domain label
  const domainLabels = domainPart.split('.')
  for (const label of domainLabels) {
    if (label.length === 0 || label.startsWith('-') || label.endsWith('-')) {
      return { valid: false, error: 'Tên miền email không hợp lệ' }
    }
  }

  return { valid: true }
}

// Phone validation (Vietnamese format)
export function validatePhone(phone: string): boolean {
  if (!phone) return false

  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '')

  // Vietnamese phone: 10-11 digits, starting with 0
  const phoneRegex = /^0[0-9]{9,10}$/

  return phoneRegex.test(cleaned)
}

// Password strength validation
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Phải có ít nhất 1 chữ thường')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Phải có ít nhất 1 chữ hoa')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Phải có ít nhất 1 số')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Phải có ít nhất 1 ký tự đặc biệt')
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  if (errors.length === 0 && password.length >= 12) {
    strength = 'strong'
  } else if (errors.length <= 2 && password.length >= 8) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

// URL validation
export function validateURL(url: string): boolean {
  if (!url) return false

  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Facebook URL validation
export function validateFacebookURL(url: string): boolean {
  if (!url) return true // Optional field

  if (!validateURL(url)) return false

  return url.includes('facebook.com') || url.includes('fb.com')
}

// Sanitize filename for uploads
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // No consecutive dots
    .substring(0, 255) // Limit length
}

// Validate file type
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

// Validate file size (in MB)
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxBytes
}

// Rate limiting helper (client-side)
const rateLimitMap = new Map<string, number[]>()

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const attempts = rateLimitMap.get(key) || []

  // Remove old attempts outside window
  const recentAttempts = attempts.filter(time => now - time < windowMs)

  if (recentAttempts.length >= maxAttempts) {
    return false // Rate limit exceeded
  }

  recentAttempts.push(now)
  rateLimitMap.set(key, recentAttempts)

  return true
}

// SQL Injection Prevention (Supabase handles this, but validate inputs anyway)
export function escapeSQL(input: string): string {
  if (!input) return ''

  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
}

// CSRF Token validation (for forms)
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Validate Vietnamese address
export function validateAddress(address: string): boolean {
  if (!address) return true // Optional

  const sanitized = sanitizeInput(address, 200)
  return sanitized.length >= 10 && sanitized.length <= 200
}

// Sanitize search query
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '')
    .replace(/[^\w\s\u00C0-\u1EF9-]/g, '') // Allow Vietnamese chars
    .substring(0, 100)
}

// Export all functions
export const security = {
  sanitizeHTML,
  sanitizeInput,
  validateEmail,
  validateEmailDetailed,
  validatePhone,
  validatePassword,
  validateURL,
  validateFacebookURL,
  sanitizeFilename,
  validateFileType,
  validateFileSize,
  checkRateLimit,
  escapeSQL,
  generateCSRFToken,
  validateAddress,
  sanitizeSearchQuery,
}

export default security

