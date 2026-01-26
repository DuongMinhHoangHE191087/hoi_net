/**
 * Secure Cookie Management
 * Quản lý cookie an toàn, chống XSS, CSRF, Session Hijacking
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Cookie encryption key (MUST be set in production)
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'change-this-secret-key-in-production'

/**
 * Cookie Options Interface
 */
export interface SecureCookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  path?: string
  maxAge?: number
  domain?: string
  signed?: boolean
}

/**
 * Default secure cookie options
 */
export const DEFAULT_COOKIE_OPTIONS: SecureCookieOptions = {
  httpOnly: true, // Prevent XSS
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // CSRF protection (lax allows GET navigation)
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days
  signed: true, // Sign cookie to prevent tampering
}

/**
 * Encrypt cookie value
 */
export function encryptCookieValue(value: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(COOKIE_SECRET, 'salt', 32)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

  let encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * Decrypt cookie value
 */
export function decryptCookieValue(encryptedValue: string): string | null {
  try {
    const [ivHex, encrypted] = encryptedValue.split(':')
    if (!ivHex || !encrypted) return null

    const iv = Buffer.from(ivHex, 'hex')
    const key = crypto.scryptSync(COOKIE_SECRET, 'salt', 32)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('[Cookie] Decryption failed:', error)
    return null
  }
}

/**
 * Sign cookie value to prevent tampering
 */
export function signCookieValue(value: string): string {
  const signature = crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(value)
    .digest('hex')

  return `${value}.${signature}`
}

/**
 * Verify signed cookie value
 */
export function verifySignedCookieValue(signedValue: string): string | null {
  const lastDotIndex = signedValue.lastIndexOf('.')
  if (lastDotIndex === -1) return null

  const value = signedValue.substring(0, lastDotIndex)
  const signature = signedValue.substring(lastDotIndex + 1)

  const expectedSignature = crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(value)
    .digest('hex')

  // Timing-safe comparison
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.warn('[Cookie] Signature verification failed')
    return null
  }

  return value
}

/**
 * Set secure cookie
 */
export function setSecureCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: SecureCookieOptions = {}
): void {
  const cookieOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options }

  let finalValue = value

  // Sign cookie if enabled
  if (cookieOptions.signed) {
    finalValue = signCookieValue(finalValue)
  }

  // Set cookie
  response.cookies.set(name, finalValue, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    maxAge: cookieOptions.maxAge,
    domain: cookieOptions.domain,
  })
}

/**
 * Get secure cookie
 */
export function getSecureCookie(
  request: NextRequest,
  name: string,
  options: SecureCookieOptions = {}
): string | null {
  const cookieValue = request.cookies.get(name)?.value

  if (!cookieValue) return null

  const cookieOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options }

  let finalValue = cookieValue

  // Verify signature if enabled
  if (cookieOptions.signed) {
    const verifiedValue = verifySignedCookieValue(finalValue)
    if (!verifiedValue) return null
    finalValue = verifiedValue
  }

  return finalValue
}

/**
 * Delete secure cookie
 */
export function deleteSecureCookie(
  response: NextResponse,
  name: string,
  options: SecureCookieOptions = {}
): void {
  response.cookies.delete(name)

  // Also set with maxAge 0 to ensure deletion
  response.cookies.set(name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: options.path || '/',
    maxAge: 0,
  })
}

/**
 * Validate cookie expiration
 */
export function isCookieExpired(cookieTimestamp: number, maxAge: number): boolean {
  const now = Date.now()
  const expiresAt = cookieTimestamp + maxAge * 1000

  return now > expiresAt
}

/**
 * Generate secure session ID
 */
export function generateSecureSessionID(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash sensitive data before storing in cookie
 */
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Cookie security best practices validator
 */
export function validateCookieSecurity(
  name: string,
  value: string,
  options: SecureCookieOptions
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []

  // Check httpOnly
  if (!options.httpOnly) {
    warnings.push('Cookie should have httpOnly flag to prevent XSS')
  }

  // Check secure in production
  if (process.env.NODE_ENV === 'production' && !options.secure) {
    warnings.push('Cookie should have secure flag in production (HTTPS)')
  }

  // Check sameSite
  if (!options.sameSite || options.sameSite === 'none') {
    warnings.push('Cookie should have sameSite=lax or strict for CSRF protection')
  }

  // Check value length
  if (value.length > 4096) {
    warnings.push('Cookie value exceeds recommended 4KB limit')
  }

  // Check for sensitive data patterns
  if (
    value.includes('password') ||
    value.includes('secret') ||
    value.includes('key')
  ) {
    warnings.push('Cookie may contain sensitive data that should be encrypted')
  }

  return {
    valid: warnings.length === 0,
    warnings,
  }
}

/**
 * Log cookie security issues
 */
export function logCookieSecurity(
  name: string,
  value: string,
  options: SecureCookieOptions
): void {
  const validation = validateCookieSecurity(name, value, options)

  if (!validation.valid) {
    console.warn(`[Cookie Security] Warnings for cookie "${name}":`, validation.warnings)
  }
}

