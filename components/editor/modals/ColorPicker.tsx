'use client'

import { useState, useRef, useEffect } from 'react'
import { Palette, Highlighter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ColorPickerProps {
  type: 'text' | 'highlight'
  currentColor?: string
  onSelect: (color: string) => void
  onRemove: () => void
}

const TEXT_COLORS = [
  { name: 'Mặc định', value: '' },
  { name: 'Đen', value: '#000000' },
  { name: 'Xám đậm', value: '#374151' },
  { name: 'Xám', value: '#6B7280' },
  { name: 'Đỏ', value: '#DC2626' },
  { name: 'Cam', value: '#EA580C' },
  { name: 'Vàng cam', value: '#D97706' },
  { name: 'Xanh lá', value: '#16A34A' },
  { name: 'Xanh ngọc', value: '#0D9488' },
  { name: 'Xanh dương', value: '#2563EB' },
  { name: 'Tím', value: '#7C3AED' },
  { name: 'Hồng', value: '#DB2777' },
]

const HIGHLIGHT_COLORS = [
  { name: 'Không', value: '' },
  { name: 'Vàng', value: '#FEF08A' },
  { name: 'Xanh lá', value: '#BBF7D0' },
  { name: 'Xanh dương', value: '#BFDBFE' },
  { name: 'Tím', value: '#DDD6FE' },
  { name: 'Hồng', value: '#FBCFE8' },
  { name: 'Cam', value: '#FED7AA' },
  { name: 'Đỏ', value: '#FECACA' },
  { name: 'Xám', value: '#E5E7EB' },
]

export default function ColorPicker({ type, currentColor, onSelect, onRemove }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const colors = type === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (color: string) => {
    if (color === '') {
      onRemove()
    } else {
      onSelect(color)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
          currentColor ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-200'
        }`}
        title={type === 'text' ? 'Màu chữ' : 'Highlight'}
      >
        {type === 'text' ? (
          <Palette className="w-4 h-4" />
        ) : (
          <Highlighter className="w-4 h-4" />
        )}
        {currentColor && (
          <span
            className="w-3 h-3 rounded-full border border-gray-300"
            style={{ backgroundColor: currentColor }}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 p-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 min-w-[180px]"
          >
            <p className="text-xs text-gray-500 mb-2 px-1">
              {type === 'text' ? 'Màu chữ' : 'Màu highlight'}
            </p>
            <div className="grid grid-cols-4 gap-1">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleSelect(color.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    currentColor === color.value
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${color.value === '' ? 'bg-white relative overflow-hidden' : ''}`}
                  style={{ backgroundColor: color.value || undefined }}
                  title={color.name}
                >
                  {color.value === '' && (
                    <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                      ✕
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
