'use client'

import { useState, useEffect, useMemo } from 'react'
import { Upload, Trash2, Search, Filter, Image as ImageIcon, Video, FileText, Grid3X3, List } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Pagination from '@/components/ui/Pagination'
import toast from 'react-hot-toast'
import { useDebounce } from '@/hooks/useDebounce'

interface MediaItem {
  id: string
  file_name: string
  file_url: string
  file_type: 'image' | 'video' | 'document' | 'other'
  file_size: number
  mime_type: string
  category: string
  alt_text: string | null
  width: number | null
  height: number | null
  created_at: string
}

export default function AdminMediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [category, setCategory] = useState('all')
  const [fileType, setFileType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 50

  // Debounce search query to avoid filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('general')
  const [uploadAltText, setUploadAltText] = useState('')

  useEffect(() => {
    fetchMedia()
  }, [category, fileType, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [category, fileType])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.append('category', category)
      if (fileType !== 'all') params.append('fileType', fileType)
      params.append('page', currentPage.toString())
      params.append('limit', ITEMS_PER_PAGE.toString())

      const response = await fetch(`/api/admin/media-library?${params}`)
      const data = await response.json()

      if (response.ok) {
        setMedia(data.media || [])
        setTotalCount(data.pagination?.total || 0)
        setTotalPages(Math.ceil((data.pagination?.total || 0) / ITEMS_PER_PAGE))
      } else {
        // Handle table not exists error gracefully
        if (data.error?.includes('media_library')) {
          console.warn('[AdminMediaLibrary] Table media_library does not exist yet')
          setMedia([])
          setTotalCount(0)
          setTotalPages(0)
        } else {
          throw new Error(data.error)
        }
      }
    } catch (error: any) {
      console.error('Fetch error:', error)
      // Only show toast for real errors, not missing table
      if (!error.message?.includes('media_library')) {
        toast.error('Lỗi khi tải media')
      }
      setMedia([])
      setTotalCount(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 20MB')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('category', uploadCategory)
      formData.append('altText', uploadAltText)

      const response = await fetch('/api/admin/media-library', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      toast.success('Upload thành công!')
      setSelectedFile(null)
      setUploadAltText('')
      fetchMedia()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Lỗi khi upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa file này?')) return

    try {
      const response = await fetch(`/api/admin/media-library?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      toast.success('Xóa file thành công!')
      fetchMedia()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Lỗi khi xóa file')
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Đã copy URL!')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <ImageIcon className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'document': return <FileText className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const filteredMedia = media.filter(item =>
    item.file_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    (item.alt_text && item.alt_text.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  )

  // Memoize stats calculations để tránh tính toán lại mỗi render
  const stats = useMemo(() => ({
    total: media.length,
    images: media.filter(m => m.file_type === 'image').length,
    totalSizeMB: (media.reduce((sum, m) => sum + m.file_size, 0) / (1024 * 1024)).toFixed(1),
    categories: [...new Set(media.map(m => m.category))].length,
  }), [media])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
          <p className="text-gray-600 mt-1">Quản lý tất cả file uploads</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid3X3 className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload File Mới
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500 transition">
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Chọn file hoặc kéo thả vào đây</p>
                    <p className="text-xs text-gray-500 mt-1">Tối đa 20MB</p>
                  </>
                )}
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="logo">Logo</option>
                <option value="favicon">Favicon</option>
                <option value="banner">Banner</option>
                <option value="content">Content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={uploadAltText}
                onChange={(e) => setUploadAltText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Mô tả ảnh (optional)"
              />
            </div>

            <Button
              onClick={handleUpload}
              loading={uploading}
              disabled={!selectedFile}
              fullWidth
            >
              Upload
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm file..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="logo">Logo</option>
          <option value="favicon">Favicon</option>
          <option value="banner">Banner</option>
          <option value="content">Content</option>
          <option value="general">General</option>
        </select>

        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {/* Media Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-2">Đang tải...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">Chưa có file nào</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-square bg-gray-100 relative">
                {item.file_type === 'image' ? (
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getFileIcon(item.file_type)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(item.file_url)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Copy URL"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate" title={item.file_name}>
                  {item.file_name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{formatFileSize(item.file_size)}</span>
                  <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-700 rounded">
                    {item.category}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-gray-200">
            {filteredMedia.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                  {item.file_type === 'image' ? (
                    <img
                      src={item.file_url}
                      alt={item.alt_text || item.file_name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(item.file_type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(item.file_size)} • {item.category} • {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrl(item.file_url)}
                  >
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pagination */}
      {!loading && filteredMedia.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="my-6"
        />
      )}

      {/* Results info */}
      {!loading && (
        <div className="mb-4 text-center text-sm text-gray-600">
          Hiển thị {filteredMedia.length} / {totalCount} files
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-pink-500">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Files</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-pink-500">
            {stats.images}
          </p>
          <p className="text-sm text-gray-600">Images</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-pink-500">
            {stats.totalSizeMB} MB
          </p>
          <p className="text-sm text-gray-600">Total Size</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-pink-500">
            {stats.categories}
          </p>
          <p className="text-sm text-gray-600">Categories</p>
        </Card>
      </div>
    </div>
  )
}
