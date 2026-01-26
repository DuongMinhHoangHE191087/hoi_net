/**
 * 🔐 Auth Validation Utilities
 * Comprehensive validation for authentication forms
 */

import { z } from 'zod'

// ============================================
// Email Validation with Bit-Hash Checking
// ============================================

export interface EmailValidationResult {
  valid: boolean
  error?: string
  suggestion?: string
}

// Common email typos and corrections
const EMAIL_TYPO_CORRECTIONS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outllook.com': 'outlook.com',
}

// Popular email domains for validation
const POPULAR_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'live.com', 'msn.com', 'aol.com',
  'mail.com', 'protonmail.com', 'zoho.com',
]

/**
 * Comprehensive email validation with detailed error messages
 */
export function validateEmailComprehensive(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email không được để trống' }
  }

  email = email.trim()

  // Check for spaces
  if (email.includes(' ')) {
    return { valid: false, error: 'Email không được chứa khoảng trắng' }
  }

  // Basic length check
  if (email.length < 5) {
    return { valid: false, error: 'Email quá ngắn' }
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email quá dài (tối đa 254 ký tự)' }
  }

  // Check for @ symbol
  const atIndex = email.indexOf('@')
  if (atIndex === -1) {
    return { valid: false, error: 'Email phải chứa ký tự @' }
  }

  if (atIndex === 0) {
    return { valid: false, error: 'Email không được bắt đầu bằng @' }
  }

  if (atIndex === email.length - 1) {
    return { valid: false, error: 'Email không được kết thúc bằng @' }
  }

  // Check for multiple @ symbols
  if (email.split('@').length > 2) {
    return { valid: false, error: 'Email chỉ được chứa một ký tự @' }
  }

  const localPart = email.substring(0, atIndex)
  const domainPart = email.substring(atIndex + 1).toLowerCase()

  // Validate local part
  if (localPart.length === 0) {
    return { valid: false, error: 'Phần trước @ không được để trống' }
  }

  if (localPart.length > 64) {
    return { valid: false, error: 'Phần trước @ quá dài (tối đa 64 ký tự)' }
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valid: false, error: 'Phần trước @ không được bắt đầu hoặc kết thúc bằng dấu chấm' }
  }

  // Check for consecutive dots
  if (email.includes('..')) {
    return { valid: false, error: 'Email không được có hai dấu chấm liên tiếp' }
  }

  // Validate local part characters (RFC 5321)
  const validLocalChars = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/
  if (!validLocalChars.test(localPart)) {
    return { valid: false, error: 'Email chứa ký tự không hợp lệ' }
  }

  // Validate domain part
  if (domainPart.length === 0) {
    return { valid: false, error: 'Tên miền email không được để trống' }
  }

  // Check for dot in domain
  const dotIndex = domainPart.lastIndexOf('.')
  if (dotIndex === -1) {
    return { valid: false, error: `Tên miền '${domainPart}' thiếu đuôi mở rộng (ví dụ: .com)` }
  }

  if (dotIndex === 0) {
    return { valid: false, error: `'.' bị sử dụng sai vị trí trong '${domainPart}'` }
  }

  if (dotIndex === domainPart.length - 1) {
    return { valid: false, error: `'.' bị sử dụng sai vị trí trong '${domainPart}'` }
  }

  // Check TLD
  const tld = domainPart.substring(dotIndex + 1)
  if (tld.length < 2) {
    return { valid: false, error: `Đuôi mở rộng '.${tld}' không hợp lệ (ít nhất 2 ký tự)` }
  }

  if (!/^[a-zA-Z]+$/.test(tld)) {
    return { valid: false, error: `Đuôi mở rộng '.${tld}' chứa ký tự không hợp lệ` }
  }

  // Validate domain characters
  const validDomainChars = /^[a-zA-Z0-9.-]+$/
  if (!validDomainChars.test(domainPart)) {
    return { valid: false, error: 'Tên miền chứa ký tự không hợp lệ' }
  }

  // Check domain labels
  const domainLabels = domainPart.split('.')
  for (const label of domainLabels) {
    if (label.length === 0) {
      return { valid: false, error: 'Tên miền có định dạng không hợp lệ' }
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      return { valid: false, error: 'Mỗi phần tên miền không được bắt đầu hoặc kết thúc bằng dấu gạch ngang' }
    }
    if (label.length > 63) {
      return { valid: false, error: 'Mỗi phần tên miền không được dài quá 63 ký tự' }
    }
  }

  // Check for common typos and suggest corrections
  if (EMAIL_TYPO_CORRECTIONS[domainPart]) {
    const correctedEmail = `${localPart}@${EMAIL_TYPO_CORRECTIONS[domainPart]}`
    return {
      valid: false,
      error: `Tên miền '${domainPart}' có thể sai chính tả`,
      suggestion: correctedEmail
    }
  }

  return { valid: true }
}

