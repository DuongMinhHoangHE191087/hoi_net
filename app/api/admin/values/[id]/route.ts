import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// PATCH: Update value section (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updatedValueSection = await dbServer.updateValueSection(id, body)

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Value section updated successfully',
      valueSection: updatedValueSection
    })
  } catch (error: any) {
    console.error('[Values API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete value section (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await dbServer.deleteValueSection(id)

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Value section deleted successfully'
    })
  } catch (error: any) {
    console.error('[Values API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
