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
  Coffee,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Eye,
  Loader2
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

// Donation method configurations
const DONATE_METHODS = [
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
      { key: 'donate_paypal_link', label: 'Link PayPal.me', type: 'url', placeholder: 'https://paypal.me/hoinet' },
    ]
  },
  {
    id: 'bmc',
    name: 'Buy Me a Coffee',
    icon: Coffee,
    color: 'bg-amber-500',
    fields: [
      { key: 'donate_bmc_link', label: 'Link Buy Me a Coffee', type: 'url', placeholder: 'https://buymeacoffee.com/hoinet' },
    ]
  },
]

export default function AdminDonate() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [activeMethod, setActiveMethod] = useState('momo')

  // Fetch current settings
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/site-settings')
      if (res.ok) {
        const data = await res.json()
        // Convert array to object for easier access
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
      // Save all donate settings
      const donateKeys = DONATE_METHODS.flatMap(m => m.fields.map(f => f.key))
      donateKeys.push('donate_enabled', 'donate_message')
      
      for (const key of donateKeys) {
        if (settings[key] !== undefined) {
          await fetch('/api/site-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: settings[key] })
          })
        }
      }
      
      toast.success('Đã lưu cài đặt donate!')
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

  const handleRemoveImage = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: '' }))
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-gray-500">Đang tải cài đặt...</p>
      </Card>
    )
  }

  const currentMethod = DONATE_METHODS.find(m => m.id === activeMethod)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cài Đặt Donate</h2>
              <p className="text-sm text-gray-500">Quản lý thông tin ủng hộ dự án</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/donate"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
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
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Cài đặt chung</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái trang Donate
            </label>
            <select
              value={settings.donate_enabled || 'true'}
              onChange={(e) => updateSetting('donate_enabled', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="true">Bật</option>
              <option value="false">Tắt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thông điệp cảm ơn
            </label>
            <input
              type="text"
              value={settings.donate_message || ''}
              onChange={(e) => updateSetting('donate_message', e.target.value)}
              placeholder="Cảm ơn bạn đã ủng hộ Hồi Nét!"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </Card>

      {/* Method Tabs */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {DONATE_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setActiveMethod(method.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeMethod === method.id
                  ? `${method.color} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <method.icon className="w-5 h-5" />
              {method.name}
              {settings[method.fields[0].key] && (
                <CheckCircle className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>

        {/* Method Settings */}
        {currentMethod && (
          <motion.div
            key={currentMethod.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className={`w-10 h-10 ${currentMethod.color} rounded-lg flex items-center justify-center`}>
                <currentMethod.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold">{currentMethod.name}</h4>
                <p className="text-sm text-gray-500">Cấu hình thông tin {currentMethod.name}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {currentMethod.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  
                  {field.type === 'image' ? (
                    <div className="space-y-3">
                      {/* Image Preview */}
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
                      
                      {/* Upload/Remove buttons */}
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
                            onClick={() => handleRemoveImage(field.key)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <input
                      type={field.type === 'url' ? 'url' : 'text'}
                      value={settings[field.key] || ''}
                      onChange={(e) => updateSetting(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </Card>

      {/* Preview Link */}
      <Card className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-500" />
            <div>
              <p className="font-medium">Xem trước trang Donate</p>
              <p className="text-sm text-gray-500">Kiểm tra hiển thị trước khi công khai</p>
            </div>
          </div>
          <a
            href="/donate"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Mở trang Donate
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </Card>
    </div>
  )
}
