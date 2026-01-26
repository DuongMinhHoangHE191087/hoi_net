'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Monitor, Smartphone, Tablet, RefreshCw, ExternalLink, 
  Maximize2, Minimize2, Loader2, X, ZoomIn, ZoomOut
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type DeviceType = 'desktop' | 'tablet' | 'mobile'

interface HomepagePreviewProps {
  refreshKey?: number
}

const deviceSizes = {
  desktop: { width: '100%', height: '600px', label: 'Desktop' },
  tablet: { width: '768px', height: '600px', label: 'Tablet' },
  mobile: { width: '375px', height: '667px', label: 'Mobile' }
}

export default function HomepagePreview({ refreshKey = 0 }: HomepagePreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scale, setScale] = useState(100)
  const [key, setKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Refresh iframe when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      handleRefresh()
    }
  }, [refreshKey])

  const handleRefresh = () => {
    setLoading(true)
    setKey(prev => prev + 1)
  }

  const handleIframeLoad = () => {
    setLoading(false)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(150, Math.max(50, prev + delta)))
  }

  const devices: { type: DeviceType; icon: any; label: string }[] = [
    { type: 'desktop', icon: Monitor, label: 'Desktop' },
    { type: 'tablet', icon: Tablet, label: 'Tablet' },
    { type: 'mobile', icon: Smartphone, label: 'Mobile' }
  ]

  const currentSize = deviceSizes[device]

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <h3 className="text-white font-medium">Preview Trang Chủ</h3>
              
              {/* Device Switcher */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                {devices.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setDevice(type)}
                    className={`
                      p-2 rounded-md transition-all flex items-center gap-2
                      ${device === type 
                        ? 'bg-primary text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }
                    `}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-2 py-1">
                <button
                  onClick={() => handleZoom(-10)}
                  className="p-1 text-gray-400 hover:text-white"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-300 w-12 text-center">{scale}%</span>
                <button
                  onClick={() => handleZoom(10)}
                  className="p-1 text-gray-400 hover:text-white"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                title="Làm mới"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                title="Mở tab mới"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                title="Đóng fullscreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div 
              style={{ 
                width: currentSize.width === '100%' ? '90%' : currentSize.width,
                height: currentSize.height,
                transform: `scale(${scale / 100})`,
                transformOrigin: 'center center'
              }}
              className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <iframe
                key={`fullscreen-${key}`}
                ref={iframeRef}
                src="/?preview=true"
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                title="Homepage Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Normal Card View */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-text">Preview Trang Chủ</h3>
            <p className="text-gray-500 text-sm mt-1">
              Xem trước giao diện thực tế trên các thiết bị
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {devices.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setDevice(type)}
                  className={`
                    p-2 rounded-md transition-all
                    ${device === type 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Actions */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Mở tab mới
            </a>
          </div>
        </div>

        {/* Device Frame Info */}
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <span className="px-2 py-0.5 bg-gray-100 rounded">
            {deviceSizes[device].label}
          </span>
          <span>
            {device === 'desktop' ? 'Full width' : deviceSizes[device].width} × {deviceSizes[device].height}
          </span>
        </div>

        {/* Preview Container */}
        <div 
          ref={containerRef}
          className="relative bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center p-4"
          style={{ minHeight: '500px' }}
        >
          {/* Device Frame */}
          <div 
            className={`
              relative bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300
              ${device === 'mobile' ? 'rounded-[2rem] border-[8px] border-gray-800' : ''}
              ${device === 'tablet' ? 'rounded-xl border-[6px] border-gray-700' : ''}
            `}
            style={{ 
              width: device === 'desktop' ? '100%' : currentSize.width,
              height: currentSize.height,
              maxWidth: '100%'
            }}
          >
            {/* Mobile Notch */}
            {device === 'mobile' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-800 rounded-b-xl z-20" />
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-gray-600">Đang tải preview...</span>
                </div>
              </div>
            )}

            {/* Iframe */}
            <iframe
              key={key}
              src="/?preview=true"
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              title="Homepage Preview"
              style={{
                pointerEvents: loading ? 'none' : 'auto'
              }}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-700">
            💡 <strong>Mẹo:</strong> Preview sẽ tự động cập nhật khi bạn lưu thay đổi. 
            Nhấn <RefreshCw className="w-4 h-4 inline" /> để làm mới thủ công.
          </p>
        </div>
      </Card>
    </>
  )
}

