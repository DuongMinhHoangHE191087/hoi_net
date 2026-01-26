/**
 * Site Metadata Utilities
 * Helper functions to get site settings for metadata
 */

import { getAllSiteSettings } from './supabase/server-utils'

// Cache for brand name to avoid repeated database calls
let cachedBrandName: string | null = null
let cacheTime: number = 0
const CACHE_TTL = 60 * 1000 // 1 minute

/**
 * Get the brand name from site settings with caching
 */
export async function getBrandName(): Promise<string> {
  const now = Date.now()
  
  // Return cached value if still valid
  if (cachedBrandName && now - cacheTime < CACHE_TTL) {
    return cachedBrandName
  }

  try {
    const settings = await getAllSiteSettings()
    cachedBrandName = settings['brand_name'] || 'Hồi Nét'
    cacheTime = now
    return cachedBrandName
  } catch (error) {
    console.error('Error fetching brand name:', error)
    return 'Hồi Nét'
  }
}

/**
 * Get site metadata settings
 */
export async function getSiteMetadata() {
  try {
    const settings = await getAllSiteSettings()
    return {
      brandName: settings['brand_name'] || 'Hồi Nét',
      description: settings['site_description'] || 'Khôi phục ảnh cũ bằng AI',
      about: settings['about'] || '',
    }
  } catch (error) {
    console.error('Error fetching site metadata:', error)
    return {
      brandName: 'Hồi Nét',
      description: 'Khôi phục ảnh cũ bằng AI',
      about: '',
    }
  }
}

