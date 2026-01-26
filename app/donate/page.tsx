'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
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
  ChevronLeft,
  FileText,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import toast, { Toaster } from 'react-hot-toast'

// Animation variants - đồng bộ với các trang khác
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
}

// Donation methods configuration
const DONATION_METHODS = [
  {
    id: 'momo',
    name: 'MoMo',
    icon: Smartphone,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
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
    borderColor: 'border-blue-200',
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
    borderColor: 'border-sky-200',
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
    borderColor: 'border-indigo-200',
    linkSettingKey: 'donate_paypal_link',
    defaultLink: ''
  },
  {
    id: 'custom',
    name: 'Hỗ trợ khác',
    icon: Heart,
    color: 'from-rose-500 to-orange-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    isCustomContent: true,
    titleSettingKey: 'donate_custom_title',
    contentSettingKey: 'donate_custom_content',
    enabledSettingKey: 'donate_custom_enabled'
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
  const [selectedMethod, setSelectedMethod] = useState<string>('momo')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Get value from settings with fallback
  const getValue = (key: string, defaultValue: string = '') => {
    return (settings as Record<string, string>)[key] || defaultValue
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Đã sao chép!', { icon: '📋' })
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error('Không thể sao chép')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
  }

  const currentMethod = DONATION_METHODS.find(m => m.id === selectedMethod)

  // Check if donate page is enabled
  if (getValue('donate_enabled', 'true') === 'false') {
    return (
      <div className="min-h-screen gradient-mesh">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-600">Trang Donate tạm đóng</h1>
            <p className="text-gray-500 mt-2">Vui lòng quay lại sau</p>
            <Link href="/" className="mt-4 inline-block text-primary hover:underline">
              Về trang chủ
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Animated background - đồng bộ với các trang khác */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại trang chủ
              </Link>
            </motion.div>

            <motion.div 
              variants={scaleIn}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 bg-gradient-to-br from-pink-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-12 h-12 text-white" fill="white" />
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              <span className="gradient-text">{getValue('donate_hero_title', 'Ủng Hộ Hồi Nét')}</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              {getValue('donate_hero_subtitle', 'Dự án phi lợi nhuận giúp khôi phục ảnh cũ miễn phí cho cộng đồng. Mỗi đóng góp của bạn giúp chúng tôi duy trì và phát triển dịch vụ.')}
            </motion.p>

            {/* Stats */}
            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
            >
              <motion.div
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glassmorphism rounded-2xl p-4 border border-white/20"
              >
                <div className="flex justify-center mb-2">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold gradient-text">{getValue('donate_stats_photos', '1000+')}</p>
                <p className="text-xs text-muted-foreground">Ảnh đã phục hồi</p>
              </motion.div>
              
              <motion.div
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glassmorphism rounded-2xl p-4 border border-white/20"
              >
                <div className="flex justify-center mb-2">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">{getValue('donate_stats_users', '500+')}</p>
                <p className="text-xs text-muted-foreground">Người dùng</p>
              </motion.div>
              
              <motion.div
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glassmorphism rounded-2xl p-4 border border-white/20"
              >
                <div className="flex justify-center mb-2">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">{getValue('donate_stats_free', '100%')}</p>
                <p className="text-xs text-muted-foreground">Miễn phí</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Donation Methods */}
      <section className="pb-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Method Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {DONATION_METHODS.map((method, index) => {
              // Hide custom if disabled
              if (method.isCustomContent && getValue(method.enabledSettingKey!, 'false') !== 'true') {
                return null
              }
              // Hide paypal if no link
              if (method.linkSettingKey && !getValue(method.linkSettingKey, method.defaultLink || '')) {
                return null
              }
              
              return (
                <motion.button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all shadow-lg ${
                    selectedMethod === method.id
                      ? `bg-gradient-to-r ${method.color} text-white shadow-xl`
                      : `glassmorphism ${method.textColor} hover:shadow-xl border ${method.borderColor}`
                  }`}
                >
                  <method.icon className="w-5 h-5" />
                  {method.name}
                </motion.button>
              )
            })}
          </motion.div>

          {/* Selected Method Content */}
          {currentMethod && (
            <motion.div
              key={currentMethod.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="glassmorphism rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20"
            >
              {/* Custom Content Section */}
              {(currentMethod as any).isCustomContent ? (
                <div className="max-w-3xl mx-auto">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mb-8"
                  >
                    <div className={`inline-flex items-center gap-2 ${currentMethod.bgColor} ${currentMethod.textColor} px-4 py-2 rounded-full text-sm font-medium mb-4`}>
                      <FileText className="w-4 h-4" />
                      {getValue((currentMethod as any).titleSettingKey || '', 'Hỗ trợ khác')}
                    </div>
                  </motion.div>
                  
                  {getValue((currentMethod as any).contentSettingKey || '', '') ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: getValue((currentMethod as any).contentSettingKey || '', '') 
                      }}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có nội dung.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* QR Code Section */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-center"
                  >
                    <div className={`inline-flex items-center gap-2 ${currentMethod.bgColor} ${currentMethod.textColor} px-4 py-2 rounded-full text-sm font-medium mb-6`}>
                      <currentMethod.icon className="w-4 h-4" />
                      {currentMethod.name}
                    </div>

                    {currentMethod.linkSettingKey ? (
                      // External link methods (PayPal)
                      <div className="space-y-4">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className={`w-48 h-48 mx-auto ${currentMethod.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}
                        >
                          <currentMethod.icon className={`w-20 h-20 ${currentMethod.textColor}`} />
                        </motion.div>
                        <motion.a
                          href={getValue(currentMethod.linkSettingKey, currentMethod.defaultLink || '')}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${currentMethod.color} text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all`}
                        >
                          <ExternalLink className="w-5 h-5" />
                          Mở {currentMethod.name}
                        </motion.a>
                      </div>
                    ) : (
                      // QR code methods
                      <div className="space-y-4">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="w-64 h-64 mx-auto bg-white rounded-2xl p-4 shadow-lg border-2 border-dashed border-gray-200"
                        >
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
                            </div>
                          )}
                        </motion.div>
                        <p className="text-sm text-muted-foreground">
                          Quét mã QR bằng ứng dụng {currentMethod.name}
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* Account Info Section */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold">Thông tin chuyển khoản</h3>

                    {currentMethod.accountSettingKey && (
                      <div className="space-y-4">
                        {/* Bank Name */}
                        {(currentMethod as any).bankNameKey && (
                          <motion.div 
                            whileHover={{ scale: 1.01 }}
                            className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                          >
                            <p className="text-sm text-muted-foreground mb-1">Ngân hàng</p>
                            <p className="font-bold text-lg">
                              {getValue((currentMethod as any).bankNameKey, (currentMethod as any).defaultBankName || '')}
                            </p>
                          </motion.div>
                        )}

                        {/* Account Number */}
                        <motion.div 
                          whileHover={{ scale: 1.01 }}
                          className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                        >
                          <p className="text-sm text-muted-foreground mb-1">Số tài khoản / Số điện thoại</p>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-lg font-mono">
                              {getValue(currentMethod.accountSettingKey, currentMethod.defaultAccount || '')}
                            </p>
                            <motion.button
                              onClick={() => handleCopy(
                                getValue(currentMethod.accountSettingKey!, currentMethod.defaultAccount || ''),
                                'account'
                              )}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-2 rounded-lg transition-colors ${
                                copiedField === 'account' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-white hover:bg-gray-100 text-gray-600'
                              }`}
                            >
                              {copiedField === 'account' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </motion.button>
                          </div>
                        </motion.div>

                        {/* Account Name */}
                        <motion.div 
                          whileHover={{ scale: 1.01 }}
                          className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                        >
                          <p className="text-sm text-muted-foreground mb-1">Tên tài khoản</p>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-lg">
                              {getValue(currentMethod.nameSettingKey!, currentMethod.defaultName || '')}
                            </p>
                            <motion.button
                              onClick={() => handleCopy(
                                getValue(currentMethod.nameSettingKey!, currentMethod.defaultName || ''),
                                'name'
                              )}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-2 rounded-lg transition-colors ${
                                copiedField === 'name' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-white hover:bg-gray-100 text-gray-600'
                              }`}
                            >
                              {copiedField === 'name' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </motion.button>
                          </div>
                        </motion.div>

                        {/* Transfer Content */}
                        <motion.div 
                          whileHover={{ scale: 1.01 }}
                          className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                        >
                          <p className="text-sm text-muted-foreground mb-2">Nội dung chuyển khoản</p>
                          <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3 border border-primary/20">
                            <p className="font-medium text-primary">
                              {getValue('donate_transfer_content', 'Ung ho Hoi Net')}
                            </p>
                            <motion.button
                              onClick={() => handleCopy(getValue('donate_transfer_content', 'Ung ho Hoi Net'), 'content')}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-2 rounded-lg transition-colors ${
                                copiedField === 'content' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'hover:bg-white text-gray-600'
                              }`}
                            >
                              {copiedField === 'content' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </motion.button>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Suggested Amounts */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Gợi ý mức ủng hộ</p>
                      <div className="grid grid-cols-3 gap-2">
                        {SUGGESTED_AMOUNTS.map((item, index) => (
                          <motion.button
                            key={item.amount}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            onClick={() => handleCopy(String(item.amount), `amount-${item.amount}`)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-3 rounded-xl border text-center transition-all shadow-sm hover:shadow-md ${
                              copiedField === `amount-${item.amount}` 
                                ? 'border-green-500 bg-green-50' 
                                : 'bg-white/80 border-white/50 hover:border-primary/30'
                            }`}
                          >
                            <span className="text-2xl">{item.emoji}</span>
                            <p className="font-bold text-lg">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.amount)}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Why Donate Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-center mb-10"
          >
            <span className="gradient-text">{getValue('donate_why_title', 'Đóng góp của bạn giúp chúng tôi')}</span>
          </motion.h2>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className="glassmorphism rounded-2xl p-6 text-center border border-white/20 hover:border-blue-200 transition-all"
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center"
                whileHover={{ rotate: [0, -10, 10, 0] }}
              >
                <Globe className="w-8 h-8 text-blue-600" />
              </motion.div>
              <h3 className="font-bold text-lg mb-2">{getValue('donate_why_1_title', 'Duy trì server')}</h3>
              <p className="text-sm text-muted-foreground">
                {getValue('donate_why_1_desc', 'Chi phí hosting, domain và các dịch vụ cloud để website luôn hoạt động')}
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className="glassmorphism rounded-2xl p-6 text-center border border-white/20 hover:border-purple-200 transition-all"
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center"
                whileHover={{ rotate: [0, -10, 10, 0] }}
              >
                <Zap className="w-8 h-8 text-purple-600" />
              </motion.div>
              <h3 className="font-bold text-lg mb-2">{getValue('donate_why_2_title', 'Nâng cấp AI')}</h3>
              <p className="text-sm text-muted-foreground">
                {getValue('donate_why_2_desc', 'Chi phí API AI để cải thiện chất lượng khôi phục ảnh')}
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className="glassmorphism rounded-2xl p-6 text-center border border-white/20 hover:border-green-200 transition-all"
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center"
                whileHover={{ rotate: [0, -10, 10, 0] }}
              >
                <Users className="w-8 h-8 text-green-600" />
              </motion.div>
              <h3 className="font-bold text-lg mb-2">{getValue('donate_why_3_title', 'Phục vụ cộng đồng')}</h3>
              <p className="text-sm text-muted-foreground">
                {getValue('donate_why_3_desc', 'Giữ dịch vụ miễn phí cho mọi người, đặc biệt các gia đình có ảnh cũ')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="glassmorphism rounded-3xl p-8 border border-pink-200/50 bg-gradient-to-r from-pink-500/5 to-purple-500/5"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-14 h-14 text-pink-500 mx-auto mb-4" fill="currentColor" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-3">{getValue('donate_thanks_title', 'Cảm ơn bạn!')}</h2>
            <p className="text-muted-foreground mb-6">
              {getValue('donate_thanks_desc', 'Mỗi đóng góp dù nhỏ đều giúp chúng tôi tiếp tục sứ mệnh bảo tồn ký ức cho cộng đồng. Hồi Nét cam kết sử dụng 100% tiền ủng hộ cho việc phát triển dịch vụ.')}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Về trang chủ
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl font-medium hover:bg-primary/5 transition-all"
                >
                  Liên hệ
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
