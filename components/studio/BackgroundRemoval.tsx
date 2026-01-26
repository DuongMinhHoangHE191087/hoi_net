'use client'

import { useState, useRef } from 'react'
import { Upload, X, Check, Loader2, Download, Image as ImageIcon } from 'lucide-react'
import { removeBackground, blobToUrl } from '@/lib/background-removal'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'

export default function BackgroundRemoval() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
      setProcessedUrl(null)
      setProgress(0)
    }
  }

  const handleRemoveBackground = async () => {
    if (!selectedImage) return
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      const blob = await removeBackground(selectedImage, {
        progress: (p) => setProgress(p),
        model: 'isnet' // Default high-quality model
      })
      
      const url = blobToUrl(blob)
      setProcessedUrl(url)
      toast.success('Đã tách nền thành công!')
    } catch (error) {
      toast.error('Lỗi khi tách nền. Vui lòng thử lại.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (processedUrl) {
      const link = document.createElement('a')
      link.href = processedUrl
      link.download = `removed-bg-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-2">Công Cụ Tách Nền AI</h2>
        <p className="opacity-90">Tự động xóa phông nền trong 5 giây - Miễn phí & Không giới hạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="flex flex-col h-[400px]">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-500" />
            Ảnh Gốc
          </h3>
          
          <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 relative overflow-hidden flex items-center justify-center">
            {selectedImage ? (
              <div className="relative w-full h-full p-2">
                <img 
                  src={URL.createObjectURL(selectedImage)} 
                  alt="Original" 
                  className="w-full h-full object-contain"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center cursor-pointer p-8 w-full h-full flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-500">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="font-medium text-gray-700">Click hoặc thả ảnh vào đây</p>
                <p className="text-xs text-gray-400 mt-2">Hỗ trợ JPG, PNG (Max 10MB)</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          <div className="mt-4">
            <Button 
              fullWidth 
              size="lg"
              disabled={!selectedImage || isProcessing}
              onClick={handleRemoveBackground}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý ({progress}%)
                </>
              ) : (
                'Tách Nền Ngay'
              )}
            </Button>
          </div>
        </Card>

        {/* Output Card */}
        <Card className="flex flex-col h-[400px]">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Kết Quả
          </h3>
          
          <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl bg-[url('/grid-bg.png')] relative overflow-hidden flex items-center justify-center">
            {processedUrl ? (
              <div className="w-full h-full p-2">
                <img 
                  src={processedUrl} 
                  alt="Processed" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                </div>
                <p>Kết quả sẽ hiện ở đây</p>
              </div>
            )}
            
            {/* Grid background effect with CSS */}
            <style jsx>{`
              .bg-\\[url('\\/grid-bg\\.png')\\] {
                background-image: 
                  linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                  linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
              }
            `}</style>
          </div>

          <div className="mt-4">
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              disabled={!processedUrl}
              onClick={downloadImage}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Tải Ảnh Về (PNG)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

