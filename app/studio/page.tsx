'use client'

import React, { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Upload, Image as ImageIcon, Layout, Scissors } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
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

// Mock Backgrounds
const MOCK_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
  'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&q=80',
]

export default function StudioPage() {
  const [images, setImages] = useState<CanvasImage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'uploads' | 'backgrounds'>('uploads')
  
  const uploadInputRef = useRef<HTMLInputElement>(null)

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
        scaleX: 0.5, // Default scale
        scaleY: 0.5,
        rotation: 0,
        zIndex: images.length
      }

      setImages(prev => [...prev, newImage])
      setSelectedId(newImage.id)
    }
  }

  return (
    <div className="h-screen flex flex-col gradient-mesh overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex overflow-hidden mt-16">
        {/* Left Sidebar (Assets) */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-lg mb-4">Studio</h2>
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
                {MOCK_BACKGROUNDS.map((url, idx) => (
                  <div 
                    key={idx}
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 relative group"
                    onClick={() => {
                        // Add background logic (send to back)
                        const newImage: CanvasImage = {
                            id: `bg-${Date.now()}`,
                            src: url,
                            x: 0,
                            y: 0,
                            scaleX: 1,
                            scaleY: 1,
                            rotation: 0,
                            zIndex: -1 // Always at bottom
                        }
                        // Remove existing BG if mostly fullscreen? Or just add.
                        setImages(prev => [newImage, ...prev])
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
          <div className="flex-1 shadow-2xl rounded-xl overflow-hidden bg-white">
             <CanvasWorkspace
                images={images}
                setImages={setImages}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onDrop={handleDrop}
             />
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            Kéo thả ảnh từ thư viện bên trái vào khung hình
          </div>
        </div>
      </main>
    </div>
  )
}

