import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// File size limit (5MB for public uploads)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được gửi' },
        { status: 400 }
      )
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WebP)' },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File quá lớn. Kích thước tối đa là 5MB' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary with specific folder for public uploads
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'photo-restoration/public-uploads',
      resource_type: 'image',
      // Add moderation for public uploads
      moderation: 'aws_rek',
      // Limit transformations for security
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    })

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error('Public upload error:', error)
    return NextResponse.json(
      { error: 'Upload thất bại. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
