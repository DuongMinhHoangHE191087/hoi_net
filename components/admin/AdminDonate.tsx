'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Save, 
  Upload, 
  Trash2, 
  ExternalLink,
  Smartphone,
  Building2,
  Globe,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  Loader2,
  FileText,
  ToggleLeft,
  ToggleRight,
  Settings,
  BarChart3,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

// Settings groups
const SETTINGS_GROUPS = [
  {
    id: 'general',
    name: 'Cài đặt chung',
    icon: Settings,
    fields: [
      { key: 'donate_enabled', label: 'Trạng thái trang', type: 'toggle', description: 'Bật/tắt trang donate' },
      { key: 'donate_transfer_content', label: 'Nội dung chuyển khoản', type: 'text', placeholder: 'Ung ho Hoi Net' },
    ]
  },
  {
    id: 'hero',
    name: 'Hero Section',
    icon: Sparkles,
    fields: [
      { key: 'donate_hero_title', label: 'Tiêu đề', type: 'text', placeholder: 'Ủng Hộ Hồi Nét' },
      { key: 'donate_hero_subtitle', label: 'Mô tả', type: 'textarea', placeholder: 'Dự án phi lợi nhuận giúp khôi phục ảnh cũ...' },
    ]
  },
  {
    id: 'stats',
    name: 'Thống kê',
    icon: BarChart3,
    fields: [
      { key: 'donate_stats_photos', label: 'Số ảnh phục hồi', type: 'text', placeholder: '1000+' },
      { key: 'donate_stats_users', label: 'Số người dùng', type: 'text', placeholder: '500+' },
      { key: 'donate_stats_free', label: 'Phần trăm miễn phí', type: 'text', placeholder: '100%' },
    ]
  },
  {
    id: 'why',
    name: 'Lý do ủng hộ',
    icon: Heart,
    fields: [
      { key: 'donate_why_title', label: 'Tiêu đề section', type: 'text', placeholder: 'Đóng góp của bạn giúp chúng tôi' },
      { key: 'donate_why_1_title', label: 'Lý do 1 - Tiêu đề', type: 'text', placeholder: 'Duy trì server' },
      { key: 'donate_why_1_desc', label: 'Lý do 1 - Mô tả', type: 'textarea', placeholder: 'Chi phí hosting, domain...' },
      { key: 'donate_why_2_title', label: 'Lý do 2 - Tiêu đề', type: 'text', placeholder: 'Nâng cấp AI' },
      { key: 'donate_why_2_desc', label: 'Lý do 2 - Mô tả', type: 'textarea', placeholder: 'Chi phí API AI...' },
      { key: 'donate_why_3_title', label: 'Lý do 3 - Tiêu đề', type: 'text', placeholder: 'Phục vụ cộng đồng' },
      { key: 'donate_why_3_desc', label: 'Lý do 3 - Mô tả', type: 'textarea', placeholder: 'Giữ dịch vụ miễn phí...' },
    ]
  },
  {
    id: 'thanks',
    name: 'Lời cảm ơn',
    icon: MessageSquare,
    fields: [
      { key: 'donate_thanks_title', label: 'Tiêu đề', type: 'text', placeholder: 'Cảm ơn bạn!' },
      { key: 'donate_thanks_desc', label: 'Nội dung', type: 'textarea', placeholder: 'Mỗi đóng góp dù nhỏ đều giúp...' },
      { key: 'donate_message', label: 'Thông điệp toast', type: 'text', placeholder: 'Cảm ơn bạn đã ủng hộ Hồi Nét!' },
    ]
  },
]

