import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAuth } from '@/lib/auth-server'
import { dbServer } from '@/lib/supabase/db-server'

export const dynamic = 'force-dynamic'

// PATCH: Update feature (admin only)
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

    const updatedFeature = await dbServer.updateFeature(id, body)

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Feature updated successfully',
      feature: updatedFeature
    })
  } catch (error: any) {
    console.error('[Features API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Delete feature (admin only)
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

    await dbServer.deleteFeature(id)

    // Revalidate homepage
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Feature deleted successfully'
    })
  } catch (error: any) {
    console.error('[Features API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
