'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  User, Settings, FileText, Image as ImageIcon, Calendar,
  TrendingUp, CheckCircle, Clock, XCircle, ArrowRight,
  Mail, Phone, MapPin, Sparkles, Shield, ArrowLeft, AlertCircle, Eye
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { useSiteSetting } from '@/hooks/useSiteSettings'
import { SafeAvatar } from '@/components/ui/SafeImage'
import { FullScreenLoading } from '@/components/UniversalLoading'
import BrandLogo from '@/components/ui/BrandLogo'
import { formatRelativeTime } from '@/lib/date-utils'

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  rejectedRequests: number
}

interface RecentRequest {
  id: string
  type: string
  status: string
  description: string
  original_images: string[]
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: 'Chờ Xử Lý', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
  processing: { label: 'Đang Xử Lý', color: 'text-blue-600', bg: 'bg-blue-50', icon: Sparkles },
  completed: { label: 'Hoàn Thành', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  rejected: { label: 'Từ Chối', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const brandName = useSiteSetting('brand_name')
  const supabase = useMemo(() => createClient(), [])

  const [profile, setProfile] = useState<{
    full_name?: string
    phone?: string
    address?: string
    facebook_url?: string
    avatar_url?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    rejectedRequests: 0,
  })

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') throw profileError
      setProfile(profileData)

      const { data: requestsData, error: requestsError } = await supabase
        .from('user_requests')
        .select('id, type, status, description, original_images, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (requestsError) {
        console.error('Error loading requests:', requestsError)
      } else if (requestsData) {
        setRecentRequests(requestsData.slice(0, 5) as RecentRequest[])
        setStats({
          totalRequests: requestsData.length,
          pendingRequests: requestsData.filter((r: { status: string }) => r.status === 'pending').length,
          completedRequests: requestsData.filter((r: { status: string }) => r.status === 'completed').length,
          rejectedRequests: requestsData.filter((r: { status: string }) => r.status === 'rejected').length,
        })
      }
    } catch (err: unknown) {
      console.error('Error loading dashboard:', err)
      setError('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  // Realtime subscription for request updates
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('dashboard-requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_requests',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        loadDashboardData()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, supabase, loadDashboardData])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard')
      return
    }
    if (user) loadDashboardData()
  }, [user, authLoading, router, loadDashboardData])

  const getUserInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return user?.email?.[0].toUpperCase() || 'U'
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })

  if (authLoading || loading) return <FullScreenLoading message="Đang tải dashboard..." />

  if (error) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={loadDashboardData} className="btn-primary w-full">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <motion.button className="p-2 hover:bg-white/50 rounded-lg transition-colors" whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }} title="Quay về trang chủ">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
            </Link>
            <div className="flex-1">
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Xin chào, {profile?.full_name || user?.email?.split('@')[0] || 'Người dùng'}! 👋
              </h1>
              <p className="text-gray-600">Chào mừng bạn quay trở lại với {brandName}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
            <div className="glassmorphism-strong p-6 sticky top-24">
              <div className="flex flex-col items-center mb-6">
                <div className="shadow-glow-pink mb-4 rounded-full overflow-hidden">
                  <SafeAvatar src={profile?.avatar_url} alt={profile?.full_name || 'User'} size="xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{profile?.full_name || 'Chưa cập nhật'}</h2>
                <p className="text-sm text-gray-600 mb-3">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-primary text-white text-xs font-semibold rounded-full shadow-glow-pink">
                    <Shield className="w-3 h-3" /> Administrator
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {profile?.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" /><span>{profile.phone}</span>
                  </div>
                )}
                {profile?.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><span>{profile.address}</span>
                  </div>
                )}
                {profile?.facebook_url && (
                  <div className="flex items-center gap-3 text-sm">
                    <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-200">
                  <Calendar className="w-4 h-4" /><span>Tham gia: {user?.created_at ? formatDate(user.created_at) : 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link href="/profile" className="block">
                  <motion.button className="btn-glass-primary w-full py-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <span className="flex items-center justify-center gap-2"><Settings className="w-4 h-4" /> Chỉnh Sửa Hồ Sơ</span>
                  </motion.button>
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="block">
                    <motion.button className="btn-glass-secondary w-full py-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <span className="flex items-center justify-center gap-2"><Shield className="w-4 h-4" /> Admin Panel</span>
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: FileText, value: stats.totalRequests, label: 'Tổng Yêu Cầu', color: 'text-primary' },
                { icon: Clock, value: stats.pendingRequests, label: 'Đang Xử Lý', color: 'text-yellow-500' },
                { icon: CheckCircle, value: stats.completedRequests, label: 'Hoàn Thành', color: 'text-green-500' },
                { icon: XCircle, value: stats.rejectedRequests, label: 'Từ Chối', color: 'text-red-500' },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="glassmorphism-strong p-4">
                  <Icon className={`w-8 h-8 ${color} mb-2`} />
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  <p className="text-xs text-gray-600">{label}</p>
                </div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glassmorphism-strong p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Thao Tác Nhanh</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/requests/new">
                  <motion.div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl hover:shadow-lg transition-shadow cursor-pointer group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <ImageIcon className="w-8 h-8 text-primary mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-1">Gửi Yêu Cầu Mới</h4>
                        <p className="text-sm text-gray-600">Phục hồi ảnh cũ bằng AI</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
                <Link href="/requests">
                  <motion.div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:shadow-lg transition-shadow cursor-pointer group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <FileText className="w-8 h-8 text-blue-600 mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-1">Xem Yêu Cầu</h4>
                        <p className="text-sm text-gray-600">Theo dõi tiến độ</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* Recent Activity Feed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glassmorphism-strong p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Hoạt Động Gần Đây</h3>
                {recentRequests.length > 0 && (
                  <Link href="/requests" className="text-sm text-primary hover:underline flex items-center gap-1">
                    Xem tất cả <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {recentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <BrandLogo className="w-16 h-16 object-contain mx-auto mb-4 opacity-40" />
                  <p className="text-gray-600 mb-4">Bạn chưa có yêu cầu nào</p>
                  <Link href="/requests/new">
                    <motion.button className="btn-glass-primary px-6 py-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Tạo Yêu Cầu Đầu Tiên</span>
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((req, index) => {
                    const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
                    const StatusIcon = statusCfg.icon
                    return (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Link href={`/requests/${req.id}`}>
                          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/80 transition-colors group cursor-pointer">
                            {/* Thumbnail */}
                            <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                              {req.original_images?.[0] ? (
                                <img src={req.original_images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-300" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {req.type === 'restore' ? 'Phục Hồi Ảnh Cũ' : 'Ảnh Gia Đình'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{req.description}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(req.created_at)}</p>
                            </div>

                            {/* Status Badge */}
                            <div className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
                            </div>

                            {/* Arrow */}
                            <Eye className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Help */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glassmorphism-strong p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Hỗ Trợ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { href: '/blog', icon: FileText, title: 'Blog', desc: 'Tin tức & hướng dẫn' },
                  { href: '/about', icon: User, title: 'Về Chúng Tôi', desc: 'Tìm hiểu thêm' },
                  { href: '/contact', icon: Mail, title: 'Liên Hệ', desc: 'Nhận hỗ trợ' },
                ].map(({ href, icon: Icon, title, desc }) => (
                  <Link key={href} href={href}>
                    <div className="p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors cursor-pointer">
                      <Icon className="w-6 h-6 text-primary mb-2" />
                      <h4 className="font-semibold text-sm text-gray-800 mb-1">{title}</h4>
                      <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
