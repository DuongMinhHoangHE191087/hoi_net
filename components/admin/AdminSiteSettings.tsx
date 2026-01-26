'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Loader2, Globe, Mail, Phone, MapPin, Facebook, Image, Type, FileText, Upload, Trash2, Palette, Settings } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useSiteSettings, useUpdateSiteSettings, DEFAULT_SITE_SETTINGS } from '@/hooks/useSiteSettings'
import toast from 'react-hot-toast'

export default function AdminSiteSettings() {
  const { data: currentSettings, isLoading } = useSiteSettings()
  const updateSettings = useUpdateSiteSettings()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [settings, setSettings] = useState({
    brand_name: '',
    brand_slogan: '',
    brand_logo_url: '',
    brand_logo_type: 'icon',
    site_logo_url: '',
    footer_description: '',
    footer_copyright: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    contact_facebook: '',
    seo_title: '',
    seo_description: '',
    // New settings
    loading_message: 'Đang tải...',
    theme_primary_color: '#ec4899',
    theme_secondary_color: '#f59e0b',
  })

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        brand_name: currentSettings.brand_name || DEFAULT_SITE_SETTINGS.brand_name,
        brand_slogan: currentSettings.brand_slogan || DEFAULT_SITE_SETTINGS.brand_slogan,
        brand_logo_url: currentSettings.brand_logo_url || '',
        brand_logo_type: currentSettings.brand_logo_type || 'icon',
        site_logo_url: currentSettings.site_logo_url || '',
        footer_description: currentSettings.footer_description || DEFAULT_SITE_SETTINGS.footer_description,
        footer_copyright: currentSettings.footer_copyright || DEFAULT_SITE_SETTINGS.footer_copyright,
        contact_email: currentSettings.contact_email || DEFAULT_SITE_SETTINGS.contact_email,
        contact_phone: currentSettings.contact_phone || '',
        contact_address: currentSettings.contact_address || '',
        contact_facebook: currentSettings.contact_facebook || '',
        seo_title: currentSettings.seo_title || DEFAULT_SITE_SETTINGS.seo_title,
        seo_description: currentSettings.seo_description || DEFAULT_SITE_SETTINGS.seo_description,
        loading_message: currentSettings.loading_message || 'Đang tải...',
        theme_primary_color: currentSettings.theme_primary_color || '#ec4899',
        theme_secondary_color: currentSettings.theme_secondary_color || '#f59e0b',
      })
    }
  }, [currentSettings])

  // Upload logo to Supabase storage
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 50MB')
      return
    }

    try {
      setUploadingLogo(true)
      
      // Upload via API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'site-assets')
      formData.append('path', `logos/${Date.now()}-${file.name}`)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      
      setSettings(prev => ({
        ...prev,
        brand_logo_url: url,
        site_logo_url: url,
        brand_logo_type: 'image'
      }))
      
      toast.success('Đã upload logo thành công!')
    } catch (error) {
      console.error('Logo upload error:', error)
      toast.error('Lỗi khi upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setSettings(prev => ({
      ...prev,
      brand_logo_url: '',
      site_logo_url: '',
      brand_logo_type: 'icon'
    }))
  }

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
            <p className="text-xs text-gray-500 mt-1">Tên này hiển thị trên Loading, Navbar, Footer</p>
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
              <option value="icon">Icon mặc định (📸)</option>
              <option value="image">Hình ảnh tải lên</option>
            </select>
          </div>

          {/* Logo Upload Section */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo (hiển thị trên Loading, Navbar)
            </label>
            
            <div className="flex items-start gap-4">
              {/* Logo Preview */}
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {settings.brand_logo_url || settings.site_logo_url ? (
                  <img 
                    src={settings.brand_logo_url || settings.site_logo_url} 
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-4xl">📸</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-1" />
                    )}
                    Upload Logo
                  </Button>
                  
                  {(settings.brand_logo_url || settings.site_logo_url) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  PNG, JPG, SVG. Tối đa 2MB. Kích thước đề xuất: 200x200px
                </p>

                {/* Manual URL input */}
                <input
                  type="text"
                  value={settings.brand_logo_url}
                  onChange={(e) => setSettings({ ...settings, brand_logo_url: e.target.value, site_logo_url: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                  placeholder="Hoặc nhập URL logo..."
                />
              </div>
            </div>
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

      {/* Loading & Theme Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-text">Loading & Giao Diện</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tin nhắn Loading mặc định
            </label>
            <input
              type="text"
              value={settings.loading_message}
              onChange={(e) => setSettings({ ...settings, loading_message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              placeholder="Đang tải..."
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Palette className="w-4 h-4 inline mr-1" />
                Màu chủ đạo
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.theme_primary_color}
                  onChange={(e) => setSettings({ ...settings, theme_primary_color: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.theme_primary_color}
                  onChange={(e) => setSettings({ ...settings, theme_primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Màu phụ
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.theme_secondary_color}
                  onChange={(e) => setSettings({ ...settings, theme_secondary_color: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.theme_secondary_color}
                  onChange={(e) => setSettings({ ...settings, theme_secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none font-mono text-sm"
                />
              </div>
            </div>
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

