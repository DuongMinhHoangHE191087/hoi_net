'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { siteSettingsQueryKeys } from '@/hooks/useSiteSettings'

interface ContentSettings {
  // Hero Section
  hero_title: string
  hero_subtitle: string
  hero_cta_primary_text: string
  hero_cta_primary_link: string
  hero_cta_secondary_text: string
  hero_cta_secondary_link: string

  // About Section
  about_section_title: string
  about_section_subtitle: string

  // Features Section
  features_section_title: string
  features_section_subtitle: string

  // Why Choose Us Section
  why_choose_us_title: string
  why_choose_us_subtitle: string

  // Team Section
  team_section_title: string
  team_section_subtitle: string

  // Testimonials Section
  testimonials_section_title: string
  testimonials_section_subtitle: string

  // Final CTA Section
  final_cta_title: string
  final_cta_subtitle: string
  final_cta_button_text: string
  final_cta_button_link: string

  // Footer
  footer_tagline: string
  footer_copyright: string
}

const defaultSettings: ContentSettings = {
  // Hero Section
  hero_title: 'Khôi Phục Ảnh Cũ',
  hero_subtitle: 'Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động. Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp.',
  hero_cta_primary_text: 'Bắt Đầu Ngay',
  hero_cta_primary_link: '/register',
  hero_cta_secondary_text: 'Tìm Hiểu Thêm',
  hero_cta_secondary_link: '/about',

  // About Section
  about_section_title: 'Về Chúng Tôi',
  about_section_subtitle: 'Sứ mệnh và tầm nhìn của chúng tôi',

  // Features Section
  features_section_title: 'Tính Năng Nổi Bật',
  features_section_subtitle: 'Khám phá những công cụ mạnh mẽ giúp bạn khôi phục và cải thiện ảnh',

  // Why Choose Us Section
  why_choose_us_title: 'Tại Sao Chọn Chúng Tôi?',
  why_choose_us_subtitle: 'Cam kết mang đến dịch vụ tốt nhất',

  // Team Section
  team_section_title: 'Đội Ngũ Của Chúng Tôi',
  team_section_subtitle: 'Những người đồng hành cùng bạn',

  // Testimonials Section
  testimonials_section_title: 'Khách Hàng Nói Gì',
  testimonials_section_subtitle: 'Phản hồi từ những người đã sử dụng dịch vụ',

  // Final CTA Section
  final_cta_title: 'Sẵn Sàng Khôi Phục Ảnh?',
  final_cta_subtitle: 'Tham gia cùng hàng ngàn người dùng đã tin tưởng chúng tôi để lưu giữ kỷ niệm quý giá.',
  final_cta_button_text: 'Đăng Ký Miễn Phí Ngay',
  final_cta_button_link: '/register',

  // Footer
  footer_tagline: 'Khôi phục ký niệm, kết nối thế hệ',
  footer_copyright: '© 2026 Photo Restoration AI. All rights reserved.'
}

