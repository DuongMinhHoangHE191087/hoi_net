'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Zap,
  Target,
  Rocket,
  Shield,
  Code,
  Eye,
  Heart,
  Star,
  TrendingUp,
  Layers,
  Users,
  Globe,
  Lock,
  CheckCircle,
  Award,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Save,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Camera,
  Image as ImagePlus,
  Palette,
  Smile,
  Clock,
  Cpu,
  Database,
  FileImage,
  Film,
  Filter,
  Fingerprint,
  Flame,
  Grid,
  Hash,
  HelpCircle,
  Home,
  Inbox,
  Lightbulb,
  Link,
  Mail,
  Map,
  MessageCircle,
  Music,
  Package,
  Phone,
  PieChart,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  ShoppingCart,
  Sliders,
  Sun,
  Tag,
  Truck,
  Video,
  Wand2,
  Wifi,
  Wind,
  Wrench
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

type Feature = {
  id: string
  title: string
  description: string
  icon_type: 'lucide' | 'image'
  icon_value: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const availableIcons = [
  { name: 'Sparkles', component: Sparkles, label: 'Sparkles' },
  { name: 'Zap', component: Zap, label: 'Lightning' },
  { name: 'Target', component: Target, label: 'Target' },
  { name: 'Rocket', component: Rocket, label: 'Rocket' },
  { name: 'Shield', component: Shield, label: 'Shield' },
  { name: 'Code', component: Code, label: 'Code' },
  { name: 'Eye', component: Eye, label: 'Eye' },
  { name: 'Heart', component: Heart, label: 'Heart' },
  { name: 'Star', component: Star, label: 'Star' },
  { name: 'TrendingUp', component: TrendingUp, label: 'Trending Up' },
  { name: 'Layers', component: Layers, label: 'Layers' },
  { name: 'Users', component: Users, label: 'Users' },
  { name: 'Globe', component: Globe, label: 'Globe' },
  { name: 'Lock', component: Lock, label: 'Lock' },
  { name: 'CheckCircle', component: CheckCircle, label: 'Check' },
  { name: 'Award', component: Award, label: 'Award' },
  { name: 'Camera', component: Camera, label: 'Camera' },
  { name: 'ImagePlus', component: ImagePlus, label: 'Image Plus' },
  { name: 'Palette', component: Palette, label: 'Palette' },
  { name: 'Smile', component: Smile, label: 'Smile' },
  { name: 'Clock', component: Clock, label: 'Clock' },
  { name: 'Cpu', component: Cpu, label: 'CPU' },
  { name: 'Database', component: Database, label: 'Database' },
  { name: 'FileImage', component: FileImage, label: 'File Image' },
  { name: 'Film', component: Film, label: 'Film' },
  { name: 'Filter', component: Filter, label: 'Filter' },
  { name: 'Fingerprint', component: Fingerprint, label: 'Fingerprint' },
  { name: 'Flame', component: Flame, label: 'Flame' },
  { name: 'Grid', component: Grid, label: 'Grid' },
  { name: 'Hash', component: Hash, label: 'Hash' },
  { name: 'HelpCircle', component: HelpCircle, label: 'Help' },
  { name: 'Home', component: Home, label: 'Home' },
  { name: 'Inbox', component: Inbox, label: 'Inbox' },
  { name: 'Lightbulb', component: Lightbulb, label: 'Lightbulb' },
  { name: 'Link', component: Link, label: 'Link' },
  { name: 'Mail', component: Mail, label: 'Mail' },
  { name: 'Map', component: Map, label: 'Map' },
  { name: 'MessageCircle', component: MessageCircle, label: 'Message' },
  { name: 'Music', component: Music, label: 'Music' },
  { name: 'Package', component: Package, label: 'Package' },
  { name: 'Phone', component: Phone, label: 'Phone' },
  { name: 'PieChart', component: PieChart, label: 'Pie Chart' },
  { name: 'RefreshCw', component: RefreshCw, label: 'Refresh' },
  { name: 'Search', component: Search, label: 'Search' },
  { name: 'Send', component: Send, label: 'Send' },
  { name: 'Settings', component: Settings, label: 'Settings' },
  { name: 'Share2', component: Share2, label: 'Share' },
  { name: 'ShoppingCart', component: ShoppingCart, label: 'Shopping Cart' },
  { name: 'Sliders', component: Sliders, label: 'Sliders' },
  { name: 'Sun', component: Sun, label: 'Sun' },
  { name: 'Tag', component: Tag, label: 'Tag' },
  { name: 'Truck', component: Truck, label: 'Truck' },
  { name: 'Video', component: Video, label: 'Video' },
  { name: 'Wand2', component: Wand2, label: 'Wand' },
  { name: 'Wifi', component: Wifi, label: 'Wifi' },
  { name: 'Wind', component: Wind, label: 'Wind' },
  { name: 'Wrench', component: Wrench, label: 'Wrench' }
]

export default function AdminFeatures() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon_type: 'lucide' as 'lucide' | 'image',
    icon_value: 'Sparkles',
    is_active: true
  })

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/features')
      const data = await response.json()

      if (data.success) {
        setFeatures(data.features || [])
      } else {
        toast.error('Không thể tải danh sách tính năng')
      }
    } catch (error) {
      console.error('Error fetching features:', error)
      toast.error('Lỗi khi tải danh sách tính năng')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB')
      return
    }

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'web-ssg')

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setFormData((prev) => ({
        ...prev,
        icon_type: 'image',
        icon_value: data.secure_url
      }))
      toast.success('Upload ảnh thành công!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Lỗi khi upload ảnh')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và mô tả')
      return
    }

    try {
      const url = editingId
        ? `/api/admin/features/${editingId}`
        : '/api/admin/features'
      const method = editingId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          display_order: editingId
            ? features.find((f) => f.id === editingId)?.display_order || 0
            : features.length
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          editingId
            ? 'Cập nhật tính năng thành công!'
            : 'Thêm tính năng thành công!'
        )
        await fetchFeatures()
        resetForm()
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error saving feature:', error)
      toast.error('Lỗi khi lưu tính năng')
    }
  }

  const handleEdit = (feature: Feature) => {
    setFormData({
      title: feature.title,
      description: feature.description,
      icon_type: feature.icon_type,
      icon_value: feature.icon_value,
      is_active: feature.is_active
    })
    setEditingId(feature.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tính năng này?')) return

    try {
      const response = await fetch(`/api/admin/features/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Xóa tính năng thành công!')
        await fetchFeatures()
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error deleting feature:', error)
      toast.error('Lỗi khi xóa tính năng')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = features.findIndex((f) => f.id === id)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === features.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const newFeatures = [...features]
    ;[newFeatures[currentIndex], newFeatures[newIndex]] = [
      newFeatures[newIndex],
      newFeatures[currentIndex]
    ]

    // Update display_order for both features
    try {
      await Promise.all([
        fetch(`/api/admin/features/${newFeatures[currentIndex].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: currentIndex })
        }),
        fetch(`/api/admin/features/${newFeatures[newIndex].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: newIndex })
        })
      ])

      await fetchFeatures()
      toast.success('Đã cập nhật thứ tự!')
    } catch (error) {
      console.error('Error reordering features:', error)
      toast.error('Lỗi khi sắp xếp lại')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/features/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          currentStatus ? 'Đã tắt tính năng!' : 'Đã bật tính năng!'
        )
        await fetchFeatures()
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error toggling feature:', error)
      toast.error('Lỗi khi thay đổi trạng thái')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon_type: 'lucide',
      icon_value: 'Sparkles',
      is_active: true
    })
    setEditingId(null)
    setIsAdding(false)
  }

  const getIconComponent = (iconName: string) => {
    const icon = availableIcons.find((i) => i.name === iconName)
    return icon?.component || Sparkles
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Tính Năng</h2>
          <p className="text-gray-600 mt-1">
            Thêm, chỉnh sửa và sắp xếp các tính năng nổi bật
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {isAdding ? (
            <>
              <X className="w-4 h-4" />
              Hủy
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Thêm Tính Năng
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border-2 border-primary/20 p-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Chỉnh Sửa Tính Năng' : 'Thêm Tính Năng Mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ví dụ: Thiết Kế Đẹp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Mô tả chi tiết về tính năng này..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại Icon
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, icon_type: 'lucide' })
                    }
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      formData.icon_type === 'lucide'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Icon SVG
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, icon_type: 'image' })
                    }
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      formData.icon_type === 'image'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Upload Ảnh
                  </button>
                </div>
              </div>

              {formData.icon_type === 'lucide' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn Icon ({availableIcons.length} icons)
                  </label>
                  <div className="grid grid-cols-10 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {availableIcons.map((icon) => {
                      const Icon = icon.component
                      const isSelected = formData.icon_value === icon.name
                      return (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, icon_value: icon.name })
                          }
                          className={`p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          title={icon.label}
                        >
                          <Icon className="w-5 h-5 mx-auto" />
                        </button>
                      )
                    })}
                  </div>
                  {formData.icon_value && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <span>Đã chọn:</span>
                      {(() => {
                        const Icon = getIconComponent(formData.icon_value)
                        return <Icon className="w-5 h-5" />
                      })()}
                      <span className="font-medium">
                        {
                          availableIcons.find(
                            (i) => i.name === formData.icon_value
                          )?.label
                        }
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Icon
                  </label>
                  <div className="space-y-3">
                    <label
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploadingImage
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="mt-2 text-sm text-gray-600">
                            Đang upload...
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-600">
                            Click để chọn ảnh
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, SVG (tối đa 2MB)
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                    {formData.icon_type === 'image' && formData.icon_value && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={formData.icon_value}
                            alt="Preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Ảnh đã upload
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {formData.icon_value}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, icon_value: '' })
                          }
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Hiển thị tính năng này trên trang chủ
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {features.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Chưa có tính năng nào</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-3 text-primary hover:underline"
            >
              Thêm tính năng đầu tiên
            </button>
          </div>
        ) : (
          features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  {feature.icon_type === 'lucide' ? (
                    (() => {
                      const Icon = getIconComponent(feature.icon_value)
                      return <Icon className="w-6 h-6 text-primary" />
                    })()
                  ) : (
                    <div className="relative w-8 h-8">
                      <Image
                        src={feature.icon_value}
                        alt={feature.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            feature.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {feature.is_active ? 'Đang hiển thị' : 'Đã ẩn'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {feature.icon_type === 'lucide'
                            ? 'Icon SVG'
                            : 'Icon ảnh'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(feature.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển lên"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMove(feature.id, 'down')}
                        disabled={index === features.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển xuống"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(feature.id, feature.is_active)}
                        className="p-1.5 text-gray-400 hover:text-blue-600"
                        title={
                          feature.is_active ? 'Ẩn tính năng' : 'Hiển thị tính năng'
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(feature)}
                        className="p-1.5 text-gray-400 hover:text-primary"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(feature.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
