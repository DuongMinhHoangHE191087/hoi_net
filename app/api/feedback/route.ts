import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Use service role for feedback submission (public endpoint)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================
// RATE LIMITING - Theo User Type
// ============================================
// Anonymous: 1 yêu cầu/ngày
// Logged in user: 3 yêu cầu/ngày

interface RateLimitRecord {
  count: number
  resetTime: number
  lastSubmit: number
}

// In-memory cache cho rate limiting (IP-based cho anonymous)
const anonymousRateLimitMap = new Map<string, RateLimitRecord>()

const RATE_LIMITS = {
  ANONYMOUS: {
    MAX_REQUESTS: 1,           // 1 yêu cầu/ngày
    WINDOW_MS: 24 * 60 * 60 * 1000,  // 24 giờ
    COOLDOWN_MS: 5 * 60 * 1000,      // 5 phút giữa các lần (cho retry)
  },
  AUTHENTICATED: {
    MAX_REQUESTS: 3,           // 3 yêu cầu/ngày
    WINDOW_MS: 24 * 60 * 60 * 1000,  // 24 giờ
    COOLDOWN_MS: 2 * 60 * 1000,      // 2 phút giữa các lần
  },
  COOLDOWN_BETWEEN_REQUESTS: 60 * 1000, // 1 phút minimum giữa requests
}

// Dọn dẹp rate limit map định kỳ
setInterval(() => {
  const now = Date.now()
  anonymousRateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      anonymousRateLimitMap.delete(key)
    }
  })
}, 60 * 60 * 1000) // Mỗi giờ

// Check rate limit cho anonymous users (IP-based)
function checkAnonymousRateLimit(ip: string): { 
  allowed: boolean
  remaining: number
  retryAfter?: number
  message?: string 
} {
  const now = Date.now()
  const limits = RATE_LIMITS.ANONYMOUS
  const record = anonymousRateLimitMap.get(ip)

  if (!record) {
    anonymousRateLimitMap.set(ip, { 
      count: 1, 
      resetTime: now + limits.WINDOW_MS, 
      lastSubmit: now 
    })
    return { allowed: true, remaining: limits.MAX_REQUESTS - 1 }
  }

  // Reset if window expired
  if (now > record.resetTime) {
    anonymousRateLimitMap.set(ip, { 
      count: 1, 
      resetTime: now + limits.WINDOW_MS, 
      lastSubmit: now 
    })
    return { allowed: true, remaining: limits.MAX_REQUESTS - 1 }
  }

  // Check cooldown between submissions
  const timeSinceLastSubmit = now - record.lastSubmit
  if (timeSinceLastSubmit < RATE_LIMITS.COOLDOWN_BETWEEN_REQUESTS) {
    const waitSeconds = Math.ceil((RATE_LIMITS.COOLDOWN_BETWEEN_REQUESTS - timeSinceLastSubmit) / 1000)
    return { 
      allowed: false,
      remaining: limits.MAX_REQUESTS - record.count,
      retryAfter: waitSeconds,
      message: `Vui lòng đợi ${waitSeconds} giây trước khi gửi yêu cầu tiếp theo`
    }
  }

  // Check max requests
  if (record.count >= limits.MAX_REQUESTS) {
    const hoursRemaining = Math.ceil((record.resetTime - now) / (60 * 60 * 1000))
    return { 
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
      message: `Khách chưa đăng nhập chỉ được gửi ${limits.MAX_REQUESTS} yêu cầu/ngày. Đăng nhập để gửi thêm hoặc thử lại sau ${hoursRemaining} giờ.`
    }
  }

  // Allow and increment
  record.count++
  record.lastSubmit = now
  anonymousRateLimitMap.set(ip, record)
  return { allowed: true, remaining: limits.MAX_REQUESTS - record.count }
}

// Check rate limit cho authenticated users (Database-based)
async function checkAuthenticatedRateLimit(userId: string): Promise<{ 
  allowed: boolean
  remaining: number
  retryAfter?: number
  message?: string 
}> {
  const limits = RATE_LIMITS.AUTHENTICATED
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  try {
    // Count today's submissions for this user
    const { count, error } = await supabaseAdmin
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString())

    if (error) {
      console.error('Rate limit check error:', error)
      // Allow if can't check (fail open for UX)
      return { allowed: true, remaining: limits.MAX_REQUESTS }
    }

    const todayCount = count || 0
    const remaining = Math.max(0, limits.MAX_REQUESTS - todayCount)

    if (todayCount >= limits.MAX_REQUESTS) {
      // Calculate when tomorrow starts
      const tomorrow = new Date(todayStart)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const secondsUntilReset = Math.ceil((tomorrow.getTime() - now.getTime()) / 1000)
      const hoursRemaining = Math.ceil(secondsUntilReset / 3600)

      return {
        allowed: false,
        remaining: 0,
        retryAfter: secondsUntilReset,
        message: `Bạn đã gửi ${limits.MAX_REQUESTS} yêu cầu hôm nay. Vui lòng thử lại sau ${hoursRemaining} giờ.`
      }
    }

    return { allowed: true, remaining }
  } catch (error) {
    console.error('Rate limit check exception:', error)
    return { allowed: true, remaining: limits.MAX_REQUESTS }
  }
}

