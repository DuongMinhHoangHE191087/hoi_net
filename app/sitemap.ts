import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/company-info'

// Các trang công khai. Bài blog/tính năng động chưa đưa vào đây.
const PUBLIC_ROUTES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/features', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/team', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/donate', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PUBLIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
