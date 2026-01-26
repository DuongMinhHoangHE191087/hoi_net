'use client'

/**
 * Conflict Resolution Dialog
 * Shows when optimistic locking detects a version mismatch
 */

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RefreshCw, X, Check, Copy } from 'lucide-react'

interface ConflictDialogProps {
  isOpen: boolean
  title?: string
  message?: string
  expectedVersion?: number
  currentVersion?: number
  onRefresh: () => void
  onClose: () => void
  onForceUpdate?: () => void
}

export function ConflictDialog({
  isOpen,
  title = 'Xung đột dữ liệu',
  message = 'Dữ liệu này đã được sửa đổi bởi người dùng khác.',
  expectedVersion,
  currentVersion,
  onRefresh,
  onClose,
  onForceUpdate
}: ConflictDialogProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
            {message}
          </p>

          {/* Version info */}
          {expectedVersion !== undefined && currentVersion !== undefined && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Phiên bản của bạn:</span>
                <span className="font-mono text-gray-900 dark:text-white">v{expectedVersion}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500 dark:text-gray-400">Phiên bản hiện tại:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">v{currentVersion}</span>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">💡 Điều này có nghĩa là gì?</p>
            <p>Trong khi bạn đang chỉnh sửa, ai đó khác đã lưu thay đổi. Bạn cần tải lại dữ liệu mới nhất để tránh mất thông tin.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onRefresh}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              Tải lại dữ liệu
            </button>
            
            {onForceUpdate && (
              <button
                onClick={onForceUpdate}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                title="Ghi đè thay đổi của người khác (cẩn thận!)"
              >
                <Copy className="w-5 h-5" />
                Ghi đè
              </button>
            )}
          </div>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full mt-3 px-4 py-2 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Để sau
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ==========================================
// Simple Toast-based Conflict Alert
// ==========================================

import { toast } from 'react-hot-toast'

export function showConflictToast(onRefresh: () => void) {
  toast(
    (t) => (
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-gray-900">Xung đột dữ liệu</p>
          <p className="text-sm text-gray-600 mt-1">
            Dữ liệu đã được sửa bởi người khác.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                onRefresh()
              }}
              className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Tải lại
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      style: {
        maxWidth: '400px',
        padding: '16px'
      }
    }
  )
}

