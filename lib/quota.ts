/**
 * AI Usage Quota Management Utilities
 * Handles quota checking, usage logging, and quota info retrieval
 */

import { supabase } from './supabase'
import { dbCache, cacheKeys, invalidateUserCache } from './lru-cache'

// ============================================
// Types
// ============================================

export interface QuotaInfo {
  hasQuota: boolean
  remaining: number
  monthlyLimit: number
  currentUsage: number
  periodEnd: string
  tier: 'free' | 'premium' | 'enterprise' | 'admin'
  isUnlimited: boolean
}

export interface QuotaCheckResult {
  allowed: boolean
  info: QuotaInfo
  message?: string
}

export interface UsageLogEntry {
  userId: string
  requestId?: string
  actionType: 'restore' | 'enhance' | 'colorize' | 'upscale' | 'harmonize'
  imagesCount: number
  creditsUsed?: number
  promptUsed?: string
  processingTimeMs?: number
}

// ============================================
// Constants
// ============================================

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  premium: 50,
  enterprise: 9999,
  admin: 99999
}

// Use single source of truth for admin emails
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

// ============================================
// Main Functions
// ============================================

/**
 * Check if user has available quota
 * Creates quota record if not exists
 */
export async function checkQuota(userId: string): Promise<QuotaCheckResult> {
  try {
    // Call the database function
    const { data, error } = await supabase.rpc('check_user_quota', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error checking quota:', error)
      // Fallback: allow but log error
      return {
        allowed: true,
        info: getDefaultQuotaInfo(),
        message: 'Error checking quota, proceeding with default'
      }
    }

    if (!data || data.length === 0) {
      // Create new quota record
      return await createDefaultQuota(userId)
    }

    const quotaData = data[0]
    const info: QuotaInfo = {
      hasQuota: quotaData.has_quota,
      remaining: quotaData.remaining,
      monthlyLimit: quotaData.monthly_limit,
      currentUsage: quotaData.current_usage,
      periodEnd: quotaData.period_end,
      tier: quotaData.tier,
      isUnlimited: quotaData.tier === 'admin' || quotaData.tier === 'enterprise'
    }

    return {
      allowed: info.hasQuota,
      info,
      message: info.hasQuota 
        ? undefined 
        : `Bạn đã sử dụng hết ${info.monthlyLimit} lượt trong tháng này. Quota sẽ reset vào ${new Date(info.periodEnd).toLocaleDateString('vi-VN')}`
    }
  } catch (err) {
    console.error('Quota check failed:', err)
    return {
      allowed: true,
      info: getDefaultQuotaInfo(),
      message: 'Quota check error, proceeding'
    }
  }
}

/**
 * Log AI usage after successful processing
 */
export async function logUsage(entry: UsageLogEntry): Promise<boolean> {
  try {
    const { error: logError } = await supabase
      .from('ai_usage_log')
      .insert({
        user_id: entry.userId,
        request_id: entry.requestId || null,
        action_type: entry.actionType,
        images_count: entry.imagesCount,
        credits_used: entry.creditsUsed || 1,
        prompt_used: entry.promptUsed || null,
        processing_time_ms: entry.processingTimeMs || null
      })

    if (logError) {
      console.error('Error logging usage:', logError)
      return false
    }

    // Increment usage counter
    const { error: incrementError } = await supabase.rpc('increment_usage', {
      p_user_id: entry.userId,
      p_credits: entry.creditsUsed || 1
    })

    if (incrementError) {
      console.error('Error incrementing usage:', incrementError)
      return false
    }

    // Invalidate user quota cache after usage change
    invalidateUserCache(entry.userId)

    return true
  } catch (err) {
    console.error('Log usage failed:', err)
    return false
  }
}

/**
 * Get current quota info for user (with caching)
 */
