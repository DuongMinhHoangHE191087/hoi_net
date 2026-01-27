'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Home, Save, Loader2, AlertCircle, Settings, Eye, LayoutGrid, 
  Sparkles, Monitor, ChevronRight
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { siteSettingsQueryKeys } from '@/hooks/useSiteSettings'

// Import sub-components
import HeroEditor from './homepage/HeroEditor'
import SectionOverview from './homepage/SectionOverview'
import SectionVisibility from './homepage/SectionVisibility'
import HomepagePreview from './homepage/HomepagePreview'

interface HeroSettings {
  hero_title: string
  hero_subtitle: string
  hero_cta_primary_text: string
  hero_cta_primary_link: string
  hero_cta_secondary_text: string
  hero_cta_secondary_link: string
}

const defaultHeroSettings: HeroSettings = {
  hero_title: 'Khôi Phục Ảnh Cũ',
  hero_subtitle: 'Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động. Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp.',
  hero_cta_primary_text: 'Bắt Đầu Ngay',
  hero_cta_primary_link: '/register',
  hero_cta_secondary_text: 'Tìm Hiểu Thêm',
  hero_cta_secondary_link: '/about'
}

type TabType = 'hero' | 'sections' | 'visibility' | 'preview'

interface AdminHomepageProps {
  onNavigateToTab?: (tabId: string) => void
}

export default function AdminHomepage({ onNavigateToTab }: AdminHomepageProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('hero')
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // Add cache-busting timestamp
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/site-content?_t=${timestamp}`)
      const data = await response.json()
      console.log('[AdminHomepage] Loaded settings')

      if (response.ok) {
        setHeroSettings({
          hero_title: data.settings?.hero_title || defaultHeroSettings.hero_title,
          hero_subtitle: data.settings?.hero_subtitle || defaultHeroSettings.hero_subtitle,
          hero_cta_primary_text: data.settings?.hero_cta_primary_text || defaultHeroSettings.hero_cta_primary_text,
          hero_cta_primary_link: data.settings?.hero_cta_primary_link || defaultHeroSettings.hero_cta_primary_link,
          hero_cta_secondary_text: data.settings?.hero_cta_secondary_text || defaultHeroSettings.hero_cta_secondary_text,
          hero_cta_secondary_link: data.settings?.hero_cta_secondary_link || defaultHeroSettings.hero_cta_secondary_link,
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Không thể tải cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const handleHeroChange = (key: keyof HeroSettings, value: string) => {
    setHeroSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSaveHero = async () => {
    try {
      setSaving(true)
      
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ settings: heroSettings })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Đã lưu Hero Section thành công!')
        setHasChanges(false)
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.settings.all })
        // Refresh preview
        setPreviewKey(prev => prev + 1)
      } else {
        throw new Error(data.error || 'Không thể lưu cài đặt')
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const handleNavigateToTab = useCallback((tabId: string) => {
    if (onNavigateToTab) {
      onNavigateToTab(tabId)
    }
  }, [onNavigateToTab])

  const tabs = [
    { id: 'hero' as TabType, label: 'Hero Section', icon: Sparkles, description: 'Chỉnh sửa banner chính' },
    { id: 'sections' as TabType, label: 'Tổng Quan', icon: LayoutGrid, description: 'Xem tổng quan các section' },
    { id: 'visibility' as TabType, label: 'Hiển Thị & Thứ Tự', icon: Settings, description: 'Bật/tắt và sắp xếp sections' },
    { id: 'preview' as TabType, label: 'Preview', icon: Monitor, description: 'Xem trước trang chủ' }
  ]

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Đang tải cài đặt trang chủ...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text">Quản Lý Trang Chủ</h2>
            <p className="text-gray-600 text-sm">
              Chỉnh sửa nội dung, thứ tự và hiển thị các section trên trang chủ
            </p>
          </div>
        </div>

        {/* Save Button for Hero tab */}
        {activeTab === 'hero' && (
          <Button
            variant="primary"
            onClick={handleSaveHero}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu Hero Section
              </>
            )}
          </Button>
        )}
      </div>

      {/* Unsaved Changes Alert */}
      {hasChanges && activeTab === 'hero' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium">Có thay đổi chưa lưu</p>
            <p className="text-amber-700 text-sm">Nhớ nhấn "Lưu Hero Section" để cập nhật nội dung</p>
          </div>
        </div>
      )}

      {/* Sub-tabs Navigation */}
      <Card className="p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                  ${isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Tab Description */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <ChevronRight className="w-4 h-4" />
        {tabs.find(t => t.id === activeTab)?.description}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'hero' && (
          <HeroEditor 
            settings={heroSettings} 
            onChange={handleHeroChange} 
          />
        )}

        {activeTab === 'sections' && (
          <SectionOverview 
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {activeTab === 'visibility' && (
          <SectionVisibility 
            onSave={() => setPreviewKey(prev => prev + 1)}
          />
        )}

        {activeTab === 'preview' && (
          <HomepagePreview 
            refreshKey={previewKey}
          />
        )}
      </div>

      {/* Quick Links */}
      {activeTab !== 'preview' && (
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Liên kết nhanh
          </h4>
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-white border border-primary/20 rounded-lg hover:bg-primary/5 transition-all"
            >
              Xem trang chủ
              <ChevronRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setActiveTab('preview')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Monitor className="w-4 h-4" />
              Mở Preview
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}

