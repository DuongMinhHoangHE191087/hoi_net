/**
 * Server-Side Database Utility
 * Uses Service Role Key to bypass RLS policies
 * Should ONLY be used in API routes with proper admin authentication
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side database operations')
}

// Create admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Re-export all database types
export type {
  User,
  Request,
  BlogPost,
  TeamMember,
  ValueSection,
  Feedback,
  SiteSetting,
  Feature
} from '../supabase'

import type {
  User,
  Request,
  BlogPost,
  TeamMember,
  ValueSection,
  Feedback,
  SiteSetting,
  Feature
} from '../supabase'

// Server-side database utility (bypasses RLS)
export const dbServer = {
  // Blog Posts
  async getBlogPosts(publishedOnly = true, page = 1, limit = 20) {
    const offset = (page - 1) * limit
    let query = supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (publishedOnly) {
      query = query.eq('published', true)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data: data as BlogPost[], total: count || 0 }
  },

  async getBlogPost(slug: string) {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as BlogPost
  },

  async createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(post)
      .select()
      .single()

    if (error) throw error
    return data as BlogPost
  },

  async updateBlogPost(id: string, updates: Partial<BlogPost>) {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as BlogPost
  },

  async deleteBlogPost(id: string) {
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Team Members
  async getTeamMembers(limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data as TeamMember[]
  },

  async createTeamMember(member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert(member)
      .select()
      .single()

    if (error) throw error
    return data as TeamMember
  },

  async updateTeamMember(id: string, updates: Partial<TeamMember>) {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as TeamMember
  },

  async deleteTeamMember(id: string) {
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Value Sections
  async getAllValueSections() {
    const { data, error } = await supabaseAdmin
      .from('value_sections')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as ValueSection[]
  },

  async createValueSection(section: Omit<ValueSection, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
      .from('value_sections')
      .insert(section)
      .select()
      .single()

    if (error) throw error
    return data as ValueSection
  },

  async updateValueSection(id: string, updates: Partial<ValueSection>) {
    const { data, error } = await supabaseAdmin
      .from('value_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as ValueSection
  },

  async deleteValueSection(id: string) {
    const { error } = await supabaseAdmin
      .from('value_sections')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Feedback
  async getFeedback(status?: 'new' | 'read' | 'archived'): Promise<Feedback[]> {
    try {
      let query = supabaseAdmin
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query
      if (error) {
        console.warn('getFeedback error:', error.message)
        return []
      }
      return (data || []) as Feedback[]
    } catch (err) {
      console.warn('getFeedback exception:', err)
      return []
    }
  },

  async updateFeedback(id: string, updates: Partial<Feedback>) {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Feedback
  },

  // Requests
  async getRequests(userId?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit
    let query = supabaseAdmin
      .from('requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data as Request[], total: count || 0 }
  },

  async updateRequest(id: string, updates: Partial<Request>) {
    const { data, error } = await supabaseAdmin
      .from('requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Request
  },

  async deleteRequest(id: string) {
    const { error } = await supabaseAdmin
      .from('requests')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Site Settings
  async getAllSiteSettings(): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .select('key, value')

      if (error) {
        console.warn('getAllSiteSettings error:', error.message)
        return {}
      }

      const settings: Record<string, string> = {}
      for (const item of (data || [])) {
        settings[item.key] = item.value
      }
      return settings
    } catch (err) {
      console.warn('getAllSiteSettings exception:', err)
      return {}
    }
  },

  async getSiteSetting(key: string): Promise<SiteSetting | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .select('*')
        .eq('key', key)
        .maybeSingle()

      if (error) {
        console.warn(`getSiteSetting error for key "${key}":`, error.message)
        return null
      }
      return data as SiteSetting | null
    } catch (err) {
      console.warn(`getSiteSetting exception for key "${key}":`, err)
      return null
    }
  },

  async updateSiteSetting(key: string, value: string): Promise<SiteSetting | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
        .select()
        .single()

      if (error) throw error
      return data as SiteSetting
    } catch (err) {
      console.error(`updateSiteSetting error for key "${key}":`, err)
      throw err
    }
  },

  async updateMultipleSiteSettings(settings: Record<string, string>): Promise<void> {
    const updates = Object.entries(settings).map(async ([key, value]) => {
      return this.updateSiteSetting(key, value)
    })

    await Promise.all(updates)
  },

  // Features
  async getAllFeatures() {
    const { data, error } = await supabaseAdmin
      .from('features')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as Feature[]
  },

  async getActiveFeatures() {
    const { data, error } = await supabaseAdmin
      .from('features')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as Feature[]
  },

  async createFeature(feature: Omit<Feature, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
      .from('features')
      .insert(feature)
      .select()
      .single()

    if (error) throw error
    return data as Feature
  },

  async updateFeature(id: string, updates: Partial<Feature>) {
    const { data, error } = await supabaseAdmin
      .from('features')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Feature
  },

  async deleteFeature(id: string) {
    const { error } = await supabaseAdmin
      .from('features')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
