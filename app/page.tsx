// ✅ Server Component - fetches data server-side
import { db } from '@/lib/supabase'
import LandingPageClient from './LandingPageClient'

export const metadata = {
  title: 'Photo Restore - Khôi Phục Ảnh Cũ Bằng AI',
  description: 'Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động. Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp.',
}

export default async function LandingPage() {
  // ✅ Fetch data on server - NO loading spinner needed
  // Data is included in initial HTML
  try {
    const [team, valueSections, features, feedback] = await Promise.all([
      db.getTeamMembers(),
      db.getValueSections(),
      db.getActiveFeatures(),
      db.getFeedback()
    ])

    // Filter feedback for testimonials - only show 'read' status feedback with name and message
    const testimonials = feedback
      .filter((item) => item.name && item.message && item.status === 'read')
      .slice(0, 6) // Limit to 6 testimonials

    // Pass data to Client Component
    return <LandingPageClient team={team} valueSections={valueSections} features={features} testimonials={testimonials} />
  } catch (error) {
    console.error('Error loading data:', error)
    // Fallback to empty data if database tables don't exist
    return <LandingPageClient team={[]} valueSections={[]} features={[]} testimonials={[]} />
  }
}
