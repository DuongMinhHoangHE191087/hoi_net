'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, CheckCircle, XCircle, Clock, Sparkles,
  TrendingUp, Image as ImageIcon, Users, Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AnalyticsData {
  totalRequests: number
  completedRequests: number
  failedRequests: number
  pendingRequests: number
  avgProcessingTimeSec: number
  successRate: number
  totalUsers: number
  totalImages: number
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    loadAnalytics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const { data: requests } = await supabase
        .from('user_requests')
        .select('status, created_at, completed_at, original_images, user_id')

      if (!requests) { setLoading(false); return }

      type Row = { status: string; created_at: string; completed_at: string | null; original_images: string[] | null; user_id: string }
      const rows = requests as Row[]

      const completed = rows.filter((r: Row) => r.status === 'completed')
      const failed = rows.filter((r: Row) => r.status === 'rejected')
      const pending = rows.filter((r: Row) => r.status === 'pending' || r.status === 'processing')

      const processedWithTime = completed.filter((r: Row) => r.completed_at && r.created_at)
      const totalTimeSec = processedWithTime.reduce((sum: number, r: Row) => {
        const diff = new Date(r.completed_at!).getTime() - new Date(r.created_at).getTime()
        return sum + diff / 1000
      }, 0)
      const avgTime = processedWithTime.length > 0 ? totalTimeSec / processedWithTime.length : 0

      const uniqueUsers = new Set(rows.map((r: Row) => r.user_id)).size
      const totalImages = rows.reduce((sum: number, r: Row) => sum + (r.original_images?.length || 0), 0)

      setData({
        totalRequests: requests.length,
        completedRequests: completed.length,
        failedRequests: failed.length,
        pendingRequests: pending.length,
        avgProcessingTimeSec: Math.round(avgTime),
        successRate: requests.length > 0 ? Math.round((completed.length / requests.length) * 100) : 0,
        totalUsers: uniqueUsers,
        totalImages,
      })
    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glassmorphism-strong p-6 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  const formatTime = (sec: number) => {
    if (sec < 60) return `${sec}s`
    if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`
    return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`
  }

  const stats = [
    { label: 'Tổng Yêu Cầu', value: data.totalRequests, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Hoàn Thành', value: data.completedRequests, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Từ Chối', value: data.failedRequests, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Đang Chờ', value: data.pendingRequests, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ]

  const metrics = [
    { label: 'Tỷ Lệ Thành Công', value: `${data.successRate}%`, icon: TrendingUp, color: data.successRate >= 80 ? 'text-green-600' : 'text-yellow-600' },
    { label: 'Thời Gian TB', value: formatTime(data.avgProcessingTimeSec), icon: Zap, color: 'text-purple-600' },
    { label: 'Người Dùng', value: data.totalUsers.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Tổng Ảnh', value: data.totalImages.toString(), icon: ImageIcon, color: 'text-pink-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Phân Tích AI
        </h2>
        <button onClick={loadAnalytics} className="text-sm text-primary hover:underline">Làm mới</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${bg} p-4 rounded-xl border border-gray-100`}
          >
            <Icon className={`w-6 h-6 ${color} mb-2`} />
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-600">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon, color }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="bg-white/80 backdrop-blur p-4 rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Tỷ Lệ Thành Công Tổng</span>
          <span className={`text-sm font-bold ${data.successRate >= 80 ? 'text-green-600' : data.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {data.successRate}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.successRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              data.successRate >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : data.successRate >= 50 ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
              : 'bg-gradient-to-r from-red-400 to-red-500'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
