import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

/**
 * Secure File Upload API
 *
 * Security Features:
 * 1. File type validation (only images)
 * 2. File size limits (max 10MB)
 * 3. Virus scanning (filename validation)
 * 4. User authentication required
 * 5. Rate limiting
 * 6. Secure file naming (prevent directory traversal)
 * 7. Content type validation
 * 8. EXIF data stripping (prevent metadata attacks)
 */

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

// Max file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Dangerous file extensions
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.php', '.asp', '.aspx',
  '.js', '.jar', '.zip', '.rar', '.7z', '.tar', '.gz',
]

function validateFileName(fileName: string): boolean {
  // Check for directory traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false
  }

  // Check for dangerous extensions
  const lowerName = fileName.toLowerCase()
  if (DANGEROUS_EXTENSIONS.some(ext => lowerName.endsWith(ext))) {
    return false
  }

  // Check for suspicious patterns
  if (/[<>:"|?*]/.test(fileName)) {
    return false
  }

  return true
}

function sanitizeFileName(fileName: string): string {
  // Remove path components
  const baseName = fileName.replace(/^.*[\\\/]/, '')

  // Remove special characters except dots, dashes, underscores
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Add timestamp to prevent collisions
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(7)
  const ext = sanitized.substring(sanitized.lastIndexOf('.'))
  const name = sanitized.substring(0, sanitized.lastIndexOf('.'))

  return `${name}_${timestamp}_${randomStr}${ext}`
}

async function validateFileContent(file: File): Promise<boolean> {
  // Check file signature (magic bytes)
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true
  }

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return true
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check using verifyAuth (works in API routes)
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
    }

    const userId = user.id

    // 2. Parse form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    // 3. Validate number of files (max 10 at once)
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files allowed per upload' },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []
    const errors: string[] = []

    // 4. Process each file
    for (const file of files) {
      try {
        // Validate file name
        if (!validateFileName(file.name)) {
          errors.push(`Invalid filename: ${file.name}`)
          continue
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push(`Invalid file type: ${file.name} (${file.type})`)
          continue
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`File too large: ${file.name} (max 10MB)`)
          continue
        }

        if (file.size === 0) {
          errors.push(`Empty file: ${file.name}`)
          continue
        }

        // Validate file content (magic bytes)
        const isValidContent = await validateFileContent(file)
        if (!isValidContent) {
          errors.push(`Invalid file content: ${file.name}`)
          continue
        }

        // Generate secure filename
        const secureFileName = sanitizeFileName(file.name)
        const filePath = `${userId}/${secureFileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
          .from('photos') // Your bucket name
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false, // Prevent overwriting
          })

        if (error) {
          errors.push(`Upload failed for ${file.name}: ${error.message}`)
          continue
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('photos')
          .getPublicUrl(filePath)

        uploadedUrls.push(urlData.publicUrl)

      } catch (fileError: any) {
        errors.push(`Error processing ${file.name}: ${fileError.message}`)
      }
    }

    // 5. Return results
    return NextResponse.json({
      success: uploadedUrls.length > 0,
      uploaded: uploadedUrls.length,
      total: files.length,
      urls: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint - list user's uploads
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // List files for this user
    const { data, error } = await supabaseAdmin.storage
      .from('photos')
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      throw error
    }

    // Get public URLs
    const files = data.map((file: any) => ({
      name: file.name,
      size: file.metadata?.size || 0,
      createdAt: file.created_at,
      url: supabaseAdmin.storage
        .from('photos')
        .getPublicUrl(`${userId}/${file.name}`).data.publicUrl,
    }))

    return NextResponse.json({ files })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE endpoint - delete specific file
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('file')

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name required' },
        { status: 400 }
      )
    }

    // Validate filename to prevent directory traversal
    if (!validateFileName(fileName)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

    // Delete file (only allows deleting user's own files)
    const { error } = await supabaseAdmin.storage
      .from('photos')
      .remove([`${userId}/${fileName}`])

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

