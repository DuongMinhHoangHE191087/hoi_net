// ✅ Server Component - SEO Optimized
import { getAboutSections, getTeamMembers } from '@/lib/supabase/server-utils'
import AboutPageClient from './AboutPageClient'

// Force dynamic rendering - required because we use cookies() for Supabase
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Hồi Nét - Chuyên Gia Phục Chế Ảnh AI | Bảo Tồn Di Sản Gia Đình',
  description: 'Khám phá sứ mệnh và công nghệ AI tiên phong của Hồi Nét trong việc phục chế ảnh cũ hư hỏng nặng, bảo tồn di sản gia đình Việt và kết nối các thế hệ.',
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
      getAboutSections(),
      getTeamMembers()
    ])

    return <AboutPageClient aboutSections={aboutSections} team={team} />
  } catch (error) {
    console.error('Error loading about page data:', error)
    // Fallback to empty data
    return <AboutPageClient aboutSections={[]} team={[]} />
  }
}

