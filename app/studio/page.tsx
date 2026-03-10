'use client'

import React, { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Upload, Image as ImageIcon, Layout, Scissors, Undo2, Redo2, Download } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import StudioErrorBoundary from '@/components/studio/StudioErrorBoundary'
import { blobToUrl } from '@/lib/background-removal'
import Link from 'next/link'

// Dynamically import Canvas to avoid SSR issues with Konva
const CanvasWorkspace = dynamic(() => import('@/components/studio/CanvasWorkspace'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100">Loading Studio...</div>
})

interface CanvasImage {
  id: string
  src: string
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  zIndex: number
}

// Sample backgrounds (fallback placeholders)
const SAMPLE_BACKGROUNDS = [
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="%23e0e7ff" width="800" height="600"/><text fill="%236366f1" font-size="24" x="400" y="300" text-anchor="middle">Phông Nền Xanh</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="%23fce7f3" width="800" height="600"/><text fill="%23ec4899" font-size="24" x="400" y="300" text-anchor="middle">Phông Nền Hồng</text></svg>'),
  'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="%23d1fae5" width="800" height="600"/><text fill="%2310b981" font-size="24" x="400" y="300" text-anchor="middle">Phông Nền Xanh Lá</text></svg>'),
]

export default function StudioPage() {
  const [images, setImages] = useState<CanvasImage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'uploads' | 'backgrounds'>('uploads')
  const [showExport, setShowExport] = useState(false)
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [exportQuality, setExportQuality] = useState(90)
  
  // Undo/Redo
  const [history, setHistory] = useState<CanvasImage[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const pushHistory = useCallback((newImages: CanvasImage[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1)
      return [...trimmed, [...newImages]]
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const undo = () => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setImages([...history[newIndex]])
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setImages([...history[newIndex]])
  }

  const setImagesWithHistory = (updater: React.SetStateAction<CanvasImage[]>) => {
    setImages(prev => {
      const newImages = typeof updater === 'function' ? updater(prev) : updater
      pushHistory(newImages)
      return newImages
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const newUrls = files.map(file => URL.createObjectURL(file))
      setUploadedAssets(prev => [...newUrls, ...prev])
    }
  }

  // Handle Drop onto Canvas
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    // Get the image source from drag data
    const src = e.dataTransfer.getData('text/plain')
    
    if (src) {
      const stage = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - stage.left
      const y = e.clientY - stage.top

      const newImage: CanvasImage = {
        id: `img-${Date.now()}`,
        src,
        x,
        y,
        scaleX: 0.5,
        scaleY: 0.5,
        rotation: 0,
        zIndex: images.length
      }

      setImagesWithHistory(prev => [...prev, newImage])
      setSelectedId(newImage.id)
    }
  }

  return (
    <div className="h-screen flex flex-col gradient-mesh overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex overflow-hidden mt-16">
        {/* Left Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Studio</h2>
              <div className="flex gap-1">
                <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors" title="Hoàn tác">
                  <Undo2 className="w-4 h-4" />
                </button>
                <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors" title="Làm lại">
                  <Redo2 className="w-4 h-4" />
                </button>
                <button onClick={() => setShowExport(true)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors" title="Xuất ảnh">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('uploads')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'uploads' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Uploads
              </button>
              <button
                onClick={() => setActiveTab('backgrounds')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'backgrounds' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Phông Nền
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'uploads' ? (
              <div className="space-y-4">
                <Button 
                  fullWidth 
                  variant="secondary" 
                  onClick={() => uploadInputRef.current?.click()}
                  className="border-dashed"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Tải Ảnh Lên
                </Button>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={uploadInputRef}
                  onChange={handleFileUpload}
                />

                <div className="grid grid-cols-2 gap-2">
                  {uploadedAssets.map((url, idx) => (
                    <div 
                      key={idx}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border hover:border-blue-400 group relative"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', url)
                      }}
                    >
                      <img src={url} alt="asset" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {uploadedAssets.length === 0 && (
                    <div className="col-span-2 text-center text-gray-400 py-8 text-sm">
                      Chưa có ảnh nào. Tải lên để bắt đầu!
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Công Cụ Hỗ Trợ</h3>
                  <Link href="/studio/background-remover">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100">
                      <div className="p-2 bg-white rounded-md shadow-sm">
                        <Scissors className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-medium">Công Cụ Tách Nền</div>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {SAMPLE_BACKGROUNDS.map((url, idx) => (
                  <div 
                    key={idx}
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 relative group"
                    onClick={() => {
                        const newImage: CanvasImage = {
                            id: `bg-${Date.now()}`,
                            src: url,
                            x: 0,
                            y: 0,
                            scaleX: 1,
                            scaleY: 1,
                            rotation: 0,
                            zIndex: -1
                        }
                        setImagesWithHistory(prev => [newImage, ...prev])
                    }}
                  >
                    <img src={url} alt="background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm">
                      Click để thêm
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-gray-200 p-8 overflow-hidden flex flex-col">
          <StudioErrorBoundary>
            <div className="flex-1 shadow-2xl rounded-xl overflow-hidden bg-white">
               <CanvasWorkspace
                 images={images}
                 setImages={setImagesWithHistory}
                 selectedId={selectedId}
                 setSelectedId={setSelectedId}
                 onDrop={handleDrop}
               />
            </div>
          </StudioErrorBoundary>
          <div className="mt-2 text-center text-xs text-gray-500">
            Kéo thả ảnh từ thư viện bên trái vào khung hình | Ctrl+Z hoàn tác | Ctrl+Y làm lại
          </div>
        </div>

        {/* Export Dialog */}
        {showExport && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowExport(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">Xuất Ảnh</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Định dạng</label>
                  <div className="flex gap-2">
                    {(['png', 'jpeg', 'webp'] as const).map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setExportFormat(fmt)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          exportFormat === fmt ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {exportFormat !== 'png' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chất lượng: {exportQuality}%</label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={exportQuality}
                      onChange={e => setExportQuality(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
                <button
                  onClick={() => {
                    const stage = document.querySelector('canvas')
                    if (stage) {
                      const link = document.createElement('a')
                      link.download = `studio-export.${exportFormat}`
                      link.href = stage.toDataURL(`image/${exportFormat}`, exportQuality / 100)
                      link.click()
                    }
                    setShowExport(false)
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Tải Xuống
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
