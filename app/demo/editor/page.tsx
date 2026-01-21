'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { sanitizeHTML } from '@/lib/security'

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

export default function EditorDemoPage() {
  const [content, setContent] = useState('<p>Bắt đầu viết nội dung của bạn...</p>')
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="min-h-screen gradient-mesh py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Demo Rich Text Editor</h1>
          <p className="text-gray-600">Thử nghiệm các tính năng của Advanced Rich Text Editor</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowPreview(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !showPreview ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Chỉnh sửa
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showPreview ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Xem trước
          </button>
        </div>

        {showPreview ? (
          <div className="glassmorphism-strong p-8">
            <h2 className="text-xl font-semibold mb-4">Xem trước nội dung</h2>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
            />
          </div>
        ) : (
          <AdvancedRichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Viết nội dung của bạn ở đây..."
            showWordCount={true}
          />
        )}

        {/* Feature List */}
        <div className="mt-12 glassmorphism-light p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tính năng Editor</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-primary mb-2">Định dạng văn bản</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Đậm, Nghiêng, Gạch chân</li>
                <li>• Gạch ngang</li>
                <li>• Màu chữ</li>
                <li>• Highlight</li>
                <li>• Chỉ số trên/dưới</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Cấu trúc</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Heading 1-6</li>
                <li>• Danh sách thường</li>
                <li>• Danh sách số</li>
                <li>• Task list</li>
                <li>• Trích dẫn</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Căn chỉnh</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Căn trái</li>
                <li>• Căn giữa</li>
                <li>• Căn phải</li>
                <li>• Căn đều</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Chèn nội dung</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Hình ảnh (upload/URL)</li>
                <li>• Video YouTube</li>
                <li>• Bảng dữ liệu</li>
                <li>• Code block</li>
                <li>• Liên kết</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
