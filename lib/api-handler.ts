/**
 * API Route Handler Wrapper
 * 
 * Provides consistent error handling, request tracing, and timing
 * for all API route handlers. Reduces boilerplate in each route file.
 * 
 * Usage:
 * ```ts
 * import { withHandler } from '@/lib/api-handler'
 * 
 * export const GET = withHandler(async (req, { user, requestId }) => {
 *   const data = await fetchData()
 *   return { data }
 * }, { requireAuth: true })
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, type AuthUser } from '@/lib/auth-server'
import { logger } from '@/lib/logger'
import {
  AppError,
  AuthenticationError,
  normalizeError,
  isOperationalError,
} from '@/lib/errors'

// ============================================
// Types
// ============================================

interface HandlerContext {
  user: AuthUser | null
  requestId: string
  startTime: number
}

interface HandlerOptions {
  /** Require authentication (401 if no user) */
  requireAuth?: boolean
  /** Require admin role (403 if not admin) */
  requireAdmin?: boolean
  /** Custom log label */
  label?: string
}

type HandlerFunction = (
  request: NextRequest,
  context: HandlerContext
) => Promise<NextResponse | Record<string, any>>

// ============================================
// Main Wrapper
// ============================================

/**
 * Wraps an API route handler with:
 * - Request ID extraction from headers
 * - Authentication verification
 * - Structured error handling
 * - Response timing (X-Response-Time header)
 * - Automatic error logging
 */
export function withHandler(
  handler: HandlerFunction,
  options: HandlerOptions = {}
) {
  return async (request: NextRequest) => {
    const startTime = Date.now()
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
    const label = options.label || request.nextUrl.pathname

    const log = logger.child({
      path: label,
      metadata: { requestId },
    })

    try {
      // ============================================
      // Auth Check
      // ============================================
      let user: AuthUser | null = null

      if (options.requireAuth || options.requireAdmin) {
        user = await verifyAuth(request)

        if (!user) {
          throw new AuthenticationError()
        }

        if (options.requireAdmin && !user.isAdmin) {
          throw new AppError('Bạn không có quyền truy cập', 403, 'FORBIDDEN')
        }
      }

      // ============================================
      // Execute Handler
      // ============================================
      const result = await handler(request, { user, requestId, startTime })

      // If handler returns NextResponse directly, add timing and return
      if (result instanceof NextResponse) {
        result.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
        result.headers.set('X-Request-ID', requestId)
        return result
      }

      // If handler returns a plain object, wrap in success response
      const response = NextResponse.json(
        { success: true, data: result },
        { status: 200 }
      )
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
      response.headers.set('X-Request-ID', requestId)
      return response

    } catch (error: unknown) {
      const appError = normalizeError(error)
      const duration = Date.now() - startTime

      // Log operational errors as warnings, unexpected errors as errors
      if (isOperationalError(error) && appError.statusCode < 500) {
        log.warn(`${label} [${appError.statusCode}] ${appError.message}`, {
          metadata: { requestId, duration, code: appError.code },
        })
      } else {
        log.error(`${label} [${appError.statusCode}] ${appError.message}`, {
          error: error instanceof Error ? error.stack : error,
          metadata: { requestId, duration, code: appError.code },
        })
      }

      const response = NextResponse.json(appError.toJSON(), {
        status: appError.statusCode,
      })
      response.headers.set('X-Response-Time', `${duration}ms`)
      response.headers.set('X-Request-ID', requestId)
      return response
    }
  }
}
