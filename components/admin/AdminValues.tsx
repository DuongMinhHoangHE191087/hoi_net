'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, ChevronUp, ChevronDown, Eye, EyeOff, Target, Heart, Sparkles, Users, Zap, Star, Loader2 } from 'lucide-react'
import { ValueSection } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface FormData {
  title: string
  description: string
  icon: string
  gradient: string
  display_order: number
  is_active: boolean
}

const defaultFormData: FormData = {
  title: '',
  description: '',
  icon: 'Target',
  gradient: 'from-pink-500 via-rose-500 to-red-500',
  display_order: 0,
  is_active: true
}

const iconOptions = [
  { name: 'Target', component: Target },
  { name: 'Eye', component: Eye },
  { name: 'Heart', component: Heart },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Users', component: Users },
  { name: 'Zap', component: Zap },
  { name: 'Star', component: Star }
]

const gradientOptions = [
  { name: 'Pink to Red', value: 'from-pink-500 via-rose-500 to-red-500' },
  { name: 'Yellow to Orange', value: 'from-yellow-500 via-orange-500 to-amber-500' },
  { name: 'Purple to Pink', value: 'from-purple-500 via-pink-500 to-rose-500' },
  { name: 'Blue to Cyan', value: 'from-blue-500 via-cyan-500 to-teal-500' },
  { name: 'Green to Emerald', value: 'from-green-500 via-emerald-500 to-teal-500' },
  { name: 'Pink to Yellow', value: 'from-pink-500 via-orange-500 to-yellow-500' }
]

