'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Facebook, Camera, Save,
  ArrowLeft, Loader2, CheckCircle, AlertCircle
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { profileSchema, type ProfileInput } from '@/lib/validation'
import { sanitizeInput, validatePhone, validateFacebookURL } from '@/lib/security'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { FullScreenLoading } from '@/components/UniversalLoading'

interface UserProfile {
  id: string
  full_name: string
  phone: string
  address: string
  facebook_url: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, updateProfile } = useAuth()

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    facebook_url: '',
  })

  const [avatarUrl, setAvatarUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Define loadProfile BEFORE using it in useEffect
  const loadProfile = useCallback(async () => {
    try {
      // Try to fetch existing profile from database
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine for new users
        console.error('Error loading profile:', error)
      }

      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          facebook_url: profile.facebook_url || '',
        })
        setAvatarUrl(profile.avatar_url || '')
      } else {
        // No profile yet, use metadata from auth
        setFormData({
          full_name: user?.user_metadata?.full_name || '',
          phone: '',
          address: '',
          facebook_url: '',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Không thể tải thông tin hồ sơ')
    } finally {
      setIsReady(true)
    }
  }, [user?.id, user?.user_metadata?.full_name])

  // Load user profile
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile')
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, authLoading, router, loadProfile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (50MB max for testing)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Kích thước ảnh không được vượt quá 50MB')
      return
    }

    try {
      setUploading(true)

      // Upload to Supabase Storage (bucket: avatars)
      const fileExt = file.name.split('.').pop() || 'png'
      const fileName = `avatar-${Date.now()}.${fileExt}`
      // Path structure: {userId}/{fileName} - matches RLS policy
      const filePath = `${user?.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      toast.success('Tải ảnh đại diện thành công!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Không thể tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)

    try {
      // Sanitize inputs
      const sanitized = {
        full_name: sanitizeInput(formData.full_name, 100),
        phone: formData.phone.trim(),
        address: sanitizeInput(formData.address, 200),
        facebook_url: formData.facebook_url.trim(),
      }

      // Validate with Zod
      const result = profileSchema.safeParse(sanitized)

      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        result.error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
        toast.error('Vui lòng kiểm tra lại thông tin')
        return
      }

      // Additional validation
      if (sanitized.phone && !validatePhone(sanitized.phone)) {
        setErrors({ phone: 'Số điện thoại không hợp lệ' })
        toast.error('Số điện thoại không hợp lệ')
        return
      }

      if (sanitized.facebook_url && !validateFacebookURL(sanitized.facebook_url)) {
        setErrors({ facebook_url: 'URL Facebook không hợp lệ' })
        toast.error('URL Facebook không hợp lệ')
        return
      }

      // Upsert profile to database
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          full_name: result.data.full_name,
          phone: result.data.phone || null,
          address: result.data.address || null,
          facebook_url: result.data.facebook_url || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (upsertError) throw upsertError

      // Update auth metadata
      await updateProfile({
        full_name: result.data.full_name,
      })

      toast.success('Cập nhật hồ sơ thành công!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Không thể cập nhật hồ sơ')
    } finally {
      setSaving(false)
    }
  }

  const getUserInitials = () => {
    if (formData.full_name) {
      const names = formData.full_name.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return user?.email?.[0].toUpperCase() || 'U'
  }

  if (authLoading || !isReady) {
    return <FullScreenLoading message="Đang tải hồ sơ..." />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen gradient-mesh py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <h1 className="text-4xl font-bold gradient-text mb-2">Hồ Sơ Cá Nhân</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glassmorphism-strong p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover shadow-glow-pink"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-glow-pink">
                    {getUserInitials()}
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-3 bg-white rounded-full shadow-xl cursor-pointer hover:scale-110 transition-transform group"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-primary" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Click vào biểu tượng camera để thay đổi ảnh đại diện
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-glass pl-12 bg-gray-100/50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={`input-glass pl-12 ${errors.full_name ? 'border-2 border-red-500' : ''}`}
                  required
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số Điện Thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`input-glass pl-12 ${errors.phone ? 'border-2 border-red-500' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Số điện thoại Việt Nam (10-11 chữ số, bắt đầu bằng 0)
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Địa Chỉ
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  placeholder="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className={`input-glass pl-12 resize-none ${errors.address ? 'border-2 border-red-500' : ''}`}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.address}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Địa chỉ chi tiết (10-200 ký tự)
              </p>
            </div>

            {/* Facebook URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Facebook
              </label>
              <div className="relative">
                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://facebook.com/yourprofile"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className={`input-glass pl-12 ${errors.facebook_url ? 'border-2 border-red-500' : ''}`}
                />
              </div>
              {errors.facebook_url && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.facebook_url}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Link đến trang Facebook cá nhân
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 pt-6">
              <motion.button
                type="submit"
                disabled={saving}
                className="btn-glass-primary flex-1 py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Lưu Thay Đổi
                    </>
                  )}
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="btn-glass-secondary px-8 py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Hủy
              </motion.button>
            </div>
          </form>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Bảo vệ thông tin cá nhân</p>
                <p className="text-xs">
                  Thông tin của bạn được bảo mật và chỉ được sử dụng để liên hệ khi cần thiết.
                  Chúng tôi không chia sẻ thông tin của bạn với bên thứ ba.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