// Payment methods
const PAYMENT_METHODS = [
  {
    id: 'momo',
    name: 'MoMo',
    icon: Smartphone,
    color: 'bg-pink-500',
    fields: [
      { key: 'donate_momo_qr', label: 'Ảnh QR MoMo', type: 'image' },
      { key: 'donate_momo_account', label: 'Số điện thoại', type: 'text', placeholder: '0394497949' },
      { key: 'donate_momo_name', label: 'Tên tài khoản', type: 'text', placeholder: 'DUONG MINH HOANG' },
    ]
  },
  {
    id: 'bank',
    name: 'Ngân hàng',
    icon: Building2,
    color: 'bg-blue-500',
    fields: [
      { key: 'donate_bank_qr', label: 'Ảnh QR Ngân hàng', type: 'image' },
      { key: 'donate_bank_bank_name', label: 'Tên ngân hàng', type: 'text', placeholder: 'MB Bank' },
      { key: 'donate_bank_account', label: 'Số tài khoản', type: 'text', placeholder: '0394497949' },
      { key: 'donate_bank_name', label: 'Tên tài khoản', type: 'text', placeholder: 'DUONG MINH HOANG' },
    ]
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: Smartphone,
    color: 'bg-sky-500',
    fields: [
      { key: 'donate_zalopay_qr', label: 'Ảnh QR ZaloPay', type: 'image' },
      { key: 'donate_zalopay_account', label: 'Số điện thoại', type: 'text', placeholder: '0394497949' },
      { key: 'donate_zalopay_name', label: 'Tên tài khoản', type: 'text', placeholder: 'DUONG MINH HOANG' },
    ]
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: Globe,
    color: 'bg-indigo-500',
    fields: [
      { key: 'donate_paypal_link', label: 'Link PayPal.me', type: 'url', placeholder: 'https://paypal.me/yourname' },
    ]
  },
  {
    id: 'custom',
    name: 'Nội dung tùy chỉnh',
    icon: FileText,
    color: 'bg-rose-500',
    fields: [
      { key: 'donate_custom_enabled', label: 'Bật phần này', type: 'toggle' },
      { key: 'donate_custom_title', label: 'Tiêu đề', type: 'text', placeholder: 'Hỗ trợ khác' },
      { key: 'donate_custom_content', label: 'Nội dung (HTML)', type: 'richtext', placeholder: '<p>Nhập nội dung HTML...</p>' },
    ]
  },
]

