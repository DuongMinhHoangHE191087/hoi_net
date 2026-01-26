'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface HeroSettings {
  hero_title: string
  hero_subtitle: string
  hero_cta_primary_text: string
  hero_cta_primary_link: string
  hero_cta_secondary_text: string
  hero_cta_secondary_link: string
}

interface HeroEditorProps {
  settings: HeroSettings
  onChange: (key: keyof HeroSettings, value: string) => void
}

export default function HeroEditor({ settings, onChange }: HeroEditorProps) {
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-text">Chỉnh sửa Hero Section</h3>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
          </button>
        </div>
        
        <div className="space-y-4">
          <Input
            label="Tiêu đề chính"
            value={settings.hero_title}
            onChange={(e) => onChange('hero_title', e.target.value)}
            placeholder="Khôi Phục Ảnh Cũ"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phụ đề / Mô tả
            </label>
            <textarea
              value={settings.hero_subtitle}
              onChange={(e) => onChange('hero_subtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none resize-none"
              rows={3}
              placeholder="Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động."
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Nút CTA Chính (Primary)</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Text"
                value={settings.hero_cta_primary_text}
                onChange={(e) => onChange('hero_cta_primary_text', e.target.value)}
                placeholder="Bắt Đầu Ngay"
              />
              <Input
                label="Link"
                value={settings.hero_cta_primary_link}
                onChange={(e) => onChange('hero_cta_primary_link', e.target.value)}
                placeholder="/register"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Nút CTA Phụ (Secondary)</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Text"
                value={settings.hero_cta_secondary_text}
                onChange={(e) => onChange('hero_cta_secondary_text', e.target.value)}
                placeholder="Tìm Hiểu Thêm"
              />
              <Input
                label="Link"
                value={settings.hero_cta_secondary_link}
                onChange={(e) => onChange('hero_cta_secondary_link', e.target.value)}
                placeholder="/about"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Live Preview Panel */}
      <div className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
        <Card className="sticky top-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Cập nhật realtime
            </span>
          </div>
          
          {/* Mini Hero Preview */}
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl p-6 relative overflow-hidden">
            {/* Decorative particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-20"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${10 + (i % 3) * 30}%`,
                  }}
                />
              ))}
            </div>

            <div className="relative text-center py-4">
              {/* Icon */}
              <div className="mb-4 inline-block">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                  {settings.hero_title || 'Khôi Phục Ảnh Cũ'}
                </span>
                <br />
                <span className="text-gray-800 text-xl">Bằng Công Nghệ AI</span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                {settings.hero_subtitle || 'Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  {settings.hero_cta_primary_text || 'Bắt Đầu Ngay'}
                  <Sparkles className="w-4 h-4" />
                </button>
                <button className="px-5 py-2.5 bg-white/80 backdrop-blur text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-white transition-all flex items-center justify-center gap-2">
                  {settings.hero_cta_secondary_text || 'Tìm Hiểu Thêm'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            ⚡ Preview này mô phỏng giao diện thực tế của Hero Section trên trang chủ
          </p>
        </Card>
      </div>
    </div>
  )
}

