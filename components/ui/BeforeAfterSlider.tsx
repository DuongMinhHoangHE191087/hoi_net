'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
  /** Auto-sweep between before/after when the user isn't interacting,
   * so the transformation is visible without requiring a drag. */
  autoPlay?: boolean
}

const AUTO_PLAY_MIN = 12
const AUTO_PLAY_MAX = 88
const AUTO_PLAY_RESUME_DELAY_MS = 1800

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Ảnh Gốc',
  afterLabel = 'Đã Khôi Phục',
  className = '',
  autoPlay = true,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Track the container's real width so the "before" image can be
    // rendered at full size and clipped by the parent, instead of
    // shrinking to match the slider's current position (which distorted
    // it). Reading offsetWidth directly during render doesn't work: on
    // the very first paint the ref isn't attached yet, and nothing
    // re-reads it again on window resize.
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(el)
    setContainerWidth(el.offsetWidth)

    return () => observer.disconnect()
  }, [])

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      const percent = (x / rect.width) * 100
      setSliderPosition(percent)
    },
    []
  )

  // --- Auto-play: smooth back-and-forth sweep while idle ---
  useEffect(() => {
    if (!autoPlay) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const clearResumeTimer = () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = null
      }
    }

    const scheduleResume = () => {
      clearResumeTimer()
      resumeTimerRef.current = setTimeout(() => setIsAutoPlaying(true), AUTO_PLAY_RESUME_DELAY_MS)
    }

    if (isDragging) {
      setIsAutoPlaying(false)
      clearResumeTimer()
    } else {
      scheduleResume()
    }

    return clearResumeTimer
  }, [autoPlay, isDragging])

  useEffect(() => {
    if (!isAutoPlaying) return

    let frameId: number
    // Start the sweep from wherever the slider currently is, so resuming
    // after a manual drag doesn't jump.
    const amplitude = (AUTO_PLAY_MAX - AUTO_PLAY_MIN) / 2
    const center = (AUTO_PLAY_MAX + AUTO_PLAY_MIN) / 2
    const startPos = sliderPosition
    const startRatio = Math.max(-1, Math.min(1, (startPos - center) / amplitude))
    const startTime = performance.now() - (Math.asin(startRatio) / (2 * Math.PI)) * 6000

    const tick = (now: number) => {
      const elapsed = now - startTime
      const cyclePos = (elapsed / 6000) * 2 * Math.PI
      setSliderPosition(center + Math.sin(cyclePos) * amplitude)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlaying])

  const stopAutoPlay = () => {
    setIsAutoPlaying(false)
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
  }

  const handleMouseDown = () => {
    stopAutoPlay()
    setIsDragging(true)
  }

  const handlePointerEnter = () => {
    stopAutoPlay()
  }

  const handlePointerLeave = () => {
    if (!isDragging && autoPlay) {
      resumeTimerRef.current = setTimeout(() => setIsAutoPlaying(true), AUTO_PLAY_RESUME_DELAY_MS)
    }
  }

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX)
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX)
    }

    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchend', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isDragging, handleMove])

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] overflow-hidden rounded-xl select-none cursor-col-resize group ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
    >
      {/* After Image (full background) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before Image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          width: `${sliderPosition}%`,
          transition: isAutoPlaying || isDragging ? undefined : 'width 200ms ease-out',
        }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 h-full object-cover"
          style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
          draggable={false}
        />
      </div>

      {/* Slider Line - glows softly while auto-sweeping to read as an
          active "restoring" scan rather than a static divider */}
      <div
        className={`absolute top-0 bottom-0 w-0.5 bg-white z-10 ${isAutoPlaying ? 'shadow-[0_0_16px_4px_rgba(255,255,255,0.8)]' : 'shadow-lg'}`}
        style={{
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
          transition: isAutoPlaying || isDragging ? undefined : 'left 200ms ease-out',
        }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-gray-200 group-hover:scale-110 transition-transform">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4L3 10L7 16" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 4L17 10L13 16" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-20">
        <span className="px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-20">
        <span className="px-2.5 py-1 bg-white/80 text-gray-800 text-xs font-medium rounded-full backdrop-blur-sm border border-gray-200">
          {afterLabel}
        </span>
      </div>
    </div>
  )
}
