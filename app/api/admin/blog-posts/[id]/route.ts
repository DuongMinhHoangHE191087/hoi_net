import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// PATCH: Update blog post (admin only)
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

    const updatedPost = await dbServer.updateBlogPost(id, body)

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
