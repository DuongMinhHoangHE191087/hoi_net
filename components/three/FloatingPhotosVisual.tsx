'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const FloatingPhotos3D = dynamic(() => import('./FloatingPhotos3D'), {
  ssr: false,
  loading: () => null,
})

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

/**
 * Purely decorative, so unlike GlobeVisual there's no flat-mockup
 * fallback needed - on unsupported browsers/small screens it just
 * renders nothing and the hero looks like it did before.
 */
export default function FloatingPhotosVisual() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(hasWebGL())
  }, [])

  if (!ready) return null

  return (
    <div
      className="hidden md:block absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <FloatingPhotos3D />
    </div>
  )
}
