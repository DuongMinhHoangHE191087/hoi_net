'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, AlertTriangle, Crown, RefreshCw, Key, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useGeminiKey } from '@/hooks/useGeminiKey'
import ApiKeySetup from './ApiKeySetup'

interface QuotaInfo {
  remaining: number
  monthlyLimit: number
  currentUsage: number
  periodEnd: string
  tier: 'free' | 'premium' | 'enterprise' | 'admin'
  isUnlimited?: boolean
}

interface QuotaDisplayProps {
  className?: string
  variant?: 'compact' | 'full' | 'inline'
  showUpgrade?: boolean
  showBYOK?: boolean
}

export default function QuotaDisplay({ 
  className = '', 
  variant = 'compact',
  showUpgrade = true,
  showBYOK = true
}: QuotaDisplayProps) {
  const { user, isAdmin } = useAuth()
  const { hasKey: hasBYOK, maskedKey } = useGeminiKey()
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchQuota()
  }, [user])

  const fetchQuota = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/process-images', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.quota) {
          setQuota(data.quota.unlimited ? {
            remaining: 9999,
            monthlyLimit: 9999,
            currentUsage: 0,
            periodEnd: '',
            tier: 'admin',
            isUnlimited: true
          } : data.quota)
        }
      } else {
        setError('Không thể tải thông tin quota')
      }
    } catch (err) {
      console.error('Error fetching quota:', err)
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null
  if (isAdmin) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <Crown className="w-4 h-4" />
        <span>Admin - Unlimited</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Đang tải...</span>
      </div>
    )
  }

  if (error || !quota) {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-500 ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span>{error || 'Không có dữ liệu'}</span>
      </div>
    )
  }

  const usagePercent = (quota.currentUsage / quota.monthlyLimit) * 100
  const isLow = quota.remaining <= 1
  const isEmpty = quota.remaining === 0

  // Compact variant (for header/sidebar)
  if (variant === 'compact') {
    return (
      <>
        <div className={`relative ${className}`}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isEmpty ? 'bg-red-50 border border-red-200' :
            isLow ? 'bg-yellow-50 border border-yellow-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <Sparkles className={`w-4 h-4 ${
              isEmpty ? 'text-red-500' : isLow ? 'text-yellow-500' : 'text-primary'
            }`} />
            <span className={`text-sm font-medium ${
              isEmpty ? 'text-red-700' : isLow ? 'text-yellow-700' : 'text-gray-700'
            }`}>
              {quota.remaining}/{quota.monthlyLimit}
            </span>
            
            {/* BYOK indicator */}
            {hasBYOK && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded text-xs text-green-700">
                <Key className="w-3 h-3" />
                <span>BYOK</span>
              </div>
            )}
          </div>
          
          {isEmpty && showBYOK && !hasBYOK && (
            <button
              onClick={() => setShowApiKeySetup(true)}
              className="absolute -bottom-7 left-0 text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Key className="w-3 h-3" />
              Dùng API key riêng →
            </button>
          )}
        </div>
        
        <ApiKeySetup 
          isOpen={showApiKeySetup} 
          onClose={() => setShowApiKeySetup(false)} 
        />
      </>
    )
  }

  // Inline variant (for request page)
  if (variant === 'inline') {
    return (
      <>
        <div className={`flex items-center gap-3 ${className}`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${
              isEmpty ? 'text-red-500' : isLow ? 'text-yellow-500' : 'text-primary'
            }`} />
            <span className="text-sm text-gray-600">
              Còn lại: <span className={`font-bold ${
                isEmpty ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-primary'
              }`}>{quota.remaining}</span>/{quota.monthlyLimit} lượt
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-32">
            <motion.div
              className={`h-full rounded-full ${
                isEmpty ? 'bg-red-500' :
                isLow ? 'bg-yellow-500' :
                'bg-gradient-to-r from-primary to-accent'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* BYOK status */}
          {hasBYOK && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg text-xs text-green-700">
              <CheckCircle className="w-3 h-3" />
              <span>API Key sẵn sàng</span>
            </div>
          )}
          
          {isEmpty && showBYOK && !hasBYOK && (
            <button
              onClick={() => setShowApiKeySetup(true)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
              <Key className="w-3 h-3" />
              Thêm API Key
            </button>
          )}
        </div>
        
        <ApiKeySetup 
          isOpen={showApiKeySetup} 
          onClose={() => setShowApiKeySetup(false)} 
        />
      </>
    )
  }

  // Full variant (for dashboard)
  const daysUntilReset = quota.periodEnd 
    ? Math.ceil((new Date(quota.periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <>
      <motion.div
        className={`glassmorphism-strong p-6 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quota AI Processing
          </h3>
          <div className="flex items-center gap-2">
            {hasBYOK && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                <Key className="w-3 h-3" />
                BYOK
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              quota.tier === 'premium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
              quota.tier === 'enterprise' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
              'bg-gray-100 text-gray-700'
            }`}>
              {quota.tier === 'free' ? 'Miễn phí' : quota.tier}
            </span>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Đã sử dụng tháng này</span>
            <span className={`font-bold ${
              isEmpty ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-text'
            }`}>
              {quota.currentUsage}/{quota.monthlyLimit} lượt
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isEmpty ? 'bg-red-500' :
                isLow ? 'bg-yellow-500' :
                'bg-gradient-to-r from-primary to-accent'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usagePercent, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Status message */}
        {isEmpty ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Bạn đã hết lượt sử dụng!</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {hasBYOK 
                ? 'Bạn có thể sử dụng API key riêng để tiếp tục.' 
                : `Quota sẽ reset sau ${daysUntilReset} ngày hoặc thêm API key riêng.`}
            </p>
          </div>
        ) : isLow ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Sắp hết lượt!</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Còn {quota.remaining} lượt. Reset sau {daysUntilReset} ngày
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Còn {quota.remaining} lượt • Reset sau {daysUntilReset} ngày
          </p>
        )}

        {/* BYOK Status or Setup */}
        {showBYOK && (
          hasBYOK ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <span className="font-medium">API Key đã thiết lập</span>
                    <p className="text-sm text-green-600">{maskedKey}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApiKeySetup(true)}
                  className="text-sm text-green-600 hover:underline"
                >
                  Quản lý
                </button>
              </div>
            </div>
          ) : isEmpty ? (
            <motion.button
              onClick={() => setShowApiKeySetup(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Key className="w-5 h-5" />
              Thêm API Key Gemini - Dùng không giới hạn
            </motion.button>
          ) : null
        )}

        {/* Upgrade CTA */}
        {showUpgrade && quota.tier === 'free' && !isEmpty && (
          <Link href="/pricing">
            <motion.button
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Crown className="w-5 h-5" />
              Nâng cấp Premium - 50 lượt/tháng
            </motion.button>
          </Link>
        )}
      </motion.div>
      
      <ApiKeySetup 
        isOpen={showApiKeySetup} 
        onClose={() => setShowApiKeySetup(false)} 
      />
    </>
  )
}

