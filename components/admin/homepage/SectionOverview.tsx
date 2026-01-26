'use client'

import { useState, useEffect } from 'react'
import { 
  Target, Eye, Heart, Users, Zap, MessageSquare, 
  ExternalLink, Loader2, RefreshCw, ArrowRight
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface SectionStats {
  values: number
  features: number
  team: number
  testimonials: number
}

interface SectionOverviewProps {
  onNavigateToTab: (tabId: string) => void
}

export default function SectionOverview({ onNavigateToTab }: SectionOverviewProps) {
  const [stats, setStats] = useState<SectionStats>({
    values: 0,
    features: 0,
    team: 0,
    testimonials: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Get auth token
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const authHeaders: Record<string, string> = session?.access_token 
        ? { 'Authorization': `Bearer ${session.access_token}` } 
        : {}
      
      // Fetch counts from different endpoints
      const [valuesRes, featuresRes, teamRes, testimonialsRes] = await Promise.all([
        fetch('/api/admin/values', { headers: authHeaders }).then(r => r.json()).catch(() => ({ valueSections: [] })),
        fetch('/api/admin/features', { headers: authHeaders }).then(r => r.json()).catch(() => ({ features: [] })),
        fetch('/api/admin/team-members', { headers: authHeaders }).then(r => r.json()).catch(() => ({ teamMembers: [] })),
        fetch('/api/admin/feedback', { headers: authHeaders }).then(r => r.json()).catch(() => ({ feedback: [] }))
      ])

      setStats({
        values: valuesRes.valueSections?.length || 0,
        features: featuresRes.features?.length || 0,
        team: teamRes.teamMembers?.length || 0,
        testimonials: testimonialsRes.feedback?.filter((f: any) => f.is_testimonial)?.length || testimonialsRes.feedback?.length || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    {
      id: 'values',
      title: 'Giá Trị Cốt Lõi',
      description: 'Sứ mệnh, Tầm nhìn, Giá trị',
      icon: Target,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      count: stats.values,
      tabId: 'values'
    },
    {
      id: 'features',
      title: 'Tính Năng',
      description: 'Các tính năng nổi bật của dịch vụ',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      count: stats.features,
      tabId: 'features'
    },
    {
      id: 'team',
      title: 'Đội Ngũ',
      description: 'Thành viên trong team',
      icon: Users,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      count: stats.team,
      tabId: 'team'
    },
    {
      id: 'testimonials',
      title: 'Đánh Giá',
      description: 'Phản hồi từ khách hàng',
      icon: MessageSquare,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      count: stats.testimonials,
      tabId: 'testimonials'
    }
  ]

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-text">Tổng Quan Các Section</h3>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý nội dung các phần trên trang chủ
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadStats}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 border border-gray-100 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div
                key={section.id}
                className="group p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${section.bgColor}`}>
                    <Icon className={`w-6 h-6 ${section.textColor}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text group-hover:text-primary transition-colors">
                      {section.title}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {section.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${section.bgColor} ${section.textColor}`}>
                        {section.count} item{section.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => onNavigateToTab(section.tabId)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    Chỉnh sửa
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Mẹo nhanh
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Nhấn "Chỉnh sửa" để quản lý chi tiết từng section</li>
          <li>• Sử dụng tab "Hiển thị & Thứ tự" để bật/tắt và sắp xếp các section</li>
          <li>• Preview trang chủ để xem kết quả trước khi publish</li>
        </ul>
      </div>
    </Card>
  )
}

