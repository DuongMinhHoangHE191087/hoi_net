'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { db } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    mission: '',
    vision: '',
    about: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const [mission, vision, about] = await Promise.all([
        db.getSiteSetting('mission'),
        db.getSiteSetting('vision'),
        db.getSiteSetting('about')
      ])

      setSettings({
        mission: mission?.value || '',
        vision: vision?.value || '',
        about: about?.value || ''
      })
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Không thể tải cài đặt. Vui lòng chạy database migration trước.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        db.updateSiteSetting('mission', settings.mission),
        db.updateSiteSetting('vision', settings.vision),
        db.updateSiteSetting('about', settings.about)
      ])
      toast.success('Đã lưu thay đổi thành công!')
    } catch (err) {
      console.error('Error saving settings:', err)
      toast.error('Lỗi khi lưu cài đặt. Vui lòng kiểm tra database.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-600">Đang tải cài đặt...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-700 mb-4">{error}</p>
        <p className="text-sm text-gray-500 mb-4">
          Chạy file migration <code className="bg-gray-100 px-2 py-1 rounded">011_complete_system_upgrade.sql</code> trong Supabase SQL Editor
        </p>
        <Button onClick={loadSettings}>Thử lại</Button>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Cài Đặt Website</h2>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <h3 className="text-xl font-bold text-text mb-4">Sứ Mệnh</h3>
          <textarea
            value={settings.mission}
            onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
            rows={4}
            placeholder="Nhập sứ mệnh của tổ chức..."
          />
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-text mb-4">Tầm Nhìn</h3>
          <textarea
            value={settings.vision}
            onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
            rows={4}
            placeholder="Nhập tầm nhìn của tổ chức..."
          />
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-text mb-4">Về Chúng Tôi</h3>
          <textarea
            value={settings.about}
            onChange={(e) => setSettings({ ...settings, about: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
            rows={4}
            placeholder="Nhập thông tin giới thiệu..."
          />
        </Card>
      </div>
    </div>
  )
}

