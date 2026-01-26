import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { updateWithOptimisticLock, logConflict } from '@/lib/optimistic-lock'
import { versionConflictResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

// GET: Get single blog post by ID (admin only - includes unpublished)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      post: data
    })
  } catch (error: any) {
    console.error('[Blog Post API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH: Update blog post with optimistic locking (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { version, ...updates } = body

    // If version is provided, use optimistic locking
    if (version !== undefined) {
      const result = await updateWithOptimisticLock(
        supabaseAdmin,
        'blog_posts',
        id,
        updates,
        version
      )

      if (result.conflict) {
        // Log the conflict for monitoring
        await logConflict(supabaseAdmin, {
          tableName: 'blog_posts',
          rowId: id,
          expectedVersion: version,
          actualVersion: result.currentVersion || 0,
          userId: user.id
        })

        return versionConflictResponse(
          version,
          result.currentVersion || 0,
          'Blog post'
        )
      }

      if (result.error) {
        console.error('[Blog Post API] Update error:', result.error)
        return NextResponse.json({ error: result.error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Blog post updated successfully',
        post: result.data
      })
    }

    // Fallback: Update without version check (backwards compatibility)
    const updatedPost = await dbServer.updateBlogPost(id, updates)

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      post: updatedPost
    })
  } catch (error: any) {
    console.error('[Blog Post API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await dbServer.deleteBlogPost(id)

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    })
  } catch (error: any) {
    console.error('[Blog Post API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
