'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, AlertCircle, Sparkles, Zap, Target, Heart, Star, Users, Shield, Award, TrendingUp, CheckCircle, Lightbulb, Rocket, FileText, Camera, Image, Wand2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface ContentSettings {
  // Hero Section
  hero_title_line1: string
  hero_title_line2: string
  hero_subtitle: string
  hero_description: string
  hero_cta_primary: string
  hero_cta_secondary: string

  // Features Section
  features_title: string
  features_subtitle: string

  // Feature 1
  feature1_title: string
  feature1_description: string
  feature1_icon: string

  // Feature 2
  feature2_title: string
  feature2_description: string
  feature2_icon: string

  // Feature 3
  feature3_title: string
  feature3_description: string
  feature3_icon: string

  // Feature 4
  feature4_title: string
  feature4_description: string
  feature4_icon: string

  // About Section
  about_title: string
  about_subtitle: string

  // CTA Section
  cta_title: string
  cta_description: string
  cta_button_text: string

  // Footer
  footer_tagline: string
  footer_copyright: string
}

const defaultSettings: ContentSettings = {
  hero_title_line1: 'Khôi Phục Ảnh Cũ',
  hero_title_line2: 'Bằng Công Nghệ AI',
  hero_subtitle: 'Biến những bức ảnh cũ, phai màu thành những ký niệm sống động.',
  hero_description: 'Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp.',
  hero_cta_primary: 'Bắt Đầu Ngay',
  hero_cta_secondary: 'Tìm Hiểu Thêm',

  features_title: 'Tính Năng Nổi Bật',
  features_subtitle: 'Công nghệ AI tiên tiến giúp khôi phục ảnh của bạn',

  feature1_title: 'Khôi Phục Tự Động',
  feature1_description: 'AI tự động nhận diện và sửa chữa các khuyết điểm trong ảnh',
  feature1_icon: 'Sparkles',

  feature2_title: 'Tô Màu Thông Minh',
  feature2_description: 'Thêm màu sắc tự nhiên cho ảnh đen trắng với độ chính xác cao',
  feature2_icon: 'Wand2',

  feature3_title: 'Ghép Ảnh Gia Đình',
  feature3_description: 'Tạo ảnh gia đình hoàn hảo từ nhiều bức ảnh riêng lẻ',
  feature3_icon: 'Users',

  feature4_title: 'Xử Lý Nhanh Chóng',
  feature4_description: 'Nhận kết quả chỉ trong vài phút với chất lượng cao',
  feature4_icon: 'Zap',

  about_title: 'Về Chúng Tôi',
  about_subtitle: 'Chúng tôi mang đến giải pháp khôi phục ảnh hiện đại nhất',

  cta_title: 'Sẵn Sàng Khôi Phục Ảnh Của Bạn?',
  cta_description: 'Bắt đầu ngay hôm nay và trải nghiệm sức mạnh của công nghệ AI',
  cta_button_text: 'Bắt Đầu Miễn Phí',

  footer_tagline: 'Khôi phục ký niệm, kết nối thế hệ',
  footer_copyright: '© 2026 Photo Restoration AI. All rights reserved.'
}

// Available icons for features
const availableIcons = [
  { name: 'Sparkles', component: Sparkles, label: 'Sparkles' },
  { name: 'Zap', component: Zap, label: 'Lightning' },
  { name: 'Target', component: Target, label: 'Target' },
  { name: 'Heart', component: Heart, label: 'Heart' },
  { name: 'Star', component: Star, label: 'Star' },
  { name: 'Users', component: Users, label: 'Users' },
  { name: 'Shield', component: Shield, label: 'Shield' },
  { name: 'Award', component: Award, label: 'Award' },
  { name: 'TrendingUp', component: TrendingUp, label: 'Trending' },
  { name: 'CheckCircle', component: CheckCircle, label: 'Check' },
  { name: 'Lightbulb', component: Lightbulb, label: 'Idea' },
  { name: 'Rocket', component: Rocket, label: 'Rocket' },
  { name: 'FileText', component: FileText, label: 'Document' },
  { name: 'Camera', component: Camera, label: 'Camera' },
  { name: 'Image', component: Image, label: 'Image' },
  { name: 'Wand2', component: Wand2, label: 'Magic Wand' },
]

const getIconComponent = (iconName: string) => {
  const icon = availableIcons.find(i => i.name === iconName)
  return icon ? icon.component : Sparkles
}

