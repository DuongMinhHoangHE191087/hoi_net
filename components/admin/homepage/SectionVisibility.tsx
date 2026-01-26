'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  GripVertical, Eye, EyeOff, Save, Loader2, AlertCircle,
  Target, Zap, Users, MessageSquare, Star, ArrowUp, ArrowDown,
  Check, RotateCcw
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface HomepageSection {
  id: string
  key: string
  title: string
  description: string
  icon: any
  is_visible: boolean
  display_order: number
}

const defaultSections: HomepageSection[] = [
  {
    id: 'hero',
    key: 'section_hero',
    title: 'Hero Section',
    description: 'Banner chính với tiêu đề và nút CTA',
    icon: Star,
    is_visible: true,
    display_order: 0
  },
  {
    id: 'values',
    key: 'section_values',
    title: 'Giá Trị Cốt Lõi',
    description: 'Sứ mệnh, Tầm nhìn, Giá trị',
    icon: Target,
    is_visible: true,
    display_order: 1
  },
  {
    id: 'features',
    key: 'section_features',
    title: 'Tính Năng',
    description: 'Các tính năng nổi bật',
    icon: Zap,
    is_visible: true,
    display_order: 2
  },
  {
    id: 'stats',
    key: 'section_stats',
    title: 'Thống Kê',
    description: 'Số liệu ấn tượng',
    icon: Star,
    is_visible: true,
    display_order: 3
  },
  {
    id: 'team',
    key: 'section_team',
    title: 'Đội Ngũ',
    description: 'Thành viên trong team',
    icon: Users,
    is_visible: true,
    display_order: 4
  },
  {
    id: 'testimonials',
    key: 'section_testimonials',
    title: 'Đánh Giá',
    description: 'Phản hồi từ khách hàng',
    icon: MessageSquare,
    is_visible: true,
    display_order: 5
  },
  {
    id: 'cta',
    key: 'section_cta',
    title: 'CTA Cuối Trang',
    description: 'Kêu gọi hành động cuối trang',
    icon: Star,
    is_visible: true,
    display_order: 6
  }
]

interface SectionVisibilityProps {
  onSave?: () => void
}

