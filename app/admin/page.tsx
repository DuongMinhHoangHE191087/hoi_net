'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, FileText, Users, Settings as SettingsIcon, BookOpen, Target, Info, Sparkles, Palette, BarChart3, UserCog, Globe, Link2, Menu, Shield, AlertTriangle, Image as ImageIcon, Layers, Type, Zap } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AdminRequests from '@/components/admin/AdminRequests'
import AdminBlog from '@/components/admin/AdminBlog'
import AdminTeam from '@/components/admin/AdminTeam'
import AdminSettings from '@/components/admin/AdminSettings'
import AdminFeedback from '@/components/admin/AdminFeedback'
import AdminValues from '@/components/admin/AdminValues'
import AdminAbout from '@/components/admin/AdminAbout'
import AdminSystemPrompts from '@/components/admin/AdminSystemPrompts'
import AdminUISettings from '@/components/admin/AdminUISettings'
import AdminAnalytics from '@/components/admin/AdminAnalytics'
import AdminUsers from '@/components/admin/AdminUsers'
import AdminSiteSettings from '@/components/admin/AdminSiteSettings'
import AdminFooterLinks from '@/components/admin/AdminFooterLinks'
import AdminNavigationLinks from '@/components/admin/AdminNavigationLinks'
import AdminSiteBranding from '@/components/admin/AdminSiteBranding'
import AdminMediaLibrary from '@/components/admin/AdminMediaLibrary'
import AdminSiteContent from '@/components/admin/AdminSiteContent'
import AdminFeatures from '@/components/admin/AdminFeatures'
import { usePageLoading } from '@/components/ui/PageWrapper'
import { FullScreenLoading } from '@/components/UniversalLoading'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

type Tab = 'analytics' | 'requests' | 'users' | 'blog' | 'team' | 'about' | 'prompts' | 'values' | 'feedback' | 'uiSettings' | 'settings' | 'siteSettings' | 'footerLinks' | 'navLinks' | 'branding' | 'media' | 'siteContent' | 'features'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const { loading: pageLoading, finishLoading } = usePageLoading(true, 1000)
  const [activeTab, setActiveTab] = useState<Tab>('analytics')

  // Let middleware handle auth protection - no client-side redirect
  // Just show loading while auth initializes
  useEffect(() => {
    console.log('[Admin Page] Auth state:', {
      authLoading,
      hasUser: !!user,
      userEmail: user?.email,
      isAdmin
    })

    if (!authLoading) {
      finishLoading()
    }
  }, [authLoading, user, isAdmin, finishLoading])

  // Show loading while checking auth
  if (authLoading) {
    return <FullScreenLoading message="Đang tải Admin Panel..." />
  }

  // If somehow got here without auth (middleware should prevent this)
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  if (pageLoading) {
    return <FullScreenLoading message="Đang tải Admin Panel..." />
  }

  const tabs = [
    { id: 'analytics' as Tab, label: 'Thống Kê', icon: BarChart3 },
    { id: 'requests' as Tab, label: 'Yêu Cầu', icon: FileText },
    { id: 'users' as Tab, label: 'Người Dùng', icon: UserCog },
    { id: 'blog' as Tab, label: 'Blog', icon: BookOpen },
    { id: 'team' as Tab, label: 'Đội Ngũ', icon: Users },
    { id: 'about' as Tab, label: 'Về Chúng Tôi', icon: Info },
    { id: 'prompts' as Tab, label: 'AI Prompts', icon: Sparkles },
    { id: 'values' as Tab, label: 'Giá Trị', icon: Target },
    { id: 'features' as Tab, label: 'Tính Năng', icon: Zap },
    { id: 'feedback' as Tab, label: 'Phản Hồi', icon: MessageSquare },
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
    <div className="flex min-h-screen bg-gray-50">
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
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </Card>

          {/* Tab Content */}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'requests' && <AdminRequests />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'blog' && <AdminBlog />}
          {activeTab === 'team' && <AdminTeam />}
          {activeTab === 'about' && <AdminAbout />}
          {activeTab === 'prompts' && <AdminSystemPrompts />}
          {activeTab === 'values' && <AdminValues />}
          {activeTab === 'features' && <AdminFeatures />}
          {activeTab === 'feedback' && <AdminFeedback />}
          {activeTab === 'siteContent' && <AdminSiteContent />}
          {activeTab === 'branding' && <AdminSiteBranding />}
          {activeTab === 'media' && <AdminMediaLibrary />}
          {activeTab === 'siteSettings' && <AdminSiteSettings />}
          {activeTab === 'footerLinks' && <AdminFooterLinks />}
          {activeTab === 'navLinks' && <AdminNavigationLinks />}
          {activeTab === 'uiSettings' && <AdminUISettings />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  )
}
