'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X, CheckCircle, Info, AlertCircle, ShieldAlert, type LucideIcon } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'

// ============================================
// Types
// ============================================

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmDialogVariant
  icon?: LucideIcon
  loading?: boolean
}

// ============================================
// Variant Configurations
// ============================================

const VARIANT_CONFIG: Record<ConfirmDialogVariant, {
  icon: LucideIcon
  iconBg: string
  confirmBg: string
  confirmHover: string
}> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-gradient-to-br from-red-400 to-red-600',
    confirmBg: 'bg-gradient-to-r from-red-500 to-red-600',
    confirmHover: 'hover:from-red-600 hover:to-red-700',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500',
    confirmBg: 'bg-gradient-to-r from-orange-500 to-amber-500',
    confirmHover: 'hover:from-orange-600 hover:to-amber-600',
  },
  info: {
    icon: Info,
    iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    confirmBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    confirmHover: 'hover:from-blue-600 hover:to-blue-700',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
    confirmBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    confirmHover: 'hover:from-green-600 hover:to-emerald-600',
  },
}

// ============================================
// Component
// ============================================

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'warning',
  icon: CustomIcon,
  loading = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  
  const config = VARIANT_CONFIG[variant]
  const IconComponent = CustomIcon || config.icon

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading && !isConfirming) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, loading, isConfirming, onClose])

  const handleConfirm = useCallback(async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
    }
  }, [onConfirm])

  const isLoading = loading || isConfirming

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="glassmorphism-strong max-w-md w-full rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {message}
                    </p>
                  </div>

                  {/* Close Button */}
                  {!isLoading && (
                    <button
                      onClick={onClose}
                      className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors"
                      aria-label="Đóng"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Separator */}
              <div className="px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </div>

              {/* Actions */}
              <div className="p-6 pt-4 flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`px-5 py-2.5 rounded-xl font-medium text-white ${config.confirmBg} ${config.confirmHover} shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    confirmText
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================
// Alert Dialog (for info/success messages)
// ============================================

export interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  variant?: ConfirmDialogVariant
  icon?: LucideIcon
  buttonText?: string
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  icon: CustomIcon,
  buttonText = 'Đã hiểu',
}: AlertDialogProps) {
  const config = VARIANT_CONFIG[variant]
  const IconComponent = CustomIcon || config.icon

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="glassmorphism-strong max-w-md w-full rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {message}
                    </p>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors"
                    aria-label="Đóng"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Separator */}
              <div className="px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </div>

              {/* Action */}
              <div className="p-6 pt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={`px-6 py-2.5 rounded-xl font-medium text-white ${config.confirmBg} ${config.confirmHover} shadow-lg transition-all`}
                >
                  {buttonText}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================
// Hook for easy usage
// ============================================

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  variant: ConfirmDialogVariant
  confirmText: string
  cancelText: string
  onConfirm: () => void | Promise<void>
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    onConfirm: () => {},
  })

  const confirm = useCallback((options: {
    title: string
    message: string
    variant?: ConfirmDialogVariant
    confirmText?: string
    cancelText?: string
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        variant: options.variant || 'warning',
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy',
        onConfirm: () => {
          setState(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
      })
    })
  }, [])

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const ConfirmDialogComponent = useCallback(() => (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={close}
      onConfirm={state.onConfirm}
      title={state.title}
      message={state.message}
      variant={state.variant}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
    />
  ), [state, close])

  return {
    confirm,
    close,
    ConfirmDialogComponent,
  }
}
