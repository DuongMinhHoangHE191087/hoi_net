'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Globe, Mail, Phone, MapPin, Facebook, Image, Type, FileText } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useSiteSettings, useUpdateSiteSettings, DEFAULT_SITE_SETTINGS } from '@/hooks/useSiteSettings'
import toast from 'react-hot-toast'

export default function AdminSiteSettings() {
  const { data: currentSettings, isLoading } = useSiteSettings()
  const updateSettings = useUpdateSiteSettings()

  const [settings, setSettings] = useState({
    brand_name: '',
    brand_slogan: '',
    brand_logo_url: '',
    brand_logo_type: 'icon',
    footer_description: '',
    footer_copyright: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    contact_facebook: '',
    seo_title: '',
    seo_description: '',
  })

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        brand_name: currentSettings.brand_name || DEFAULT_SITE_SETTINGS.brand_name,
        brand_slogan: currentSettings.brand_slogan || DEFAULT_SITE_SETTINGS.brand_slogan,
        brand_logo_url: currentSettings.brand_logo_url || '',
        brand_logo_type: currentSettings.brand_logo_type || 'icon',
        footer_description: currentSettings.footer_description || DEFAULT_SITE_SETTINGS.footer_description,
        footer_copyright: currentSettings.footer_copyright || DEFAULT_SITE_SETTINGS.footer_copyright,
        contact_email: currentSettings.contact_email || DEFAULT_SITE_SETTINGS.contact_email,
        contact_phone: currentSettings.contact_phone || '',
        contact_address: currentSettings.contact_address || '',
        contact_facebook: currentSettings.contact_facebook || '',
        seo_title: currentSettings.seo_title || DEFAULT_SITE_SETTINGS.seo_title,
        seo_description: currentSettings.seo_description || DEFAULT_SITE_SETTINGS.seo_description,
      })
    }
  }, [currentSettings])

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(settings)
      toast.success('Đã lưu cài đặt thành công!')
    } catch (err) {
      console.error('Error saving settings:', err)
      toast.error('Lỗi khi lưu cài đặt')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-600">Đang tải cài đặt...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text">Cài Đặt Trang</h2>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {updateSettings.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </Button>
      </div>

      {/* Brand Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-text">Thương Hiệu</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên thương hiệu
            </label>
            <input
              type="text"
              value={settings.brand_name}
              onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              placeholder="Photo Restore"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại logo
            </label>
            <select
              value={settings.brand_logo_type}
              onChange={(e) => setSettings({ ...settings, brand_logo_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
            >
              <option value="icon">Icon (Lucide)</option>
              <option value="image">Hình ảnh</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Logo (nếu dùng hình ảnh)
            </label>
            <input
              type="text"
              value={settings.brand_logo_url}
              onChange={(e) => setSettings({ ...settings, brand_logo_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slogan
            </label>
            <textarea
              value={settings.brand_slogan}
              onChange={(e) => setSettings({ ...settings, brand_slogan: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              rows={2}
              placeholder="Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI..."
            />
          </div>
        </div>
      </Card>

      {/* Contact Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-text">Thông Tin Liên Hệ</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              placeholder="support@photorestore.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Số điện thoại
            </label>
            <input
              type="text"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              placeholder="0123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Facebook className="w-4 h-4 inline mr-1" />
              Facebook
            </label>
            <input
              type="text"
              value={settings.contact_facebook}
              onChange={(e) => setSettings({ ...settings, contact_facebook: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Địa chỉ
            </label>
            <input
              type="text"
              value={settings.contact_address}
              onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
            />
          </div>
        </div>
      </Card>

      {/* Footer Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-text">Footer</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả footer
            </label>
            <textarea
              value={settings.footer_description}
              onChange={(e) => setSettings({ ...settings, footer_description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              rows={2}
              placeholder="Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text bản quyền
            </label>
            <input
              type="text"
              value={settings.footer_copyright}
              onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              placeholder="© 2026 Photo Restore. All rights reserved."
            />
          </div>
        </div>
      </Card>

      {/* SEO Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-text">SEO</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề trang mặc định
            </label>
            <input
              type="text"
              value={settings.seo_title}
              onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              placeholder="Photo Restoration App"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta description mặc định
            </label>
            <textarea
              value={settings.seo_description}
              onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              rows={2}
              placeholder="Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