// ============================================
// SPAM DETECTION
// ============================================
function detectSpam(data: { name: string; email: string; message: string; honeypot?: string }): { isSpam: boolean; reason?: string } {
  // Honeypot check
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return { isSpam: true, reason: 'Bot detected (honeypot)' }
  }

  // Too many links
  const linkCount = (data.message.match(/https?:\/\//gi) || []).length
  if (linkCount > 3) {
    return { isSpam: true, reason: 'Too many links' }
  }

  // Spam keywords
  const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'cryptocurrency', 'bitcoin mining', 'free money', 'click here', 'buy now']
  const lowerMessage = data.message.toLowerCase()
  for (const keyword of spamKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { isSpam: true, reason: 'Spam keyword detected' }
    }
  }

  // Repeated characters
  if (/(.)\1{10,}/.test(data.message)) {
    return { isSpam: true, reason: 'Repeated characters' }
  }

  // All caps message
  if (data.message.length > 50 && data.message === data.message.toUpperCase()) {
    return { isSpam: true, reason: 'All caps message' }
  }

  return { isSpam: false }
}

// ============================================
// EMAIL VALIDATION
// ============================================
function isValidEmailFormat(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email không được để trống' }
  }

  email = email.trim().toLowerCase()

  if (email.length < 5 || email.length > 254) {
    return { valid: false, error: 'Email không hợp lệ' }
  }

  const atIndex = email.indexOf('@')
  if (atIndex === -1 || atIndex === 0 || atIndex === email.length - 1) {
    return { valid: false, error: 'Email phải chứa @' }
  }

  const localPart = email.substring(0, atIndex)
  const domainPart = email.substring(atIndex + 1)

  if (localPart.length === 0 || localPart.length > 64) {
    return { valid: false, error: 'Phần trước @ không hợp lệ' }
  }

  const dotIndex = domainPart.lastIndexOf('.')
  if (dotIndex === -1 || dotIndex === 0 || dotIndex === domainPart.length - 1) {
    return { valid: false, error: 'Tên miền email không hợp lệ' }
  }

  const tld = domainPart.substring(dotIndex + 1)
  if (tld.length < 2) {
    return { valid: false, error: 'Tên miền email không hợp lệ' }
  }

  if (email.includes('..')) {
    return { valid: false, error: 'Email không được có dấu chấm liên tiếp' }
  }

  const validLocalChars = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/
  const validDomainChars = /^[a-zA-Z0-9.-]+$/

  if (!validLocalChars.test(localPart)) {
    return { valid: false, error: 'Email chứa ký tự không hợp lệ' }
  }

  if (!validDomainChars.test(domainPart)) {
    return { valid: false, error: 'Tên miền chứa ký tự không hợp lệ' }
  }

  return { valid: true }
}

// ============================================
// MAIN API HANDLER
// ============================================
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 'unknown'

    // Try to get authenticated user
    let userId: string | null = null
    let userEmail: string | null = null
    let isAuthenticated = false

    try {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        userEmail = user.email || null
        isAuthenticated = true
      }
    } catch (authError) {
      // Not authenticated - that's fine for this endpoint
      console.log('[Feedback API] Anonymous submission')
    }

    // Check rate limit based on user type
    let rateLimitResult: { allowed: boolean; remaining: number; retryAfter?: number; message?: string }
    
    if (isAuthenticated && userId) {
      rateLimitResult = await checkAuthenticatedRateLimit(userId)
    } else {
      rateLimitResult = checkAnonymousRateLimit(ip)
    }

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.message,
          retryAfter: rateLimitResult.retryAfter,
          remaining: rateLimitResult.remaining,
          isAuthenticated,
          code: 'RATE_LIMITED'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining)
          }
        }
      )
    }

    const body = await request.json()
    const { name, email, message, rating, phone, honeypot } = body

    // Check spam
    const spamCheck = detectSpam({ name, email, message, honeypot })
    if (spamCheck.isSpam) {
      console.warn(`[Spam Detected] IP: ${ip}, Reason: ${spamCheck.reason}`)
      // Silently reject
      return NextResponse.json({
        success: true,
        message: 'Yêu cầu đã được gửi thành công!',
        remaining: rateLimitResult.remaining,
        isAuthenticated,
        id: 'spam-blocked'
      })
    }

    // Validate fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Tên phải có ít nhất 2 ký tự' },
        { status: 400 }
      )
    }

    const emailValidation = isValidEmailFormat(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Tin nhắn phải có ít nhất 10 ký tự' },
        { status: 400 }
      )
    }

    // Prepare data
    const sanitizedData: Record<string, any> = {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase().substring(0, 254),
      message: message.trim().substring(0, 5000),
      rating: rating ? Math.min(5, Math.max(1, parseInt(rating))) : null,
      status: 'new',
      source: isAuthenticated ? 'authenticated' : 'anonymous',
      ip_hash: Buffer.from(ip).toString('base64').substring(0, 20), // Anonymized IP
    }

    // Link to user if authenticated
    if (isAuthenticated && userId) {
      sanitizedData.user_id = userId
    }

    // Add phone if provided
    if (phone) {
      sanitizedData.message += `\n\nSố điện thoại: ${phone.trim().substring(0, 20)}`
    }

    // Insert feedback
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert(sanitizedData)
      .select()
      .single()

    if (error) {
      console.error('Feedback insert error:', error)
      return NextResponse.json(
        { error: 'Không thể gửi yêu cầu. Vui lòng thử lại.' },
        { status: 500 }
      )
    }

    const limits = isAuthenticated ? RATE_LIMITS.AUTHENTICATED : RATE_LIMITS.ANONYMOUS
    const newRemaining = rateLimitResult.remaining - 1

    return NextResponse.json({
      success: true,
      message: isAuthenticated 
        ? `Yêu cầu đã được gửi! Còn lại ${newRemaining}/${limits.MAX_REQUESTS} yêu cầu hôm nay.`
        : `Yêu cầu đã được gửi! Đăng nhập để gửi thêm yêu cầu.`,
      id: data.id,
      remaining: newRemaining,
      maxRequests: limits.MAX_REQUESTS,
      isAuthenticated,
      nextResetHours: 24
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
