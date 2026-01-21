'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface AIConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'warning' | 'success'
  showPreview?: boolean
  previewImages?: string[]
  promptName?: string
  promptDescription?: string
}

export default function AIConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xử lý bằng AI',
  description = 'Bạn có chắc muốn xử lý ảnh này bằng AI không?',
  confirmText = 'Xác Nhận & Xử Lý',
  cancelText = 'Hủy Bỏ',
  variant = 'default',
  showPreview = false,
  previewImages = [],
  promptName,
  promptDescription,
}: AIConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }

  const variantStyles = {
    default: {
      iconBg: 'bg-gradient-primary',
      icon: Sparkles,
      iconColor: 'text-white',
      buttonBg: 'btn-glass-primary',
    },
    warning: {
      iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      icon: AlertCircle,
      iconColor: 'text-white',
      buttonBg: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg',
    },
    success: {
      iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
      icon: CheckCircle2,
      iconColor: 'text-white',
      buttonBg: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg',
    },
  }

  const currentVariant = variantStyles[variant]
  const Icon = currentVariant.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glassmorphism-strong max-w-lg w-full p-6 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="mb-6"
            >
              <div className={`w-16 h-16 ${currentVariant.iconBg} rounded-full flex items-center justify-center mx-auto shadow-glow-pink`}>
                <Icon className={`w-8 h-8 ${currentVariant.iconColor}`} />
              </div>
            </motion.div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
              {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-center mb-6">
              {description}
            </p>

            {/* Prompt Info */}
            {promptName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      System Prompt: {promptName}
                    </h4>
                    {promptDescription && (
                      <p className="text-sm text-gray-600">
                        {promptDescription}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preview Images */}
            {showPreview && previewImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Ảnh sẽ được xử lý ({previewImages.length}):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {previewImages.slice(0, 6).map((url, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="relative aspect-square rounded-lg overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
                {previewImages.length > 6 && (
                  <p className="text-xs text-gray-500 mt-2">
                    +{previewImages.length - 6} ảnh khác
                  </p>
                )}
              </motion.div>
            )}

            {/* Processing Info */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Đang xử lý...
                    </p>
                    <p className="text-xs text-blue-600">
                      Vui lòng đợi, AI đang phân tích và xử lý ảnh của bạn
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isProcessing ? { scale: 1.02 } : {}}
                whileTap={!isProcessing ? { scale: 0.98 } : {}}
              >
                {cancelText}
              </motion.button>

              <motion.button
                onClick={handleConfirm}
                disabled={isProcessing}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${currentVariant.buttonBg}`}
                whileHover={!isProcessing ? { scale: 1.02 } : {}}
                whileTap={!isProcessing ? { scale: 0.98 } : {}}
              >
                <span className="flex items-center justify-center gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {confirmText}
                    </>
                  )}
                </span>
              </motion.button>
            </div>

            {/* Info Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-gray-500 text-center mt-4"
            >
              Quá trình xử lý có thể mất vài giây đến vài phút tùy vào số lượng ảnh
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
