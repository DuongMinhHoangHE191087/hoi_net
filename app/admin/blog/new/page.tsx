'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  Save, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle,
  AlertCircle, FileText, Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { blogPostSchema } from '@/lib/validation'
import { sanitizeInput, sanitizeHTML } from '@/lib/security'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// Lazy load rich text editor
const AdvancedRichTextEditor = dynamic(
  () => import('@/components/editor/AdvancedRichTextEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-200 rounded-xl p-8 text-center bg-white">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">Đang tải editor...</p>
      </div>
    )
  }
)

export default function NewBlogPostPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '<p>Bắt đầu viết bài...</p>',
    author_name: '',
    featured_image: '',
    published: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/admin/blog/new')
      return
    }

    if (!authLoading && !isAdmin) {
      router.push('/unauthorized')
      return
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin'
      }))
    }
  }, [user, isAdmin, authLoading])

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Sanitize inputs
      const sanitized = {
        title: sanitizeInput(formData.title, 200),
        slug: sanitizeInput(formData.slug, 200),
        excerpt: sanitizeInput(formData.excerpt, 500),
        content: sanitizeHTML(formData.content),
        author_name: sanitizeInput(formData.author_name, 100),
        featured_image: formData.featured_image.trim(),
        published: formData.published,
      }

      // Validate with Zod
      const result = blogPostSchema.safeParse(sanitized)

      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        result.error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
        toast.error('Vui lòng kiểm tra lại thông tin')
        return
      }

      // Check if slug already exists
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', result.data.slug)
        .single()

      if (existing) {
        setErrors({ slug: 'Slug này đã tồn tại' })
        toast.error('Slug này đã tồn tại')
        return
      }

      // Create blog post
      const { error: insertError } = await supabase
        .from('blog_posts')
        .insert({
          ...result.data,
          author_id: user?.id,
        })

      if (insertError) throw insertError

      toast.success('Tạo bài viết thành công!')

      // Redirect to blog list
      setTimeout(() => {
        router.push('/admin/blog')
      }, 1500)

    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error.message || 'Không thể tạo bài viết')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            <h1 className="text-4xl font-bold gradient-text mb-2">Tạo Bài Viết Mới</h1>
            <p className="text-gray-600">Viết và xuất bản bài viết blog</p>
          </div>

          <motion.button
            onClick={() => setPreview(!preview)}
            className="btn-glass-secondary px-6 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2">
              {preview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {preview ? 'Chỉnh Sửa' : 'Xem Trước'}
            </span>
          </motion.button>
        </motion.div>

        {preview ? (
          // Preview Mode
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glassmorphism-strong p-8"
          >
            {formData.featured_image && (
              <img
                src={formData.featured_image}
                alt={formData.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{formData.title || 'Tiêu đề'}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <span>Bởi {formData.author_name}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
            <p className="text-lg text-gray-600 mb-8 italic">{formData.excerpt}</p>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(formData.content) }}
            />
          </motion.div>
        ) : (
          // Edit Mode
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glassmorphism-strong p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tiêu Đề <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tiêu đề bài viết..."
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={`input-glass pl-12 ${errors.title ? 'border-2 border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="slug-bai-viet"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className={`input-glass ${errors.slug ? 'border-2 border-red-500' : ''}`}
                  required
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.slug}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  URL: /blog/{formData.slug || 'slug-bai-viet'}
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tóm Tắt <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Tóm tắt ngắn gọn về bài viết..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className={`input-glass resize-none ${errors.excerpt ? 'border-2 border-red-500' : ''}`}
                  required
                />
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.excerpt}
                  </p>
                )}
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội Dung <span className="text-red-500">*</span>
                </label>
                <AdvancedRichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Viết nội dung bài viết..."
                  className="min-h-[500px]"
                  showWordCount={true}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.content}
                  </p>
                )}
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh Đại Diện
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    className={`input-glass pl-12 ${errors.featured_image ? 'border-2 border-red-500' : ''}`}
                  />
                </div>
                {formData.featured_image && (
                  <img
                    src={formData.featured_image}
                    alt="Preview"
                    className="mt-2 w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>

              {/* Author Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Tác Giả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tên tác giả"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className={`input-glass ${errors.author_name ? 'border-2 border-red-500' : ''}`}
                  required
                />
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
                <label htmlFor="published" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Xuất bản ngay
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-glass-primary flex-1 py-3"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {formData.published ? 'Xuất Bản' : 'Lưu Nháp'}
                      </>
                    )}
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="btn-glass-secondary px-8 py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Hủy
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
