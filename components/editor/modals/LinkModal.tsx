'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Unlink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LinkModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (url: string, text?: string, openInNewTab?: boolean) => void
  onRemove: () => void
  initialUrl?: string
  initialText?: string
}

export default function LinkModal({
  isOpen,
  onClose,
  onInsert,
  onRemove,
  initialUrl = '',
  initialText = '',
}: LinkModalProps) {
  const [url, setUrl] = useState(initialUrl)
  const [text, setText] = useState(initialText)
  const [openInNewTab, setOpenInNewTab] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setUrl(initialUrl)
    setText(initialText)
  }, [initialUrl, initialText])

  const validateUrl = (url: string): boolean => {
    if (!url) return false

    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('#')) return true

    // Allow mailto and tel
    if (url.startsWith('mailto:') || url.startsWith('tel:')) return true

    // Validate http(s) URLs
    try {
      new URL(url)
      return true
    } catch {
      // Try with https prefix
      try {
        new URL('https://' + url)
        return true
      } catch {
        return false
      }
    }
  }

  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url
    }
    return url
  }

  const handleInsert = () => {
    if (!url.trim()) {
      setError('Vui lòng nhập URL')
      return
    }

    if (!validateUrl(url)) {
      setError('URL không hợp lệ')
      return
    }

    const normalizedUrl = normalizeUrl(url)
    onInsert(normalizedUrl, text || undefined, openInNewTab)
    handleClose()
  }

  const handleRemoveLink = () => {
    onRemove()
    handleClose()
  }

  const handleClose = () => {
    setUrl('')
    setText('')
    setError('')
    setOpenInNewTab(true)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {initialUrl ? 'Chỉnh sửa liên kết' : 'Thêm liên kết'}
            </h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError('')
                }}
                placeholder="https://example.com hoặc /trang-noi-bo"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Văn bản hiển thị
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập văn bản (để trống sẽ dùng URL)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="openNewTab"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="openNewTab" className="text-sm text-gray-700 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Mở trong tab mới
              </label>
            </div>

            {/* Link Types Info */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
              <p className="font-medium mb-1">Các loại liên kết hỗ trợ:</p>
              <ul className="space-y-1">
                <li>• URL đầy đủ: https://example.com</li>
                <li>• Đường dẫn nội bộ: /about, /blog/bai-viet</li>
                <li>• Anchor: #section-id</li>
                <li>• Email: mailto:email@example.com</li>
                <li>• Điện thoại: tel:+84123456789</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <div>
              {initialUrl && (
                <button
                  onClick={handleRemoveLink}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Unlink className="w-4 h-4" />
                  Xóa liên kết
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleInsert}
                disabled={!url.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {initialUrl ? 'Cập nhật' : 'Thêm liên kết'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

