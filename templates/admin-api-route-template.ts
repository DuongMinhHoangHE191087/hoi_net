/**
 * ADMIN API ROUTE TEMPLATE
 *
 * Sử dụng template này khi tạo admin API routes mới
 * Copy file này và modify theo nhu cầu
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AdminService } from '@/lib/admin-service'

// Force dynamic rendering (không cache response)
export const dynamic = 'force-dynamic'

/**
 * GET: Fetch admin data
 * Example: GET /api/admin/example?param=value
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Create Supabase client
    const supabase = await createClient()

    // 2. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Vui lòng đăng nhập để tiếp tục'
        },
        { status: 401 }
      )
    }

    // 3. Check admin permission using AdminService
    const isAdmin = await AdminService.isAdmin(user.id, supabase)

    if (!isAdmin) {
      console.warn('[Admin API] Non-admin access attempt:', {
        userId: user.id,
        email: user.email,
        path: request.nextUrl.pathname
      })

      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Chỉ admin mới có quyền truy cập API này'
        },
        { status: 403 }
      )
    }

    // 4. Parse query parameters
    const { searchParams } = new URL(request.url)
    const param = searchParams.get('param')

    // 5. Validate input (if needed)
    if (!param) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Missing required parameter: param'
        },
        { status: 400 }
      )
    }

    // 6. Perform admin operation
    // Example: Fetch data from database
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .eq('column', param)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin API] Database error:', error)
      return NextResponse.json(
        {
          error: 'Database Error',
          message: error.message
        },
        { status: 500 }
      )
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: data,
      meta: {
        count: data.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Đã xảy ra lỗi không mong muốn'
      },
      { status: 500 }
    )
  }
}

/**
 * POST: Create or update admin data
 * Example: POST /api/admin/example
 * Body: { name: "...", value: "..." }
 */
export async function POST(request: NextRequest) {
  try {
    // 1-3. Auth checks (same as GET)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    const isAdmin = await AdminService.isAdmin(user.id, supabase)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Chỉ admin mới có quyền' },
        { status: 403 }
      )
    }

    // 4. Parse request body
    const body = await request.json()
    const { name, value } = body

    // 5. Validate input
    if (!name || !value) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Missing required fields: name, value'
        },
        { status: 400 }
      )
    }

    // Additional validation
    if (name.length < 3 || name.length > 100) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Name must be between 3 and 100 characters'
        },
        { status: 400 }
      )
    }

    // 6. Perform admin operation
    // Example: Insert into database
    const { data, error } = await supabase
      .from('your_table')
      .insert({
        name,
        value,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[Admin API] Insert error:', error)
      return NextResponse.json(
        {
          error: 'Database Error',
          message: error.message
        },
        { status: 500 }
      )
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Đã xảy ra lỗi không mong muốn'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT: Update admin data
 * Example: PUT /api/admin/example
 * Body: { id: "...", name: "...", value: "..." }
 */
export async function PUT(request: NextRequest) {
  try {
    // Auth checks
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isAdmin = await AdminService.isAdmin(user.id, supabase)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Parse and validate
    const body = await request.json()
    const { id, name, value } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // Build update object (only update fields that are provided)
    const updates: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name
    if (value !== undefined) updates.value = value

    // Perform update
    const { data, error } = await supabase
      .from('your_table')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Admin API] Update error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Not found', message: 'Record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Updated successfully'
    })

  } catch (error: any) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Delete admin data
 * Example: DELETE /api/admin/example?id=...
 */
export async function DELETE(request: NextRequest) {
  try {
    // Auth checks
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isAdmin = await AdminService.isAdmin(user.id, supabase)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Parse query parameter
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      )
    }

    // Perform delete
    const { error } = await supabase
      .from('your_table')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] Delete error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Deleted successfully'
    })

  } catch (error: any) {
    console.error('[Admin API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * ALTERNATIVE: Using requireAdminAuth helper
 *
 * Cách ngắn gọn hơn sử dụng helper function
 */

import { requireAdminAuth } from '@/lib/auth-server'

export async function GET_ALTERNATIVE(request: NextRequest) {
  return requireAdminAuth(request, async (user, req) => {
    // user is guaranteed to be authenticated and admin here

    const { searchParams } = new URL(req.url)
    const param = searchParams.get('param')

    // Your admin logic
    const data = await fetchData(param)

    return Response.json({ success: true, data })
  })
}

/**
 * RESPONSE FORMATS
 *
 * Standardized response formats for consistency
 */

// Success response
const successResponse = {
  success: true,
  data: { /* ... */ },
  message: 'Operation completed successfully', // optional
  meta: { // optional
    timestamp: new Date().toISOString(),
    count: 10,
    page: 1
  }
}

// Error response
const errorResponse = {
  success: false, // optional
  error: 'Error Type', // e.g., 'Unauthorized', 'Validation Error'
  message: 'Human-readable error message',
  details: { /* ... */ } // optional, for debugging
}

/**
 * COMMON VALIDATIONS
 */

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// UUID validation
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Number validation
function isValidNumber(value: any, min?: number, max?: number): boolean {
  const num = Number(value)
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

// String length validation
function isValidLength(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max
}

/**
 * LOGGING BEST PRACTICES
 */

// ✅ Good logging
console.log('[Admin API] Operation started:', {
  userId: user.id,
  email: user.email,
  action: 'create_user',
  timestamp: new Date().toISOString()
})

// ✅ Error logging
console.error('[Admin API] Database error:', {
  error: error.message,
  code: error.code,
  userId: user.id,
  operation: 'insert'
})

// ❌ Bad logging (too much sensitive info)
console.log(user) // Contains tokens, passwords, etc.
console.log(request) // Too verbose

/**
 * RATE LIMITING (Optional)
 *
 * Add rate limiting for sensitive operations
 */

import { checkRateLimit, getRateLimitType } from '@/lib/rate-limit'

export async function POST_WITH_RATE_LIMIT(request: NextRequest) {
  // Check rate limit BEFORE auth (prevent auth spam)
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitResult = await checkRateLimit(clientIP, 'api')

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Vui lòng thử lại sau ${rateLimitResult.resetIn} giây`
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.resetIn.toString()
        }
      }
    )
  }

  // Continue with normal auth checks...
}

/**
 * CORS HEADERS (If needed for external API calls)
 */

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

/**
 * FILE TO CREATE:
 *
 * 1. Copy this template
 * 2. Rename to your route: app/api/admin/your-route/route.ts
 * 3. Modify according to your needs:
 *    - Change table names
 *    - Update validation logic
 *    - Add business logic
 * 4. Test with curl or Postman
 * 5. Add frontend integration
 */

