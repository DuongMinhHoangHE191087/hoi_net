'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, Save, Trash2, Eye, EyeOff, Info, Palette } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface SiteSettings {
  site_name: string
  site_tagline: string
  site_logo_url: string
  site_logo_dark_url: string
  site_favicon_url: string
  site_meta_title: string
  site_meta_description: string
  site_meta_keywords: string
  site_og_image: string
  theme_primary_color: string
  theme_secondary_color: string
  google_analytics_id: string
  google_tag_manager_id: string
  maintenance_mode: string
  announcement_bar_enabled: string
  announcement_bar_text: string
  announcement_bar_color: string
}

export default function AdminSiteBranding() {
  const { data: currentSettings } = useSiteSettings()
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    site_tagline: '',
    site_logo_url: '',
    site_logo_dark_url: '',
    site_favicon_url: '',
    site_meta_title: '',
    site_meta_description: '',
    site_meta_keywords: '',
    site_og_image: '',
    theme_primary_color: '#ec4899',
    theme_secondary_color: '#f59e0b',
    google_analytics_id: '',
    google_tag_manager_id: '',
    maintenance_mode: 'false',
    announcement_bar_enabled: 'false',
    announcement_bar_text: '',
    announcement_bar_color: 'blue',
  })

  const [lightLogoFile, setLightLogoFile] = useState<File | null>(null)
  const [darkLogoFile, setDarkLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [lightLogoPreview, setLightLogoPreview] = useState<string>('')
  const [darkLogoPreview, setDarkLogoPreview] = useState<string>('')
  const [faviconPreview, setFaviconPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Load current settings
  useEffect(() => {
    if (currentSettings) {
      setSettings(prev => ({
        ...prev,
        ...currentSettings
      }))
      setLightLogoPreview(currentSettings.site_logo_url || '')
      setDarkLogoPreview(currentSettings.site_logo_dark_url || '')
      setFaviconPreview(currentSettings.site_favicon_url || '')
    }
  }, [currentSettings])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 50MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const preview = reader.result as string
      if (type === 'light') {
        setLightLogoFile(file)
        setLightLogoPreview(preview)
      } else if (type === 'dark') {
        setDarkLogoFile(file)
        setDarkLogoPreview(preview)
      } else {
        setFaviconFile(file)
        setFaviconPreview(preview)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUploadLogos = async () => {
    if (!lightLogoFile && !darkLogoFile) {
      toast.error('Vui lòng chọn ít nhất một logo')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      if (lightLogoFile) formData.append('lightLogo', lightLogoFile)
      if (darkLogoFile) formData.append('darkLogo', darkLogoFile)

      const response = await fetch('/api/admin/site-settings/logo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      toast.success('Upload logo thành công!')
      setLightLogoFile(null)
      setDarkLogoFile(null)

      // Update preview with uploaded URLs
      if (data.urls.lightLogoUrl) {
        setLightLogoPreview(data.urls.lightLogoUrl)
        setSettings(prev => ({ ...prev, site_logo_url: data.urls.lightLogoUrl }))
      }
      if (data.urls.darkLogoUrl) {
        setDarkLogoPreview(data.urls.darkLogoUrl)
        setSettings(prev => ({ ...prev, site_logo_dark_url: data.urls.darkLogoUrl }))
      }

      // Refresh page to update settings
      window.location.reload()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Lỗi khi upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadFavicon = async () => {
    if (!faviconFile) {
      toast.error('Vui lòng chọn file favicon')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('favicon', faviconFile)

      const response = await fetch('/api/admin/site-settings/favicon', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      toast.success('Upload favicon thành công!')
      setFaviconFile(null)
      setFaviconPreview(data.icons['32x32'])
      setSettings(prev => ({ ...prev, site_favicon_url: data.icons['32x32'] }))

      // Refresh page
      window.location.reload()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Lỗi khi upload favicon')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteLogo = async (type: 'light' | 'dark') => {
    if (!confirm(`Xóa logo ${type === 'light' ? 'chính' : 'dark mode'}?`)) return

    try {
      const response = await fetch(`/api/admin/site-settings/logo?type=${type}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      toast.success('Xóa logo thành công!')
      if (type === 'light') {
        setLightLogoPreview('')
        setSettings(prev => ({ ...prev, site_logo_url: '' }))
      } else {
        setDarkLogoPreview('')
        setSettings(prev => ({ ...prev, site_logo_dark_url: '' }))
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa logo')
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Save failed')
      }

      toast.success('Lưu cài đặt thành công!')
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || 'Lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Branding</h2>
          <p className="text-gray-600 mt-1">Quản lý logo, favicon, và thông tin website</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Ẩn' : 'Xem'} Preview
          </Button>
          <Button
            onClick={handleSaveSettings}
            loading={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu Cài Đặt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logo Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo Chính
          </h3>
          <div className="space-y-4">
            {/* Preview */}
            {lightLogoPreview && (
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <img
                  src={lightLogoPreview}
                  alt="Light Logo"
                  className="max-h-32 mx-auto object-contain"
                />
                <button
                  onClick={() => handleDeleteLogo('light')}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload */}
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-pink-500 transition">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Chọn logo (PNG/SVG)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'light')}
                  className="hidden"
                />
              </div>
            </label>

            {lightLogoFile && (
              <Button
                onClick={handleUploadLogos}
                loading={uploading}
                fullWidth
              >
                Upload Logo
              </Button>
            )}
          </div>
        </Card>

        {/* Dark Logo */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo Dark Mode
          </h3>
          <div className="space-y-4">
            {darkLogoPreview && (
              <div className="relative border-2 border-dashed border-gray-800 rounded-lg p-4 bg-gray-900">
                <img
                  src={darkLogoPreview}
                  alt="Dark Logo"
                  className="max-h-32 mx-auto object-contain"
                />
                <button
                  onClick={() => handleDeleteLogo('dark')}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-pink-500 transition">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Chọn logo dark</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'dark')}
                  className="hidden"
                />
              </div>
            </label>

            {darkLogoFile && (
              <Button
                onClick={handleUploadLogos}
                loading={uploading}
                fullWidth
              >
                Upload Logo Dark
              </Button>
            )}
          </div>
        </Card>

        {/* Favicon */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Favicon
          </h3>
          <div className="space-y-4">
            {faviconPreview && (
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <img
                  src={faviconPreview}
                  alt="Favicon"
                  className="w-16 h-16 mx-auto object-contain"
                />
              </div>
            )}

            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-pink-500 transition">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Chọn favicon (PNG)</p>
                <p className="text-xs text-gray-500 mt-1">Tự động tạo 16x16, 32x32, 180x180</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'favicon')}
                  className="hidden"
                />
              </div>
            </label>

            {faviconFile && (
              <Button
                onClick={handleUploadFavicon}
                loading={uploading}
                fullWidth
              >
                Upload Favicon
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Site Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Thông Tin Website
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Website
            </label>
            <input
              type="text"
              name="site_name"
              value={settings.site_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Photo Restore"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline/Slogan
            </label>
            <input
              type="text"
              name="site_tagline"
              value={settings.site_tagline}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Khôi phục ảnh bằng AI"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title (SEO)
            </label>
            <input
              type="text"
              name="site_meta_title"
              value={settings.site_meta_title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Photo Restoration App - Khôi phục ảnh bằng AI"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description (SEO)
            </label>
            <textarea
              name="site_meta_description"
              value={settings.site_meta_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Mô tả ngắn về website (150-160 ký tự)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Keywords
            </label>
            <input
              type="text"
              name="site_meta_keywords"
              value={settings.site_meta_keywords}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Analytics ID
            </label>
            <input
              type="text"
              name="google_analytics_id"
              value={settings.google_analytics_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </div>
      </Card>

      {/* Theme Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Màu Sắc Theme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                name="theme_primary_color"
                value={settings.theme_primary_color}
                onChange={handleInputChange}
                className="w-16 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.theme_primary_color}
                onChange={(e) => setSettings(prev => ({ ...prev, theme_primary_color: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="#ec4899"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                name="theme_secondary_color"
                value={settings.theme_secondary_color}
                onChange={handleInputChange}
                className="w-16 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.theme_secondary_color}
                onChange={(e) => setSettings(prev => ({ ...prev, theme_secondary_color: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="#f59e0b"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <Card className="p-6 bg-gradient-to-br from-pink-50 to-yellow-50">
          <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Navbar Preview */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              {lightLogoPreview ? (
                <img src={lightLogoPreview} alt="Logo" className="h-10 object-contain" />
              ) : (
                <div className="text-2xl font-bold" style={{ color: settings.theme_primary_color }}>
                  {settings.site_name || 'Your Site'}
                </div>
              )}
              <div className="text-sm text-gray-600">{settings.site_tagline}</div>
            </div>

            {/* Hero Section Preview */}
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold mb-4" style={{ color: settings.theme_primary_color }}>
                {settings.site_meta_title || 'Welcome to Your Site'}
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {settings.site_meta_description || 'Add your site description here'}
              </p>
              <div className="mt-8 flex gap-4 justify-center">
                <button
                  className="px-6 py-3 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: settings.theme_primary_color }}
                >
                  Primary Button
                </button>
                <button
                  className="px-6 py-3 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: settings.theme_secondary_color }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

