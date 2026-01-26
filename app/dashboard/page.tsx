'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  User, Settings, FileText, Image as ImageIcon, Calendar,
  TrendingUp, CheckCircle, Clock, XCircle, ArrowRight,
  Mail, Phone, MapPin, Sparkles, Shield, ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useSiteSetting } from '@/hooks/useSiteSettings'
import { SafeAvatar } from '@/components/ui/SafeImage'
import { FullScreenLoading } from '@/components/UniversalLoading'

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  rejectedRequests: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const brandName = useSiteSetting('brand_name')

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    rejectedRequests: 0,
  })

  // Define loadDashboardData BEFORE using it in useEffect
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      setProfile(profileData)

      // Load user requests stats
      const { data: requestsData, error: requestsError } = await supabase
        .from('user_requests')
        .select('status')
        .eq('user_id', user?.id)

      if (requestsError) {
        console.error('Error loading requests:', requestsError)
      } else if (requestsData) {
        const totalRequests = requestsData.length
        const pendingRequests = requestsData.filter(r => r.status === 'pending').length
        const completedRequests = requestsData.filter(r => r.status === 'completed').length
        const rejectedRequests = requestsData.filter(r => r.status === 'rejected').length

        setStats({
          totalRequests,
          pendingRequests,
          completedRequests,
          rejectedRequests,
        })
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error)
      setError('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard')
      return
    }

    if (user) {
      loadDashboardData()
    }
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (authLoading || loading) {
    return <FullScreenLoading message="Đang tải dashboard..." />
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="btn-primary w-full"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <motion.button
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                title="Quay về trang chủ"
              >
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
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glassmorphism-strong p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="shadow-glow-pink mb-4 rounded-full overflow-hidden">
                  <SafeAvatar
                    src={profile?.avatar_url}
                    alt={profile?.full_name || 'User'}
                    size="xl"
                  />
                </div>

                <h2 className="text-xl font-bold text-gray-800">
                  {profile?.full_name || 'Chưa cập nhật'}
                </h2>
                <p className="text-sm text-gray-600 mb-3">{user?.email}</p>

                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-primary text-white text-xs font-semibold rounded-full shadow-glow-pink">
                    <Shield className="w-3 h-3" />
                    Administrator
                  </span>
                )}
              </div>

              {/* Profile Info */}
              <div className="space-y-3 mb-6">
                {profile?.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}

                {profile?.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{profile.address}</span>
                  </div>
                )}

                {profile?.facebook_url && (
                  <div className="flex items-center gap-3 text-sm">
                    <a
                      href={profile.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook Profile
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-200">
                  <Calendar className="w-4 h-4" />
                  <span>Tham gia: {user?.created_at ? formatDate(user.created_at) : 'N/A'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link href="/profile" className="block">
                  <motion.button
                    className="btn-glass-primary w-full py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" />
                      Chỉnh Sửa Hồ Sơ
                    </span>
                  </motion.button>
                </Link>

                {isAdmin && (
                  <Link href="/admin" className="block">
                    <motion.button
                      className="btn-glass-secondary w-full py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </span>
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Stats and Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {/* Total Requests */}
              <div className="glassmorphism-strong p-4">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
                <p className="text-xs text-gray-600">Tổng Yêu Cầu</p>
              </div>

              {/* Pending */}
              <div className="glassmorphism-strong p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingRequests}</p>
                <p className="text-xs text-gray-600">Đang Xử Lý</p>
              </div>

              {/* Completed */}
              <div className="glassmorphism-strong p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.completedRequests}</p>
                <p className="text-xs text-gray-600">Hoàn Thành</p>
              </div>

              {/* Rejected */}
              <div className="glassmorphism-strong p-4">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.rejectedRequests}</p>
                <p className="text-xs text-gray-600">Từ Chối</p>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glassmorphism-strong p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Thao Tác Nhanh</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/requests/new">
                  <motion.div
                    className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl hover:shadow-lg transition-shadow cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
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
                  <motion.div
                    className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:shadow-lg transition-shadow cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
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

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glassmorphism-strong p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Hoạt Động Gần Đây</h3>

              {stats.totalRequests === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Bạn chưa có yêu cầu nào</p>
                  <Link href="/requests/new">
                    <motion.button
                      className="btn-glass-primary px-6 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Tạo Yêu Cầu Đầu Tiên
                      </span>
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Recent requests will be displayed here when implemented */}
                  <p className="text-sm text-gray-500">Đang tải hoạt động...</p>
                </div>
              )}
            </motion.div>

            {/* Help & Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glassmorphism-strong p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Hỗ Trợ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/blog">
                  <div className="p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors cursor-pointer">
                    <FileText className="w-6 h-6 text-primary mb-2" />
                    <h4 className="font-semibold text-sm text-gray-800 mb-1">Blog</h4>
                    <p className="text-xs text-gray-600">Tin tức & hướng dẫn</p>
                  </div>
                </Link>

                <Link href="/about">
                  <div className="p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors cursor-pointer">
                    <User className="w-6 h-6 text-primary mb-2" />
                    <h4 className="font-semibold text-sm text-gray-800 mb-1">Về Chúng Tôi</h4>
                    <p className="text-xs text-gray-600">Tìm hiểu thêm</p>
                  </div>
                </Link>

                <Link href="/contact">
                  <div className="p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors cursor-pointer">
                    <Mail className="w-6 h-6 text-primary mb-2" />
                    <h4 className="font-semibold text-sm text-gray-800 mb-1">Liên Hệ</h4>
                    <p className="text-xs text-gray-600">Nhận hỗ trợ</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

