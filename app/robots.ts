import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/company-info'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Khu vực riêng tư / cần đăng nhập — không nên xuất hiện trên kết quả tìm kiếm
        disallow: [
          '/api/',
          '/admin',
          '/dashboard',
          '/profile',
          '/requests',
          '/settings',
          '/notifications',
          '/studio',
          '/auth/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/onboarding',
          '/unauthorized',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
