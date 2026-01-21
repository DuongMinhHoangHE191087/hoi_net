/**
 * Profile Completeness Check Utility
 * Verifies user has phone OR Facebook before allowing request submission
 */

import { supabase } from './supabase'

export interface ProfileCheckResult {
  complete: boolean
  missing: ('phone' | 'facebook_url')[]
  profile: {
    full_name?: string
    phone?: string
    facebook_url?: string
  } | null
}

/**
 * Check if user profile is complete enough for request submission
 * Requires at least: phone OR facebook_url
 */
export async function checkProfileComplete(userId: string): Promise<ProfileCheckResult> {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('full_name, phone, facebook_url')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return {
        complete: false,
        missing: ['phone', 'facebook_url'],
        profile: null
      }
    }

    const hasPhone = !!profile.phone && profile.phone.trim().length >= 10
    const hasFacebook = !!profile.facebook_url && profile.facebook_url.trim().length > 0

    // User needs at least ONE contact method
    const complete = hasPhone || hasFacebook

    const missing: ('phone' | 'facebook_url')[] = []
    if (!hasPhone) missing.push('phone')
    if (!hasFacebook) missing.push('facebook_url')

    return {
      complete,
      missing: complete ? [] : missing.slice(0, 1), // Only show first missing if incomplete
      profile: {
        full_name: profile.full_name || undefined,
        phone: profile.phone || undefined,
        facebook_url: profile.facebook_url || undefined
      }
    }
  } catch (error) {
    console.error('[Profile Check] Error:', error)
    return {
      complete: false,
      missing: ['phone', 'facebook_url'],
      profile: null
    }
  }
}

/**
 * Hook-friendly version for client components
 */
export const profileCheck = {
  check: checkProfileComplete
}

export default profileCheck
