// ✅ Server Component - fetches data server-side with Redis caching
import { 
  getTeamMembersWithCache,
  getValueSectionsWithCache,
  getTestimonialsWithCache,
  getSiteSettingsWithCache,
  getFeaturesWithCache,
} from '@/lib/homepage-cache'
import { getBrandName } from '@/lib/site-metadata'
import LandingPageClient from './LandingPageClient'
import { Metadata } from 'next'

// Force dynamic rendering - required because we use cookies() for Supabase auth
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const brandName = await getBrandName()
  return {
    title: `${brandName} - Khôi Phục Ảnh Cũ Bằng AI`,
    description: 'Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động. Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp.',
  }
}

export default async function LandingPage() {
  // ✅ Fetch data on server with Redis cache - NO loading spinner needed
  // Data is included in initial HTML, cached for 24 hours
  try {
    const [team, valueSections, features, testimonials, siteSettings] = await Promise.all([
      getTeamMembersWithCache(),
      getValueSectionsWithCache(),
      getFeaturesWithCache(),
      getTestimonialsWithCache(6),
      getSiteSettingsWithCache(),
    ])

    // Pass data to Client Component
    return <LandingPageClient
      team={team}
      valueSections={valueSections}
      features={features}
      testimonials={testimonials}
      siteSettings={siteSettings}
    />
  } catch (error) {
    console.error('Error loading data:', error)
    // Fallback to empty data if database tables don't exist
    return <LandingPageClient
      team={[]}
      valueSections={[]}
      features={[]}
      testimonials={[]}
      siteSettings={{}}
    />
  }
}

