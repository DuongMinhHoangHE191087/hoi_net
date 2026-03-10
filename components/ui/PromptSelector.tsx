'use client'

import { useState } from 'react'
import {
  Sparkles, Palette, Wand2, Sun, Eraser, ZoomIn, Brush,
  ImagePlus, Layers, Focus, Droplets, ChevronDown
} from 'lucide-react'

// ============================================
// Prompt Chip Categories
// ============================================
const PROMPT_CATEGORIES = [
  {
    id: 'restore',
    label: 'Khôi Phục',
    color: 'from-orange-500 to-amber-500',
    chipColor: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    selectedColor: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent',
    chips: [
      { id: 'fix_scratches', label: 'Sửa vết xước', icon: Eraser, prompt: 'Repair scratches and tears' },
      { id: 'remove_noise', label: 'Khử nhiễu hạt', icon: Droplets, prompt: 'Remove grain and noise' },
      { id: 'sharpen', label: 'Tăng độ nét', icon: Focus, prompt: 'Sharpen blurry areas' },
      { id: 'restore_color', label: 'Phục hồi màu', icon: Palette, prompt: 'Restore faded colors' },
    ],
  },
  {
    id: 'enhance',
    label: 'Nâng Cấp',
    color: 'from-blue-500 to-cyan-500',
    chipColor: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    selectedColor: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent',
    chips: [
      { id: 'smooth_skin', label: 'Làm mịn da', icon: Brush, prompt: 'Smooth skin texture naturally' },
      { id: 'upscale', label: 'Nâng độ phân giải', icon: ZoomIn, prompt: 'Upscale resolution 2x' },
      { id: 'fix_lighting', label: 'Cân bằng sáng', icon: Sun, prompt: 'Balance lighting and exposure' },
      { id: 'enhance_faces', label: 'Nâng cấp khuôn mặt', icon: Wand2, prompt: 'Enhance facial details' },
    ],
  },
  {
    id: 'creative',
    label: 'Sáng Tạo',
    color: 'from-purple-500 to-pink-500',
    chipColor: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    selectedColor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent',
    chips: [
      { id: 'colorize', label: 'Tô màu ảnh B&W', icon: Palette, prompt: 'Colorize black and white photo realistically' },
      { id: 'change_bg', label: 'Thay nền', icon: ImagePlus, prompt: 'Replace background with clean studio backdrop' },
      { id: 'harmonize', label: 'Hài hòa phong cách', icon: Layers, prompt: 'Harmonize style and color grading' },
      { id: 'artistic', label: 'Phong cách nghệ thuật', icon: Sparkles, prompt: 'Apply artistic enhancement' },
    ],
  },
]

interface PromptSelectorProps {
  selectedChips: string[]
  onChipsChange: (chips: string[]) => void
  customNote: string
  onCustomNoteChange: (note: string) => void
}

export default function PromptSelector({
  selectedChips,
  onChipsChange,
  customNote,
  onCustomNoteChange,
}: PromptSelectorProps) {
  const [showCustom, setShowCustom] = useState(false)

  const toggleChip = (chipId: string) => {
    if (selectedChips.includes(chipId)) {
      onChipsChange(selectedChips.filter((c) => c !== chipId))
    } else {
      onChipsChange([...selectedChips, chipId])
    }
  }

  const selectedCount = selectedChips.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Tùy Chọn AI Xử Lý
        </label>
        {selectedCount > 0 && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
            {selectedCount} đã chọn
          </span>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {PROMPT_CATEGORIES.map((category) => (
          <div key={category.id}>
            {/* Category Label */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color}`} />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {category.label}
              </span>
            </div>

            {/* Chips Grid */}
            <div className="flex flex-wrap gap-2">
              {category.chips.map((chip) => {
                const isSelected = selectedChips.includes(chip.id)
                const Icon = chip.icon
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => toggleChip(chip.id)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                      border transition-all duration-200 cursor-pointer
                      ${isSelected ? category.selectedColor + ' shadow-md scale-[1.02]' : category.chipColor}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {chip.label}
                    {isSelected && (
                      <span className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Note Toggle */}
      <button
        type="button"
        onClick={() => setShowCustom(!showCustom)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
        {showCustom ? 'Ẩn ghi chú riêng' : 'Thêm ghi chú riêng (tùy chọn)'}
      </button>

      {/* Custom Note Textarea */}
      {showCustom && (
        <div className="animate-in slide-in-from-top-2">
          <textarea
            placeholder="VD: Giữ nguyên tông màu ấm, chỉ sửa phần bên trái bị rách..."
            value={customNote}
            onChange={(e) => onCustomNoteChange(e.target.value)}
            rows={3}
            className="input-glass w-full resize-none text-sm"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{customNote.length}/500</p>
        </div>
      )}
    </div>
  )
}

/**
 * Build combined prompt string from selected chips + custom note
 */
export function buildPromptFromChips(selectedChips: string[], customNote: string): string {
  const parts: string[] = []

  for (const category of PROMPT_CATEGORIES) {
    for (const chip of category.chips) {
      if (selectedChips.includes(chip.id)) {
        parts.push(chip.prompt)
      }
    }
  }

  if (customNote.trim()) {
    parts.push(`User note: ${customNote.trim()}`)
  }

  return parts.length > 0
    ? parts.join('. ') + '.'
    : 'Professional photo restoration and enhancement.'
}

export { PROMPT_CATEGORIES }