export default function AdminDonate() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'payment'>('content')
  const [activeGroup, setActiveGroup] = useState('general')
  const [activePayment, setActivePayment] = useState('momo')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      // Add cache-busting timestamp
      const timestamp = Date.now()
      const res = await fetch(`/api/admin/site-settings?_t=${timestamp}`)
      console.log('[AdminDonate] Fetching settings...')
      if (res.ok) {
        const data = await res.json()
        const settingsObj: Record<string, string> = {}
        if (Array.isArray(data)) {
          data.forEach((item: { key: string; value: string }) => {
            settingsObj[item.key] = item.value
          })
        }
        setSettings(settingsObj)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Không thể tải cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Collect all donate keys
      const allKeys = [
        ...SETTINGS_GROUPS.flatMap(g => g.fields.map(f => f.key)),
        ...PAYMENT_METHODS.flatMap(m => m.fields.map(f => f.key)),
      ]
      
      for (const key of allKeys) {
        if (settings[key] !== undefined) {
          await fetch('/api/admin/site-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: settings[key] || '' })
          })
        }
      }
      
      toast.success('Đã lưu tất cả cài đặt!', { icon: '✅' })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Không thể lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'donate')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({ ...prev, [key]: data.url }))
        toast.success('Đã tải ảnh lên!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Không thể tải ảnh lên')
    } finally {
      setUploading(null)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const renderField = (field: any) => {
    switch (field.type) {
      case 'toggle':
        return (
          <button
            onClick={() => updateSetting(field.key, settings[field.key] === 'true' ? 'false' : 'true')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all w-full ${
              settings[field.key] === 'true' 
                ? 'bg-green-50 border-green-300 text-green-700' 
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            {settings[field.key] === 'true' ? (
              <ToggleRight className="w-6 h-6" />
            ) : (
              <ToggleLeft className="w-6 h-6" />
            )}
            <span className="font-medium">
              {settings[field.key] === 'true' ? 'Đang bật' : 'Đang tắt'}
            </span>
          </button>
        )
      
      case 'textarea':
        return (
          <textarea
            value={settings[field.key] || ''}
            onChange={(e) => updateSetting(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        )
      
      case 'richtext':
        return (
          <div className="space-y-3">
            <textarea
              value={settings[field.key] || ''}
              onChange={(e) => updateSetting(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={8}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span>Hỗ trợ HTML: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;h3&gt;</span>
            </div>
            {settings[field.key] && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2 font-medium">Xem trước:</p>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: settings[field.key] }}
                />
              </div>
            )}
          </div>
        )
      
      case 'image':
        return (
          <div className="space-y-3">
            <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
              {settings[field.key] ? (
                <img
                  src={settings[field.key]}
                  alt={field.label}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-sm">Chưa có ảnh</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
                {uploading === field.key ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Tải ảnh lên
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(field.key, file)
                  }}
                  disabled={uploading === field.key}
                />
              </label>
              {settings[field.key] && (
                <button
                  onClick={() => updateSetting(field.key, '')}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              )}
            </div>
          </div>
        )
      
      default:
        return (
          <input
            type={field.type === 'url' ? 'url' : 'text'}
            value={settings[field.key] || ''}
            onChange={(e) => updateSetting(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        )
    }
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-gray-500">Đang tải cài đặt...</p>
      </Card>
    )
  }

  const currentGroup = SETTINGS_GROUPS.find(g => g.id === activeGroup)
  const currentPayment = PAYMENT_METHODS.find(m => m.id === activePayment)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold">Cài Đặt Trang Donate</h2>
              <p className="text-sm text-gray-500">Quản lý toàn bộ nội dung và phương thức thanh toán</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/donate"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-primary transition-colors border rounded-lg hover:border-primary"
            >
              <Eye className="w-4 h-4" />
              Xem trang
              <ExternalLink className="w-4 h-4" />
            </a>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Lưu tất cả
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Tabs */}
      <Card className="p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'content'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Nội dung trang
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'payment'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Phương thức thanh toán
          </button>
        </div>

        {activeTab === 'content' ? (
          <div className="grid md:grid-cols-4 gap-6">
            {/* Content Groups Sidebar */}
            <div className="space-y-2">
              {SETTINGS_GROUPS.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeGroup === group.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <group.icon className="w-5 h-5" />
                  <span className="font-medium">{group.name}</span>
                </button>
              ))}
            </div>

            {/* Content Fields */}
            <div className="md:col-span-3">
              {currentGroup && (
                <motion.div
                  key={currentGroup.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <currentGroup.icon className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold">{currentGroup.name}</h3>
                  </div>
                  
                  <div className="grid gap-6">
                    {currentGroup.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.description && (
                            <span className="text-gray-400 font-normal ml-2">({field.description})</span>
                          )}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Methods Tabs */}
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setActivePayment(method.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activePayment === method.id
                      ? `${method.color} text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <method.icon className="w-5 h-5" />
                  {method.name}
                  {method.fields.some(f => settings[f.key]) && (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Payment Method Fields */}
            {currentPayment && (
              <motion.div
                key={currentPayment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className={`w-10 h-10 ${currentPayment.color} rounded-lg flex items-center justify-center`}>
                    <currentPayment.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">{currentPayment.name}</h3>
                    <p className="text-sm text-gray-500">Cấu hình thông tin {currentPayment.name}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {currentPayment.fields.map((field) => (
                    <div key={field.key} className={field.type === 'richtext' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Card>

      {/* Preview Link */}
      <Card className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-500" />
            <div>
              <p className="font-medium">Xem trước trang Donate</p>
              <p className="text-sm text-gray-500">Lưu thay đổi trước khi xem để thấy cập nhật mới nhất</p>
            </div>
          </div>
          <a
            href="/donate"
            target="_blank"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Eye className="w-5 h-5" />
            Mở trang Donate
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </Card>
    </div>
  )
}
