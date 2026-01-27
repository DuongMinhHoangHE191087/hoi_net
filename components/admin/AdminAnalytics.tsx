'use client'

import { useState, useEffect, useRef } from 'react'
import {
  BarChart3, TrendingUp, Zap, AlertCircle, Users, FileText, MessageSquare,
  BookOpen, Clock, CheckCircle, XCircle, UserPlus, ShieldX, Activity,
  RefreshCw
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { authFetch } from '@/lib/auth-fetch'

interface AnalyticsData {
  overview: {
    totalRequests: number
    totalCached: number
    totalErrors: number
    systemHealth: string
  }
  chartData: {
    date: string
    count: number
    restore: number
    enhance: number
    other: number
  }[]
  topUsers: {
    user_id: string
    current_usage: number
    monthly_limit: number
  }[]
  userStats: {
    total: number
    newThisWeek: number
    blocked: number
    active: number
  }
  requestStats: {
    pending: number
    processing: number
    completed: number
    rejected: number
    total: number
  }
  contentStats: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalFeedback: number
    unreadFeedback: number
  }
}

export default function AdminAnalytics() {
  // ✅ OPTIMIZED: Trust AdminPage parent - no auth check needed
  // If this component rendered, user IS authenticated and admin
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const didFetch = useRef(false)

  useEffect(() => {
    // Prevent double-fetch on mount (React StrictMode)
    if (didFetch.current && process.env.NODE_ENV === 'development') {
      return
    }
    didFetch.current = true
    
    console.log('[AdminAnalytics] Fetching analytics...')
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async (retryCount = 0) => {
    setLoading(true)
    try {
      // Add cache-busting timestamp
      const timestamp = Date.now()
      console.log('[AdminAnalytics] Starting fetch... (retry:', retryCount, ')')

      const res = await authFetch.get(`/api/admin/analytics?_t=${timestamp}`)

      console.log('[AdminAnalytics] Response status:', res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('[AdminAnalytics] Error response text:', errorText)

        let errorData: any = {}
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { message: errorText }
        }

        // Retry on 401 (auth might not be ready yet)
        if (res.status === 401 && retryCount < 2) {
          console.log('[AdminAnalytics] Auth error, retrying in 1s... (attempt', retryCount + 1, ')')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchAnalytics(retryCount + 1)
        }

        console.error('[AdminAnalytics] API Error:', errorData)

        if (res.status === 401) {
          toast.error('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản admin.')
        } else {
          toast.error(`Không thể tải dữ liệu thống kê: ${errorData.message || 'Lỗi không xác định'}`)
        }
        throw new Error(errorData.message || 'Failed to fetch analytics')
      }

      const jsonData = await res.json()
      console.log('[AdminAnalytics] Full data received:', jsonData)
      console.log('[AdminAnalytics] Data structure:', {
        hasOverview: !!jsonData.overview,
        hasChartData: !!jsonData.chartData,
        hasUserStats: !!jsonData.userStats,
        totalRequests: jsonData.overview?.totalRequests,
        totalUsers: jsonData.userStats?.total
      })

      setData(jsonData)
      toast.success('Đã tải thống kê thành công')
    } catch (error: any) {
      console.error('[AdminAnalytics] Fetch error:', error)
      console.error('[AdminAnalytics] Error stack:', error.stack)
      toast.error(error.message || 'Không thể tải dữ liệu thống kê')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
        <span className="text-gray-600">Đang tải thống kê...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-700 mb-4">Không thể tải dữ liệu thống kê</p>
        <Button onClick={() => fetchAnalytics()}>Thử lại</Button>
      </Card>
    )
  }

  // Calculate percentages
  const cacheRate = data.overview.totalRequests > 0
    ? ((data.overview.totalCached / data.overview.totalRequests) * 100).toFixed(1)
    : '0'

  const errorRate = data.overview.totalRequests > 0
    ? ((data.overview.totalErrors / data.overview.totalRequests) * 100).toFixed(1)
    : '0'

  const completionRate = data.requestStats.total > 0
    ? ((data.requestStats.completed / data.requestStats.total) * 100).toFixed(0)
    : '0'

  // System health indicator
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'Warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Tổng Quan Hệ Thống
          </h2>
          <p className="text-sm text-gray-500 mt-1">Thống kê và phân tích hoạt động của hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getHealthColor(data.overview.systemHealth)}`}>
            <Activity className="w-4 h-4 inline mr-1" />
            {data.overview.systemHealth}
          </span>
          <Button variant="secondary" size="sm" onClick={() => fetchAnalytics()}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng API Request"
          value={data.overview.totalRequests}
          icon={BarChart3}
          color="blue"
          subValue="Tất cả các request"
        />
        <StatsCard
          title="Cache Hits"
          value={data.overview.totalCached}
          icon={Zap}
          color="green"
          subValue={`${cacheRate}% tỷ lệ cache`}
        />
        <StatsCard
          title="Tỷ lệ Lỗi"
          value={`${errorRate}%`}
          icon={AlertCircle}
          color={parseFloat(errorRate) > 5 ? 'red' : 'green'}
          subValue={`${data.overview.totalErrors} lỗi hệ thống`}
        />
        <StatsCard
          title="Active Users"
          value={data.topUsers.length}
          icon={Users}
          color="purple"
          subValue="Đang sử dụng hệ thống"
        />
      </div>

      {/* User Stats */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Thống Kê Người Dùng
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{data.userStats.total}</div>
            <div className="text-sm text-blue-700 mt-1">Tổng người dùng</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{data.userStats.active}</div>
            <div className="text-sm text-green-700 mt-1">Đang hoạt động</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-1">
              <UserPlus className="w-5 h-5" />
              {data.userStats.newThisWeek}
            </div>
            <div className="text-sm text-purple-700 mt-1">Mới tuần này</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-600 flex items-center justify-center gap-1">
              <ShieldX className="w-5 h-5" />
              {data.userStats.blocked}
            </div>
            <div className="text-sm text-red-700 mt-1">Đã chặn</div>
          </div>
        </div>
      </Card>

      {/* Request Stats */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          Thống Kê Yêu Cầu
          <span className="ml-auto text-sm font-normal text-gray-500">
            Tỷ lệ hoàn thành: <span className="font-bold text-green-600">{completionRate}%</span>
          </span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{data.requestStats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Tổng yêu cầu</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center border-l-4 border-yellow-400">
            <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
              <Clock className="w-5 h-5" />
              {data.requestStats.pending}
            </div>
            <div className="text-sm text-yellow-700 mt-1">Chờ xử lý</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center border-l-4 border-blue-400">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
              <RefreshCw className="w-5 h-5" />
              {data.requestStats.processing}
            </div>
            <div className="text-sm text-blue-700 mt-1">Đang xử lý</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center border-l-4 border-green-400">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
              <CheckCircle className="w-5 h-5" />
              {data.requestStats.completed}
            </div>
            <div className="text-sm text-green-700 mt-1">Hoàn thành</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center border-l-4 border-red-400">
            <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
              <XCircle className="w-5 h-5" />
              {data.requestStats.rejected}
            </div>
            <div className="text-sm text-red-700 mt-1">Từ chối</div>
          </div>
        </div>
      </Card>

      {/* Content Stats */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          Nội Dung & Phản Hồi
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{data.contentStats.totalPosts}</div>
            <div className="text-sm text-purple-700 mt-1">Tổng bài viết</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.contentStats.publishedPosts}</div>
            <div className="text-sm text-green-700 mt-1">Đã xuất bản</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{data.contentStats.draftPosts}</div>
            <div className="text-sm text-gray-600 mt-1">Bản nháp</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
              <MessageSquare className="w-5 h-5" />
              {data.contentStats.totalFeedback}
            </div>
            <div className="text-sm text-blue-700 mt-1">Tổng phản hồi</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center relative">
            {data.contentStats.unreadFeedback > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {data.contentStats.unreadFeedback}
              </span>
            )}
            <div className="text-2xl font-bold text-orange-600">{data.contentStats.unreadFeedback}</div>
            <div className="text-sm text-orange-700 mt-1">Chưa đọc</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Biểu Đồ Sử Dụng (30 Ngày)
            </h3>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Restore</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded-sm"></div> Enhance</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-400 rounded-sm"></div> Other</span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-1">
            {data.chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có dữ liệu</p>
                </div>
              </div>
            ) : (
              data.chartData.slice(-14).map((day, idx) => {
                const maxVal = Math.max(...data.chartData.map(d => d.count)) || 1
                const heightPercent = (day.count / maxVal) * 100
                const restorePercent = day.count > 0 ? (day.restore / day.count) * 100 : 0
                const enhancePercent = day.count > 0 ? (day.enhance / day.count) * 100 : 0
                const otherPercent = day.count > 0 ? (day.other / day.count) * 100 : 0

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs p-2 rounded pointer-events-none transition-opacity z-10 whitespace-nowrap">
                      <div className="font-bold mb-1">{day.date}</div>
                      <div>Total: {day.count}</div>
                      <div className="text-blue-300">Restore: {day.restore}</div>
                      <div className="text-purple-300">Enhance: {day.enhance}</div>
                      <div className="text-gray-300">Other: {day.other}</div>
                    </div>

                    {/* Bar */}
                    <div
                      className="w-full max-w-[30px] bg-gray-100 rounded-t-sm overflow-hidden flex flex-col-reverse transition-all hover:opacity-80"
                      style={{ height: `${Math.max(10, heightPercent)}%` }}
                    >
                      <div className="w-full bg-blue-500" style={{ height: `${restorePercent}%` }}></div>
                      <div className="w-full bg-purple-500" style={{ height: `${enhancePercent}%` }}></div>
                      <div className="w-full bg-gray-400" style={{ height: `${otherPercent}%` }}></div>
                    </div>

                    {/* Date Label */}
                    <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center">
                      {day.date.split('-')[2]}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Top Users */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Top Users
          </h3>
          {data.topUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Chưa có dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topUsers.map((topUser, idx) => {
                const usagePercent = (topUser.current_usage / topUser.monthly_limit) * 100
                return (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-200 text-gray-600' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="text-sm font-medium text-gray-800 truncate max-w-[100px]" title={topUser.user_id}>
                          {topUser.user_id.substring(0, 8)}...
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{topUser.current_usage}</div>
                        <div className="text-[10px] text-gray-400">/{topUser.monthly_limit}</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent > 90 ? 'bg-red-500' :
                          usagePercent > 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 text-right">{usagePercent.toFixed(0)}% quota</div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, color, subValue }: {
  title: string
  value: number | string
  icon: any
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'yellow'
  subValue: string
}) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    yellow: 'text-yellow-600 bg-yellow-50',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{subValue}</div>
      </div>
    </Card>
  )
}

