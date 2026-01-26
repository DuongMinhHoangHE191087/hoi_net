// ✅ Server Component - fetches data server-side
import { 
  getTeamMembers, 
  getValueSections, 
  getTestimonials, 
  getAllSiteSettings,
  getServices as getActiveFeatures
} from '@/lib/supabase/server-utils'
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
  // ✅ Fetch data on server - NO loading spinner needed
  // Data is included in initial HTML
  try {
    const [team, valueSections, features, testimonials, siteSettings] = await Promise.all([
      getTeamMembers(),
      getValueSections(),
      getActiveFeatures(),
      getTestimonials(6), // Get up to 6 testimonials that are marked for homepage display
      getAllSiteSettings() // Get all site settings including CTA content
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