export default function SectionVisibility({ onSave }: SectionVisibilityProps) {
  const [sections, setSections] = useState<HomepageSection[]>(defaultSections)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSections, setOriginalSections] = useState<HomepageSection[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  useEffect(() => {
    loadSectionSettings()
  }, [])

  const loadSectionSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/homepage-sections')
      const data = await response.json()

      if (response.ok && data.sections) {
        // Merge with default sections
        const mergedSections = defaultSections.map(defaultSection => {
          const savedSection = data.sections.find((s: any) => s.key === defaultSection.key)
          return {
            ...defaultSection,
            is_visible: savedSection?.is_visible ?? defaultSection.is_visible,
            display_order: savedSection?.display_order ?? defaultSection.display_order
          }
        }).sort((a, b) => a.display_order - b.display_order)

        setSections(mergedSections)
        setOriginalSections(JSON.parse(JSON.stringify(mergedSections)))
      } else {
        // Use defaults if no saved settings
        setSections(defaultSections)
        setOriginalSections(JSON.parse(JSON.stringify(defaultSections)))
      }
    } catch (error) {
      console.error('Error loading section settings:', error)
      setSections(defaultSections)
      setOriginalSections(JSON.parse(JSON.stringify(defaultSections)))
    } finally {
      setLoading(false)
    }
  }

  const toggleVisibility = (sectionId: string) => {
    setSections(prev => {
      const updated = prev.map(s => 
        s.id === sectionId ? { ...s, is_visible: !s.is_visible } : s
      )
      return updated
    })
    setHasChanges(true)
  }

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const index = prev.findIndex(s => s.id === sectionId)
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prev.length - 1)
      ) {
        return prev
      }

      const newSections = [...prev]
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      
      // Swap positions
      const temp = newSections[index]
      newSections[index] = newSections[swapIndex]
      newSections[swapIndex] = temp

      // Update display_order
      return newSections.map((s, i) => ({ ...s, display_order: i }))
    })
    setHasChanges(true)
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedItem(sectionId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null)
      return
    }

    setSections(prev => {
      const draggedIndex = prev.findIndex(s => s.id === draggedItem)
      const targetIndex = prev.findIndex(s => s.id === targetId)
      
      const newSections = [...prev]
      const [removed] = newSections.splice(draggedIndex, 1)
      newSections.splice(targetIndex, 0, removed)

      return newSections.map((s, i) => ({ ...s, display_order: i }))
    })
    
    setDraggedItem(null)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/homepage-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ 
          sections: sections.map(s => ({
            key: s.key,
            is_visible: s.is_visible,
            display_order: s.display_order
          }))
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Đã lưu cài đặt hiển thị!')
        setOriginalSections(JSON.parse(JSON.stringify(sections)))
        setHasChanges(false)
        onSave?.()
      } else {
        throw new Error(data.error || 'Không thể lưu cài đặt')
      }
    } catch (error: any) {
      console.error('Error saving section settings:', error)
      toast.error(error.message || 'Lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSections(JSON.parse(JSON.stringify(originalSections)))
    setHasChanges(false)
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Đang tải cài đặt...</span>
        </div>
      </Card>
    )
  }

  const visibleCount = sections.filter(s => s.is_visible).length

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-text">Hiển Thị & Thứ Tự Sections</h3>
          <p className="text-gray-500 text-sm mt-1">
            Kéo thả để sắp xếp, bật/tắt để hiển thị trên trang chủ
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Hoàn tác
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-amber-800">Có thay đổi chưa lưu</span>
            <span className="text-amber-700"> - Nhấn "Lưu thay đổi" để áp dụng</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
          {visibleCount} đang hiển thị
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
          {sections.length - visibleCount} đang ẩn
        </span>
      </div>

      {/* Sections List */}
      <div className="space-y-2">
        {sections.map((section, index) => {
          const Icon = section.icon
          const isFirst = index === 0
          const isLast = index === sections.length - 1

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
              className={`
                flex items-center gap-4 p-4 rounded-xl border transition-all cursor-move
                ${section.is_visible 
                  ? 'bg-white border-gray-200 hover:border-primary/30 hover:shadow-sm' 
                  : 'bg-gray-50 border-gray-100 opacity-60'
                }
                ${draggedItem === section.id ? 'opacity-50 scale-[0.98]' : ''}
              `}
            >
              {/* Drag Handle */}
              <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Order Number */}
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`p-2 rounded-lg ${section.is_visible ? 'bg-primary/10' : 'bg-gray-200'}`}>
                <Icon className={`w-5 h-5 ${section.is_visible ? 'text-primary' : 'text-gray-400'}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${section.is_visible ? 'text-text' : 'text-gray-500'}`}>
                  {section.title}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                  {section.description}
                </p>
              </div>

              {/* Move Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSection(section.id, 'up')}
                  disabled={isFirst}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Di chuyển lên"
                >
                  <ArrowUp className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => moveSection(section.id, 'down')}
                  disabled={isLast}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Di chuyển xuống"
                >
                  <ArrowDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Toggle Visibility */}
              <button
                onClick={() => toggleVisibility(section.id)}
                className={`
                  p-2 rounded-lg transition-all
                  ${section.is_visible 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }
                `}
                title={section.is_visible ? 'Ẩn section' : 'Hiển thị section'}
              >
                {section.is_visible ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Kéo thả</strong> để thay đổi thứ tự hiển thị các section</li>
          <li>• Nhấn <Eye className="w-4 h-4 inline text-green-600" /> để <strong>ẩn/hiện</strong> section</li>
          <li>• Sử dụng nút <ArrowUp className="w-4 h-4 inline" />/<ArrowDown className="w-4 h-4 inline" /> để di chuyển nhanh</li>
          <li>• Nhấn <strong>"Lưu thay đổi"</strong> để áp dụng cài đặt</li>
        </ul>
      </div>
    </Card>
  )
}

