'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Loader2, ExternalLink, GripVertical, X, Check } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  useAllFooterLinks,
  useCreateFooterLink,
  useUpdateFooterLink,
  useDeleteFooterLink,
} from '@/hooks/useSiteSettings'
import { FooterLink } from '@/lib/supabase'
import toast from 'react-hot-toast'

const COLUMN_OPTIONS = [
  { value: 'products', label: 'Sản Phẩm' },
  { value: 'company', label: 'Công Ty' },
  { value: 'legal', label: 'Pháp Lý' },
]

interface LinkFormData {
  column_name: string
  column_title: string
  label: string
  href: string
  is_external: boolean
  is_active: boolean
}

const defaultFormData: LinkFormData = {
  column_name: 'products',
  column_title: 'Sản Phẩm',
  label: '',
  href: '',
  is_external: false,
  is_active: true,
}

export default function AdminFooterLinks() {
  const { data: links = [], isLoading } = useAllFooterLinks()
  const createLink = useCreateFooterLink()
  const updateLink = useUpdateFooterLink()
  const deleteLink = useDeleteFooterLink()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<LinkFormData>(defaultFormData)

  const handleColumnChange = (column: string) => {
    const columnOption = COLUMN_OPTIONS.find(c => c.value === column)
    setFormData({
      ...formData,
      column_name: column,
      column_title: columnOption?.label || column,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.label.trim() || !formData.href.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      if (editingId) {
        await updateLink.mutateAsync({
          id: editingId,
          updates: formData,
        })
        toast.success('Đã cập nhật link!')
      } else {
        await createLink.mutateAsync({
          ...formData,
          display_order: links.length,
        })
        toast.success('Đã thêm link mới!')
      }
      resetForm()
    } catch (err) {
      console.error('Error saving link:', err)
      toast.error('Lỗi khi lưu link')
    }
  }

  const handleEdit = (link: FooterLink) => {
    setEditingId(link.id)
    setFormData({
      column_name: link.column_name,
      column_title: link.column_title,
      label: link.label,
      href: link.href,
      is_external: link.is_external,
      is_active: link.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa link này?')) return

    try {
      await deleteLink.mutateAsync(id)
      toast.success('Đã xóa link!')
    } catch (err) {
      console.error('Error deleting link:', err)
      toast.error('Lỗi khi xóa link')
    }
  }

  const handleToggleActive = async (link: FooterLink) => {
    try {
      await updateLink.mutateAsync({
        id: link.id,
        updates: { is_active: !link.is_active },
      })
      toast.success(link.is_active ? 'Đã ẩn link!' : 'Đã hiện link!')
    } catch (err) {
      console.error('Error toggling link:', err)
      toast.error('Lỗi khi cập nhật link')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(defaultFormData)
  }

  // Group links by column
  const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.column_name]) {
      acc[link.column_name] = []
    }
    acc[link.column_name].push(link)
    return acc
  }, {} as Record<string, FooterLink[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-600">Đang tải footer links...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text">Quản Lý Footer Links</h2>
        <Button
          variant="primary"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Link
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-text">
              {editingId ? 'Sửa Link' : 'Thêm Link Mới'}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhóm (Column)
                </label>
                <select
                  value={formData.column_name}
                  onChange={(e) => handleColumnChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                >
                  {COLUMN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề nhóm
                </label>
                <input
                  type="text"
                  value={formData.column_title}
                  onChange={(e) => setFormData({ ...formData, column_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                  placeholder="Sản Phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên link *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                  placeholder="Blog"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="text"
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                  placeholder="/blog hoặc https://..."
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_external}
                  onChange={(e) => setFormData({ ...formData, is_external: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Link ngoài (mở tab mới)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Hiển thị</span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={createLink.isPending || updateLink.isPending}>
                {(createLink.isPending || updateLink.isPending) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {editingId ? 'Cập nhật' : 'Thêm'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Hủy
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Links by Column */}
      {COLUMN_OPTIONS.map((column) => (
        <Card key={column.value}>
          <h3 className="text-lg font-bold text-text mb-4">{column.label}</h3>

          {groupedLinks[column.value]?.length > 0 ? (
            <div className="space-y-2">
              {groupedLinks[column.value].map((link) => (
                <div
                  key={link.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    link.is_active ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{link.label}</span>
                      {link.is_external && (
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      )}
                      {!link.is_active && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Ẩn</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{link.href}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(link)}
                      className={`p-1.5 rounded-lg transition ${
                        link.is_active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={link.is_active ? 'Ẩn link' : 'Hiện link'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(link)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Chưa có link nào trong nhóm này</p>
          )}
        </Card>
      ))}
    </div>
  )
}
