'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Key, ExternalLink, CheckCircle, XCircle, Loader2, 
  Eye, EyeOff, Trash2, Info, Copy, Check, Shield
} from 'lucide-react'
import { useGeminiKey } from '@/hooks/useGeminiKey'
import toast from 'react-hot-toast'

interface ApiKeySetupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ApiKeySetup({ isOpen, onClose, onSuccess }: ApiKeySetupProps) {
  const { 
    hasKey, 
    maskedKey, 
    isValidating, 
    validationError,
    saveKey, 
    removeKey 
  } = useGeminiKey()

  const [inputKey, setInputKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [step, setStep] = useState<'intro' | 'guide' | 'input'>(hasKey ? 'input' : 'intro')
  const [copied, setCopied] = useState(false)

  const handleSaveKey = async () => {
    const result = await saveKey(inputKey)
    
    if (result.success) {
      toast.success('API key đã được lưu thành công!')
      setInputKey('')
      onSuccess?.()
      onClose()
    } else {
      toast.error(result.error || 'Có lỗi xảy ra')
    }
  }

  const handleRemoveKey = () => {
    if (confirm('Bạn có chắc muốn xóa API key?')) {
      removeKey()
      toast.success('Đã xóa API key')
      setStep('intro')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glassmorphism-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text">
                  {hasKey ? 'Quản lý API Key' : 'Thiết lập API Key'}
                </h2>
                <p className="text-sm text-gray-600">
                  Sử dụng Gemini AI với API key của bạn
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-medium">Bảo mật API Key</p>
              <p className="text-sm text-green-700">
                API key của bạn được lưu trữ an toàn trên thiết bị và <strong>không bao giờ</strong> gửi về server của chúng tôi.
              </p>
            </div>
          </div>

          {/* Current Key Status */}
          {hasKey && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">API Key đã thiết lập</p>
                    <p className="text-sm text-gray-600 font-mono">{maskedKey}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveKey}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa API key"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step Navigation */}
          {!hasKey && (
            <div className="flex gap-2 mb-6">
              {(['intro', 'guide', 'input'] as const).map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    step === s
                      ? 'bg-gradient-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}. {s === 'intro' ? 'Giới thiệu' : s === 'guide' ? 'Hướng dẫn' : 'Nhập Key'}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-text">Tại sao cần API Key?</h3>
                <p className="text-gray-700">
                  Bạn đã sử dụng hết <strong>5 lượt miễn phí</strong> trong tháng. 
                  Để tiếp tục sử dụng AI xử lý ảnh, bạn có thể:
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="font-medium text-gray-800">✨ Sử dụng API key miễn phí từ Google</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Google cung cấp Gemini API miễn phí với giới hạn 15 request/phút, 1500 request/ngày.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                    <p className="font-medium text-gray-800">🔒 An toàn & Riêng tư</p>
                    <p className="text-sm text-gray-600 mt-1">
                      API key chỉ lưu trên thiết bị của bạn. Không chia sẻ với ai.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <p className="font-medium text-gray-800">🚀 Không giới hạn lượt dùng</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Sử dụng bao nhiêu tùy thích với API key của riêng bạn.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setStep('guide')}
                  className="w-full btn-glass-primary mt-4"
                >
                  Tiếp tục - Xem hướng dẫn lấy API Key
                </button>
              </motion.div>
            )}

            {step === 'guide' && (
              <motion.div
                key="guide"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-text">Hướng dẫn lấy API Key (3 bước)</h3>
                
                {/* Step 1 */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</span>
                    <span className="font-bold text-gray-800">Truy cập Google AI Studio</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-11 mb-3">
                    Click vào link bên dưới để mở Google AI Studio:
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-11 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Mở Google AI Studio
                  </a>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">2</span>
                    <span className="font-bold text-gray-800">Đăng nhập & Tạo API Key</span>
                  </div>
                  <ul className="text-sm text-gray-600 ml-11 space-y-1">
                    <li>• Đăng nhập bằng tài khoản Google của bạn</li>
                    <li>• Click nút <strong>"Create API key"</strong></li>
                    <li>• Chọn <strong>"Create API key in new project"</strong></li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">3</span>
                    <span className="font-bold text-gray-800">Copy API Key</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-11 mb-2">
                    Copy API key (bắt đầu bằng <code className="bg-gray-100 px-1 py-0.5 rounded">AIza...</code>) và dán vào ô bên dưới.
                  </p>
                  <div className="ml-11 flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                    <code className="text-sm text-gray-700">AIzaSy...</code>
                    <button
                      onClick={() => copyToClipboard('AIzaSy...')}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep('intro')}
                    className="flex-1 btn-glass-secondary"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setStep('input')}
                    className="flex-1 btn-glass-primary"
                  >
                    Đã có API Key - Nhập ngay
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-text">Nhập API Key của bạn</h3>
                
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Dán API key tại đây (AIza...)"
                    className="input-glass w-full pr-12 font-mono"
                    disabled={isValidating}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    type="button"
                  >
                    {showKey ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>

                {validationError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <XCircle className="w-4 h-4" />
                    {validationError}
                  </div>
                )}

                <div className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                  <Info className="w-4 h-4 mt-0.5 text-yellow-600" />
                  <p>
                    API key sẽ được kiểm tra tính hợp lệ trước khi lưu. 
                    Đảm bảo key bắt đầu bằng <code className="bg-white px-1 py-0.5 rounded">AIza</code>.
                  </p>
                </div>

                <div className="flex gap-3">
                  {!hasKey && (
                    <button
                      onClick={() => setStep('guide')}
                      className="flex-1 btn-glass-secondary"
                    >
                      Xem hướng dẫn
                    </button>
                  )}
                  <button
                    onClick={handleSaveKey}
                    disabled={!inputKey || isValidating}
                    className="flex-1 btn-glass-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Lưu API Key
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
