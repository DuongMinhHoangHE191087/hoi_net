'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Phone, Facebook, ArrowRight, Loader2, CheckCircle,
  AlertCircle, Heart, Shield, MessageCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { validatePhone, validateFacebookURL } from '@/lib/security'
import toast from 'react-hot-toast'
import Link from 'next/link'

function ContactSetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  
  const [saving, setSaving] = useState(false)
  const [phone, setPhone] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [errors, setErrors] = useState<{ phone?: string; facebook?: string }>({})
  const [activeField, setActiveField] = useState<'phone' | 'facebook' | null>(null)
  
  const isFromRegister = searchParams.get('from') === 'register'
  const redirectTo = searchParams.get('redirect') || '/requests'

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/contact-setup')
    }
  }, [user, authLoading, router])

  // Check if profile already complete
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('user_profiles')
          .select('phone, facebook_url')
          .eq('id', user.id)
          .single()
        
        if (data?.phone || data?.facebook_url) {
          // Already has contact info, redirect
          router.push(redirectTo)
        }
      }
    }
    checkExistingProfile()
  }, [user?.id, router, redirectTo])

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as Vietnamese phone: 0xxx xxx xxx
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
    setErrors(prev => ({ ...prev, phone: undefined }))
  }

  const handleFacebookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFacebookUrl(e.target.value)
    setErrors(prev => ({ ...prev, facebook: undefined }))
  }

  const validateForm = () => {
    const newErrors: { phone?: string; facebook?: string } = {}
    const cleanPhone = phone.replace(/\s/g, '')
    
    // Must have at least one
    if (!cleanPhone && !facebookUrl) {
      newErrors.phone = 'Vui lòng nhập ít nhất một thông tin liên hệ'
      return newErrors
    }

    // Validate phone if provided
    if (cleanPhone && !validatePhone(cleanPhone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912 345 678)'
    }

    // Validate Facebook if provided
    if (facebookUrl && !validateFacebookURL(facebookUrl)) {
      newErrors.facebook = 'Link Facebook không hợp lệ'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    
    try {
      const cleanPhone = phone.replace(/\s/g, '')
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          phone: cleanPhone || null,
          facebook_url: facebookUrl || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (error) throw error

      toast.success('Đã lưu thông tin liên hệ!')
      router.push(redirectTo)
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error('Không thể lưu thông tin. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => {
    toast('Bạn có thể cập nhật sau trong phần Hồ sơ', { icon: '💡' })
    router.push(redirectTo)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Thông Tin Liên Hệ
          </h1>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Để chúng tôi có thể <span className="font-semibold text-primary">gửi trả ảnh đã xử lý</span> và thông báo tiến độ cho bạn, 
            vui lòng cung cấp ít nhất <span className="font-semibold">một thông tin liên hệ</span>.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-primary" />
                Số Điện Thoại
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onFocus={() => setActiveField('phone')}
                  onBlur={() => setActiveField(null)}
                  placeholder="0912 345 678"
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-lg
                    ${activeField === 'phone' 
                      ? 'border-primary ring-4 ring-primary/10' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${errors.phone ? 'border-red-400 ring-4 ring-red-50' : ''}
                    focus:outline-none
                  `}
                  maxLength={14}
                />
                {phone && !errors.phone && validatePhone(phone.replace(/\s/g, '')) && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.phone && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </motion.p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            {/* Facebook Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook Profile
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={handleFacebookChange}
                  onFocus={() => setActiveField('facebook')}
                  onBlur={() => setActiveField(null)}
                  placeholder="https://facebook.com/yourprofile"
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-200
                    ${activeField === 'facebook' 
                      ? 'border-blue-500 ring-4 ring-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${errors.facebook ? 'border-red-400 ring-4 ring-red-50' : ''}
                    focus:outline-none
                  `}
                />
                {facebookUrl && !errors.facebook && validateFacebookURL(facebookUrl) && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.facebook && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.facebook}
                </motion.p>
              )}
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">Tại sao cần thông tin liên hệ?</p>
                  <ul className="mt-1 text-xs text-amber-700 space-y-1">
                    <li>✓ Nhận ảnh đã xử lý nhanh chóng</li>
                    <li>✓ Được thông báo khi có cập nhật</li>
                    <li>✓ Hỗ trợ tư vấn khi cần</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Thông tin của bạn được bảo mật và chỉ dùng để liên lạc.</span>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-medium
                  hover:bg-gray-50 transition-colors"
              >
                Để sau
              </button>
              <button
                type="submit"
                disabled={saving || (!phone && !facebookUrl)}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary 
                  text-white font-semibold shadow-lg shadow-primary/25
                  hover:shadow-xl hover:shadow-primary/30 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                  flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    Tiếp tục
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Footer Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          Bạn có thể cập nhật thông tin này sau trong{' '}
          <Link href="/profile" className="text-primary hover:underline font-medium">
            Hồ sơ cá nhân
          </Link>
        </motion.p>
      </div>
    </div>
  )
}

export default function ContactSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ContactSetupContent />
    </Suspense>
  )
}
