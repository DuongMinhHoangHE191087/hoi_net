'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, ShieldCheck, ShieldOff, Clock, Users, Lock, 
  Save, Loader2, RefreshCw, AlertTriangle, CheckCircle,
  Key, Mail, FileText, LogIn, UserPlus, Settings
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface CaptchaSettings {
  enabled: boolean
  threshold_attempts: number
  forms: {
    login: boolean
    register: boolean
    forgot_password: boolean
    request_form: boolean
  }
}

interface RateLimitSettings {
  enabled: boolean
  login_max_attempts: number
  login_window_minutes: number
  login_block_minutes: number
  register_max_per_hour: number
  register_max_per_day: number
  request_max_per_hour: number
  request_max_per_day: number
  password_reset_max_per_hour: number
}

const DEFAULT_CAPTCHA: CaptchaSettings = {
  enabled: true,
  threshold_attempts: 3,
  forms: { login: true, register: true, forgot_password: true, request_form: true }
}

const DEFAULT_RATE_LIMIT: RateLimitSettings = {
  enabled: true,
  login_max_attempts: 5,
  login_window_minutes: 15,
  login_block_minutes: 30,
  register_max_per_hour: 5,
  register_max_per_day: 10,
  request_max_per_hour: 10,
  request_max_per_day: 50,
  password_reset_max_per_hour: 3,
}

export default function AdminSecuritySettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [captcha, setCaptcha] = useState<CaptchaSettings>(DEFAULT_CAPTCHA)
  const [rateLimit, setRateLimit] = useState<RateLimitSettings>(DEFAULT_RATE_LIMIT)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/security-settings', {
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.captcha) setCaptcha({ ...DEFAULT_CAPTCHA, ...data.captcha })
        if (data.rateLimit) setRateLimit({ ...DEFAULT_RATE_LIMIT, ...data.rateLimit })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Không thể tải cài đặt bảo mật')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/security-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captcha, rateLimit })
      })

      if (res.ok) {
        toast.success('Đã lưu cài đặt bảo mật')
        setHasChanges(false)
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast.error('Không thể lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const updateCaptcha = (key: keyof CaptchaSettings, value: any) => {
    setCaptcha(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateCaptchaForm = (form: keyof CaptchaSettings['forms'], value: boolean) => {
    setCaptcha(prev => ({
      ...prev,
      forms: { ...prev.forms, [form]: value }
    }))
    setHasChanges(true)
  }

  const updateRateLimit = (key: keyof RateLimitSettings, value: any) => {
    setRateLimit(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Bảo Mật & Giới Hạn
          </h2>
          <p className="text-gray-600 mt-1">
            Cấu hình captcha và giới hạn request để bảo vệ hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={loadSettings}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Bạn có thay đổi chưa lưu</span>
        </motion.div>
      )}

      {/* CAPTCHA Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${captcha.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              {captcha.enabled ? (
                <ShieldCheck className="w-5 h-5 text-green-600" />
              ) : (
                <ShieldOff className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-text">hCaptcha</h3>
              <p className="text-sm text-gray-500">Bảo vệ chống bot và spam</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={captcha.enabled}
              onChange={(e) => updateCaptcha('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {captcha.enabled && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {/* Threshold */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-text">Số lần thất bại trước khi hiện captcha</label>
                <p className="text-sm text-gray-500">Captcha sẽ hiện sau số lần thất bại này</p>
              </div>
              <Input
                type="number"
                min={0}
                max={10}
                value={captcha.threshold_attempts}
                onChange={(e) => updateCaptcha('threshold_attempts', parseInt(e.target.value) || 0)}
                className="w-20 text-center"
              />
            </div>

            {/* Forms */}
            <div>
              <label className="font-medium text-text block mb-3">Áp dụng cho form</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'login', label: 'Đăng nhập', icon: LogIn },
                  { key: 'register', label: 'Đăng ký', icon: UserPlus },
                  { key: 'forgot_password', label: 'Quên mật khẩu', icon: Key },
                  { key: 'request_form', label: 'Gửi yêu cầu', icon: FileText },
                ].map(({ key, label, icon: Icon }) => (
                  <label
                    key={key}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors
                      ${captcha.forms[key as keyof CaptchaSettings['forms']]
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={captcha.forms[key as keyof CaptchaSettings['forms']]}
                      onChange={(e) => updateCaptchaForm(key as keyof CaptchaSettings['forms'], e.target.checked)}
                      className="sr-only"
                    />
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                    {captcha.forms[key as keyof CaptchaSettings['forms']] && (
                      <CheckCircle className="w-4 h-4 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* hCaptcha Site Key Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Lưu ý:</strong> Đảm bảo đã cấu hình <code>NEXT_PUBLIC_HCAPTCHA_SITE_KEY</code> và <code>HCAPTCHA_SECRET_KEY</code> trong file <code>.env.local</code>
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Rate Limit Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${rateLimit.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Clock className={`w-5 h-5 ${rateLimit.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-text">Giới Hạn Request</h3>
              <p className="text-sm text-gray-500">Bảo vệ chống brute force và spam</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rateLimit.enabled}
              onChange={(e) => updateRateLimit('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {rateLimit.enabled && (
          <div className="space-y-6 pt-4 border-t border-gray-100">
            {/* Login Limits */}
            <div>
              <h4 className="font-medium text-text flex items-center gap-2 mb-3">
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Số lần thử tối đa</label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={rateLimit.login_max_attempts}
                    onChange={(e) => updateRateLimit('login_max_attempts', parseInt(e.target.value) || 5)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Cửa sổ thời gian (phút)</label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={rateLimit.login_window_minutes}
                    onChange={(e) => updateRateLimit('login_window_minutes', parseInt(e.target.value) || 15)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Thời gian khóa (phút)</label>
                  <Input
                    type="number"
                    min={1}
                    max={1440}
                    value={rateLimit.login_block_minutes}
                    onChange={(e) => updateRateLimit('login_block_minutes', parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>
            </div>

            {/* Register Limits */}
            <div>
              <h4 className="font-medium text-text flex items-center gap-2 mb-3">
                <UserPlus className="w-4 h-4" />
                Đăng ký
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Tối đa mỗi giờ (mỗi IP)</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={rateLimit.register_max_per_hour}
                    onChange={(e) => updateRateLimit('register_max_per_hour', parseInt(e.target.value) || 5)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Tối đa mỗi ngày (mỗi IP)</label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={rateLimit.register_max_per_day}
                    onChange={(e) => updateRateLimit('register_max_per_day', parseInt(e.target.value) || 10)}
                  />
                </div>
              </div>
            </div>

            {/* Request Form Limits */}
            <div>
              <h4 className="font-medium text-text flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                Gửi yêu cầu
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Tối đa mỗi giờ (mỗi user)</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={rateLimit.request_max_per_hour}
                    onChange={(e) => updateRateLimit('request_max_per_hour', parseInt(e.target.value) || 10)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Tối đa mỗi ngày (mỗi user)</label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={rateLimit.request_max_per_day}
                    onChange={(e) => updateRateLimit('request_max_per_day', parseInt(e.target.value) || 50)}
                  />
                </div>
              </div>
            </div>

            {/* Password Reset Limits */}
            <div>
              <h4 className="font-medium text-text flex items-center gap-2 mb-3">
                <Key className="w-4 h-4" />
                Khôi phục mật khẩu
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Tối đa mỗi giờ (mỗi email)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={rateLimit.password_reset_max_per_hour}
                    onChange={(e) => updateRateLimit('password_reset_max_per_hour', parseInt(e.target.value) || 3)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
