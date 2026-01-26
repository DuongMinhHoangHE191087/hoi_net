import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { v2 as cloudinary } from 'cloudinary'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST: Upload favicon (generates multiple sizes)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const faviconFile = formData.get('favicon') as File | null

    if (!faviconFile) {
      return NextResponse.json({ error: 'No favicon file provided' }, { status: 400 })
    }

    // Validate file type
    if (!faviconFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const arrayBuffer = await faviconFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate multiple favicon sizes
    const sizes = [16, 32, 180] // 16x16, 32x32, 180x180 (Apple touch icon)
    const uploadedIcons: Record<string, string> = {}

    for (const size of sizes) {
      // Resize image
      const resizedBuffer = await sharp(buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toBuffer()

      const base64 = resizedBuffer.toString('base64')
      const dataUri = `data:image/png;base64,${base64}`

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'site-branding/favicon',
        public_id: `favicon-${size}x${size}`,
        resource_type: 'image',
        overwrite: true,
        format: 'png'
      })

      uploadedIcons[`${size}x${size}`] = result.secure_url

      // Save to media library
      await supabaseAdmin
        .from('media_library')
        .insert({
          user_id: user.id,
          file_name: `favicon-${size}x${size}.png`,
          file_url: result.secure_url,
          file_type: 'image',
          file_size: resizedBuffer.length,
          mime_type: 'image/png',
          category: 'favicon',
          width: size,
          height: size,
          alt_text: `Favicon ${size}x${size}`
        })
    }

    // Store main favicon URL (32x32) in site_settings
    await supabaseAdmin
      .from('site_settings')
      .upsert({
        key: 'site_favicon_url',
        value: uploadedIcons['32x32'],
        description: 'Favicon của website'
      }, { onConflict: 'key' })

    // Store all sizes as JSON
    await supabaseAdmin
      .from('site_settings')
      .upsert({
        key: 'site_favicon_sizes',
        value: JSON.stringify(uploadedIcons),
        description: 'All favicon sizes'
      }, { onConflict: 'key' })

    return NextResponse.json({
      success: true,
      message: 'Favicon uploaded successfully',
      icons: uploadedIcons
    })
  } catch (error: any) {
    console.error('[Favicon Upload API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete favicon
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all favicon sizes from Cloudinary
    const sizes = [16, 32, 180]
    for (const size of sizes) {
      try {
        await cloudinary.uploader.destroy(`site-branding/favicon/favicon-${size}x${size}`)
      } catch (cloudinaryError) {
        console.warn(`[Favicon Delete] Failed to delete ${size}x${size}:`, cloudinaryError)
      }
    }

    // Clear from site_settings
    await supabaseAdmin
      .from('site_settings')
      .update({ value: '' })
      .in('key', ['site_favicon_url', 'site_favicon_sizes'])

    return NextResponse.json({
      success: true,
      message: 'Favicon deleted successfully'
    })
  } catch (error: any) {
    console.error('[Favicon Delete API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

