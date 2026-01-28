// ✅ Server Component - fetches data server-side with Redis caching
import { getHomepageDataWithCache } from '@/lib/homepage-cache'
import { getBrandName } from '@/lib/site-metadata'
import LandingPageClient from './LandingPageClient'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const brandName = await getBrandName()
  return {
    title: `${brandName} - Khôi Phục Ảnh Cũ Bằng AI`,
    description: 'Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động. Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp.',
  }
}

export default async function LandingPage() {
  // ✅ Fetch data with Redis caching - faster load, no spinner
  // Fallback to database if Redis unavailable
  try {
    const { team, valueSections, features, testimonials, siteSettings } = 
      await getHomepageDataWithCache()

    return <LandingPageClient
      team={team}
      valueSections={valueSections}
      features={features}
      testimonials={testimonials}
      siteSettings={siteSettings}
    />
  } catch (error) {
    console.error('Error loading homepage data:', error)
    // Fallback to empty data
    return <LandingPageClient
      team={[]}
      valueSections={[]}
      features={[]}
      testimonials={[]}
      siteSettings={{}}
    />
  }
}

