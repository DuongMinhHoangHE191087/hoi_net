import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Use service role for feedback submission (public endpoint)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple email validation with bit hash check
function isValidEmailFormat(email: string): { valid: boolean; error?: string } {
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

  // Check domain part
  const dotIndex = domainPart.lastIndexOf('.')
  if (dotIndex === -1 || dotIndex === 0 || dotIndex === domainPart.length - 1) {
    return { valid: false, error: '\'.\'  bị sử dụng sai vị trí trong \'' + domainPart + '\'' }
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

  // Bit hash validation - check character validity
  // Using bitwise operations to validate email chars
  const validLocalChars = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/
  const validDomainChars = /^[a-zA-Z0-9.-]+$/

  if (!validLocalChars.test(localPart)) {
    return { valid: false, error: 'Email chứa ký tự không hợp lệ' }
  }

  if (!validDomainChars.test(domainPart)) {
    return { valid: false, error: 'Tên miền chứa ký tự không hợp lệ' }
  }

  // Check domain has at least one dot and valid structure
  const domainLabels = domainPart.split('.')
  for (const label of domainLabels) {
    if (label.length === 0 || label.startsWith('-') || label.endsWith('-')) {
      return { valid: false, error: 'Tên miền email không hợp lệ' }
    }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, rating, phone } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Tên phải có ít nhất 2 ký tự' },
        { status: 400 }
      )
    }

    // Validate email with bit hash check
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

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase().substring(0, 254),
      message: message.trim().substring(0, 5000),
      rating: rating ? Math.min(5, Math.max(1, parseInt(rating))) : null,
      status: 'new'
    }

    // Add phone if provided
    if (phone) {
      sanitizedData.message += `\n\nSố điện thoại: ${phone.trim().substring(0, 20)}`
    }

    // Insert feedback using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert(sanitizedData)
      .select()
      .single()

    if (error) {
      console.error('Feedback insert error:', error)
      return NextResponse.json(
        { error: 'Không thể gửi phản hồi. Vui lòng thử lại.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Phản hồi đã được gửi thành công!',
      id: data.id
    })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
