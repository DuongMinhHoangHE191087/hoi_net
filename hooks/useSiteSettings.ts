import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db, FooterLink, NavigationLink } from '@/lib/supabase'

// Query Keys
export const siteSettingsQueryKeys = {
  settings: {
    all: ['site-settings'] as const,
    byKey: (key: string) => ['site-settings', key] as const,
  },
  footerLinks: {
    all: ['footer-links'] as const,
    active: ['footer-links', 'active'] as const,
  },
  navigationLinks: {
    all: ['navigation-links'] as const,
    active: ['navigation-links', 'active'] as const,
  },
}

// Official Hồi Nét logo URL
export const HOINET_LOGO_URL = 'https://res.cloudinary.com/dt6p7wm6i/image/upload/v1769010302/site-branding/logos/jfse7pubnqgqfzfnyemr.png'

// Default fallback values
export const DEFAULT_SITE_SETTINGS: Record<string, string> = {
  brand_name: 'Hồi Nét',
  brand_slogan: 'Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI - Mang lại kỷ niệm tươi đẹp.',
  brand_logo_url: HOINET_LOGO_URL,
  brand_logo_type: 'image',
  site_logo_url: HOINET_LOGO_URL,
  site_name: 'Hồi Nét',
  footer_description: 'Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI - Mang lại kỷ niệm tươi đẹp.',
  footer_copyright: '© 2026 Hồi Nét. Made with ❤️ All rights reserved.',
  contact_email: 'support@hoinet.com',
  contact_phone: '',
  contact_address: '',
  contact_facebook: '',
  social_links: '{}',
  seo_title: 'Hồi Nét - Khôi phục ảnh cũ',
  seo_description: 'Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI',
}

// ============================================
// Site Settings Hooks
// ============================================

export function useSiteSettings() {
  return useQuery({
    queryKey: siteSettingsQueryKeys.settings.all,
    queryFn: async () => {
      const settings = await db.getAllSiteSettings()
      // Merge with defaults to ensure all keys exist
      return { ...DEFAULT_SITE_SETTINGS, ...settings }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
  })
}

export function useSiteSetting(key: string) {
  const { data: settings } = useSiteSettings()
  return settings?.[key] ?? DEFAULT_SITE_SETTINGS[key] ?? ''
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      // Use API route to update settings (bypasses RLS with service key)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ settings })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update settings')
      }

      return settings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.settings.all })
    },
  })
}

// ============================================
// Footer Links Hooks
// ============================================

export function useFooterLinks() {
  return useQuery({
    queryKey: siteSettingsQueryKeys.footerLinks.active,
    queryFn: async () => {
      try {
        return await db.getFooterLinks()
      } catch (err) {
        console.warn('Footer links table not found - run migration 012')
        return []
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false, // Don't retry if table doesn't exist
  })
}

export function useAllFooterLinks() {
  return useQuery({
    queryKey: siteSettingsQueryKeys.footerLinks.all,
    queryFn: async () => {
      try {
        return await db.getAllFooterLinks()
      } catch (err) {
        console.warn('Footer links table not found - run migration 012')
        return []
      }
    },
    retry: false,
  })
}

export function useFooterLinksByColumn() {
  const { data: links = [], ...rest } = useFooterLinks()

  // Group links by column_name
  const grouped = links.reduce((acc, link) => {
    if (!acc[link.column_name]) {
      acc[link.column_name] = {
        title: link.column_title,
        links: [],
      }
    }
    acc[link.column_name].links.push(link)
    return acc
  }, {} as Record<string, { title: string; links: FooterLink[] }>)

  return { data: grouped, ...rest }
}

export function useCreateFooterLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (link: Omit<FooterLink, 'id' | 'created_at' | 'updated_at'>) => {
      return await db.createFooterLink(link)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.footerLinks.all })
    },
  })
}

export function useUpdateFooterLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FooterLink> }) => {
      return await db.updateFooterLink(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.footerLinks.all })
    },
  })
}

export function useDeleteFooterLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await db.deleteFooterLink(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.footerLinks.all })
    },
  })
}

export function useReorderFooterLinks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await db.reorderFooterLinks(orderedIds)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.footerLinks.all })
    },
  })
}

// ============================================
// Navigation Links Hooks
// ============================================

export function useNavigationLinks() {
  return useQuery({
    queryKey: siteSettingsQueryKeys.navigationLinks.active,
    queryFn: async () => {
      try {
        return await db.getNavigationLinks()
      } catch (err) {
        console.warn('Navigation links table not found - run migration 012')
        return []
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useAllNavigationLinks() {
  return useQuery({
    queryKey: siteSettingsQueryKeys.navigationLinks.all,
    queryFn: async () => {
      try {
        return await db.getAllNavigationLinks()
      } catch (err) {
        console.warn('Navigation links table not found - run migration 012')
        return []
      }
    },
    retry: false,
  })
}

export function useCreateNavigationLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (link: Omit<NavigationLink, 'id' | 'created_at' | 'updated_at'>) => {
      return await db.createNavigationLink(link)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.navigationLinks.all })
    },
  })
}

export function useUpdateNavigationLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NavigationLink> }) => {
      return await db.updateNavigationLink(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.navigationLinks.all })
    },
  })
}

export function useDeleteNavigationLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await db.deleteNavigationLink(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.navigationLinks.all })
    },
  })
}

export function useReorderNavigationLinks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await db.reorderNavigationLinks(orderedIds)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.navigationLinks.all })
    },
  })
}

