/**
 * Supabase Client - Backward Compatibility Layer
 *
 * This file maintains backward compatibility for existing imports.
 * New code should use:
 * - Client components: import { createClient } from '@/lib/supabase/client'
 * - Server components: import { createClient } from '@/lib/supabase/server'
 */

// Import supabase for internal use first
import { supabase as supabaseClient, createClient as createBrowserClient } from './supabase/client'

// Re-export for backward compatibility
export const supabase = supabaseClient
export const createClient = createBrowserClient

// Helper function to check if error is AbortError
function isAbortError(error: any): boolean {
  return error?.name === 'AbortError' ||
         error?.message?.includes('abort') ||
         error?.message?.includes('signal is aborted')
}

// Helper function to handle Supabase errors with retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 300
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (isAbortError(error) && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1, delay * 1.5)
    }
    throw error
  }
}

// Types for database tables
export type User = {
  id: string
  email: string
  name: string
  company?: string
  created_at: string
  updated_at: string
}

export type Request = {
  id: string
  user_id: string
  type: 'restore' | 'family'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  description: string
  image_urls: string[]
  result_url?: string
  created_at: string
  updated_at: string
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author_name: string
  author_avatar?: string
  category?: string
  tags?: string[]
  featured_image?: string
  published: boolean
  created_at: string
  updated_at: string
}

export type TeamMember = {
  id: string
  name: string
  role: string
  bio?: string
  avatar?: string
  avatar_url?: string
  social_links?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  display_order: number
  created_at: string
  updated_at: string
}

export type Feedback = {
  id: string
  user_id?: string
  name: string
  email: string
  message: string
  rating?: number
  status: 'new' | 'read' | 'archived'
  // Extended fields for testimonials
  is_testimonial?: boolean
  display_on_homepage?: boolean
  display_order?: number
  testimonial_image_url?: string
  position_title?: string
  company_name?: string
  is_featured?: boolean
  allow_contact_display?: boolean
  facebook_url?: string
  zalo_id?: string
  website_url?: string
  phone_number?: string
  is_public?: boolean
  created_at: string
  updated_at: string
}

export type SiteSetting = {
  id: string
  key: string
  value: string
  description?: string
  updated_at: string
}

