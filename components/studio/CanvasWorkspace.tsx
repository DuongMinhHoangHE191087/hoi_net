'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage, Transformer, Text } from 'react-konva'
import useImage from 'use-image'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ZoomIn, ZoomOut, RotateCcw, Download, Layers, Trash2 } from 'lucide-react'

interface CanvasImage {
  id: string
  src: string
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  zIndex: number
  width?: number
  height?: number
}

interface CanvasWorkspaceProps {
  images: CanvasImage[]
  setImages: React.Dispatch<React.SetStateAction<CanvasImage[]>>
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
}

const URLImage = ({ image, isSelected, onSelect, onChange }: any) => {
  const [img] = useImage(image.src)
  const shapeRef = useRef<any>(null)
  const trRef = useRef<any>(null)

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  return (
    <>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        image={img}
        x={image.x}
        y={image.y}
        offsetX={img ? img.width / 2 : 0}
        offsetY={img ? img.height / 2 : 0}
        scaleX={image.scaleX}
        scaleY={image.scaleY}
        rotation={image.rotation}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...image,
            x: e.target.x(),
            y: e.target.y(),
          })
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // Reset scale to 1 to avoid weird scaling effects but keep the visual size
          node.scaleX(1)
          node.scaleY(1)
          
          onChange({
            ...image,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY,
          })
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

export default function CanvasWorkspace({ 
  images, 
  setImages, 
  selectedId, 
  setSelectedId,
  onDrop 
}: CanvasWorkspaceProps) {
  const stageRef = useRef<any>(null)
  const [stageScale, setStageScale] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [isHarmonizing, setIsHarmonizing] = useState(false)
  const [filters, setFilters] = useState<any>(null)

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      setSelectedId(null)
    }
  }

  const handleDelete = () => {
    if (selectedId) {
      setImages(images.filter(img => img.id !== selectedId))
      setSelectedId(null)
    }
  }

  const handleBringToFront = () => {
    if (!selectedId) return
    const maxZ = Math.max(...images.map(i => i.zIndex))
    setImages(images.map(img => 
      img.id === selectedId ? { ...img, zIndex: maxZ + 1 } : img
    ))
  }

  const handleSendToBack = () => {
    if (!selectedId) return
    const minZ = Math.min(...images.map(i => i.zIndex))
    setImages(images.map(img => 
      img.id === selectedId ? { ...img, zIndex: minZ - 1 } : img
    ))
  }

  const handleDownload = () => {
    // Temporarily reset scale and position for full quality export
    const oldScale = stageRef.current.scale()
    const oldPos = stageRef.current.position()
    
    stageRef.current.scale({ x: 1, y: 1 })
    stageRef.current.position({ x: 0, y: 0 })
    
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 })
    
    // Restore view
    stageRef.current.scale(oldScale)
    stageRef.current.position(oldPos)

    const link = document.createElement('a')
    link.download = `family-composite-${Date.now()}.png`
    link.href = uri
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleHarmonize = async () => {
    if (images.length === 0) return
    setIsHarmonizing(true)
    
    try {
      // 1. Capture current stage
      const oldScale = stageRef.current.scale()
      stageRef.current.scale({ x: 0.5, y: 0.5 }) // Lower res for API
      const dataUrl = stageRef.current.toDataURL()
      stageRef.current.scale(oldScale)

      // 2. Call API
      const res = await fetch('/api/process-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: crypto.randomUUID(),
          images: [dataUrl], // Current composition
          type: 'harmonize'
        })
      })
      
      const data = await res.json()
      
      if (data.success && data.results[0]?.description) {
         // Parse JSON from description (Gemini returns markdown block often)
         const jsonStr = data.results[0].description.replace(/```json|```/g, '').trim()
         const suggestions = JSON.parse(jsonStr)
         setFilters(suggestions)
      }

    } catch (error) {
      console.error('Harmonization failed', error)
    } finally {
      setIsHarmonizing(false)
    }
  }

  // Define CSS filters string
  const filterStyle = filters ? {
    filter: `brightness(${filters.brightness || 1}) contrast(${filters.contrast || 1}) saturate(${filters.saturation || 1}) sepia(${filters.sepia || 0}) blur(${filters.blur || 0}px)`
  } : {}

  // Sort images by zIndex for rendering order
  const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200">
      {/* Toolbar */}
      <div className="bg-white p-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Zoom controls... */}
          <Button variant="ghost" size="sm" onClick={() => setStageScale(s => s * 1.1)} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStageScale(s => s / 1.1)} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setStageScale(1); setStagePos({x:0, y:0}) }} title="Reset View">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Smart Blend Button */}
          <Button 
            size="sm" 
            onClick={handleHarmonize} 
            disabled={isHarmonizing || images.length === 0}
            className={`transition-all ${filters ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'}`}
          >
            {isHarmonizing ? 'Đang xử lý...' : (filters ? '✨ Đã Hòa Trộn' : '✨ AI Hòa Trộn')}
          </Button>
          
          <div className="w-px h-4 bg-gray-300 mx-2"></div>

          {selectedId && (
            <>
              <Button variant="ghost" size="sm" onClick={handleBringToFront} title="Bring to Front">
                <Layers className="w-4 h-4 transform rotate-180" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSendToBack} title="Send to Back">
                <Layers className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Delete">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button size="sm" onClick={handleDownload} className="bg-green-600 hover:bg-green-700 ml-2">
            <Download className="w-4 h-4 mr-2" />
            Lưu Ảnh
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        className="flex-1 relative bg-[url('/grid-bg.png')] overflow-hidden cursor-move transition-all duration-700"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        style={filterStyle} // Apply AI filters here
      >
        <Stage
          width={window.innerWidth - 350} // Approximate width accounting for sidebar
          height={window.innerHeight - 200}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          draggable
        >
          <Layer>
            {sortedImages.map((img) => (
              <URLImage
                key={img.id}
                image={img}
                isSelected={img.id === selectedId}
                onSelect={() => setSelectedId(img.id)}
                onChange={(newAttrs: CanvasImage) => {
                  setImages(images.map(i => i.id === img.id ? newAttrs : i))
                }}
              />
            ))}
            {sortedImages.length === 0 && (
              <Text 
                text="Kéo thả ảnh vào đây để bắt đầu ghép" 
                x={100} 
                y={100} 
                fontSize={24} 
                fill="#aaa" 
              />
            )}
          </Layer>
        </Stage>
        
        {/* CSS for grid background */}
        <style jsx global>{`
          .bg-\\[url('\\/grid-bg\\.png')\\] {
            background-image: 
              linear-gradient(45deg, #e5e7eb 25%, transparent 25%), 
              linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #e5e7eb 75%), 
              linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          }
        `}</style>
      </div>
    </div>
  )
}
