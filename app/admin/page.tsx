'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MessageSquare, FileText, Users, Settings as SettingsIcon, BookOpen, Target, Info, Sparkles, Palette, BarChart3, UserCog, Globe, Link2, Menu, Shield, AlertTriangle, Image as ImageIcon, Layers, Type, Zap, Award, Loader2, Home } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
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
  'siteSettings': () => import('@/components/admin/AdminSiteSettings'),
  'footerLinks': () => import('@/components/admin/AdminFooterLinks'),
  'navLinks': () => import('@/components/admin/AdminNavigationLinks'),
  'uiSettings': () => import('@/components/admin/AdminUISettings'),
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
  const { user, loading: authLoading, isAdmin, status } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('homepage')
  const [isPending, startTransition] = useTransition()
  const [adminChecked, setAdminChecked] = useState(false)
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false)

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

    // If already admin from store, we're good
    if (isAdmin) {
      setIsVerifiedAdmin(true)
      setAdminChecked(true)
      return
    }

    // If we have a user but isAdmin is false, do an explicit check
    // This handles the race condition where admin check runs in background
    if (user) {
      const checkAdmin = async () => {
        try {
          // Import dynamically to avoid circular deps
          const { AdminService } = await import('@/lib/admin-service')
          const adminStatus = await AdminService.isAdmin(user.id)
          setIsVerifiedAdmin(adminStatus)
        } catch (e) {
          console.error('[AdminPage] Admin check failed:', e)
          setIsVerifiedAdmin(false)
        } finally {
          setAdminChecked(true)
        }
      }
      checkAdmin()
    } else {
      // No user = not admin
      setAdminChecked(true)
      setIsVerifiedAdmin(false)
    }
  }, [user, isAdmin, authLoading, status])

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

  // Access denied if not admin (only show after admin check completed)
  if (!user || !isVerifiedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <Card className="max-w-md p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập trang này.
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Quay về Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // ✅ REMOVED: No more pageLoading check - render immediately when ready

  const tabs = [
    { id: 'homepage' as Tab, label: 'Trang Chủ', icon: Home },
    { id: 'analytics' as Tab, label: 'Thống Kê', icon: BarChart3 },
    { id: 'requests' as Tab, label: 'Yêu Cầu', icon: FileText },
    { id: 'users' as Tab, label: 'Người Dùng', icon: UserCog },
    { id: 'blog' as Tab, label: 'Blog', icon: BookOpen },
    { id: 'team' as Tab, label: 'Đội Ngũ', icon: Users },
    { id: 'about' as Tab, label: 'Về Chúng Tôi', icon: Info },
    { id: 'prompts' as Tab, label: 'AI Prompts', icon: Sparkles },
    { id: 'values' as Tab, label: 'Giá Trị', icon: Target },
    { id: 'features' as Tab, label: 'Tính Năng', icon: Zap },
    { id: 'testimonials' as Tab, label: 'Phản Hồi & Testimonials', icon: MessageSquare },
    { id: 'siteContent' as Tab, label: 'Nội Dung Web', icon: Type },
    { id: 'branding' as Tab, label: 'Site Branding', icon: ImageIcon },
    { id: 'media' as Tab, label: 'Media Library', icon: Layers },
    { id: 'siteSettings' as Tab, label: 'Cài Đặt Trang', icon: Globe },
    { id: 'footerLinks' as Tab, label: 'Link Footer', icon: Link2 },
    { id: 'navLinks' as Tab, label: 'Menu Nav', icon: Menu },
    { id: 'uiSettings' as Tab, label: 'Giao Diện', icon: Palette },
    { id: 'settings' as Tab, label: 'Cài Đặt', icon: SettingsIcon },
  ]

  return (
    <div className="flex min-h-screen gradient-mesh">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Admin Header with Security Badge */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-text">Admin Panel</h1>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  ADMIN
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