export default function AdminSiteContent() {
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState<ContentSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

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
      console.log('[AdminSiteContent] Loaded settings')

      if (response.ok) {
        // Merge with default settings to ensure all keys exist
        setSettings({ ...defaultSettings, ...data.settings })
      } else {
        throw new Error(data.error || 'Failed to load settings')
      }
    } catch (error: any) {
      console.error('Error loading settings:', error)
      toast.error(error.message || 'Lỗi khi tải cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: keyof ContentSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Get auth token for API call
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ settings })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Đã lưu thành công')
        setHasChanges(false)
        // Refresh site settings across the app
        queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.settings.all })
      } else {
        throw new Error(data.error || 'Failed to save settings')
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text">Quản Lý Nội Dung Website</h2>
          <p className="text-gray-600 mt-1">Chỉnh sửa tất cả văn bản hiển thị trên website</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
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
              Lưu Thay Đổi
            </>
          )}
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium">Có thay đổi chưa lưu</p>
            <p className="text-amber-700 text-sm">Nhớ nhấn "Lưu Thay Đổi" để cập nhật nội dung website</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Hero Section (Trang chủ)</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề chính"
            value={settings.hero_title}
            onChange={(e) => handleChange('hero_title', e.target.value)}
            placeholder="Khôi Phục Ảnh Cũ"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phụ đề / Mô tả</label>
            <textarea
              value={settings.hero_subtitle}
              onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              rows={3}
              placeholder="Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nút CTA chính - Text"
              value={settings.hero_cta_primary_text}
              onChange={(e) => handleChange('hero_cta_primary_text', e.target.value)}
              placeholder="Bắt Đầu Ngay"
            />
            <Input
              label="Nút CTA chính - Link"
              value={settings.hero_cta_primary_link}
              onChange={(e) => handleChange('hero_cta_primary_link', e.target.value)}
              placeholder="/register"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nút CTA phụ - Text"
              value={settings.hero_cta_secondary_text}
              onChange={(e) => handleChange('hero_cta_secondary_text', e.target.value)}
              placeholder="Tìm Hiểu Thêm"
            />
            <Input
              label="Nút CTA phụ - Link"
              value={settings.hero_cta_secondary_link}
              onChange={(e) => handleChange('hero_cta_secondary_link', e.target.value)}
              placeholder="/about"
            />
          </div>
        </div>
      </Card>

      {/* About Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Section: Về Chúng Tôi</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            value={settings.about_section_title}
            onChange={(e) => handleChange('about_section_title', e.target.value)}
            placeholder="Về Chúng Tôi"
          />
          <Input
            label="Phụ đề"
            value={settings.about_section_subtitle}
            onChange={(e) => handleChange('about_section_subtitle', e.target.value)}
            placeholder="Sứ mệnh và tầm nhìn của chúng tôi"
          />
        </div>
      </Card>

      {/* Features Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Section: Tính Năng Nổi Bật</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            value={settings.features_section_title}
            onChange={(e) => handleChange('features_section_title', e.target.value)}
            placeholder="Tính Năng Nổi Bật"
          />
          <Input
            label="Phụ đề"
            value={settings.features_section_subtitle}
            onChange={(e) => handleChange('features_section_subtitle', e.target.value)}
            placeholder="Khám phá những công cụ mạnh mẽ giúp bạn khôi phục và cải thiện ảnh"
          />
        </div>
      </Card>

      {/* Why Choose Us Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Section: Tại Sao Chọn Chúng Tôi</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            value={settings.why_choose_us_title}
            onChange={(e) => handleChange('why_choose_us_title', e.target.value)}
            placeholder="Tại Sao Chọn Chúng Tôi?"
          />
          <Input
            label="Phụ đề"
            value={settings.why_choose_us_subtitle}
            onChange={(e) => handleChange('why_choose_us_subtitle', e.target.value)}
            placeholder="Cam kết mang đến dịch vụ tốt nhất"
          />
        </div>
      </Card>

      {/* Team Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Section: Đội Ngũ</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            value={settings.team_section_title}
            onChange={(e) => handleChange('team_section_title', e.target.value)}
            placeholder="Đội Ngũ Của Chúng Tôi"
          />
          <Input
            label="Phụ đề"
            value={settings.team_section_subtitle}
            onChange={(e) => handleChange('team_section_subtitle', e.target.value)}
            placeholder="Những người đồng hành cùng bạn"
          />
        </div>
      </Card>

      {/* Testimonials Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Section: Đánh Giá Khách Hàng</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            value={settings.testimonials_section_title}
            onChange={(e) => handleChange('testimonials_section_title', e.target.value)}
            placeholder="Khách Hàng Nói Gì"
          />
          <Input
            label="Phụ đề"
            value={settings.testimonials_section_subtitle}
            onChange={(e) => handleChange('testimonials_section_subtitle', e.target.value)}
            placeholder="Phản hồi từ những người đã sử dụng dịch vụ"
          />
        </div>
      </Card>

      {/* Final CTA Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Section: Kêu Gọi Hành Động (CTA)</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            value={settings.final_cta_title}
            onChange={(e) => handleChange('final_cta_title', e.target.value)}
            placeholder="Sẵn Sàng Khôi Phục Ảnh?"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={settings.final_cta_subtitle}
              onChange={(e) => handleChange('final_cta_subtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              rows={2}
              placeholder="Tham gia cùng hàng ngàn người dùng đã tin tưởng chúng tôi"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Text nút"
              value={settings.final_cta_button_text}
              onChange={(e) => handleChange('final_cta_button_text', e.target.value)}
              placeholder="Đăng Ký Miễn Phí Ngay"
            />
            <Input
              label="Link nút"
              value={settings.final_cta_button_link}
              onChange={(e) => handleChange('final_cta_button_link', e.target.value)}
              placeholder="/register"
            />
          </div>
        </div>
      </Card>

      {/* Footer */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Footer</h3>
        <div className="space-y-4">
          <Input
            label="Tagline"
            value={settings.footer_tagline}
            onChange={(e) => handleChange('footer_tagline', e.target.value)}
            placeholder="Khôi phục ký niệm, kết nối thế hệ"
          />
          <Input
            label="Copyright"
            value={settings.footer_copyright}
            onChange={(e) => handleChange('footer_copyright', e.target.value)}
            placeholder="© 2026 Photo Restoration AI. All rights reserved."
          />
        </div>
      </Card>

      {/* Save Button at Bottom */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!hasChanges || saving}
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Lưu Thay Đổi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

