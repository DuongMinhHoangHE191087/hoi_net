'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Edit2, Trash2, Eye, Loader2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import { BlogPost } from '@/lib/supabase'
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

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({})

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog-posts?publishedOnly=false')
      const data = await response.json()

      if (response.ok) {
        setPosts(data.posts || [])
      } else {
        throw new Error(data.error || 'Failed to load posts')
      }
    } catch (error: any) {
      console.error('Error loading posts:', error)
      toast.error(error.message || 'Lỗi khi tải bài viết')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setCurrentPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author_name: '',
      published: false
    })
    setEditMode(true)
  }

  const handleSave = async () => {
    try {
      const url = currentPost.id
        ? `/api/admin/blog-posts/${currentPost.id}`
        : '/api/admin/blog-posts'

      const method = currentPost.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentPost)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Lưu bài viết thành công')
        setEditMode(false)
        setCurrentPost({})
        loadPosts()
      } else {
        throw new Error(data.error || 'Failed to save post')
      }
    } catch (error: any) {
      console.error('Error saving post:', error)
      toast.error(error.message || 'Lỗi khi lưu bài viết')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        const response = await fetch(`/api/admin/blog-posts/${id}`, {
          method: 'DELETE'
        })

        const data = await response.json()

        if (response.ok) {
          toast.success(data.message || 'Xóa bài viết thành công')
          loadPosts()
        } else {
          throw new Error(data.error || 'Failed to delete post')
        }
      } catch (error: any) {
        console.error('Error deleting post:', error)
        toast.error(error.message || 'Lỗi khi xóa bài viết')
      }
    }
  }

  if (editMode) {
    return (
      <div>
        <Card>
          <h2 className="text-2xl font-bold text-text mb-6">
            {currentPost.id ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
          </h2>

          <div className="space-y-4">
            <Input
              label="Tiêu đề"
              value={currentPost.title || ''}
              onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
              required
            />

            <Input
              label="Slug (URL)"
              value={currentPost.slug || ''}
              onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
              required
            />

            <Input
              label="Tóm tắt"
              value={currentPost.excerpt || ''}
              onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
              <AdvancedRichTextEditor
                content={currentPost.content || ''}
                onChange={(content) => setCurrentPost({ ...currentPost, content })}
                placeholder="Viết nội dung bài viết..."
                className="min-h-[400px]"
                showWordCount={true}
              />
            </div>

            <Input
              label="Tác giả"
              value={currentPost.author_name || ''}
              onChange={(e) => setCurrentPost({ ...currentPost, author_name: e.target.value })}
              required
            />

            <Input
              label="Ảnh đại diện (URL)"
              value={currentPost.featured_image || ''}
              onChange={(e) => setCurrentPost({ ...currentPost, featured_image: e.target.value })}
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentPost.published || false}
                onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                className="cursor-pointer"
              />
              <span className="text-gray-700">Công khai bài viết</span>
            </label>

            <div className="flex gap-3">
              <Button variant="primary" onClick={handleSave}>Lưu</Button>
              <Button variant="ghost" onClick={() => { setEditMode(false); setCurrentPost({}) }}>Hủy</Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Quản Lý Blog</h2>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo Bài Viết
        </Button>
      </div>

      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết</h3>
            <p className="text-gray-500">Tạo bài viết đầu tiên của bạn</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{post.author_name}</span>
                    <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${post.published ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'}`}>
                      {post.published ? 'Công khai' : 'Nháp'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => { setCurrentPost(post); setEditMode(true) }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="w-4 h-4 text-error" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

