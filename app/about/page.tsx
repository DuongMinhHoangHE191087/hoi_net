// ✅ Server Component - SEO Optimized
import type { Metadata } from 'next'
import { getAboutSections, getTeamMembers } from '@/lib/supabase/server-utils'
import { COMPANY, SITE_URL } from '@/lib/company-info'
import AboutPageClient from './AboutPageClient'

// Force dynamic rendering - required because we use cookies() for Supabase
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  // layout.tsx có title.template "%s | Hồi Nét" nên không lặp tên thương hiệu ở đây
  title: 'Về Chúng Tôi - Dự Án Phục Chế Ảnh AI Phi Lợi Nhuận',
  description: `${COMPANY.shortDescription} Thành lập ${COMPANY.foundedLabel}, thuộc ${COMPANY.legalName}.`,
  keywords: [
    'về Hồi Nét',
    'công ty Hồi Nét',
    'khôi phục ảnh AI',
    'dự án phi lợi nhuận',
    'sứ mệnh',
    'tầm nhìn',
    'đội ngũ',
    COMPANY.legalName,
  ],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'Về Chúng Tôi - Hồi Nét',
    description: 'Sứ mệnh bảo tồn ký ức, kết nối các thế hệ bằng công nghệ AI — dự án phi lợi nhuận của Công ty TNHH Công nghệ Hồi Nét.',
    type: 'website',
    url: `${SITE_URL}/about`,
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

