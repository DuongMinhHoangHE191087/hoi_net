import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST: Upload logo (light and dark mode)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const lightLogo = formData.get('lightLogo') as File | null
    const darkLogo = formData.get('darkLogo') as File | null

    const uploadedUrls: { lightLogoUrl?: string; darkLogoUrl?: string } = {}

    // Upload light logo
    if (lightLogo) {
      const arrayBuffer = await lightLogo.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      const dataUri = `data:${lightLogo.type};base64,${base64}`

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'site-branding/logos',
        resource_type: 'image',
        transformation: [
          { width: 500, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })

      uploadedUrls.lightLogoUrl = result.secure_url

      // Update site_settings
      await supabaseAdmin
        .from('site_settings')
        .upsert({
          key: 'site_logo_url',
          value: result.secure_url,
          description: 'Logo chính của website'
        }, { onConflict: 'key' })

      // Save to media library
      await supabaseAdmin
        .from('media_library')
        .insert({
          user_id: user.id,
          file_name: lightLogo.name,
          file_url: result.secure_url,
          file_type: 'image',
          file_size: lightLogo.size,
          mime_type: lightLogo.type,
          category: 'logo',
          width: result.width,
          height: result.height,
          alt_text: 'Site Logo'
        })
    }

    // Upload dark logo
    if (darkLogo) {
      const arrayBuffer = await darkLogo.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      const dataUri = `data:${darkLogo.type};base64,${base64}`

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'site-branding/logos',
        resource_type: 'image',
        transformation: [
          { width: 500, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })

      uploadedUrls.darkLogoUrl = result.secure_url

      // Update site_settings
      await supabaseAdmin
        .from('site_settings')
        .upsert({
          key: 'site_logo_dark_url',
          value: result.secure_url,
          description: 'Logo dark mode'
        }, { onConflict: 'key' })

      // Save to media library
      await supabaseAdmin
        .from('media_library')
        .insert({
          user_id: user.id,
          file_name: darkLogo.name,
          file_url: result.secure_url,
          file_type: 'image',
          file_size: darkLogo.size,
          mime_type: darkLogo.type,
          category: 'logo',
          width: result.width,
          height: result.height,
          alt_text: 'Site Logo Dark'
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Logo uploaded successfully',
      urls: uploadedUrls
    })
  } catch (error: any) {
    console.error('[Logo Upload API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete logo
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'light' | 'dark'

    if (!type || (type !== 'light' && type !== 'dark')) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    const key = type === 'light' ? 'site_logo_url' : 'site_logo_dark_url'

    // Get current logo URL
    const { data: setting } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single()

    if (setting?.value) {
      // Extract public_id from Cloudinary URL
      const urlParts = setting.value.split('/')
      const publicIdWithExt = urlParts.slice(-2).join('/')
      const publicId = publicIdWithExt.split('.')[0]

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(publicId)
      } catch (cloudinaryError) {
        console.warn('[Logo Delete] Cloudinary deletion failed:', cloudinaryError)
      }
    }

    // Clear from site_settings
    await supabaseAdmin
      .from('site_settings')
      .update({ value: '' })
      .eq('key', key)

    return NextResponse.json({
      success: true,
      message: 'Logo deleted successfully'
    })
  } catch (error: any) {
    console.error('[Logo Delete API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

