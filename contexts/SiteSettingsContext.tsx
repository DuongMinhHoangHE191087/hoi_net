'use client'

import React, { createContext, useContext, ReactNode, useMemo } from 'react'
import { useSiteSettings, useFooterLinksByColumn, DEFAULT_SITE_SETTINGS } from '@/hooks/useSiteSettings'
import { FooterLink } from '@/lib/supabase'

interface SiteSettingsContextValue {
  // Settings
  settings: Record<string, string>
  isLoading: boolean
  error: Error | null

  // Helper getters - Legacy
  brandName: string
  brandSlogan: string
  brandLogoUrl: string
  brandLogoType: 'icon' | 'image'
  footerDescription: string
  footerCopyright: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  contactFacebook: string
  socialLinks: Record<string, string>
  seoTitle: string
  seoDescription: string

  // New Site Branding getters
  siteName: string
  siteTagline: string
  siteLogoUrl: string
  siteLogoDarkUrl: string
  siteFaviconUrl: string
  siteMetaTitle: string
  siteMetaDescription: string
  siteMetaKeywords: string
  siteOgImage: string
  themePrimaryColor: string
  themeSecondaryColor: string
  googleAnalyticsId: string
  googleTagManagerId: string
  maintenanceMode: boolean
  announcementBarEnabled: boolean
  announcementBarText: string
  announcementBarColor: string

  // Footer links grouped by column
  footerColumns: Record<string, { title: string; links: FooterLink[] }>
  footerLinksLoading: boolean
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings = DEFAULT_SITE_SETTINGS, isLoading, error } = useSiteSettings()
  const { data: footerColumns = {}, isLoading: footerLinksLoading } = useFooterLinksByColumn()

  // Memoize social links parsing to avoid re-parsing on every render
  const socialLinks = useMemo(() => {
    try {
      return JSON.parse(settings.social_links || '{}')
    } catch {
      return {}
    }
  }, [settings.social_links])

  // Memoize the entire context value to prevent unnecessary re-renders
  const value = useMemo<SiteSettingsContextValue>(() => ({
    settings,
    isLoading,
    error: error as Error | null,

    // Legacy helper getters with fallbacks
    brandName: settings.brand_name || DEFAULT_SITE_SETTINGS.brand_name,
    brandSlogan: settings.brand_slogan || DEFAULT_SITE_SETTINGS.brand_slogan,
    brandLogoUrl: settings.brand_logo_url || '',
    brandLogoType: (settings.brand_logo_type as 'icon' | 'image') || 'icon',
    footerDescription: settings.footer_description || DEFAULT_SITE_SETTINGS.footer_description,
    footerCopyright: settings.footer_copyright || DEFAULT_SITE_SETTINGS.footer_copyright,
    contactEmail: settings.contact_email || DEFAULT_SITE_SETTINGS.contact_email,
    contactPhone: settings.contact_phone || '',
    contactAddress: settings.contact_address || '',
    contactFacebook: settings.contact_facebook || '',
    socialLinks,
    seoTitle: settings.seo_title || DEFAULT_SITE_SETTINGS.seo_title,
    seoDescription: settings.seo_description || DEFAULT_SITE_SETTINGS.seo_description,

    // New Site Branding getters
    siteName: settings.site_name || 'Photo Restore',
    siteTagline: settings.site_tagline || 'Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI',
    siteLogoUrl: settings.site_logo_url || '',
    siteLogoDarkUrl: settings.site_logo_dark_url || '',
    siteFaviconUrl: settings.site_favicon_url || '',
    siteMetaTitle: settings.site_meta_title || 'Photo Restoration App',
    siteMetaDescription: settings.site_meta_description || 'Khôi phục ảnh bằng AI',
    siteMetaKeywords: settings.site_meta_keywords || '',
    siteOgImage: settings.site_og_image || '',
    themePrimaryColor: settings.theme_primary_color || '#ec4899',
    themeSecondaryColor: settings.theme_secondary_color || '#f59e0b',
    googleAnalyticsId: settings.google_analytics_id || '',
    googleTagManagerId: settings.google_tag_manager_id || '',
    maintenanceMode: settings.maintenance_mode === 'true',
    announcementBarEnabled: settings.announcement_bar_enabled === 'true',
    announcementBarText: settings.announcement_bar_text || '',
    announcementBarColor: settings.announcement_bar_color || 'blue',

    footerColumns,
    footerLinksLoading,
  }), [settings, isLoading, error, socialLinks, footerColumns, footerLinksLoading])

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettingsContext() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettingsContext must be used within a SiteSettingsProvider')
  }
  return context
}

// Optional hook that won't throw if used outside provider
export function useSiteSettingsOptional() {
  return useContext(SiteSettingsContext)
}
