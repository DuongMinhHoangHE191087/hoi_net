'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Twitter, Linkedin, Github, Mail } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { db, TeamMember } from '@/lib/supabase'

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeam()
  }, [])

  const loadTeam = async () => {
    try {
      const data = await db.getTeamMembers()
      setTeam(data)
    } catch (error) {
      console.error('Error loading team:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return Twitter
      case 'linkedin':
        return Linkedin
      case 'github':
        return Github
      default:
        return Mail
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-text mb-6">Đội Ngũ Của Chúng Tôi</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gặp gỡ những con người tài năng đang xây dựng công nghệ khôi phục ảnh AI tiên tiến
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : team.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Đang cập nhật
                </h3>
                <p className="text-gray-500">
                  Thông tin đội ngũ sẽ được cập nhật sớm
                </p>
              </div>
            </Card>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {team.map((member) => (
                <motion.div
                  key={member.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Card hover className="text-center">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-primary/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-text mb-2">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-4">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-gray-600 mb-6">
                        {member.bio}
                      </p>
                    )}

                    {member.social_links && (
                      <div className="flex justify-center gap-4">
                        {Object.entries(member.social_links).map(([platform, url]) => {
                          if (!url) return null
                          const Icon = getSocialIcon(platform)
                          return (
                            <a
                              key={platform}
                              href={url as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-primary transition cursor-pointer"
                            >
                              <Icon className="w-5 h-5" />
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
