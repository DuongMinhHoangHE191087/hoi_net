'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Copy, Check,
  Sparkles, AlertCircle, ChevronDown, ChevronUp, Search
} from 'lucide-react'
import { db, SystemPrompt } from '@/lib/supabase'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'general', label: 'Tổng Quát' },
  { value: 'restore', label: 'Phục Hồi' },
  { value: 'enhance', label: 'Nâng Cao' },
  { value: 'colorize', label: 'Tô Màu' },
  { value: 'upscale', label: 'Phóng To' },
]

export default function AdminSystemPrompts() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<SystemPrompt>>({
    name: '',
    display_name: '',
    category: 'general',
    system_prompt: '',
    user_prompt_template: '{user_input}',
    description: '',
    parameters: {
      upscale: 2,
      denoise: true,
      enhanceFaces: true,
      colorAccuracy: 0.8,
    },
    is_active: true,
    is_default: false,
    display_order: 0,
  })

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      setLoading(true)
      const data = await db.getAllSystemPrompts()
      setPrompts(data)
    } catch (error) {
      console.error('Error loading prompts:', error)
      toast.error('Không thể tải system prompts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.display_name || !formData.system_prompt) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      if (editingId) {
        await db.updateSystemPrompt(editingId, formData)
        toast.success('Đã cập nhật system prompt')
      } else {
        await db.createSystemPrompt(formData as Omit<SystemPrompt, 'id' | 'created_at' | 'updated_at'>)
        toast.success('Đã tạo system prompt mới')
      }

      resetForm()
      loadPrompts()
    } catch (error: any) {
      console.error('Error saving prompt:', error)
      toast.error(error.message || 'Không thể lưu system prompt')
    }
  }

  const handleEdit = (prompt: SystemPrompt) => {
    setFormData(prompt)
    setEditingId(prompt.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa system prompt này?')) return

    try {
      await db.deleteSystemPrompt(id)
      toast.success('Đã xóa system prompt')
      loadPrompts()
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Không thể xóa system prompt')
    }
  }

  const handleToggleActive = async (prompt: SystemPrompt) => {
    try {
      await db.updateSystemPrompt(prompt.id, { is_active: !prompt.is_active })
      toast.success(prompt.is_active ? 'Đã ẩn' : 'Đã kích hoạt')
      loadPrompts()
    } catch (error) {
      console.error('Error toggling prompt:', error)
      toast.error('Không thể cập nhật')
    }
  }

  const handleSetDefault = async (prompt: SystemPrompt) => {
    try {
      // Unset all defaults first
      const updates = prompts.map(p =>
        db.updateSystemPrompt(p.id, { is_default: p.id === prompt.id })
      )
      await Promise.all(updates)
      toast.success('Đã đặt làm mặc định')
      loadPrompts()
    } catch (error) {
      console.error('Error setting default:', error)
      toast.error('Không thể đặt mặc định')
    }
  }

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Đã copy')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      category: 'general',
      system_prompt: '',
      user_prompt_template: '{user_input}',
      description: '',
      parameters: {
        upscale: 2,
        denoise: true,
        enhanceFaces: true,
        colorAccuracy: 0.8,
      },
      is_active: true,
      is_default: false,
      display_order: 0,
    })
    setEditingId(null)
    setShowForm(false)
  }

  // Filter prompts
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || prompt.category === filterCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Quản Lý System Prompts
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Cấu hình prompts cho Gemini AI xử lý ảnh
          </p>
        </div>

        <motion.button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Thêm Prompt Mới
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm prompt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">Tất cả danh mục</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="glassmorphism-strong p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingId ? 'Chỉnh Sửa Prompt' : 'Thêm Prompt Mới'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Kỹ Thuật (name) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="vd: general_restore"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Hiển Thị *
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="vd: Phục Hồi Tổng Quát"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh Mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thứ Tự Hiển Thị
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô Tả
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn về prompt này"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Prompt * (Hướng dẫn cho AI)
                </label>
                <textarea
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  placeholder="Bạn là chuyên gia xử lý ảnh...&#10;&#10;Hãy:&#10;1. Phân tích ảnh&#10;2. Xử lý tự nhiên&#10;3. Giữ nguyên bản chất"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                  rows={8}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Đây là hướng dẫn chính cho AI. Viết chi tiết và rõ ràng.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Prompt Template (Kết hợp với input từ user)
                </label>
                <textarea
                  value={formData.user_prompt_template}
                  onChange={(e) => setFormData({ ...formData, user_prompt_template: e.target.value })}
                  placeholder="{user_input}&#10;&#10;Yêu cầu:&#10;- Loại ảnh: {image_type}&#10;- Độ ưu tiên: {priority}"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sử dụng placeholders: {'{user_input}'}, {'{image_type}'}, {'{priority}'}, etc.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm text-gray-700">Kích hoạt</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm text-gray-700">Đặt làm mặc định</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Cập Nhật' : 'Tạo Mới'}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Hủy
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="glassmorphism-strong p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Không tìm thấy prompt nào
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterCategory !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc tìm kiếm'
                : 'Thêm prompt đầu tiên bằng nút "Thêm Prompt Mới"'}
            </p>
          </div>
        ) : (
          filteredPrompts.map((prompt, index) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onSetDefault={handleSetDefault}
              onCopy={handleCopyPrompt}
              copiedId={copiedId}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Prompt Card Component
function PromptCard({
  prompt,
  index,
  onEdit,
  onDelete,
  onToggleActive,
  onSetDefault,
  onCopy,
  copiedId
}: {
  prompt: SystemPrompt
  index: number
  onEdit: (prompt: SystemPrompt) => void
  onDelete: (id: string) => void
  onToggleActive: (prompt: SystemPrompt) => void
  onSetDefault: (prompt: SystemPrompt) => void
  onCopy: (text: string, id: string) => void
  copiedId: string | null
}) {
  const [expanded, setExpanded] = useState(false)

  const categoryLabel = CATEGORIES.find(c => c.value === prompt.category)?.label || prompt.category

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glassmorphism-strong p-6 ${!prompt.is_active ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-800">{prompt.display_name}</h3>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {categoryLabel}
            </span>
            {prompt.is_default && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Mặc định
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{prompt.name}</span>
          </p>

          {prompt.description && (
            <p className="text-sm text-gray-700">{prompt.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={() => onEdit(prompt)}
            className="p-2 hover:bg-primary/10 rounded-lg text-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Chỉnh sửa"
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={() => onToggleActive(prompt)}
            className={`p-2 hover:bg-gray-100 rounded-lg ${prompt.is_active ? 'text-green-600' : 'text-gray-400'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={prompt.is_active ? 'Ẩn' : 'Kích hoạt'}
          >
            {prompt.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </motion.button>

          <motion.button
            onClick={() => onDelete(prompt.id)}
            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Xóa"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Expand/Collapse */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2 mb-3"
        whileHover={{ x: 2 }}
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? 'Thu gọn' : 'Xem chi tiết'}
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">System Prompt:</label>
                <motion.button
                  onClick={() => onCopy(prompt.system_prompt, `${prompt.id}-system`)}
                  className="text-xs text-gray-500 hover:text-primary flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                >
                  {copiedId === `${prompt.id}-system` ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy
                </motion.button>
              </div>
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                {prompt.system_prompt}
              </pre>
            </div>

            {prompt.user_prompt_template && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">User Prompt Template:</label>
                  <motion.button
                    onClick={() => onCopy(prompt.user_prompt_template!, `${prompt.id}-user`)}
                    className="text-xs text-gray-500 hover:text-primary flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    {copiedId === `${prompt.id}-user` ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copy
                  </motion.button>
                </div>
                <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                  {prompt.user_prompt_template}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-semibold text-gray-700">Thứ tự:</label>
                <span className="ml-2 text-gray-600">{prompt.display_order}</span>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Trạng thái:</label>
                <span className={`ml-2 ${prompt.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                  {prompt.is_active ? 'Kích hoạt' : 'Ẩn'}
                </span>
              </div>
            </div>

            {!prompt.is_default && (
              <motion.button
                onClick={() => onSetDefault(prompt)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
                whileHover={{ x: 2 }}
              >
                Đặt làm mặc định
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
