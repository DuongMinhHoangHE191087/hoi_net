/**
 * Server-only Supabase utilities
 * Use these in Server Components, API routes, and Server Actions only
 */

import { createClient } from './server'

// ============================================
// Server-side Data Fetching Functions
// ============================================

export async function getTeamMembers(limit = 50) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getTeamMembers exception:', error)
    return []
  }
}

export async function getTestimonials(limit = 10, featuredOnly = false) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('feedback')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (featuredOnly) {
      query = query.eq('is_featured', true)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getTestimonials exception:', error)
    return []
  }
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error) throw error

    const settings: Record<string, string> = {}
    if (data) {
      data.forEach((item: { key: string; value: string }) => {
        settings[item.key] = item.value
      })
    }
    return settings
  } catch (error) {
    console.error('getAllSiteSettings exception:', error)
    return {}
  }
}

export async function getSiteSetting(key: string, defaultValue = ''): Promise<string> {
  try {
    const settings = await getAllSiteSettings()
    return settings[key] || defaultValue
  } catch (error) {
    console.error('getSiteSetting exception:', error)
    return defaultValue
  }
}

export async function getBlogPosts(publishedOnly = true, page = 1, limit = 20) {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (publishedOnly) {
      query = query.eq('published', true)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data: data || [], total: count || 0 }
  } catch (error) {
    console.error('getBlogPosts exception:', error)
    return { data: [], total: 0 }
  }
}

export async function getBlogPost(slug: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('getBlogPost exception:', error)
    return null
  }
}

export async function getNavigationLinks() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('navigation_links')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getNavigationLinks exception:', error)
    return []
  }
}

export async function getFooterLinks() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('footer_links')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getFooterLinks exception:', error)
    return []
  }
}

export async function getValueSections() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('value_sections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getValueSections exception:', error)
    return []
  }
}

export async function getAboutSections() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getAboutSections exception:', error)
    return []
  }
}

export async function getServices() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getServices exception:', error)
    return []
  }
}

export async function getPricingPlans() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getPricingPlans exception:', error)
    return []
  }
}

