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

// GET: Get all media from library (with filters)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const fileType = searchParams.get('fileType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabaseAdmin
      .from('media_library')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (fileType && fileType !== 'all') {
      query = query.eq('file_type', fileType)
    }

    // Pagination
    query = query.range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[Media Library API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      media: data || [],
      pagination: {
        page,
        limit,
        total: count || 0
      }
    })
  } catch (error: any) {
    console.error('[Media Library API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Upload media file
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string || 'general'
    const altText = formData.get('altText') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Determine file type
    let fileType = 'other'
    if (file.type.startsWith('image/')) fileType = 'image'
    else if (file.type.startsWith('video/')) fileType = 'video'
    else if (file.type.includes('pdf') || file.type.includes('document')) fileType = 'document'

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const resourceType = fileType === 'video' ? 'video' : 'image'
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `media-library/${category}`,
      resource_type: resourceType,
      transformation: fileType === 'image' ? [
        { width: 2000, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ] : undefined
    })

    // Save to database
    const { data: mediaData, error: dbError } = await supabaseAdmin
      .from('media_library')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: result.secure_url,
        file_type: fileType,
        file_size: file.size,
        mime_type: file.type,
        category,
        alt_text: altText,
        width: result.width || null,
        height: result.height || null
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Media Library API] DB Error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      media: mediaData
    })
  } catch (error: any) {
    console.error('[Media Library API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete media file
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    // Get media info
    const { data: media, error: fetchError } = await supabaseAdmin
      .from('media_library')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Extract public_id from Cloudinary URL
    try {
      const urlParts = media.file_url.split('/')
      const uploadIndex = urlParts.findIndex(part => part === 'upload')
      if (uploadIndex !== -1) {
        const pathParts = urlParts.slice(uploadIndex + 2) // Skip version
        const publicIdWithExt = pathParts.join('/')
        const publicId = publicIdWithExt.split('.')[0]

        // Delete from Cloudinary
        const resourceType = media.file_type === 'video' ? 'video' : 'image'
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
      }
    } catch (cloudinaryError) {
      console.warn('[Media Delete] Cloudinary deletion failed:', cloudinaryError)
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('media_library')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    })
  } catch (error: any) {
    console.error('[Media Library API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH: Update media metadata
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, altText, category } = body

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    const updates: any = {}
    if (altText !== undefined) updates.alt_text = altText
    if (category) updates.category = category

    const { data, error } = await supabaseAdmin
      .from('media_library')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      media: data
    })
  } catch (error: any) {
    console.error('[Media Library API] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