export type Feature = {
  id: string
  title: string
  description: string
  icon_type: 'lucide' | 'image' // lucide icon name or image URL
  icon_value: string // icon name (e.g., 'Sparkles') or image URL
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type FooterLink = {
  id: string
  column_name: string
  column_title: string
  label: string
  href: string
  is_external: boolean
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type NavigationLink = {
  id: string
  label: string
  href: string
  is_external: boolean
  icon?: string
  display_order: number
  is_active: boolean
  show_in_mobile: boolean
  requires_auth: boolean
  requires_admin: boolean
  created_at: string
  updated_at: string
}

export type ValueSection = {
  id: string
  title: string
  description: string
  icon: string
  gradient: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AboutSection = {
  id: string
  title: string
  subtitle?: string
  description: string
  image_url?: string
  image_position: 'left' | 'right'
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SystemPrompt = {
  id: string
  name: string
  display_name: string
  category: string
  system_prompt: string
  user_prompt_template?: string
  description?: string
  parameters: {
    upscale?: number
    denoise?: boolean
    enhanceFaces?: boolean
    colorAccuracy?: number
    [key: string]: any
  }
  is_active: boolean
  is_default: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// ============================================
// AI Usage & Quota Types
// ============================================

export type AIUsageLog = {
  id: string
  user_id: string
  request_id: string | null
  action_type: 'restore' | 'enhance' | 'colorize' | 'upscale'
  images_count: number
  credits_used: number
  prompt_used?: string
  processing_time_ms?: number
  created_at: string
}

export type UserQuota = {
  id: string
  user_id: string
  tier: 'free' | 'premium' | 'enterprise' | 'admin'
  monthly_limit: number
  current_usage: number
  period_start: string
  period_end: string
  extra_credits: number
  is_unlimited: boolean
  created_at: string
  updated_at: string
}

export type QuotaTier = {
  id: string
  name: string
  display_name: string
  monthly_limit: number
  price_monthly: number
  features: string[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// Use the already imported supabaseClient for db utility functions

// Database utility functions
export const db = {
  // Users
  async getUser(id: string) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as User
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  // Requests
  async getRequests(userId?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit
    let query = supabase
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

  async getRequest(id: string) {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Request
  },

  async createRequest(request: Omit<Request, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('requests')
      .insert(request)
      .select()
      .single()

    if (error) throw error
    return data as Request
  },

  async updateRequest(id: string, updates: Partial<Request>) {
    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Request
  },

  async deleteRequest(id: string) {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Blog Posts
  async getBlogPosts(publishedOnly = true, page = 1, limit = 20) {
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
    return { data: data as BlogPost[], total: count || 0 }
  },

  async getBlogPost(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as BlogPost
  },

  async createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single()

    if (error) throw error
    return data as BlogPost
  },

  async updateBlogPost(id: string, updates: Partial<BlogPost>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as BlogPost
  },

  async deleteBlogPost(id: string) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Team Members
  async getTeamMembers(limit = 50) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data as TeamMember[]
  },

  async createTeamMember(member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('team_members')
      .insert(member)
      .select()
      .single()

    if (error) throw error
    return data as TeamMember
  },

  async updateTeamMember(id: string, updates: Partial<TeamMember>) {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as TeamMember
  },

  async deleteTeamMember(id: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Feedback
  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert(feedback)
        .select()
        .single()

      if (error) throw error
      return data as Feedback
    } catch (err) {
      console.error('createFeedback error:', err)
      throw err
    }
  },

  async getFeedback(status?: 'new' | 'read' | 'archived'): Promise<Feedback[]> {
    try {
      let query = supabase
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
    try {
      const { data, error } = await supabase
        .from('feedback')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Feedback
    } catch (err) {
      console.error('updateFeedback error:', err)
      throw err
    }
  },

  // Site Settings
  async getSiteSetting(key: string): Promise<SiteSetting | null> {
    try {
      const { data, error } = await supabase
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
      // Use upsert to handle both insert and update
      const { data, error } = await supabase
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

  // Value Sections
  async getValueSections() {
    const { data, error } = await supabase
      .from('value_sections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as ValueSection[]
  },

  async getAllValueSections() {
    const { data, error } = await supabase
      .from('value_sections')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as ValueSection[]
  },

  async createValueSection(section: Omit<ValueSection, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('value_sections')
      .insert(section)
      .select()
      .single()

    if (error) throw error
    return data as ValueSection
  },

  async updateValueSection(id: string, updates: Partial<ValueSection>) {
    const { data, error } = await supabase
      .from('value_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as ValueSection
  },

  async deleteValueSection(id: string) {
    const { error } = await supabase
      .from('value_sections')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // About Sections
  async getAboutSections() {
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as AboutSection[]
  },

  async getAllAboutSections() {
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as AboutSection[]
  },

  async createAboutSection(section: Omit<AboutSection, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error} = await supabase
      .from('about_sections')
      .insert(section)
      .select()
      .single()

    if (error) throw error
    return data as AboutSection
  },

  async updateAboutSection(id: string, updates: Partial<AboutSection>) {
    const { data, error } = await supabase
      .from('about_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AboutSection
  },

  async deleteAboutSection(id: string) {
    const { error } = await supabase
      .from('about_sections')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // System Prompts
  async getSystemPrompts() {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as SystemPrompt[]
  },

  async getAllSystemPrompts() {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .order('category, display_order', { ascending: true })

    if (error) throw error
    return data as SystemPrompt[]
  },

  async getSystemPromptByName(name: string) {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data as SystemPrompt
  },

  async getSystemPromptsByCategory(category: string) {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as SystemPrompt[]
  },

  async getDefaultSystemPrompt() {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data as SystemPrompt
  },

  async createSystemPrompt(prompt: Omit<SystemPrompt, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('system_prompts')
      .insert(prompt)
      .select()
      .single()

    if (error) throw error
    return data as SystemPrompt
  },

  async updateSystemPrompt(id: string, updates: Partial<SystemPrompt>) {
    const { data, error } = await supabase
      .from('system_prompts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as SystemPrompt
  },

  async deleteSystemPrompt(id: string) {
    const { error } = await supabase
      .from('system_prompts')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Build final prompt for AI processing
  buildAIPrompt(systemPrompt: SystemPrompt, userInput: string, variables: Record<string, string> = {}) {
    let finalSystemPrompt = systemPrompt.system_prompt
    let finalUserPrompt = systemPrompt.user_prompt_template || '{user_input}'

    // Replace variables in user prompt template
    finalUserPrompt = finalUserPrompt.replace('{user_input}', userInput)

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      finalUserPrompt = finalUserPrompt.replace(new RegExp(placeholder, 'g'), value)
    })

    return {
      systemPrompt: finalSystemPrompt,
      userPrompt: finalUserPrompt,
      parameters: systemPrompt.parameters
    }
  },

  // ============================================
  // Footer Links CRUD
  // ============================================
  async getFooterLinks(): Promise<FooterLink[]> {
    try {
      const result = await withRetry(() =>
        supabase
          .from('footer_links')
          .select('*')
          .eq('is_active', true)
          .order('column_name')
          .order('display_order', { ascending: true })
      )
      const { data, error } = result as any

      if (error) {
        if (!isAbortError(error)) {
          console.warn('getFooterLinks error:', error.message)
        }
        return []
      }
      return (data || []) as FooterLink[]
    } catch (err) {
      if (!isAbortError(err)) {
        console.warn('getFooterLinks exception:', err)
      }
      return []
    }
  },

  async getAllFooterLinks(): Promise<FooterLink[]> {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .order('column_name')
        .order('display_order', { ascending: true })

      if (error) {
        console.warn('getAllFooterLinks error:', error.message)
        return []
      }
      return (data || []) as FooterLink[]
    } catch (err) {
      console.warn('getAllFooterLinks exception:', err)
      return []
    }
  },

  async createFooterLink(link: Omit<FooterLink, 'id' | 'created_at' | 'updated_at'>): Promise<FooterLink> {
    const { data, error } = await supabase
      .from('footer_links')
      .insert(link)
      .select()
      .single()

    if (error) throw error
    return data as FooterLink
  },

  async updateFooterLink(id: string, updates: Partial<FooterLink>): Promise<FooterLink> {
    const { data, error } = await supabase
      .from('footer_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as FooterLink
  },

  async deleteFooterLink(id: string): Promise<void> {
    const { error } = await supabase
      .from('footer_links')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async reorderFooterLinks(orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index
    }))

    for (const update of updates) {
      await supabase
        .from('footer_links')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
    }
  },

  // ============================================
  // Navigation Links CRUD
  // ============================================
  async getNavigationLinks(): Promise<NavigationLink[]> {
    try {
      const { data, error } = await supabase
        .from('navigation_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.warn('getNavigationLinks error:', error.message)
        return []
      }
      return (data || []) as NavigationLink[]
    } catch (err) {
      console.warn('getNavigationLinks exception:', err)
      return []
    }
  },

  async getAllNavigationLinks(): Promise<NavigationLink[]> {
    try {
      const { data, error } = await supabase
        .from('navigation_links')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.warn('getAllNavigationLinks error:', error.message)
        return []
      }
      return (data || []) as NavigationLink[]
    } catch (err) {
      console.warn('getAllNavigationLinks exception:', err)
      return []
    }
  },

  async createNavigationLink(link: Omit<NavigationLink, 'id' | 'created_at' | 'updated_at'>): Promise<NavigationLink> {
    const { data, error } = await supabase
      .from('navigation_links')
      .insert(link)
      .select()
      .single()

    if (error) throw error
    return data as NavigationLink
  },

  async updateNavigationLink(id: string, updates: Partial<NavigationLink>): Promise<NavigationLink> {
    const { data, error } = await supabase
      .from('navigation_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as NavigationLink
  },

  async deleteNavigationLink(id: string): Promise<void> {
    const { error } = await supabase
      .from('navigation_links')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async reorderNavigationLinks(orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index
    }))

    for (const update of updates) {
      await supabase
        .from('navigation_links')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
    }
  },

  // ============================================
  // Bulk Site Settings
  // ============================================
  async getAllSiteSettings(): Promise<Record<string, string>> {
    try {
      const result = await withRetry(() =>
        supabase
          .from('site_settings')
          .select('key, value')
      )
      const { data, error } = result as any

      if (error) {
        if (!isAbortError(error)) {
          console.warn('getAllSiteSettings error:', error.message)
        }
        return {}
      }

      const settings: Record<string, string> = {}
      for (const item of (data || [])) {
        settings[item.key] = item.value
      }
      return settings
    } catch (err) {
      if (!isAbortError(err)) {
        console.warn('getAllSiteSettings exception:', err)
      }
      return {}
    }
  },

  async updateMultipleSiteSettings(settings: Record<string, string>): Promise<void> {
    const updates = Object.entries(settings).map(async ([key, value]) => {
      return this.updateSiteSetting(key, value)
    })

    await Promise.all(updates)
  },

  // Features
  async getActiveFeatures() {
    const { data, error } = await supabase
      .from('features')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as Feature[]
  }
}


