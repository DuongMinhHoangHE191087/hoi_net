import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET: Get all blog posts (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publishedOnly = searchParams.get('publishedOnly') !== 'false'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // If requesting unpublished content, require blog.edit permission.
    if (!publishedOnly) {
      return requirePermissionAuth(request, 'blog.edit', async () => {
        const result = await dbServer.getBlogPosts(false, page, limit)
        return NextResponse.json({
          success: true,
          posts: result.data,
          pagination: { page, limit, total: result.total },
        })
      })
    }

    const result = await dbServer.getBlogPosts(true, page, limit)

    return NextResponse.json({
      success: true,
      posts: result.data,
      pagination: {
        page,
        limit,
        total: result.total
      }
    })
  } catch (error: any) {
    console.error('[Blog Posts API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Create new blog post (admin only)
export async function POST(request: NextRequest) {
  return requirePermissionAuth(request, 'blog.create', async (user) => {
    try {
      const body = await request.json()
      const { title, slug, excerpt, content, author_name, category, tags, featured_image, published } = body

      if (!title || !slug || !content) {
        return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
      }

      // Enforce publish permission
      const canPublish = user.role === 'admin' || user.role === 'moderator'
      const safePublished = canPublish ? !!published : false

      // Ensure slug unique
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (existingError) {
        return NextResponse.json({ error: existingError.message }, { status: 500 })
      }

      if (existing?.id) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }

      const newPost = await dbServer.createBlogPost({
        title,
        slug,
        excerpt: excerpt || '',
        content,
        author_name: author_name || 'Admin',
        category: category || 'general',
        tags: tags || [],
        featured_image: featured_image || '',
        published: safePublished
      })

      return NextResponse.json({
        success: true,
        message: 'Blog post created successfully',
        post: newPost
      })
    } catch (error: any) {
      console.error('[Blog Posts API] Error:', error)
      return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
  })
}

