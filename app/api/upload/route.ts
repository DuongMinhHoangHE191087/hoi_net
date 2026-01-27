import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { verifyAuth } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ⚠️ IMPORTANT: This config increases body size limit for file uploads
// Without this, Next.js has a default 4MB limit which causes 413 errors
export const maxDuration = 60 // Increase timeout for large files

// Allowed image types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/heic',
  'image/heif'
]

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

    // Check content length header first (quick validation)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large', 
          message: `File vượt quá giới hạn ${MAX_FILE_SIZE / (1024 * 1024)}MB. Vui lòng nén ảnh trước khi tải lên.` 
        },
        { status: 413 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

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
          message: `Loại file "${file.type}" không được hỗ trợ. Chấp nhận: JPEG, PNG, GIF, WebP, BMP, TIFF, HEIC` 
        },
        { status: 400 }
      )
    }

    // Validate file size (double check after parsing)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large', 
          message: `File ${(file.size / (1024 * 1024)).toFixed(1)}MB vượt quá giới hạn ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        },
        { status: 413 }
      )
    }

    // Validate file name
    const fileName = file.name || 'unnamed'
    if (fileName.length > 200) {
      return NextResponse.json(
        { error: 'Invalid filename', message: 'Tên file quá dài (tối đa 200 ký tự)' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary with optimization
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'photo-restoration',
      resource_type: 'auto',
      // Optimize uploaded images
      quality: 'auto:best',
      fetch_format: 'auto',
      // Add unique identifier
      public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}`,
    })

    console.log('[Upload] Success:', {
      userId: user.id,
      fileName,
      size: file.size,
      type: file.type,
      publicId: result.public_id
    })

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    
    // Handle specific Cloudinary errors
    if (error.message?.includes('File size too large')) {
      return NextResponse.json(
        { error: 'File too large', message: 'File quá lớn. Vui lòng nén ảnh trước khi tải.' },
        { status: 413 }
      )
    }
    
    return NextResponse.json(
      { error: 'Upload failed', message: error.message || 'Không thể tải ảnh lên. Vui lòng thử lại.' },
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

    const { public_id } = await request.json()

    if (!public_id) {
      return NextResponse.json(
        { error: 'No public_id provided' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}

