'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MessageSquare, FileText, Users, Settings as SettingsIcon, BookOpen, Target, Info, Sparkles, Palette, BarChart3, UserCog, Globe, Link2, Menu, Shield, AlertTriangle, Image as ImageIcon, Layers, Type, Zap, Award, Loader2, Home, Heart } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { useUserRole } from '@/hooks/useUserRole'
import { hasPermission as roleHasPermission } from '@/lib/permissions'
import toast from 'react-hot-toast'

// Tab loading skeleton component
function TabLoadingSkeleton() {
  return (
    <Card className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ✅ OPTIMIZED: Dynamic loaders instead of eager imports
// Each component is only imported when clicked, not on page load
const ADMIN_TAB_LOADERS = {
  'homepage': () => import('@/components/admin/AdminHomepage'),
  'analytics': () => import('@/components/admin/AdminAnalytics'),
  'requests': () => import('@/components/admin/AdminRequests'),
  'users': () => import('@/components/admin/AdminUsers'),
  'blog': () => import('@/components/admin/AdminBlog'),
  'team': () => import('@/components/admin/AdminTeam'),
  'about': () => import('@/components/admin/AdminAbout'),
  'prompts': () => import('@/components/admin/AdminSystemPrompts'),
  'values': () => import('@/components/admin/AdminValues'),
  'features': () => import('@/components/admin/AdminFeatures'),
  'testimonials': () => import('@/components/admin/AdminTestimonials'),
  'siteContent': () => import('@/components/admin/AdminSiteContent'),
  'branding': () => import('@/components/admin/AdminSiteBranding'),
  'media': () => import('@/components/admin/AdminMediaLibrary'),
  'donate': () => import('@/components/admin/AdminDonate'),
  'siteSettings': () => import('@/components/admin/AdminSiteSettings'),
  'footerLinks': () => import('@/components/admin/AdminFooterLinks'),
  'navLinks': () => import('@/components/admin/AdminNavigationLinks'),
  'uiSettings': () => import('@/components/admin/AdminUISettings'),
  'security': () => import('@/components/admin/AdminSecuritySettings'),
  'settings': () => import('@/components/admin/AdminSettings'),
} as const

type Tab = keyof typeof ADMIN_TAB_LOADERS

// ✅ OPTIMIZED: Lazy wrapper that loads component on demand
function TabRenderer({ tabId }: { tabId: Tab }) {
  const [TabComponent, setTabComponent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const loader = ADMIN_TAB_LOADERS[tabId]
    if (!loader) {
      setError('Tab not found')
      setLoading(false)
      return
    }

    loader()
      .then((module) => {
        setTabComponent(() => module.default)
        setLoading(false)
      })
      .catch((err) => {
        console.error(`[AdminPage] Failed to load tab ${tabId}:`, err)
        setError(`Failed to load ${tabId}`)
        setLoading(false)
      })
  }, [tabId])

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </Card>
    )
  }

  if (loading || !TabComponent) {
    return <TabLoadingSkeleton />
  }

  return <TabComponent />
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading, status } = useAuth()
  const userRole = useUserRole()
  const [isPending, startTransition] = useTransition()
  const [adminChecked, setAdminChecked] = useState(false)
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false)

  // Determine default tab based on role
  const getDefaultTab = (): Tab => {
    const role = userRole.role
    if (role === 'admin') return 'homepage'
    if (role === 'moderator') return 'requests'
    if (role === 'editor') return 'blog'
    return 'homepage'
  }

  const [activeTab, setActiveTab] = useState<Tab>('homepage')

  // Set default tab when role is loaded
  useEffect(() => {
    if (!userRole.isLoading && userRole.role) {
      setActiveTab(getDefaultTab())
    }
  }, [userRole.isLoading, userRole.role])

  // Handle tab change with transition for smooth UX
  const handleTabChange = (tab: Tab) => {
    startTransition(() => {
      setActiveTab(tab)
    })
  }

  // ✅ IMPROVED: Wait for admin check to complete before showing access denied
  useEffect(() => {
    // Don't check until auth is loaded
    if (authLoading || status === 'loading' || status === 'idle') {
      return
    }

    if (!user) {
      setAdminChecked(true)
      setIsVerifiedAdmin(false)
      return
    }

    // Role-based access: admin.access (admin OR moderator)
    if (!userRole.isLoading) {
      setIsVerifiedAdmin(userRole.canAccessAdmin)
      setAdminChecked(true)
    }
  }, [user, authLoading, status, userRole.isLoading, userRole.canAccessAdmin])

  // Show loading state while auth or admin check is in progress
  if (authLoading || !adminChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">
            {authLoading ? 'Đang xác thực...' : 'Đang kiểm tra quyền admin...'}
          </p>
        </div>
      </div>
    )
  }

  // Access denied - Show 404 to hide admin route existence
  if (!user || !isVerifiedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Không tìm thấy trang</h2>
          <p className="text-gray-600 mt-2 mb-6">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Quay về Trang Chủ
          </Button>
        </div>
      </div>
    )
  }

  // ✅ REMOVED: No more pageLoading check - render immediately when ready

  // Build tabs based on role permissions
  const isAdmin = userRole.role === 'admin'
  const isModerator = userRole.role === 'moderator'
  const isEditor = userRole.role === 'editor'

  const tabs = [
    // Admin-only tabs
    ...(isAdmin ? [{ id: 'homepage' as Tab, label: 'Trang Chủ', icon: Home }] : []),
    ...(isAdmin ? [{ id: 'analytics' as Tab, label: 'Thống Kê', icon: BarChart3 }] : []),
    
    // Requests: Admin + Moderator
    ...((isAdmin || isModerator) ? [{ id: 'requests' as Tab, label: 'Yêu Cầu', icon: FileText }] : []),
    
    // Users: Admin only
    ...(isAdmin ? [{ id: 'users' as Tab, label: 'Người Dùng', icon: UserCog }] : []),
    
    // Blog: Admin + Moderator + Editor
    ...((isAdmin || isModerator || isEditor) ? [{ id: 'blog' as Tab, label: 'Blog', icon: BookOpen }] : []),
    
    // Feedback: Admin + Moderator
    ...((isAdmin || isModerator) ? [{ id: 'testimonials' as Tab, label: 'Phản Hồi', icon: MessageSquare }] : []),
    
    // Admin-only settings tabs
    ...(isAdmin ? [{ id: 'team' as Tab, label: 'Đội Ngũ', icon: Users }] : []),
    ...(isAdmin ? [{ id: 'about' as Tab, label: 'Về Chúng Tôi', icon: Info }] : []),
    ...(isAdmin ? [{ id: 'prompts' as Tab, label: 'AI Prompts', icon: Sparkles }] : []),
    ...(isAdmin ? [{ id: 'values' as Tab, label: 'Giá Trị', icon: Target }] : []),
    ...(isAdmin ? [{ id: 'features' as Tab, label: 'Tính Năng', icon: Zap }] : []),
    ...(isAdmin ? [{ id: 'siteContent' as Tab, label: 'Nội Dung Web', icon: Type }] : []),
    ...(isAdmin ? [{ id: 'branding' as Tab, label: 'Site Branding', icon: ImageIcon }] : []),
    ...(isAdmin ? [{ id: 'media' as Tab, label: 'Media Library', icon: Layers }] : []),
    ...(isAdmin ? [{ id: 'donate' as Tab, label: 'Donate', icon: Heart }] : []),
    ...(isAdmin ? [{ id: 'siteSettings' as Tab, label: 'Cài Đặt Trang', icon: Globe }] : []),
    ...(isAdmin ? [{ id: 'footerLinks' as Tab, label: 'Link Footer', icon: Link2 }] : []),
    ...(isAdmin ? [{ id: 'navLinks' as Tab, label: 'Menu Nav', icon: Menu }] : []),
    ...(isAdmin ? [{ id: 'uiSettings' as Tab, label: 'Giao Diện', icon: Palette }] : []),
    ...(isAdmin ? [{ id: 'security' as Tab, label: 'Bảo Mật', icon: Shield }] : []),
    ...(isAdmin ? [{ id: 'settings' as Tab, label: 'Cài Đặt', icon: SettingsIcon }] : []),
  ]

  return (
    <div className="flex min-h-screen gradient-mesh">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Admin Header with Role Badge */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-text">
                  {isAdmin ? 'Admin Panel' : isModerator ? 'Moderator Panel' : 'Editor Panel'}
                </h1>
                <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
                  isAdmin ? 'bg-red-100 text-red-700' :
                  isModerator ? 'bg-purple-100 text-purple-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  <Shield className="w-3 h-3" />
                  {isAdmin ? 'ADMIN' : isModerator ? 'MODERATOR' : 'EDITOR'}
                </span>
              </div>
              <p className="text-gray-600">
                Xin chào, <span className="font-semibold">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Card className="mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'primary' : 'secondary'}
                    onClick={() => handleTabChange(tab.id)}
                    className="flex items-center gap-2"
                    disabled={isPending}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </Card>

          {/* Tab Loading Indicator */}
          {isPending && (
            <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-gray-600">Đang tải...</span>
            </div>
          )}

          {/* ✅ OPTIMIZED: Tab content loaded on-demand */}
          <TabRenderer tabId={activeTab} />
        </div>
      </main>
    </div>
  )
}

