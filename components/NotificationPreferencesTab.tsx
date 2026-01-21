'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Smartphone, Save } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useNotificationPreferences, useUpdateNotificationPreferences, useNotificationPermission } from '@/hooks/useNotifications'
import toast from 'react-hot-toast'

export default function NotificationPreferencesTab() {
  const { data: preferences, isLoading } = useNotificationPreferences()
  const updatePreferences = useUpdateNotificationPreferences()
  const { permission, requestPermission, isSupported } = useNotificationPermission()

  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    request_updates: true,
    request_delivered: true,
    system_announcements: true,
    marketing_emails: false,
    email_frequency: 'instant' as 'instant' | 'daily' | 'weekly' | 'never'
  })

  useEffect(() => {
    if (preferences) {
      setSettings({
        email_notifications: preferences.email_notifications,
        push_notifications: preferences.push_notifications,
        request_updates: preferences.request_updates,
        request_delivered: preferences.request_delivered,
        system_announcements: preferences.system_announcements,
        marketing_emails: preferences.marketing_emails,
        email_frequency: preferences.email_frequency
      })
    }
  }, [preferences])

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    try {
      await updatePreferences.mutateAsync(settings)
      toast.success('Lưu cài đặt thành công!')
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt')
    }
  }

  const handleRequestBrowserPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      toast.success('Đã bật thông báo trình duyệt!')
      setSettings(prev => ({ ...prev, push_notifications: true }))
    } else {
      toast.error('Bạn đã từ chối quyền thông báo')
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cài Đặt Thông Báo</h2>
        <p className="text-gray-600 mt-1">Quản lý cách bạn nhận thông báo</p>
      </div>

      {/* Browser Notifications */}
      {isSupported && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-pink-500" />
            Thông Báo Trình Duyệt
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Cho phép thông báo trên trình duyệt</p>
                <p className="text-sm text-gray-600">Nhận thông báo realtime ngay cả khi không mở tab</p>
              </div>
              {permission === 'granted' ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Đã bật
                </span>
              ) : permission === 'denied' ? (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                  Đã chặn
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestBrowserPermission}
                >
                  Bật thông báo
                </Button>
              )}
            </div>

            {permission === 'denied' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                Bạn đã chặn thông báo. Vui lòng vào cài đặt trình duyệt để bật lại.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Email Notifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-pink-500" />
          Thông Báo Email
        </h3>

        <div className="space-y-4">
          {/* Email Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Nhận email thông báo</p>
              <p className="text-sm text-gray-600">Gửi thông báo quan trọng qua email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={() => handleToggle('email_notifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {/* Email Frequency */}
          {settings.email_notifications && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tần suất gửi email
              </label>
              <select
                value={settings.email_frequency}
                onChange={(e) => setSettings(prev => ({ ...prev, email_frequency: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="instant">Ngay lập tức</option>
                <option value="daily">Tổng hợp hàng ngày</option>
                <option value="weekly">Tổng hợp hàng tuần</option>
                <option value="never">Không bao giờ</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Notification Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-pink-500" />
          Loại Thông Báo
        </h3>

        <div className="space-y-4">
          {/* Request Updates */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Cập nhật yêu cầu</p>
              <p className="text-sm text-gray-600">Thông báo khi yêu cầu của bạn được cập nhật trạng thái</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.request_updates}
                onChange={() => handleToggle('request_updates')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {/* Request Delivered */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Kết quả sẵn sàng</p>
              <p className="text-sm text-gray-600">Thông báo khi ảnh đã được xử lý xong</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.request_delivered}
                onChange={() => handleToggle('request_delivered')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {/* System Announcements */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Thông báo hệ thống</p>
              <p className="text-sm text-gray-600">Các thông báo quan trọng từ hệ thống</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.system_announcements}
                onChange={() => handleToggle('system_announcements')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Email marketing</p>
              <p className="text-sm text-gray-600">Nhận tin tức, khuyến mãi và cập nhật sản phẩm</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.marketing_emails}
                onChange={() => handleToggle('marketing_emails')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={updatePreferences.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          Lưu Cài Đặt
        </Button>
      </div>
    </div>
  )
}