export async function getQuotaInfo(userId: string): Promise<QuotaInfo> {
  // Check cache first
  const cacheKey = cacheKeys.userQuota(userId)
  const cached = dbCache.get(cacheKey)
  if (cached) return cached as QuotaInfo

  try {
    const { data, error } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      const result = await createDefaultQuota(userId)
      return result.info
    }

    // Check if period needs reset
    if (new Date(data.period_end) < new Date()) {
      await resetQuotaIfNeeded(userId)
      invalidateUserCache(userId)
      return getQuotaInfo(userId) // Recursively get updated info
    }

    const quotaInfo: QuotaInfo = {
      hasQuota: data.is_unlimited || data.current_usage < data.monthly_limit,
      remaining: Math.max(0, data.monthly_limit + (data.extra_credits || 0) - data.current_usage),
      monthlyLimit: data.monthly_limit,
      currentUsage: data.current_usage,
      periodEnd: data.period_end,
      tier: data.tier,
      isUnlimited: data.is_unlimited || false
    }

    // Cache for 2 minutes
    dbCache.set(cacheKey, quotaInfo, 2 * 60 * 1000)

    return quotaInfo
  } catch (err) {
    console.error('Get quota info failed:', err)
    return getDefaultQuotaInfo()
  }
}

/**
 * Check if user is admin (for bypassing quota)
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    if (!user?.user?.email) return false
    return ADMIN_EMAILS.includes(user.user.email.toLowerCase())
  } catch {
    return false
  }
}

/**
 * Get usage history for user
 */
export async function getUsageHistory(
  userId: string, 
  limit: number = 10
): Promise<Array<{
  actionType: string
  imagesCount: number
  createdAt: string
}>> {
  try {
    const { data, error } = await supabase
      .from('ai_usage_log')
      .select('action_type, images_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []

    return data.map((item: any) => ({
      actionType: item.action_type,
      imagesCount: item.images_count,
      createdAt: item.created_at
    }))
  } catch {
    return []
  }
}

/**
 * Get available tiers for upgrade
 */
export async function getAvailableTiers(): Promise<Array<{
  name: string
  displayName: string
  monthlyLimit: number
  priceMonthly: number
  features: string[]
}>> {
  try {
    const { data, error } = await supabase
      .from('quota_tiers')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error || !data) return []

    return data.map((tier: any) => ({
      name: tier.name,
      displayName: tier.display_name,
      monthlyLimit: tier.monthly_limit,
      priceMonthly: tier.price_monthly,
      features: tier.features || []
    }))
  } catch {
    return []
  }
}

// ============================================
// Helper Functions
// ============================================

async function createDefaultQuota(userId: string): Promise<QuotaCheckResult> {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  try {
    const { data, error } = await supabase
      .from('user_quotas')
      .insert({
        user_id: userId,
        tier: 'free',
        monthly_limit: TIER_LIMITS.free,
        current_usage: 0,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating quota:', error)
      return {
        allowed: true,
        info: getDefaultQuotaInfo()
      }
    }

    return {
      allowed: true,
      info: {
        hasQuota: true,
        remaining: TIER_LIMITS.free,
        monthlyLimit: TIER_LIMITS.free,
        currentUsage: 0,
        periodEnd: periodEnd.toISOString(),
        tier: 'free',
        isUnlimited: false
      }
    }
  } catch {
    return {
      allowed: true,
      info: getDefaultQuotaInfo()
    }
  }
}

async function resetQuotaIfNeeded(userId: string): Promise<void> {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  try {
    await supabase
      .from('user_quotas')
      .update({
        current_usage: 0,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString()
      })
      .eq('user_id', userId)
      .lt('period_end', now.toISOString())
  } catch (err) {
    console.error('Error resetting quota:', err)
  }
}

function getDefaultQuotaInfo(): QuotaInfo {
  const now = new Date()
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  return {
    hasQuota: true,
    remaining: TIER_LIMITS.free,
    monthlyLimit: TIER_LIMITS.free,
    currentUsage: 0,
    periodEnd: periodEnd.toISOString(),
    tier: 'free',
    isUnlimited: false
  }
}

// ============================================
// Export all functions
// ============================================

export const quota = {
  check: checkQuota,
  log: logUsage,
  getInfo: getQuotaInfo,
  getHistory: getUsageHistory,
  getTiers: getAvailableTiers,
  isAdmin: isUserAdmin,
}

export default quota
