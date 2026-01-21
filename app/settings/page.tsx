'use client'

import { useState } from 'react'
import { User, Lock, Bell, Trash2 } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn A',
    email: 'user@email.com',
    company: 'Công ty ABC'
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true
  })

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thông tin đã được cập nhật!')
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.new !== password.confirm) {
      alert('Mật khẩu mới không khớp!')
      return
    }
    alert('Mật khẩu đã được thay đổi!')
    setPassword({ current: '', new: '', confirm: '' })
  }

  const handleDeleteAccount = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      alert('Tài khoản đã được xóa')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">Cài Đặt</h1>
            <p className="text-gray-600">Quản lý thông tin tài khoản và tùy chọn</p>
          </div>

          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-text">Thông Tin Hồ Sơ</h2>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <Input
                label="Tên"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />

              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />

              <Input
                label="Công ty (Tùy chọn)"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              />

              <Button type="submit" variant="primary">
                Lưu Thay Đổi
              </Button>
            </form>
          </Card>

          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-text">Thay Đổi Mật Khẩu</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                required
              />

              <Input
                label="Mật khẩu mới"
                type="password"
                value={password.new}
                onChange={(e) => setPassword({ ...password, new: e.target.value })}
                required
              />

              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                required
              />

              <Button type="submit" variant="primary">
                Cập Nhật Mật Khẩu
              </Button>
            </form>
          </Card>

          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-text">Tùy Chọn Thông Báo</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <div>
                  <p className="font-medium text-text">Thông báo Email</p>
                  <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <div>
                  <p className="font-medium text-text">Thông báo Push</p>
                  <p className="text-sm text-gray-600">Nhận thông báo đẩy trên trình duyệt</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  className="cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <div>
                  <p className="font-medium text-text">Email Marketing</p>
                  <p className="text-sm text-gray-600">Nhận tin tức và ưu đãi</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
                  className="cursor-pointer"
                />
              </label>
            </div>
          </Card>

          <Card className="border-error">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-6 h-6 text-error" />
              <h2 className="text-xl font-bold text-error">Xóa Tài Khoản</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Sau khi xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
              Hành động này không thể hoàn tác.
            </p>

            <Button variant="secondary" onClick={handleDeleteAccount} className="border-error text-error hover:bg-error/5">
              Xóa Tài Khoản
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}
