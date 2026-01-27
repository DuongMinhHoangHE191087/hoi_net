import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { AdminService } from '@/lib/admin-service'
import { canAccessAdmin } from '@/lib/permissions'
import {
  checkRateLimit,
  getRateLimitType,
  createRateLimitHeaders,
  generateRateLimitKey
} from '@/lib/rate-limit'

// Admin emails - single source of truth from env (fallback only)
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

// ============================================
// Utility Functions
// ============================================

/**
 * Get client IP from various headers
 */
function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         req.headers.get('cf-connecting-ip') || // Cloudflare
         'unknown'
}

// ============================================
// Security Headers
// ============================================

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // Strict Transport Security (HSTS) - Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://res.cloudinary.com https://accounts.google.com",
    "frame-src 'self' https://accounts.google.com https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
}

function applySecurityHeaders(response: NextResponse): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  // Secure cookie settings - extended expiry
  const cookieOptions = {
    httpOnly: true, // Prevent XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax' as const, // CSRF protection
    path: '/',
    maxAge: 29 * 24 * 60 * 60, // 29 days (matches refresh token)
  }

  // Apply to all Set-Cookie headers
  const setCookie = response.headers.get('Set-Cookie')
  if (setCookie) {
    response.headers.set('Set-Cookie', setCookie)
  }
}

// ============================================
// Main Middleware Function
// ============================================

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const clientIP = getClientIP(req)

  // Update session and get user from @supabase/ssr
  const { user, response: res, supabase } = await updateSession(req)

  const userId = user?.id || null

  // ✅ RBAC: Use user_profiles.role as source of truth
  const role = user ? await AdminService.getRole(user.id, supabase) : 'user'
  const isAdmin = role === 'admin'
  const canAccessAdminPanel = canAccessAdmin(role)

  // Define route checks
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/login'
  const isRegisterRoute = pathname === '/register'
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isRequestsRoute = pathname.startsWith('/requests')
  const isProfileRoute = pathname.startsWith('/profile')

  console.log('[Middleware]', {
    pathname,
    hasUser: !!user,
    userEmail: user?.email,
    isAdmin,
    role,
    isLoginRoute,
    isAdminRoute,
    isDashboardRoute
  })

  // ============================================
  // Rate Limiting (skip for admins)
  // ============================================
  if (!canAccessAdminPanel) {
    const rateLimitType = getRateLimitType(pathname)
    const rateLimitKey = generateRateLimitKey(userId || clientIP, rateLimitType)
    const rateLimitResult = checkRateLimit(rateLimitKey, rateLimitType)

    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Too Many Requests',
          message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${rateLimitResult.resetIn} giây.`,
          code: 'RATE_LIMITED'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(rateLimitResult)
          }
        }
      )
    }

    // Add rate limit headers to successful responses
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult)
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      res.headers.set(key, value)
    }
  }

  // ============================================
  // Security Headers
  // ============================================
  applySecurityHeaders(res)

  // Prevent caching of sensitive pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  }

  // ============================================
  // Route Protection
  // ============================================

  // Protected routes require authentication
  if ((isAdminRoute || isDashboardRoute || isRequestsRoute || isProfileRoute) && !user) {
    console.log('[Middleware] Protected route accessed without auth, redirecting to login')
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    applySecurityHeaders(redirectResponse)
    return redirectResponse
  }

  // Admin routes require admin role
  if (isAdminRoute && user && !canAccessAdminPanel) {
    console.log('[Middleware] Non-admin tried to access admin route')
    const redirectResponse = NextResponse.redirect(new URL('/unauthorized', req.url))
    applySecurityHeaders(redirectResponse)
    return redirectResponse
  }

  // Redirect logged-in users away from login/register page
  if ((isLoginRoute || isRegisterRoute) && user) {
    console.log('[Middleware] User already logged in on auth page')

    // Check for redirect parameter
    const redirect = req.nextUrl.searchParams.get('redirect')
    const targetUrl = redirect || (canAccessAdminPanel ? '/admin' : '/dashboard')

    const redirectResponse = NextResponse.redirect(new URL(targetUrl, req.url))
    applySecurityHeaders(redirectResponse)
    return redirectResponse
  }

  return res
}

// ============================================
// Matcher Configuration
// ============================================
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

