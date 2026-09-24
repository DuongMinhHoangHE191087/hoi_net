'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Globe3D = dynamic(() => import('./Globe3D'), {
  ssr: false,
  loading: () => <FlatGlobePlaceholder />,
})

/**
 * The original flat SVG globe mockup, kept as:
 * 1. the loading placeholder while the 3D chunk loads, and
 * 2. the permanent fallback on devices/browsers without WebGL.
 */
function FlatGlobePlaceholder() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-soft-blue-bg to-soft-cyan-bg flex items-center justify-center">
      <svg className="w-full h-full text-soft-blue-light" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        <ellipse cx="50" cy="50" rx="30" ry="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        <ellipse cx="50" cy="50" rx="15" ry="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        <circle cx="30" cy="35" r="2" fill="#4F8FFF" />
        <circle cx="60" cy="40" r="2" fill="#4F8FFF" />
        <circle cx="45" cy="55" r="2" fill="#4F8FFF" />
        <circle cx="70" cy="50" r="2" fill="#4F8FFF" />
        <circle cx="55" cy="65" r="2" fill="#4F8FFF" />
      </svg>
    </div>
  )
}

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
 * Real-image override (if the site ever provides one), else a 3D globe on
 * WebGL-capable browsers, else the original flat SVG mockup.
 */
export default function GlobeVisual({ image }: { image?: string }) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null)

  useEffect(() => {
    setWebglOk(hasWebGL())
  }, [])

  if (image) {
    return <img src={image} alt="Global Presence" className="w-full h-full object-cover" />
  }

  // webglOk === null on the very first client render (avoids a
  // server/client markup mismatch) - show the flat version until we know.
  if (webglOk) {
    return <Globe3D />
  }

  return <FlatGlobePlaceholder />
}
