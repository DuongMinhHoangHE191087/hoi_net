'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Coffee, 
  Gift, 
  Star, 
  Copy, 
  Check, 
  ExternalLink,
  Smartphone,
  CreditCard,
  Building2,
  Globe,
  Sparkles,
  Users,
  Image as ImageIcon,
  ChevronLeft
} from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useSiteSettings, DEFAULT_SITE_SETTINGS } from '@/hooks/useSiteSettings'
import toast, { Toaster } from 'react-hot-toast'

// Donation methods configuration
const DONATION_METHODS = [
  {
    id: 'momo',
    name: 'MoMo',
    icon: Smartphone,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    description: 'Chuyển tiền qua ví MoMo',
    qrSettingKey: 'donate_momo_qr',
    accountSettingKey: 'donate_momo_account',
    nameSettingKey: 'donate_momo_name',
    defaultAccount: '0394497949',
    defaultName: 'DUONG MINH HOANG'
  },
  {
    id: 'bank',
    name: 'Ngân hàng',
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'Chuyển khoản ngân hàng',
    qrSettingKey: 'donate_bank_qr',
    accountSettingKey: 'donate_bank_account',
    nameSettingKey: 'donate_bank_name',
    bankNameKey: 'donate_bank_bank_name',
    defaultAccount: '0394497949',
    defaultName: 'DUONG MINH HOANG',
    defaultBankName: 'MB Bank'
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: Smartphone,
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-600',
    description: 'Chuyển tiền qua ZaloPay',
    qrSettingKey: 'donate_zalopay_qr',
    accountSettingKey: 'donate_zalopay_account',
    nameSettingKey: 'donate_zalopay_name',
    defaultAccount: '0394497949',
    defaultName: 'DUONG MINH HOANG'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: Globe,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    description: 'Ủng hộ quốc tế qua PayPal',
    linkSettingKey: 'donate_paypal_link',
    defaultLink: 'https://paypal.me/hoinet'
  },
  {
    id: 'buymeacoffee',
    name: 'Buy Me a Coffee',
    icon: Coffee,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    description: 'Mời team một ly cà phê',
    linkSettingKey: 'donate_bmc_link',
    defaultLink: 'https://buymeacoffee.com/hoinet'
  }
]

// Suggested amounts
const SUGGESTED_AMOUNTS = [
  { amount: 20000, label: '20K', emoji: '☕' },
  { amount: 50000, label: '50K', emoji: '🍜' },
  { amount: 100000, label: '100K', emoji: '🎁' },
  { amount: 200000, label: '200K', emoji: '💝' },
  { amount: 500000, label: '500K', emoji: '🌟' },
  { amount: 1000000, label: '1M', emoji: '🚀' },
]

