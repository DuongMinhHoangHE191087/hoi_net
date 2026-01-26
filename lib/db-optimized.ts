/**
 * Optimized Database Operations
 * Provides cached and batch database operations for improved performance
 */

import { supabase, FooterLink, NavigationLink, SiteSetting } from './supabase'
import { settingsCache, dbCache, cacheKeys, invalidateSiteCache } from './lru-cache'

// ============================================
// Cached Site Settings Operations
// ============================================

/**
 * Get all site settings with caching
 */
export async function getCachedSiteSettings(): Promise<Record<string, string>> {
  const cacheKey = cacheKeys.siteSettings()

  return settingsCache.getOrSet(cacheKey, async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error) {
      console.warn('getCachedSiteSettings error:', error.message)
      return {}
    }

    const settings: Record<string, string> = {}
    for (const item of (data || [])) {
      try {
        // Parse JSON values
        settings[item.key] = JSON.parse(item.value)
      } catch {
        settings[item.key] = item.value
      }
    }
    return settings
  }, 15 * 60 * 1000) // 15 minutes TTL
}

/**
 * Get single site setting with caching
 */
export async function getCachedSiteSetting(key: string): Promise<string | null> {
  const settings = await getCachedSiteSettings()
  return settings[key] ?? null
}

/**
 * Update site setting and invalidate cache
 */
export async function updateSiteSettingCached(
  key: string,
  value: string
): Promise<void> {
  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .eq('key', key)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('site_settings')
      .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
      .eq('key', key)
  } else {
    await supabase
      .from('site_settings')
      .insert({ key, value: JSON.stringify(value) })
  }

  // Invalidate cache
  invalidateSiteCache()
}

/**
 * Batch update multiple site settings
 */
export async function batchUpdateSiteSettings(
  settings: Record<string, string>
): Promise<void> {
  const entries = Object.entries(settings)

  // Use upsert for efficiency
  const upsertData = entries.map(([key, value]) => ({
    key,
    value: JSON.stringify(value),
    updated_at: new Date().toISOString()
  }))

  // Supabase doesn't support upsert on non-primary key
  // So we need to do individual updates or use a transaction
  await Promise.all(
    entries.map(([key, value]) => updateSiteSettingCached(key, value))
  )
}

// ============================================
// Cached Footer Links Operations
// ============================================

/**
 * Get footer links with caching
 */
export async function getCachedFooterLinks(): Promise<FooterLink[]> {
  const cacheKey = cacheKeys.footerLinks()

  return settingsCache.getOrSet(cacheKey, async () => {
    const { data, error } = await supabase
      .from('footer_links')
      .select('*')
      .eq('is_active', true)
      .order('column_name')
      .order('display_order', { ascending: true })

    if (error) {
      console.warn('getCachedFooterLinks error:', error.message)
      return []
    }
    return (data || []) as FooterLink[]
  }, 15 * 60 * 1000) // 15 minutes TTL
}

// ============================================
// Cached Navigation Links Operations
// ============================================

/**
 * Get navigation links with caching
 */
export async function getCachedNavigationLinks(): Promise<NavigationLink[]> {
  const cacheKey = cacheKeys.navLinks()

  return settingsCache.getOrSet(cacheKey, async () => {
    const { data, error } = await supabase
      .from('navigation_links')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.warn('getCachedNavigationLinks error:', error.message)
      return []
    }
    return (data || []) as NavigationLink[]
  }, 15 * 60 * 1000) // 15 minutes TTL
}

// ============================================
// Batch Reorder Operations (Optimized)
// ============================================

/**
 * Batch reorder footer links using single query
 */
export async function batchReorderFooterLinks(orderedIds: string[]): Promise<void> {
  // Use CASE WHEN for batch update in single query
  const caseStatement = orderedIds
    .map((id, index) => `WHEN id = '${id}' THEN ${index}`)
    .join(' ')

  const { error } = await supabase.rpc('batch_update_display_order', {
    p_table: 'footer_links',
    p_ids: orderedIds,
    p_orders: orderedIds.map((_, i) => i)
  }).catch(async () => {
    // Fallback to individual updates if RPC doesn't exist
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from('footer_links')
          .update({ display_order: index })
          .eq('id', id)
      )
    )
    return { error: null }
  })

  if (error) {
    console.error('batchReorderFooterLinks error:', error)
  }

  // Invalidate cache
  invalidateSiteCache()
}

/**
 * Batch reorder navigation links using parallel updates
 */
export async function batchReorderNavigationLinks(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('navigation_links')
        .update({ display_order: index })
        .eq('id', id)
    )
  )

  // Invalidate cache
  invalidateSiteCache()
}

// ============================================
// Blog Posts with Caching
// ============================================

/**
 * Get blog posts with caching
 */
export async function getCachedBlogPosts(publishedOnly: boolean = true) {
  const cacheKey = cacheKeys.blogPosts(publishedOnly)

  return dbCache.getOrSet(cacheKey, async () => {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (publishedOnly) {
      query = query.eq('published', true)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }, 5 * 60 * 1000) // 5 minutes TTL
}

/**
 * Get single blog post with caching
 */
export async function getCachedBlogPost(slug: string) {
  const cacheKey = cacheKeys.blogPost(slug)

  return dbCache.getOrSet(cacheKey, async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  }, 5 * 60 * 1000) // 5 minutes TTL
}

// ============================================
// Parallel Query Helper
// ============================================

/**
 * Execute multiple database queries in parallel
 */
export async function parallelQueries<T extends Record<string, Promise<any>>>(
  queries: T
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const keys = Object.keys(queries) as (keyof T)[]
  const promises = Object.values(queries)

  const results = await Promise.all(
    promises.map(p => p.catch(error => ({ error })))
  )

  const output: any = {}
  keys.forEach((key, index) => {
    output[key] = results[index]
  })

  return output
}

// ============================================
// Exports
// ============================================

export const dbOptimized = {
  // Site Settings
  getSiteSettings: getCachedSiteSettings,
  getSiteSetting: getCachedSiteSetting,
  updateSiteSetting: updateSiteSettingCached,
  batchUpdateSiteSettings,

  // Footer Links
  getFooterLinks: getCachedFooterLinks,
  reorderFooterLinks: batchReorderFooterLinks,

  // Navigation Links
  getNavigationLinks: getCachedNavigationLinks,
  reorderNavigationLinks: batchReorderNavigationLinks,

  // Blog Posts
  getBlogPosts: getCachedBlogPosts,
  getBlogPost: getCachedBlogPost,

  // Utilities
  parallelQueries,
  invalidateCache: invalidateSiteCache,
}

export default dbOptimized

