import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// GET: Get all blog posts (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publishedOnly = searchParams.get('publishedOnly') !== 'false'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const result = await dbServer.getBlogPosts(publishedOnly, page, limit)

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
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, excerpt, content, author_name, category, tags, featured_image, published } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
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
      published: published || false
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
}
