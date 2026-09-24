'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Small decorative 3D globe for the "Luôn Bên Bạn Mọi Lúc, Mọi Nơi" stats
 * section - replaces the previous flat SVG placeholder with a real,
 * gently auto-rotating WebGL scene.
 *
 * Deliberately built with plain three.js rather than @react-three/fiber:
 * this app already depends on react-konva (a React 19-oriented package,
 * pulling in react-reconciler@0.33.0) while the app itself is pinned to
 * React 18.3.1. @react-three/fiber's own react-reconciler@0.27.0 collided
 * with that under the bundler's module resolution and crashed the whole
 * page (`Cannot read properties of undefined (reading 'ReactCurrentOwner')`
 * inside its renderer, caught by the root error boundary). Plain three.js
 * has no React reconciler dependency at all, so it can't hit that
 * collision - the render loop here is just requestAnimationFrame.
 *
 * Non-interactive by design (no drag/orbit controls) so it never competes
 * with page scroll on touch devices - it's ambient decoration.
 */

const MARKERS: { lat: number; lon: number; color: number }[] = [
  { lat: 21, lon: 106, color: 0xff6b9d }, // Vietnam
  { lat: 35, lon: 139, color: 0xffc837 }, // Japan
  { lat: 1, lon: 104, color: 0x4ecb71 }, // Singapore
  { lat: 37, lon: -122, color: 0x6bcfcf }, // US West
  { lat: 51, lon: 0, color: 0x8b7fd4 }, // UK
  { lat: -33, lon: 151, color: 0xff8f6b }, // Australia
]

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

export default function Globe3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 0, 4.2)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    // Wireframe globe
    const wireGeometry = new THREE.SphereGeometry(1.5, 24, 24)
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x6bcfcf,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    })
    group.add(new THREE.Mesh(wireGeometry, wireMaterial))

    // Solid inner sphere for depth
    const innerGeometry = new THREE.SphereGeometry(1.46, 32, 32)
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xebf3ff,
      transparent: true,
      opacity: 0.35,
    })
    group.add(new THREE.Mesh(innerGeometry, innerMaterial))

    // Location markers
    const markerMeshes = MARKERS.map(({ lat, lon, color }) => {
      const geometry = new THREE.SphereGeometry(0.045, 12, 12)
      const material = new THREE.MeshBasicMaterial({ color })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(latLonToVector3(lat, lon, 1.51))
      group.add(mesh)
      return mesh
    })

    scene.add(new THREE.AmbientLight(0xffffff, 1))

    let frameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      const elapsed = clock.getElapsedTime()

      if (!reduceMotion) {
        group.rotation.y += 0.0025
      }
      markerMeshes.forEach((mesh, i) => {
        const pulse = 1 + Math.sin(elapsed * 2 + i) * 0.25
        mesh.scale.setScalar(pulse)
      })

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
      wireGeometry.dispose()
      wireMaterial.dispose()
      innerGeometry.dispose()
      innerMaterial.dispose()
      markerMeshes.forEach((mesh) => {
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
