// ✅ Server Component - SEO Optimized
import { db } from '@/lib/supabase'
import AboutPageClient from './AboutPageClient'

export const metadata = {
  title: 'Về Chúng Tôi - Khôi Phục Ảnh AI | Bảo Tồn Ký Ức Gia Đình',
  description: 'Khám phá sứ mệnh, tầm nhìn và giá trị cốt lõi của chúng tôi trong việc sử dụng công nghệ AI tiên tiến để khôi phục ảnh cũ, bảo tồn ký ức và kết nối các thế hệ. Đội ngũ chuyên gia tận tâm với từng bức ảnh.',
  keywords: 'về chúng tôi, khôi phục ảnh AI, sứ mệnh, tầm nhìn, giá trị cốt lõi, đội ngũ, công nghệ AI',
  openGraph: {
    title: 'Về Chúng Tôi - Khôi Phục Ảnh AI',
    description: 'Sứ mệnh bảo tồn ký ức, kết nối thế hệ với công nghệ AI tiên tiến',
    type: 'website',
  },
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
