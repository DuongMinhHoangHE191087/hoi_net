import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { verifyAuth } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

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

    const formData = await request.formData()
    const file = formData.get('file') as File

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

    // Validate file size (max 50MB for avatars)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large', message: 'File không được vượt quá 50MB' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary with avatar-optimized settings
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'avatars',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' }, // Smart crop focusing on faces
        { quality: 'auto', fetch_format: 'auto' } // Auto optimization
      ],
      // Generate thumbnails
      eager: [
        { width: 150, height: 150, crop: 'fill', gravity: 'face' },
        { width: 50, height: 50, crop: 'fill', gravity: 'face' }
      ]
    })

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      thumbnail: result.eager?.[0]?.secure_url,
      small_thumbnail: result.eager?.[1]?.secure_url,
    })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error.message || 'Không thể tải lên avatar',
        details: error.error?.message
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

    const { public_id } = await request.json()

    if (!public_id) {
      return NextResponse.json(
        { error: 'No public_id provided', message: 'Thiếu public_id' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id)

    return NextResponse.json({ success: true, message: 'Đã xóa avatar' })
  } catch (error: any) {
    console.error('Avatar delete error:', error)
    return NextResponse.json(
      {
        error: 'Delete failed',
        message: 'Không thể xóa avatar',
        details: error.message
      },
      { status: 500 }
    )
  }
}

