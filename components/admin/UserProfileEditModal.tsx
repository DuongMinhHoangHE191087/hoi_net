'use client'

import { useState } from 'react'
import { X, Loader2, Save, User as UserIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import AvatarUpload from '@/components/ui/AvatarUpload'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { authFetch } from '@/lib/auth-fetch'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'moderator' | 'admin'
  is_blocked: boolean
}

interface UserProfileEditModalProps {
  user: UserProfile
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UserProfileEditModal({
  user,
  isOpen,
  onClose,
  onSuccess
}: UserProfileEditModalProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    phone: user.phone || '',
    avatar_url: user.avatar_url || '',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await authFetch.patch(`/api/admin/users/${user.id}`, formData)
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to update profile')
      }

      toast.success('Đã cập nhật hồ sơ')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật hồ sơ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-primary" />
                Chỉnh Sửa Hồ Sơ
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                disabled={saving || uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Email:</p>
              <p className="font-semibold text-gray-800">{user.email}</p>
            </div>

            <div className="space-y-4">
              <AvatarUpload
                label="Avatar"
                currentAvatar={formData.avatar_url}
                onUploadSuccess={(url) => setFormData({ ...formData, avatar_url: url })}
                onRemove={() => setFormData({ ...formData, avatar_url: '' })}
                size="lg"
                uploading={uploading}
                setUploading={setUploading}
              />

              <Input
                label="Họ tên"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nguyễn Văn A"
              />

              <Input
                label="Số điện thoại"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0123 456 789"
              />
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={saving || uploading}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {uploading ? 'Đang tải ảnh...' : saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

