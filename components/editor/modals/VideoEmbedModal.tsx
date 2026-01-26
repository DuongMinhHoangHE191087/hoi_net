'use client'

import { useState } from 'react'
import { X, Youtube, Video, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoEmbedModalProps {
  isOpen: boolean
  onClose: () => void
  onInsertYoutube: (url: string) => void
  onInsertVideo: (url: string) => void
  onInsertIframe: (url: string) => void
}

export default function VideoEmbedModal({
  isOpen,
  onClose,
  onInsertYoutube,
  onInsertVideo,
  onInsertIframe,
}: VideoEmbedModalProps) {
  const [activeTab, setActiveTab] = useState<'youtube' | 'video' | 'embed'>('youtube')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleInsert = () => {
    if (!url.trim()) {
      setError('Vui lòng nhập URL')
      return
    }

    setError('')

    switch (activeTab) {
      case 'youtube':
        const videoId = extractYoutubeId(url)
        if (!videoId) {
          setError('URL YouTube không hợp lệ')
          return
        }
        onInsertYoutube(url)
        break
      case 'video':
        if (!url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
          setError('URL video phải là file .mp4, .webm hoặc .ogg')
          return
        }
        onInsertVideo(url)
        break
      case 'embed':
        onInsertIframe(url)
        break
    }

    handleClose()
  }

  const handleClose = () => {
    setUrl('')
    setError('')
    setActiveTab('youtube')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Chèn video</h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'youtube'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Youtube className="w-4 h-4 inline mr-2" />
              YouTube
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'video'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Video className="w-4 h-4 inline mr-2" />
              Video URL
            </button>
            <button
              onClick={() => setActiveTab('embed')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'embed'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Embed
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {activeTab === 'youtube' && 'URL YouTube'}
                {activeTab === 'video' && 'URL Video'}
                {activeTab === 'embed' && 'URL Embed'}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError('')
                }}
                placeholder={
                  activeTab === 'youtube'
                    ? 'https://www.youtube.com/watch?v=...'
                    : activeTab === 'video'
                    ? 'https://example.com/video.mp4'
                    : 'https://example.com/embed/...'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              {activeTab === 'youtube' && (
                <>
                  <p className="font-medium mb-1">Hỗ trợ các định dạng:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
                    <li>https://youtu.be/VIDEO_ID</li>
                    <li>https://www.youtube.com/shorts/VIDEO_ID</li>
                  </ul>
                </>
              )}
              {activeTab === 'video' && (
                <>
                  <p className="font-medium mb-1">Định dạng hỗ trợ:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>MP4 (.mp4)</li>
                    <li>WebM (.webm)</li>
                    <li>OGG (.ogg)</li>
                  </ul>
                </>
              )}
              {activeTab === 'embed' && (
                <>
                  <p className="font-medium mb-1">Embed từ:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Vimeo</li>
                    <li>Google Maps</li>
                    <li>Spotify</li>
                    <li>Các nền tảng khác</li>
                  </ul>
                </>
              )}
            </div>

            {/* Preview */}
            {activeTab === 'youtube' && url && extractYoutubeId(url) && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYoutubeId(url)}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleInsert}
              disabled={!url.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Chèn video
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

