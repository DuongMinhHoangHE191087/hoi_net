import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { verifyAuth } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

// Allowed image types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/x-icon',
  'image/ico'
]

// Max file size: 10MB for admin uploads
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Check if user is admin
async function checkAdminRole(userId: string): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    return data?.role === 'admin'
  } catch {
    return false
  }
}

/**
 * GET - Lấy danh sách files đã upload
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    // Check admin role
    const isAdmin = await checkAdminRole(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Bạn không có quyền thực hiện thao tác này' },
        { status: 403 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'admin-uploads'
    const maxResults = parseInt(searchParams.get('limit') || '50')
    const nextCursor = searchParams.get('cursor') || undefined

    // List resources from Cloudinary
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: maxResults,
      next_cursor: nextCursor,
    })

    return NextResponse.json({
      success: true,
      files: result.resources.map((resource: any) => ({
        public_id: resource.public_id,
        url: resource.secure_url,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
        created_at: resource.created_at,
      })),
      next_cursor: result.next_cursor,
      total: result.resources.length,
    })
  } catch (error: any) {
    console.error('[Admin Upload] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to list files', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    // Check admin role
    const isAdmin = await checkAdminRole(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Bạn không có quyền thực hiện thao tác này' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'admin-uploads'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', message: 'Không có file được chọn' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type', 
          message: `Loại file "${file.type}" không được hỗ trợ` 
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large', 
          message: `File vượt quá giới hạn ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        },
        { status: 413 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Generate unique public_id
    const fileName = file.name || 'unnamed'
    const publicId = `${folder}/${Date.now()}_${fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto:best',
      fetch_format: 'auto',
      public_id: publicId.split('/').pop(), // Just the filename part
    })

    console.log('[Admin Upload] Success:', {
      userId: user.id,
      fileName,
      folder,
      publicId: result.public_id
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    })
  } catch (error: any) {
    console.error('[Admin Upload] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        message: error.message || 'Không thể tải ảnh lên. Vui lòng thử lại.' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    // Check admin role
    const isAdmin = await checkAdminRole(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Bạn không có quyền thực hiện thao tác này' },
        { status: 403 }
      )
    }

    const { public_id } = await request.json()

    if (!public_id) {
      return NextResponse.json(
        { error: 'No public_id provided' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id)

    console.log('[Admin Upload] Deleted:', { userId: user.id, publicId: public_id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin Upload] Delete error:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}
