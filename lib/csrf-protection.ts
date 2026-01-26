/**
 * CSRF Protection Utility
 * Bảo vệ chống Cross-Site Request Forgery
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_COOKIE_NAME = 'csrf-token'

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, cookieToken: string): boolean {
  if (!token || !cookieToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(cookieToken)
    )
  } catch {
    return false
  }
}

/**
 * Add CSRF token to response
 */
export function addCSRFToken(response: NextResponse): void {
  const token = generateCSRFToken()

  // Set cookie
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  // Also set in header for client access
  response.headers.set(CSRF_TOKEN_HEADER, token)
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(req: NextRequest): boolean {
  // GET, HEAD, OPTIONS requests don't need CSRF check
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true
  }

  const tokenFromHeader = req.headers.get(CSRF_TOKEN_HEADER)
  const tokenFromCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value

  if (!tokenFromHeader || !tokenFromCookie) {
    console.warn('[CSRF] Missing CSRF token', {
      method: req.method,
      path: req.nextUrl.pathname,
      hasHeader: !!tokenFromHeader,
      hasCookie: !!tokenFromCookie,
    })
    return false
  }

  const isValid = verifyCSRFToken(tokenFromHeader, tokenFromCookie)

  if (!isValid) {
    console.warn('[CSRF] Invalid CSRF token', {
      method: req.method,
      path: req.nextUrl.pathname,
    })
  }

  return isValid
}

/**
 * Get CSRF token for client-side
 */
export function getCSRFTokenFromCookie(cookieString: string): string | null {
  const match = cookieString.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

/**
 * Create CSRF error response
 */
export function createCSRFErrorResponse(): NextResponse {
  return new NextResponse(
    JSON.stringify({
      success: false,
      error: 'CSRF Token Invalid',
      message: 'Request không hợp lệ. Vui lòng refresh trang và thử lại.',
      code: 'CSRF_INVALID',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