// ============================================
// Password Validation
// ============================================

export interface PasswordValidationResult {
  valid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
  requirements: PasswordRequirement[]
  score: number // 0-100
}

export interface PasswordRequirement {
  label: string
  met: boolean
  weight: number // importance for scoring
}

/**
 * Comprehensive password validation with detailed requirements
 */
export function validatePasswordComprehensive(password: string): PasswordValidationResult {
  const requirements: PasswordRequirement[] = [
    {
      label: 'Ít nhất 8 ký tự',
      met: password.length >= 8,
      weight: 25
    },
    {
      label: 'Ít nhất 1 chữ thường (a-z)',
      met: /[a-z]/.test(password),
      weight: 15
    },
    {
      label: 'Ít nhất 1 chữ hoa (A-Z)',
      met: /[A-Z]/.test(password),
      weight: 15
    },
    {
      label: 'Ít nhất 1 số (0-9)',
      met: /[0-9]/.test(password),
      weight: 15
    },
    {
      label: 'Ít nhất 1 ký tự đặc biệt (!@#$%...)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      weight: 15
    },
    {
      label: 'Ít nhất 12 ký tự (khuyến nghị)',
      met: password.length >= 12,
      weight: 15
    }
  ]

  // Calculate score
  let score = 0
  const errors: string[] = []

  for (const req of requirements) {
    if (req.met) {
      score += req.weight
    } else if (req.weight >= 15) {
      // Only first 5 requirements are mandatory
      if (requirements.indexOf(req) < 5) {
        errors.push(req.label)
      }
    }
  }

  // Bonus for length
  if (password.length >= 16) score = Math.min(100, score + 10)

  // Penalty for common patterns
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /(.)\1{3,}/, // Repeated characters
  ]

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 20)
      errors.push('Mật khẩu chứa mẫu phổ biến dễ đoán')
      break
    }
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 85) {
    strength = 'strong'
  } else if (score >= 55) {
    strength = 'medium'
  }

  // Check validity (first 4 requirements are mandatory)
  const valid = requirements.slice(0, 4).every(r => r.met)

  return {
    valid,
    strength,
    errors,
    requirements,
    score: Math.min(100, Math.max(0, score))
  }
}

// ============================================
// Zod Schemas
// ============================================

export const emailSchema = z.string()
  .min(1, 'Email không được để trống')
  .email('Email không hợp lệ')
  .max(254, 'Email quá dài')
  .refine(
    (email) => validateEmailComprehensive(email).valid,
    (email) => ({ message: validateEmailComprehensive(email).error || 'Email không hợp lệ' })
  )

export const passwordSchema = z.string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(128, 'Mật khẩu quá dài')
  .refine(
    (password) => /[a-z]/.test(password),
    'Mật khẩu phải chứa ít nhất 1 chữ thường'
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    'Mật khẩu phải chứa ít nhất 1 chữ hoa'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Mật khẩu phải chứa ít nhất 1 số'
  )

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mật khẩu không được để trống')
})

export const registerFormSchema = z.object({
  fullName: z.string()
    .max(100, 'Họ tên tối đa 100 ký tự')
    .optional(),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  agreeTerms: z.boolean().refine(
    (val) => val === true,
    'Bạn phải đồng ý với điều khoản sử dụng'
  )
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  }
)

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  }
)

// ============================================
// Type Exports
// ============================================

export type LoginFormData = z.infer<typeof loginFormSchema>
export type RegisterFormData = z.infer<typeof registerFormSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
