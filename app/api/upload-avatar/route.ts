import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB - matches bucket config

/**
 * Get file extension from File object
 */
function getExtension(file: File): string {
  const extFromName = file.name.split('.').pop()
  if (extFromName && extFromName.length <= 8) return extFromName.toLowerCase()

  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return mimeToExt[file.type] ?? 'png'
}

/**
 * Parse storage path from public URL
 */
function parseStoragePathFromUrl(url: string): string | null {
  const markerPublic = `/storage/v1/object/public/${AVATAR_BUCKET}/`
  const idxPublic = url.indexOf(markerPublic)
  if (idxPublic !== -1) return decodeURIComponent(url.slice(idxPublic + markerPublic.length))

  const marker = `/storage/v1/object/${AVATAR_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx !== -1) return decodeURIComponent(url.slice(idx + marker.length))

  return null
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const requestedUserId = (formData.get('userId') as string | null)?.trim() || null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', message: 'Không có file được chọn' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type', message: 'Chỉ chấp nhận file ảnh' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max - matches bucket config)
    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: 'File too large', message: 'File không được vượt quá 5MB' },
        { status: 400 }
      )
    }

    // Determine target user ID
    // Admin can upload for other users, regular users only for themselves
    const targetUserId = requestedUserId ?? authUser.id

    // Non-admins are only allowed to upload for themselves
    if (!authUser.isAdmin && targetUserId !== authUser.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Không đủ quyền upload cho user khác' },
        { status: 403 }
      )
    }

    // Build object path: {userId}/avatar-{timestamp}.{ext}
    const ext = getExtension(file)
    const objectPath = `${targetUserId}/avatar-${Date.now()}.${ext}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET)
      .upload(objectPath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Upload failed', message: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath)

    return NextResponse.json({
      url: data.publicUrl,
      bucket: AVATAR_BUCKET,
      path: objectPath,
    })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error.message || 'Không thể tải lên avatar',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const path = (body?.path as string | undefined)?.trim()
    const url = (body?.url as string | undefined)?.trim()

    // Extract object path from either path or url
    const objectPath = path || (url ? parseStoragePathFromUrl(url) : null)
    if (!objectPath) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Thiếu path (hoặc url) để xóa' },
        { status: 400 }
      )
    }

    // Non-admins can only delete their own avatars
    if (!authUser.isAdmin && !objectPath.startsWith(`${authUser.id}/`)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Không đủ quyền xóa avatar này' },
        { status: 403 }
      )
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage.from(AVATAR_BUCKET).remove([objectPath])
    if (error) {
      console.error('Supabase Storage delete error:', error)
      return NextResponse.json(
        { error: 'Delete failed', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Đã xóa avatar' })
  } catch (error: any) {
    console.error('Avatar delete error:', error)
    return NextResponse.json(
      {
        error: 'Delete failed',
        message: error.message || 'Không thể xóa avatar',
      },
      { status: 500 }
    )
  }
}

