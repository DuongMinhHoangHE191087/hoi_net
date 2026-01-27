'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Loader2, ExternalLink, GripVertical, X, Check, Smartphone, ShieldCheck, Lock } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import {
  useAllNavigationLinks,
  useCreateNavigationLink,
  useUpdateNavigationLink,
  useDeleteNavigationLink,
} from '@/hooks/useSiteSettings'
import { NavigationLink } from '@/lib/supabase'
import toast from 'react-hot-toast'

// Common Lucide icons for selection
const ICON_OPTIONS = [
  { value: '', label: 'Không có icon' },
  { value: 'Home', label: 'Home' },
  { value: 'BookOpen', label: 'BookOpen (Blog)' },
  { value: 'Users', label: 'Users (About)' },
  { value: 'Mail', label: 'Mail (Contact)' },
  { value: 'Image', label: 'Image' },
  { value: 'FileText', label: 'FileText' },
  { value: 'Settings', label: 'Settings' },
  { value: 'HelpCircle', label: 'HelpCircle' },
  { value: 'Star', label: 'Star' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Sparkles', label: 'Sparkles' },
]

interface LinkFormData {
  label: string
  href: string
  is_external: boolean
  icon: string
  is_active: boolean
  show_in_mobile: boolean
  requires_auth: boolean
  requires_admin: boolean
}

const defaultFormData: LinkFormData = {
  label: '',
  href: '',
  is_external: false,
  icon: '',
  is_active: true,
  show_in_mobile: true,
  requires_auth: false,
  requires_admin: false,
}

export default function AdminNavigationLinks() {
  const { data: links = [], isLoading } = useAllNavigationLinks()
  const createLink = useCreateNavigationLink()
  const updateLink = useUpdateNavigationLink()
  const deleteLink = useDeleteNavigationLink()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<LinkFormData>(defaultFormData)

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
        toast.success('Đã cập nhật menu!')
      } else {
        await createLink.mutateAsync({
          ...formData,
          display_order: links.length,
        })
        toast.success('Đã thêm menu mới!')
      }
      resetForm()
    } catch (err) {
      console.error('Error saving link:', err)
      toast.error('Lỗi khi lưu menu')
    }
  }

  const handleEdit = (link: NavigationLink) => {
    setEditingId(link.id)
    setFormData({
      label: link.label,
      href: link.href,
      is_external: link.is_external,
      icon: link.icon || '',
      is_active: link.is_active,
      show_in_mobile: link.show_in_mobile,
      requires_auth: link.requires_auth,
      requires_admin: link.requires_admin,
    })
    setShowForm(true)
  }

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; linkId: string | null }>({
    isOpen: false,
    linkId: null
  })

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, linkId: id })
  }

  const confirmDelete = async () => {
    const id = deleteConfirm.linkId
    if (!id) return
    
    setDeleteConfirm({ isOpen: false, linkId: null })

    try {
      await deleteLink.mutateAsync(id)
      toast.success('Đã xóa menu!')
    } catch (err) {
      console.error('Error deleting link:', err)
      toast.error('Lỗi khi xóa menu')
    }
  }

  const handleToggleActive = async (link: NavigationLink) => {
    try {
      await updateLink.mutateAsync({
        id: link.id,
        updates: { is_active: !link.is_active },
      })
      toast.success(link.is_active ? 'Đã ẩn menu!' : 'Đã hiện menu!')
    } catch (err) {
      console.error('Error toggling link:', err)
      toast.error('Lỗi khi cập nhật menu')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(defaultFormData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-600">Đang tải navigation...</span>
      </div>
    )
  }

  return (
    <>
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, linkId: null })}
        onConfirm={confirmDelete}
        title="Xoá Menu"
        message="Bạn có chắc chắn muốn xoá menu này? Hành động này không thể hoàn tác."
        variant="danger"
        confirmText="Xoá"
        cancelText="Huỷ"
      />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text">Quản Lý Navigation Menu</h2>
          <Button
            variant="primary"
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Menu
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-text">
                {editingId ? 'Sửa Menu' : 'Thêm Menu Mới'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên menu *
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (Lucide)
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_external}
                  onChange={(e) => setFormData({ ...formData, is_external: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Link ngoài</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_in_mobile}
                  onChange={(e) => setFormData({ ...formData, show_in_mobile: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Hiển thị mobile</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_auth}
                  onChange={(e) => setFormData({ ...formData, requires_auth: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Yêu cầu đăng nhập</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_admin}
                  onChange={(e) => setFormData({ ...formData, requires_admin: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Chỉ Admin</span>
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

      {/* Links List */}
      <Card>
        <h3 className="text-lg font-bold text-text mb-4">Danh sách menu ({links.length})</h3>

        {links.length > 0 ? (
          <div className="space-y-2">
            {links.map((link, index) => (
              <div
                key={link.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  link.is_active ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-60'
                }`}
              >
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />

                <span className="text-sm text-gray-400 font-mono w-6">{index + 1}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{link.label}</span>
                    {link.icon && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                        {link.icon}
                      </span>
                    )}
                    {link.is_external && (
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    )}
                    {!link.show_in_mobile && (
                      <span title="Ẩn trên mobile"><Smartphone className="w-3 h-3 text-gray-400" /></span>
                    )}
                    {link.requires_auth && (
                      <span title="Yêu cầu đăng nhập"><Lock className="w-3 h-3 text-orange-500" /></span>
                    )}
                    {link.requires_admin && (
                      <span title="Chỉ Admin"><ShieldCheck className="w-3 h-3 text-red-500" /></span>
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
                    title={link.is_active ? 'Ẩn menu' : 'Hiện menu'}
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
          <p className="text-gray-500 text-sm">Chưa có menu nào</p>
        )}
        </Card>
      </div>
    </>
  )
}