export default function AdminValues() {
  const [sections, setSections] = useState<ValueSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/values')
      const data = await response.json()

      if (response.ok) {
        setSections(data.valueSections || [])
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to load value sections')
      }
    } catch (err: any) {
      console.error('Error loading sections:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
      toast.error(err.message || 'Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      ...defaultFormData,
      display_order: sections.length
    })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (section: ValueSection) => {
    setFormData({
      title: section.title,
      description: section.description,
      icon: section.icon,
      gradient: section.gradient,
      display_order: section.display_order,
      is_active: section.is_active
    })
    setEditingId(section.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const url = editingId
        ? `/api/admin/values/${editingId}`
        : '/api/admin/values'

      const method = editingId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || (editingId ? 'Đã cập nhật' : 'Đã tạo mới'))
        await loadSections()
        setShowForm(false)
        setFormData(defaultFormData)
        setEditingId(null)
      } else {
        throw new Error(data.error || 'Failed to save value section')
      }
    } catch (err: any) {
      console.error('Error saving section:', err)
      setError('Không thể lưu. Vui lòng thử lại.')
      toast.error(err.message || 'Lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/values/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Đã xóa')
        await loadSections()
      } else {
        throw new Error(data.error || 'Failed to delete value section')
      }
    } catch (err: any) {
      console.error('Error deleting section:', err)
      setError('Không thể xóa. Vui lòng thử lại.')
      toast.error(err.message || 'Lỗi khi xóa')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (section: ValueSection) => {
    try {
      const response = await fetch(`/api/admin/values/${section.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !section.is_active
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Đã cập nhật')
        await loadSections()
      } else {
        throw new Error(data.error || 'Failed to toggle active status')
      }
    } catch (err: any) {
      console.error('Error toggling active:', err)
      setError('Không thể cập nhật. Vui lòng thử lại.')
      toast.error(err.message || 'Lỗi khi cập nhật')
    }
  }

  const handleMoveUp = async (section: ValueSection, index: number) => {
    if (index === 0) return

    try {
      const prevSection = sections[index - 1]

      const response1 = await fetch(`/api/admin/values/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: prevSection.display_order })
      })

      const response2 = await fetch(`/api/admin/values/${prevSection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: section.display_order })
      })

      if (response1.ok && response2.ok) {
        toast.success('Đã di chuyển')
        await loadSections()
      } else {
        throw new Error('Failed to move section')
      }
    } catch (err: any) {
      console.error('Error moving up:', err)
      setError('Không thể di chuyển. Vui lòng thử lại.')
      toast.error(err.message || 'Lỗi khi di chuyển')
    }
  }

  const handleMoveDown = async (section: ValueSection, index: number) => {
    if (index === sections.length - 1) return

    try {
      const nextSection = sections[index + 1]

      const response1 = await fetch(`/api/admin/values/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: nextSection.display_order })
      })

      const response2 = await fetch(`/api/admin/values/${nextSection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: section.display_order })
      })

      if (response1.ok && response2.ok) {
        toast.success('Đã di chuyển')
        await loadSections()
      } else {
        throw new Error('Failed to move section')
      }
    } catch (err: any) {
      console.error('Error moving down:', err)
      setError('Không thể di chuyển. Vui lòng thử lại.')
      toast.error(err.message || 'Lỗi khi di chuyển')
    }
  }

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(i => i.name === iconName)
    return icon ? icon.component : Target
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold">
              <span className="gradient-text-alt">Quản Lý Giá Trị</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý các phần sứ mệnh, tầm nhìn và giá trị của công ty
            </p>
          </div>

          <motion.button
            onClick={handleCreate}
            className="btn-glass-primary px-6 py-3"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm Mới
            </span>
          </motion.button>
        </div>

        {error && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="glassmorphism-strong p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">
                  {editingId ? 'Chỉnh Sửa Mục' : 'Thêm Mục Mới'}
                </h2>
                <motion.button
                  onClick={() => setShowForm(false)}
                  className="w-10 h-10 rounded-full glassmorphism-light flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tiêu Đề
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 glassmorphism-light rounded-xl border border-white/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Sứ Mệnh"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô Tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 glassmorphism-light rounded-xl border border-white/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="Mô tả chi tiết..."
                    rows={4}
                    required
                  />
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Biểu Tượng
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {iconOptions.map((icon) => {
                      const IconComponent = icon.component
                      return (
                        <motion.button
                          key={icon.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: icon.name })}
                          className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                            formData.icon === icon.name
                              ? 'bg-gradient-primary text-white shadow-glow-pink'
                              : 'glassmorphism-light hover:bg-white/60'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent className="w-6 h-6" />
                          <span className="text-xs font-medium">{icon.name}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Gradient Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Gradient
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {gradientOptions.map((gradient) => (
                      <motion.button
                        key={gradient.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, gradient: gradient.value })}
                        className={`p-4 rounded-xl transition-all ${
                          formData.gradient === gradient.value
                            ? 'ring-2 ring-primary shadow-glow'
                            : 'glassmorphism-light'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`h-12 rounded-lg bg-gradient-to-r ${gradient.value} mb-2`}></div>
                        <span className="text-sm font-medium text-gray-700">{gradient.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                    Hiển thị công khai
                  </label>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Xem Trước
                  </label>
                  <div className="glassmorphism-strong p-8 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${formData.gradient} opacity-5`}></div>

                    <div className="relative">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${formData.gradient} rounded-2xl flex items-center justify-center shadow-glow`}>
                        {(() => {
                          const IconComponent = getIconComponent(formData.icon)
                          return <IconComponent className="w-8 h-8 text-white" />
                        })()}
                      </div>

                      <h3 className="text-xl font-bold text-text mb-3 text-center">
                        {formData.title || 'Tiêu đề'}
                      </h3>
                      <p className="text-gray-700 text-center leading-relaxed">
                        {formData.description || 'Mô tả sẽ hiển thị ở đây...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="submit"
                    disabled={saving}
                    className="flex-1 btn-glass-primary py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          {editingId ? 'Cập Nhật' : 'Tạo Mới'}
                        </>
                      )}
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 btn-glass-secondary py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Hủy
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <motion.div
            className="glassmorphism-strong p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-600 text-lg">
              Chưa có mục nào. Nhấn "Thêm Mới" để tạo mục đầu tiên.
            </p>
          </motion.div>
        ) : (
          sections.map((section, index) => {
            const IconComponent = getIconComponent(section.icon)

            return (
              <motion.div
                key={section.id}
                className="glassmorphism-strong p-6 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Gradient preview bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${section.gradient}`}></div>

                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-glow flex-shrink-0`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold text-text">
                        {section.title}
                      </h3>

                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        section.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {section.is_active ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4">
                      {section.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <motion.button
                        onClick={() => handleEdit(section)}
                        className="px-4 py-2 glassmorphism-light rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit2 className="w-4 h-4" />
                        Sửa
                      </motion.button>

                      <motion.button
                        onClick={() => handleToggleActive(section)}
                        className="px-4 py-2 glassmorphism-light rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {section.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Ẩn
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Hiện
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleMoveUp(section, index)}
                        disabled={index === 0}
                        className={`px-3 py-2 glassmorphism-light rounded-lg text-sm font-semibold flex items-center gap-1 ${
                          index === 0 ? 'opacity-40 cursor-not-allowed' : 'text-gray-700'
                        }`}
                        whileHover={index === 0 ? {} : { scale: 1.05, y: -2 }}
                        whileTap={index === 0 ? {} : { scale: 0.95 }}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleMoveDown(section, index)}
                        disabled={index === sections.length - 1}
                        className={`px-3 py-2 glassmorphism-light rounded-lg text-sm font-semibold flex items-center gap-1 ${
                          index === sections.length - 1 ? 'opacity-40 cursor-not-allowed' : 'text-gray-700'
                        }`}
                        whileHover={index === sections.length - 1 ? {} : { scale: 1.05, y: -2 }}
                        whileTap={index === sections.length - 1 ? {} : { scale: 0.95 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleDelete(section.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-2 ml-auto"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
