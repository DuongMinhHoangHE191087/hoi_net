'use client'

import { useState, useEffect } from 'react'
import { Save, Palette, Eye, Layout, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { db } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface UISettings {
  // Color Theme
  primaryColor: string
  secondaryColor: string
  accentColor: string

  // Team Section
  teamBackgroundGradient: string
  teamCardStyle: 'glassmorphism' | 'solid' | 'minimal'
  teamAnimationSpeed: 'slow' | 'normal' | 'fast'

  // Global Stats
  showGlobe: boolean
  statsLayout: 'center-globe' | 'grid' | 'single-row'

  // Values Section
  valuesStyle: 'icons' | 'cards' | 'minimal'

  // General
  enableAnimations: boolean
  animationIntensity: 'subtle' | 'normal' | 'expressive'
}

const defaultSettings: UISettings = {
  primaryColor: '#FF6B9D',
  secondaryColor: '#FFC837',
  accentColor: '#4F8FFF',
  teamBackgroundGradient: 'blue-purple',
  teamCardStyle: 'glassmorphism',
  teamAnimationSpeed: 'normal',
  showGlobe: true,
  statsLayout: 'center-globe',
  valuesStyle: 'icons',
  enableAnimations: true,
  animationIntensity: 'normal',
}

export default function AdminUISettings() {
  const [settings, setSettings] = useState<UISettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const uiSettingsData = await db.getSiteSetting('ui_settings')
      if (uiSettingsData?.value) {
        // Handle both string and object values (JSONB returns object, TEXT returns string)
        let parsedValue: Partial<UISettings>
        if (typeof uiSettingsData.value === 'string') {
          try {
            parsedValue = JSON.parse(uiSettingsData.value)
          } catch {
            parsedValue = {}
          }
        } else {
          // Already an object (JSONB)
          parsedValue = uiSettingsData.value as unknown as Partial<UISettings>
        }
        setSettings({ ...defaultSettings, ...parsedValue })
      }
    } catch (err) {
      console.error('Error loading UI settings:', err)
      // Don't show error - just use defaults
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await db.updateSiteSetting('ui_settings', JSON.stringify(settings))
      toast.success('Đã lưu cài đặt UI thành công! Refresh trang để xem kết quả.')
    } catch (err) {
      console.error('Error saving UI settings:', err)
      toast.error('Lỗi khi lưu cài đặt UI. Vui lòng kiểm tra database.')
    } finally {
      setSaving(false)
    }
  }

  const gradientOptions = [
    { value: 'blue-purple', label: 'Blue → Purple', colors: ['#4F8FFF', '#8B7FD4'] },
    { value: 'pink-yellow', label: 'Pink → Yellow', colors: ['#FF6B9D', '#FFC837'] },
    { value: 'orange-green', label: 'Orange → Green', colors: ['#FF8F6B', '#4ECB71'] },
    { value: 'cyan-purple', label: 'Cyan → Purple', colors: ['#6BCFCF', '#8B7FD4'] },
    { value: 'green-blue', label: 'Green → Blue', colors: ['#4ECB71', '#4F8FFF'] },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" />
          Tùy Chỉnh Giao Diện
        </h2>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Ẩn Preview' : 'Xem Preview'}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Theme */}
        <Card>
          <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-soft-purple-DEFAULT" />
            Màu Sắc Chính
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Team Section Settings */}
        <Card>
          <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-soft-blue-DEFAULT" />
            Phần Đội Ngũ (Team)
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gradient Nền
              </label>
              <div className="grid grid-cols-1 gap-2">
                {gradientOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({ ...settings, teamBackgroundGradient: option.value })}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      settings.teamBackgroundGradient === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${option.colors[0]}, ${option.colors[1]})`
                      }}
                    />
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kiểu Card
              </label>
              <select
                value={settings.teamCardStyle}
                onChange={(e) => setSettings({ ...settings, teamCardStyle: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              >
                <option value="glassmorphism">Glassmorphism (Blur)</option>
                <option value="solid">Solid Color</option>
                <option value="minimal">Minimal (Border only)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tốc Độ Animation
              </label>
              <select
                value={settings.teamAnimationSpeed}
                onChange={(e) => setSettings({ ...settings, teamAnimationSpeed: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              >
                <option value="slow">Chậm (Elegant)</option>
                <option value="normal">Bình thường</option>
                <option value="fast">Nhanh (Dynamic)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Animation Settings */}
        <Card>
          <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-soft-orange-DEFAULT" />
            Cài Đặt Animation
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-700">
                Bật Animation
              </label>
              <button
                onClick={() => setSettings({ ...settings, enableAnimations: !settings.enableAnimations })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableAnimations ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableAnimations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức Độ Animation
              </label>
              <select
                value={settings.animationIntensity}
                onChange={(e) => setSettings({ ...settings, animationIntensity: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                disabled={!settings.enableAnimations}
              >
                <option value="subtle">Nhẹ (Subtle)</option>
                <option value="normal">Bình thường</option>
                <option value="expressive">Mạnh (Expressive)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Stats & Values Settings */}
        <Card>
          <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-soft-green-DEFAULT" />
            Thống Kê & Giá Trị
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-700">
                Hiển thị Globe (bản đồ)
              </label>
              <button
                onClick={() => setSettings({ ...settings, showGlobe: !settings.showGlobe })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showGlobe ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showGlobe ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Thống Kê
              </label>
              <select
                value={settings.statsLayout}
                onChange={(e) => setSettings({ ...settings, statsLayout: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              >
                <option value="center-globe">Globe ở giữa</option>
                <option value="grid">Grid 2x2</option>
                <option value="single-row">Một hàng ngang</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kiểu Values Section
              </label>
              <select
                value={settings.valuesStyle}
                onChange={(e) => setSettings({ ...settings, valuesStyle: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              >
                <option value="icons">Icons đơn giản</option>
                <option value="cards">Cards với mô tả</option>
                <option value="minimal">Minimal (chỉ text)</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Preview Section */}
      {previewMode && (
        <div className="mt-8">
          <Card>
            <h3 className="text-xl font-bold text-text mb-4">Live Preview</h3>
            <div 
              className="p-8 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`
              }}
            >
              <div className="text-center text-white">
                <h4 className="text-2xl font-bold mb-2">Sample Preview</h4>
                <p className="text-white/80">Đây là preview của màu sắc bạn đã chọn</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

