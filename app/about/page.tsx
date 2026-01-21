// ✅ Server Component - SEO Optimized
import { db } from '@/lib/supabase'
import AboutPageClient from './AboutPageClient'

export const metadata = {
  title: 'Về Chúng Tôi - Photo Restore AI',
  description: 'Khám phá câu chuyện, sứ mệnh và tầm nhìn của chúng tôi trong việc mang đến công nghệ khôi phục ảnh AI tốt nhất',
}

export default async function AboutPage() {
  // ✅ Fetch data on server - SEO friendly!
  try {
    const [aboutSections, team] = await Promise.all([
      db.getAboutSections(),
      db.getTeamMembers()
    ])

    return <AboutPageClient aboutSections={aboutSections} team={team} />
  } catch (error) {
    console.error('Error loading about page data:', error)
    // Fallback to empty data
    return <AboutPageClient aboutSections={[]} team={[]} />
  }
}
