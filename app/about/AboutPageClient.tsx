'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AboutSections from '@/components/sections/AboutSections'
import TeamCarousel3D from '@/components/sections/TeamCarousel3D'
import { AboutSection, TeamMember } from '@/lib/supabase'

interface AboutPageClientProps {
  aboutSections: AboutSection[]
  team: TeamMember[]
}

export default function AboutPageClient({ aboutSections, team }: AboutPageClientProps) {
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

      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="fade-in-up text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text-alt">Về Chúng Tôi</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Khám phá câu chuyện, sứ mệnh và tầm nhìn của chúng tôi trong việc<br className="hidden sm:block" />
              <strong className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                bảo tồn ký ức và kết nối các thế hệ
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* About Sections - Dynamic from admin */}
      <AboutSections sections={aboutSections} />

      {/* Team Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text-alt">Đội Ngũ Của Chúng Tôi</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
              Những con người tài năng và tận tâm,<br className="hidden sm:block" />
              cùng nhau tạo nên sự khác biệt
            </p>
          </div>

          <TeamCarousel3D
            team={team}
            variant="compact"
            showBackground={false}
          />
        </div>
      </section>

      <Footer />
    </div>
  )
}