export default function AdminSiteContent() {
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
      const response = await fetch('/api/admin/site-content')
      const data = await response.json()

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
      const response = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Đã lưu thành công')
        setHasChanges(false)
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
            label="Tiêu đề dòng 1"
            value={settings.hero_title_line1}
            onChange={(e) => handleChange('hero_title_line1', e.target.value)}
            placeholder="Khôi Phục Ảnh Cũ"
          />
          <Input
            label="Tiêu đề dòng 2"
            value={settings.hero_title_line2}
            onChange={(e) => handleChange('hero_title_line2', e.target.value)}
            placeholder="Bằng Công Nghệ AI"
          />
          <Input
            label="Phụ đề"
            value={settings.hero_subtitle}
            onChange={(e) => handleChange('hero_subtitle', e.target.value)}
            placeholder="Biến những bức ảnh cũ, phai màu thành những ký niệm sống động."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={settings.hero_description}
              onChange={(e) => handleChange('hero_description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              rows={2}
              placeholder="Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nút CTA chính"
              value={settings.hero_cta_primary}
              onChange={(e) => handleChange('hero_cta_primary', e.target.value)}
              placeholder="Bắt Đầu Ngay"
            />
            <Input
              label="Nút CTA phụ"
              value={settings.hero_cta_secondary}
              onChange={(e) => handleChange('hero_cta_secondary', e.target.value)}
              placeholder="Tìm Hiểu Thêm"
            />
          </div>
        </div>
      </Card>

      {/* Features Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Tính Năng Nổi Bật</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề section"
            value={settings.features_title}
            onChange={(e) => handleChange('features_title', e.target.value)}
            placeholder="Tính Năng Nổi Bật"
          />
          <Input
            label="Mô tả section"
            value={settings.features_subtitle}
            onChange={(e) => handleChange('features_subtitle', e.target.value)}
            placeholder="Công nghệ AI tiên tiến giúp khôi phục ảnh của bạn"
          />
        </div>
      </Card>

      {/* Features Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((num) => {
          const iconKey = `feature${num}_icon` as keyof ContentSettings
          const currentIcon = settings[iconKey] || 'Sparkles'
          const IconPreview = getIconComponent(currentIcon as string)

          return (
            <Card key={num}>
              <h4 className="text-lg font-bold text-text mb-4">Tính năng {num}</h4>
              <div className="space-y-4">
                {/* Icon Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {availableIcons.map((icon) => {
                      const Icon = icon.component
                      const isSelected = currentIcon === icon.name
                      return (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => handleChange(iconKey, icon.name)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                          }`}
                          title={icon.label}
                        >
                          <Icon className="w-5 h-5 mx-auto" />
                        </button>
                      )
                    })}
                  </div>
                  {/* Preview */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <IconPreview className="w-5 h-5 text-primary" />
                    <span>Icon hiện tại: <strong>{availableIcons.find(i => i.name === currentIcon)?.label || currentIcon}</strong></span>
                  </div>
                </div>

                <Input
                  label="Tiêu đề"
                  value={settings[`feature${num}_title` as keyof ContentSettings]}
                  onChange={(e) => handleChange(`feature${num}_title` as keyof ContentSettings, e.target.value)}
                  placeholder={`Tính năng ${num}`}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    value={settings[`feature${num}_description` as keyof ContentSettings]}
                    onChange={(e) => handleChange(`feature${num}_description` as keyof ContentSettings, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                    rows={3}
                    placeholder="Mô tả tính năng..."
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* About Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Về Chúng Tôi</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            value={settings.about_title}
            onChange={(e) => handleChange('about_title', e.target.value)}
            placeholder="Về Chúng Tôi"
          />
          <Input
            label="Phụ đề"
            value={settings.about_subtitle}
            onChange={(e) => handleChange('about_subtitle', e.target.value)}
            placeholder="Chúng tôi mang đến giải pháp khôi phục ảnh hiện đại nhất"
          />
        </div>
      </Card>

      {/* CTA Section */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4">Call-to-Action Section</h3>
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            value={settings.cta_title}
            onChange={(e) => handleChange('cta_title', e.target.value)}
            placeholder="Sẵn Sàng Khôi Phục Ảnh Của Bạn?"
          />
          <Input
            label="Mô tả"
            value={settings.cta_description}
            onChange={(e) => handleChange('cta_description', e.target.value)}
            placeholder="Bắt đầu ngay hôm nay và trải nghiệm sức mạnh của công nghệ AI"
          />
          <Input
            label="Text nút"
            value={settings.cta_button_text}
            onChange={(e) => handleChange('cta_button_text', e.target.value)}
            placeholder="Bắt Đầu Miễn Phí"
          />
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
