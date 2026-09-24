'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Decorative floating "polaroid" photo cards in 3D space behind the hero
 * heading - a second, subtler 3D highlight alongside the globe in
 * GlobalStats. Plain three.js for the same reason as Globe3D (see that
 * file's comment): @react-three/fiber's react-reconciler collides with
 * react-konva's in this app's dependency tree and crashes the page.
 *
 * Purely decorative and non-interactive: absolutely positioned behind the
 * hero text, pointer-events disabled at the container level (handled by
 * the caller), gentle idle bobbing/rotation only - never something a user
 * needs to interact with or that can block clicks/scroll.
 */

// Each "card" is a small rounded-rect canvas texture in the app's palette,
// standing in for a photo (we don't have real restoration photos to use
// here - these are abstract accents, not fake "real result" content).
// Kept close to the edges/corners so the cards frame the hero text
// instead of overlapping the subtitle and buttons in the center column.
const CARDS: { color: string; x: number; y: number; z: number; scale: number }[] = [
  { color: '#FF6B9D', x: -4.6, y: 1.6, z: -1.5, scale: 1 },
  { color: '#FFC837', x: 4.5, y: 1.9, z: -2, scale: 0.85 },
  { color: '#8B7FD4', x: -4.8, y: -2.6, z: -1.8, scale: 0.8 },
  { color: '#6BCFCF', x: 4.7, y: -2.5, z: -1.2, scale: 0.95 },
  { color: '#4ECB71', x: 0, y: 3, z: -2.4, scale: 0.65 },
]

function makeCardTexture(color: string): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // White polaroid frame
  const radius = 18
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(4, 4, size - 8, size - 8, radius)
  ctx.fill()

  // Colored "photo" area
  const pad = 20
  const photoH = size - pad * 2 - 36
  const gradient = ctx.createLinearGradient(pad, pad, size - pad, pad + photoH)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, '#ffffff')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.roundRect(pad, pad, size - pad * 2, photoH, 8)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export default function FloatingPhotos3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const textures: THREE.CanvasTexture[] = []
    const cards = CARDS.map((c) => {
      const texture = makeCardTexture(c.color)
      textures.push(texture)
      const geometry = new THREE.PlaneGeometry(1.3, 1.3)
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(c.x, c.y, c.z)
      mesh.scale.setScalar(c.scale)
      mesh.rotation.z = (Math.random() - 0.5) * 0.35
      scene.add(mesh)
      return { mesh, baseY: c.y, baseRotZ: mesh.rotation.z, phase: Math.random() * Math.PI * 2 }
    })

    let frameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      const elapsed = clock.getElapsedTime()

      if (!reduceMotion) {
        cards.forEach(({ mesh, baseY, baseRotZ, phase }) => {
          mesh.position.y = baseY + Math.sin(elapsed * 0.6 + phase) * 0.15
          mesh.rotation.z = baseRotZ + Math.sin(elapsed * 0.4 + phase) * 0.04
        })
      }

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      cards.forEach(({ mesh }) => {
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
      })
      textures.forEach((t) => t.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
