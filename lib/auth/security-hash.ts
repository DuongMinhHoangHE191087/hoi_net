/**
 * 🔐 Auth Security Hash Utilities
 * 
 * HMAC-SHA256 hashing for email/IP với server-side pepper.
 * Tối ưu cho tra cứu index trong database.
 */

import { createHmac } from 'crypto'

// ============================================
// Configuration
// ============================================

// Pepper từ env - KHÁC với SUPABASE keys
const AUTH_SECURITY_PEPPER = process.env.AUTH_SECURITY_PEPPER || process.env.NEXTAUTH_SECRET || 'fallback-pepper-change-in-production'

// ============================================
// Email Normalization
// ============================================

/**
 * Normalize email để đảm bảo consistent hashing
 * - Lowercase
 * - Trim whitespace
 * - Remove dots from gmail (optional - có thể tùy chỉnh)
 */
export function normalizeEmail(email: string): string {
  let normalized = email.toLowerCase().trim()
  
  // Gmail specific: remove dots before @
  // gmail.com, googlemail.com treat a.b.c@gmail.com same as abc@gmail.com
  if (normalized.endsWith('@gmail.com') || normalized.endsWith('@googlemail.com')) {
    const [localPart, domain] = normalized.split('@')
    // Remove dots and anything after + (plus addressing)
    const cleanLocal = localPart.split('+')[0].replace(/\./g, '')
    normalized = `${cleanLocal}@${domain}`
  }
  
  return normalized
}

// ============================================
// HMAC-SHA256 Hashing
// ============================================

/**
 * Hash email with HMAC-SHA256
 * Returns hex string for database storage
 */
export function hashEmail(email: string): string {
  const normalized = normalizeEmail(email)
  return createHmac('sha256', AUTH_SECURITY_PEPPER)
    .update(`email:${normalized}`)
    .digest('hex')
}

/**
 * Hash IP address with HMAC-SHA256
 * Handles IPv4, IPv6, and forwarded IPs
 */
export function hashIP(ip: string): string {
  // Normalize IP
  const normalized = normalizeIP(ip)
  
  return createHmac('sha256', AUTH_SECURITY_PEPPER)
    .update(`ip:${normalized}`)
    .digest('hex')
}

/**
 * Hash combination of email + IP for lockout lookup
 * This is the primary key for lockout records
 */
export function hashEmailIP(email: string, ip: string): string {
  const normalizedEmail = normalizeEmail(email)
  const normalizedIP = normalizeIP(ip)
  
  return createHmac('sha256', AUTH_SECURITY_PEPPER)
    .update(`emailip:${normalizedEmail}:${normalizedIP}`)
    .digest('hex')
}

/**
 * Hash device fingerprint (optional, for future use)
 */
export function hashDevice(userAgent: string, accept: string): string {
  // Simple fingerprint from headers
  const fingerprint = `${userAgent}|${accept}`
  
  return createHmac('sha256', AUTH_SECURITY_PEPPER)
    .update(`device:${fingerprint}`)
    .digest('hex')
}

// ============================================
// IP Normalization
// ============================================

/**
 * Normalize IP address
 * - Handle X-Forwarded-For (take first IP)
 * - Handle IPv6 localhost
 * - Trim whitespace
 */
export function normalizeIP(ip: string): string {
  if (!ip) return 'unknown'
  
  let normalized = ip.trim()
  
  // X-Forwarded-For có thể chứa nhiều IPs: "client, proxy1, proxy2"
  // Lấy IP đầu tiên (client thật)
  if (normalized.includes(',')) {
    normalized = normalized.split(',')[0].trim()
  }
  
  // IPv6 localhost -> IPv4
  if (normalized === '::1' || normalized === '::ffff:127.0.0.1') {
    normalized = '127.0.0.1'
  }
  
  // Remove IPv6 prefix
  if (normalized.startsWith('::ffff:')) {
    normalized = normalized.slice(7)
  }
  
  return normalized
}

// ============================================
// Extract IP from Request
// ============================================

/**
 * Get client IP from Next.js request
 * Priority: X-Forwarded-For > X-Real-IP > connection.remoteAddress
 */
export function getClientIP(headers: Headers): string {
  // Cloudflare
  const cfIP = headers.get('cf-connecting-ip')
  if (cfIP) return normalizeIP(cfIP)
  
  // Standard proxy headers
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) return normalizeIP(forwardedFor)
  
  const realIP = headers.get('x-real-ip')
  if (realIP) return normalizeIP(realIP)
  
  // Fallback
  return 'unknown'
}

// ============================================
// Verify Hashes (for testing/debugging)
// ============================================

/**
 * Verify if a plaintext matches a hash
 * Useful for debugging - NOT for production password verification
 */
export function verifyEmailHash(email: string, hash: string): boolean {
  return hashEmail(email) === hash
}

export function verifyIPHash(ip: string, hash: string): boolean {
  return hashIP(ip) === hash
}

// ============================================
// Exports
// ============================================

export default {
  normalizeEmail,
  normalizeIP,
  hashEmail,
  hashIP,
  hashEmailIP,
  hashDevice,
  getClientIP,
  verifyEmailHash,
  verifyIPHash,
}
