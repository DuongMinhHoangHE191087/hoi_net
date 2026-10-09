'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AboutSections from '@/components/sections/AboutSections'
import TeamCarousel3D from '@/components/sections/TeamCarousel3D'
import { useAboutLang } from '@/components/sections/AboutLang'
import AboutHero from '@/components/sections/AboutHero'
import CompanyOverview from '@/components/sections/CompanyOverview'
import CoreValues from '@/components/sections/CoreValues'
import CompanyStats from '@/components/sections/CompanyStats'
import GrowthChart from '@/components/sections/GrowthChart'
import Achievements from '@/components/sections/Achievements'
import Expertise from '@/components/sections/Expertise'
import CompanyTimeline from '@/components/sections/CompanyTimeline'
import Roadmap2030 from '@/components/sections/Roadmap2030'
import Leadership from '@/components/sections/Leadership'
import CompanyProfileTable from '@/components/sections/CompanyProfileTable'
import AboutCTA from '@/components/sections/AboutCTA'
import type { CompanyContent, L } from '@/lib/about-content'
import OurStory from '@/components/sections/OurStory'
import AboutNav from '@/components/sections/AboutNav'
import ServicesGrid from '@/components/sections/ServicesGrid'
import HowItWorks from '@/components/sections/HowItWorks'
import Ecosystem from '@/components/sections/Ecosystem'
import TrustGovernance from '@/components/sections/TrustGovernance'
import ImpactSection from '@/components/sections/ImpactSection'
import PartnersSection from '@/components/sections/PartnersSection'
import Newsroom from '@/components/sections/Newsroom'
import CareersSection from '@/components/sections/CareersSection'
import AboutFAQ from '@/components/sections/AboutFAQ'
import { AboutSection, TeamMember } from '@/lib/supabase'

interface AboutPageClientProps {
  aboutSections: AboutSection[]
  team: TeamMember[]
  /** Nội dung từ bảng company_* (migration 041); thiếu thì dùng bản hardcode */
  content?: CompanyContent
}

const TEAM_TITLE: L = { vi: 'Đội Ngũ Của Chúng Tôi', en: 'Our Team' }
const TEAM_SUB: L = {
  vi: 'Những con người tài năng và tận tâm, cùng nhau tạo nên sự khác biệt',
  en: 'Talented, dedicated people who together make the difference',
}

function TeamHeading() {
  const { t } = useAboutLang()
  return (
    <>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
        <span className="gradient-text-alt">{t(TEAM_TITLE)}</span>
      </h2>
      <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">{t(TEAM_SUB)}</p>
    </>
  )
}

export default function AboutPageClient({ aboutSections, team, content = {} }: AboutPageClientProps) {
  const { lang } = useAboutLang()
  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      {/* ✅ Pure CSS Animated background - NO Framer Motion */}
      <style jsx>{`
        @keyframes pulse-about-1 {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }
        @keyframes pulse-about-2 {
          0%, 100% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
        .pulse-bg-1 {
          animation: pulse-about-1 8s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .pulse-bg-2 {
          animation: pulse-about-2 10s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pulse-bg-1 absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="pulse-bg-2 absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Nội dung song ngữ VI/EN: lib/about-content.ts — thông tin công ty: lib/company-info.ts */}
      <AboutHero />
      <AboutNav />
      <CompanyOverview />
      <OurStory />
      <ServicesGrid />
      <HowItWorks />
      <Ecosystem />
      <CoreValues />
      <CompanyStats stats={content.stats} />
      <GrowthChart />

      {/* Khối About do admin nhập trong DB chỉ có tiếng Việt → chỉ hiện ở bản VI.
          Bản EN đã có sứ mệnh/tầm nhìn/giá trị bằng tiếng Anh ở các section phía trên. */}
      {lang === 'vi' && <AboutSections sections={aboutSections} />}

      <Achievements achievements={content.achievements} />
      <Expertise />
      <TrustGovernance />
      <ImpactSection />
      <CompanyTimeline milestones={content.milestones} />
      <Roadmap2030 />
      <Leadership leaders={content.leaders} />

      {/* Team Section — ẩn khi chưa có thành viên active trong DB, tránh tiêu đề trống */}
      {team.length > 0 && (
        <section className="py-20 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <TeamHeading />
            </div>

            <TeamCarousel3D
              team={team}
              variant="compact"
              showBackground={false}
            />
          </div>
        </section>
      )}

      <PartnersSection />
      <Newsroom />
      <CareersSection />
      <AboutFAQ />
      <CompanyProfileTable />
      <AboutCTA />

      <Footer />
    </div>
  )
}

