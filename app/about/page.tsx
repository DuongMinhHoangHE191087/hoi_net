// ✅ Server Component - SEO Optimized
import type { Metadata } from 'next'
import { getAboutSections, getCompanyContent, getTeamMembers } from '@/lib/supabase/server-utils'
import { COMPANY, SITE_URL } from '@/lib/company-info'
import { COMPANY_EN } from '@/lib/about-content'
import { getRequestLang } from '@/lib/server-lang'
import AboutPageClient from './AboutPageClient'

// Force dynamic rendering - required because we use cookies() for Supabase
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getRequestLang()) === 'en'

  return {
    // layout.tsx có title.template "%s | Hồi Nét" nên không lặp tên thương hiệu ở đây
    title: en
      ? 'About Us — A Non-Profit AI Photo Restoration Project'
      : 'Về Chúng Tôi - Dự Án Phục Chế Ảnh AI Phi Lợi Nhuận',
    description: en
      ? `${COMPANY_EN.shortDescription} Founded in September 2025 as part of ${COMPANY.legalNameEn}.`
      : `${COMPANY.shortDescription} Thành lập ${COMPANY.foundedLabel}, thuộc ${COMPANY.legalName}.`,
    keywords: en
      ? ['about Hoi Net', 'Hoi Net company', 'AI photo restoration', 'non-profit project', 'mission', 'leadership', 'careers', COMPANY.legalNameEn]
      : ['về Hồi Nét', 'công ty Hồi Nét', 'khôi phục ảnh AI', 'dự án phi lợi nhuận', 'sứ mệnh', 'tầm nhìn', 'đội ngũ', COMPANY.legalName],
    alternates: { canonical: `${SITE_URL}/about` },
    openGraph: {
      title: en ? 'About Us — Hoi Net' : 'Về Chúng Tôi - Hồi Nét',
      description: en
        ? 'Preserving memories and connecting generations with AI — a non-profit project of Hoi Net Technology Company Limited.'
        : 'Sứ mệnh bảo tồn ký ức, kết nối các thế hệ bằng công nghệ AI — dự án phi lợi nhuận của Công ty TNHH Công nghệ Hồi Nét.',
      type: 'website',
      url: `${SITE_URL}/about`,
      locale: en ? 'en_US' : 'vi_VN',
    },
  }
}

export default async function AboutPage() {
  // ✅ Fetch data on server - SEO friendly!
  try {
    const [aboutSections, team, content] = await Promise.all([
      getAboutSections(),
      getTeamMembers(),
      getCompanyContent(),
    ])

    return <AboutPageClient aboutSections={aboutSections} team={team} content={content} />
  } catch (error) {
    console.error('Error loading about page data:', error)
    // Fallback to empty data
    return <AboutPageClient aboutSections={[]} team={[]} />
  }
}

