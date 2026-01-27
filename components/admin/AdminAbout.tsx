'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon,
  ChevronUp, ChevronDown, Eye, EyeOff, Loader2
} from 'lucide-react'
import { db, AboutSection } from '@/lib/supabase'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

export default function AdminAbout() {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; sectionId: string | null }>({
    isOpen: false,
    sectionId: null,
  })
  const [formData, setFormData] = useState<Partial<AboutSection>>({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    image_position: 'right',
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      setLoading(true)
      const data = await db.getAllAboutSections()
      setSections(data)
    } catch (error) {
      console.error('Error loading sections:', error)
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      if (editingId) {
        await db.updateAboutSection(editingId, formData)
        toast.success('Cập nhật thành công!')
      } else {
        await db.createAboutSection(formData as Omit<AboutSection, 'id' | 'created_at' | 'updated_at'>)
        toast.success('Thêm mới thành công!')
      }

      resetForm()
      loadSections()
    } catch (error) {
      console.error('Error saving section:', error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleEdit = (section: AboutSection) => {
    setEditingId(section.id)
    setFormData(section)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, sectionId: id })
  }

  const confirmDelete = async () => {
    const id = deleteConfirm.sectionId
    if (!id) return
    setDeleteConfirm({ isOpen: false, sectionId: null })

    try {
      await db.deleteAboutSection(id)
      toast.success('Xóa thành công!')
      loadSections()
    } catch (error) {
      console.error('Error deleting section:', error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleToggleActive = async (section: AboutSection) => {
    try {
      await db.updateAboutSection(section.id, { is_active: !section.is_active })
      toast.success(section.is_active ? 'Đã ẩn' : 'Đã hiển thị')
      loadSections()
    } catch (error) {
      console.error('Error toggling section:', error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleMoveUp = async (section: AboutSection, index: number) => {
    if (index === 0) return
    const prevSection = sections[index - 1]

    try {
      await Promise.all([
        db.updateAboutSection(section.id, { display_order: prevSection.display_order }),
        db.updateAboutSection(prevSection.id, { display_order: section.display_order })
      ])
      loadSections()
    } catch (error) {
      console.error('Error moving section:', error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleMoveDown = async (section: AboutSection, index: number) => {
    if (index === sections.length - 1) return
    const nextSection = sections[index + 1]

    try {
      await Promise.all([
        db.updateAboutSection(section.id, { display_order: nextSection.display_order }),
        db.updateAboutSection(nextSection.id, { display_order: section.display_order })
      ])
      loadSections()
    } catch (error) {
      console.error('Error moving section:', error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      image_position: 'right',
      display_order: sections.length,
      is_active: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, sectionId: null })}
        onConfirm={confirmDelete}
        title="Xoá Section"
        message="Bạn có chắc chắn muốn xoá section này? Hành động này không thể hoàn tác."
        variant="danger"
        confirmText="Xoá"
        cancelText="Huỷ"
      />

      {/* Form Section */}
      <motion.div
        className="glassmorphism-strong p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary" />
          {editingId ? 'Chỉnh Sửa Section' : 'Thêm Section Mới'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu Đề *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                placeholder="VD: Sứ Mệnh Của Chúng Tôi"
                required
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu Đề Phụ
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                placeholder="VD: Mang lại giá trị cho khách hàng"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô Tả Chi Tiết *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
              rows={6}
              placeholder="Mô tả chi tiết về section này..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL Hình Ảnh
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.png'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Image Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vị Trí Hình Ảnh
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image_position: 'left' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.image_position === 'left'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Bên Trái</div>
                    <div className="text-xs mt-1">Ảnh | Text</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image_position: 'right' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.image_position === 'right'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Bên Phải</div>
                    <div className="text-xs mt-1">Text | Ảnh</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Hủy
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {editingId ? 'Cập Nhật' : 'Thêm Mới'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* List Sections */}
      <div>
        <h3 className="text-xl font-bold text-text mb-4">
          Danh Sách Sections ({sections.length})
        </h3>

        {sections.length === 0 ? (
          <div className="glassmorphism-light p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có section nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`glassmorphism-strong p-6 ${
                    !section.is_active ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-6">
                    {/* Image Preview */}
                    {section.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={section.image_url}
                          alt={section.title}
                          className="w-32 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-text">
                            {section.title}
                          </h4>
                          {section.subtitle && (
                            <p className="text-sm text-gray-600 mt-1">
                              {section.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            section.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {section.is_active ? 'Hiển thị' : 'Ẩn'}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {section.image_position === 'left' ? 'Ảnh trái' : 'Ảnh phải'}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 line-clamp-2">
                        {section.description}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(section)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleActive(section)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
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
                        </button>
                        <button
                          onClick={() => handleDelete(section.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>

                        <div className="ml-auto flex items-center gap-1">
                          <button
                            onClick={() => handleMoveUp(section, index)}
                            disabled={index === 0}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(section, index)}
                            disabled={index === sections.length - 1}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

