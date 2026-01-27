/**
 * API: Admin Feedback Statistics
 * Get aggregate statistics for all request feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const log = logger.child({ path: '/api/admin/feedback-stats' })

// Check if user is admin
async function checkAdmin(user: any): Promise<boolean> {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(user.email?.toLowerCase())
}

// GET: Get feedback statistics
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdmin(user)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all feedback
    const { data: allFeedback, error } = await supabaseAdmin
      .from('request_feedback')
      .select(`
        *,
        user_requests (
          id,
          type,
          user_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate statistics
    const totalFeedback = allFeedback?.length || 0
    const ratings = allFeedback?.map(f => f.rating) || []
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
      : 0

    const ratingDistribution = {
      5: ratings.filter(r => r === 5).length,
      4: ratings.filter(r => r === 4).length,
      3: ratings.filter(r => r === 3).length,
      2: ratings.filter(r => r === 2).length,
      1: ratings.filter(r => r === 1).length
    }

    const wouldRecommend = allFeedback?.filter(f => f.would_recommend === true).length || 0
    const wouldNotRecommend = allFeedback?.filter(f => f.would_recommend === false).length || 0
    const recommendPercentage = totalFeedback > 0 
      ? ((wouldRecommend / (wouldRecommend + wouldNotRecommend)) * 100).toFixed(1)
      : 0

    // Get popular tags
    const allTags = allFeedback?.flatMap(f => f.tags || []) || []
    const tagCounts: Record<string, number> = {}
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
    const popularTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))

    // Get recent feedback with comments
    const recentWithComments = allFeedback
      ?.filter(f => f.comment && f.comment.trim().length > 0)
      .slice(0, 10)
      .map(f => ({
        id: f.id,
        rating: f.rating,
        comment: f.comment,
        would_recommend: f.would_recommend,
        created_at: f.created_at,
        request_type: f.user_requests?.type
      })) || []

    // Average quality and speed ratings
    const qualityRatings = allFeedback?.filter(f => f.quality_rating).map(f => f.quality_rating) || []
    const speedRatings = allFeedback?.filter(f => f.speed_rating).map(f => f.speed_rating) || []
    
    const avgQualityRating = qualityRatings.length > 0
      ? (qualityRatings.reduce((a, b) => a + b, 0) / qualityRatings.length).toFixed(2)
      : null
    
    const avgSpeedRating = speedRatings.length > 0
      ? (speedRatings.reduce((a, b) => a + b, 0) / speedRatings.length).toFixed(2)
      : null

    // Feedback by request type
    const restoreFeedback = allFeedback?.filter(f => f.user_requests?.type === 'restore') || []
    const familyFeedback = allFeedback?.filter(f => f.user_requests?.type === 'family') || []
    
    const avgByType = {
      restore: restoreFeedback.length > 0
        ? (restoreFeedback.reduce((a, f) => a + f.rating, 0) / restoreFeedback.length).toFixed(2)
        : null,
      family: familyFeedback.length > 0
        ? (familyFeedback.reduce((a, f) => a + f.rating, 0) / familyFeedback.length).toFixed(2)
        : null
    }

    return NextResponse.json({
      success: true,
      statistics: {
        totalFeedback,
        averageRating: parseFloat(averageRating as string),
        ratingDistribution,
        recommendStats: {
          wouldRecommend,
          wouldNotRecommend,
          percentage: parseFloat(recommendPercentage as string)
        },
        detailedRatings: {
          quality: avgQualityRating ? parseFloat(avgQualityRating) : null,
          speed: avgSpeedRating ? parseFloat(avgSpeedRating) : null
        },
        byRequestType: avgByType,
        popularTags,
        recentWithComments
      }
    })

  } catch (error: any) {
    log.error('Error fetching feedback stats:', { error })
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