export default function DonatePage() {
  const { data: settings = {} } = useSiteSettings()
  const [selectedMethod, setSelectedMethod] = useState<string | null>('momo')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Đã sao chép!', { icon: '📋' })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      toast.error('Không thể sao chép')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const currentMethod = DONATION_METHODS.find(m => m.id === selectedMethod)

  // Get values from settings or defaults
  const getValue = (key: string, defaultValue: string) => {
    return (settings as Record<string, string>)[key] || defaultValue
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Toaster position="top-center" />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại trang chủ
            </Link>

            <div className="flex justify-center mb-6">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-3xl flex items-center justify-center shadow-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-10 h-10 text-white" fill="white" />
              </motion.div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Ủng Hộ <span className="text-primary">Hồi Nét</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Dự án phi lợi nhuận giúp khôi phục ảnh cũ miễn phí cho cộng đồng. 
              Mỗi đóng góp của bạn giúp chúng tôi duy trì và phát triển dịch vụ.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
              <div className="bg-card border rounded-xl p-4">
                <div className="flex justify-center mb-2">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">1000+</p>
                <p className="text-xs text-muted-foreground">Ảnh đã phục hồi</p>
              </div>
              <div className="bg-card border rounded-xl p-4">
                <div className="flex justify-center mb-2">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground">Người dùng</p>
              </div>
              <div className="bg-card border rounded-xl p-4">
                <div className="flex justify-center mb-2">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground">Miễn phí</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Donation Methods */}
      <section className="pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Method Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {DONATION_METHODS.map((method) => (
              <motion.button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  selectedMethod === method.id
                    ? `bg-gradient-to-r ${method.color} text-white shadow-lg`
                    : `${method.bgColor} ${method.textColor} hover:shadow-md`
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <method.icon className="w-5 h-5" />
                {method.name}
              </motion.button>
            ))}
          </div>

          {/* Selected Method Content */}
          {currentMethod && (
            <motion.div
              key={currentMethod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-2xl p-6 md:p-8 shadow-lg"
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* QR Code Section */}
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 ${currentMethod.bgColor} ${currentMethod.textColor} px-4 py-2 rounded-full text-sm font-medium mb-6`}>
                    <currentMethod.icon className="w-4 h-4" />
                    {currentMethod.name}
                  </div>

                  {/* QR Image or Link Button */}
                  {currentMethod.linkSettingKey ? (
                    // External link methods (PayPal, Buy Me a Coffee)
                    <div className="space-y-4">
                      <div className={`w-48 h-48 mx-auto ${currentMethod.bgColor} rounded-2xl flex items-center justify-center`}>
                        <currentMethod.icon className={`w-20 h-20 ${currentMethod.textColor}`} />
                      </div>
                      <a
                        href={getValue(currentMethod.linkSettingKey, currentMethod.defaultLink || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${currentMethod.color} text-white rounded-xl font-medium hover:shadow-lg transition-all`}
                      >
                        <ExternalLink className="w-5 h-5" />
                        Mở {currentMethod.name}
                      </a>
                    </div>
                  ) : (
                    // QR code methods (MoMo, Bank, ZaloPay)
                    <div className="space-y-4">
                      <div className="w-64 h-64 mx-auto bg-white rounded-2xl p-4 shadow-inner border-2 border-dashed border-gray-200">
                        {getValue(currentMethod.qrSettingKey!, '') ? (
                          <img
                            src={getValue(currentMethod.qrSettingKey!, '')}
                            alt={`QR ${currentMethod.name}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <CreditCard className="w-12 h-12 mb-2" />
                            <p className="text-sm">QR chưa được cấu hình</p>
                            <p className="text-xs">Vui lòng liên hệ Admin</p>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quét mã QR bằng ứng dụng {currentMethod.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Account Info Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Thông tin chuyển khoản</h3>

                  {/* Account Details */}
                  {currentMethod.accountSettingKey && (
                    <div className="space-y-4">
                      {/* Bank Name (if applicable) */}
                      {currentMethod.bankNameKey && (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <p className="text-sm text-muted-foreground mb-1">Ngân hàng</p>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-lg">
                              {getValue(currentMethod.bankNameKey, currentMethod.defaultBankName || '')}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Account Number */}
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">Số tài khoản / Số điện thoại</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-lg font-mono">
                            {getValue(currentMethod.accountSettingKey, currentMethod.defaultAccount || '')}
                          </p>
                          <button
                            onClick={() => handleCopy(
                              getValue(currentMethod.accountSettingKey!, currentMethod.defaultAccount || ''),
                              'account'
                            )}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedField === 'account' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-white hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            {copiedField === 'account' ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Account Name */}
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">Tên tài khoản</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-lg">
                            {getValue(currentMethod.nameSettingKey!, currentMethod.defaultName || '')}
                          </p>
                          <button
                            onClick={() => handleCopy(
                              getValue(currentMethod.nameSettingKey!, currentMethod.defaultName || ''),
                              'name'
                            )}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedField === 'name' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-white hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            {copiedField === 'name' ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Suggested Amount */}
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-3">Nội dung chuyển khoản</p>
                        <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                          <p className="font-medium text-primary">Ung ho Hoi Net</p>
                          <button
                            onClick={() => handleCopy('Ung ho Hoi Net', 'content')}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedField === 'content' 
                                ? 'bg-green-100 text-green-600' 
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            {copiedField === 'content' ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggested Amounts */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Gợi ý mức ủng hộ</p>
                    <div className="grid grid-cols-3 gap-2">
                      {SUGGESTED_AMOUNTS.map((item) => (
                        <button
                          key={item.amount}
                          onClick={() => handleCopy(String(item.amount), `amount-${item.amount}`)}
                          className={`p-3 rounded-xl border text-center transition-all hover:shadow-md hover:border-primary ${
                            copiedField === `amount-${item.amount}` ? 'border-green-500 bg-green-50' : 'bg-white'
                          }`}
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <p className="font-bold text-lg">{item.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.amount).replace('₫', 'đ')}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Why Donate Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Đóng góp của bạn giúp chúng tôi
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border rounded-xl p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Globe className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Duy trì server</h3>
              <p className="text-sm text-muted-foreground">
                Chi phí hosting, domain và các dịch vụ cloud để website luôn hoạt động
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-xl p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Nâng cấp AI</h3>
              <p className="text-sm text-muted-foreground">
                Chi phí API AI để cải thiện chất lượng khôi phục ảnh
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card border rounded-xl p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Phục vụ cộng đồng</h3>
              <p className="text-sm text-muted-foreground">
                Giữ dịch vụ miễn phí cho mọi người, đặc biệt các gia đình có ảnh cũ
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 rounded-2xl p-8"
          >
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" fill="currentColor" />
            <h2 className="text-2xl font-bold mb-2">Cảm ơn bạn!</h2>
            <p className="text-muted-foreground mb-4">
              Mỗi đóng góp dù nhỏ đều giúp chúng tôi tiếp tục sứ mệnh bảo tồn ký ức cho cộng đồng.
              Hồi Nét cam kết sử dụng 100% tiền ủng hộ cho việc phát triển dịch vụ.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Về trang chủ
              </Link>
              <Link
                href="/contact"
                className="px-6 py-2 border border-primary text-primary rounded-xl font-medium hover:bg-primary/10 transition-colors"
              >
                Liên hệ
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
