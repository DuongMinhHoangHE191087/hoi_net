'use client'

import { useEffect, useState } from 'react'
import { FullScreenLoading } from './ui/Loading'

/**
 * Global Page Loader
 * - Hiển thị loading khi page chưa ready
 * - Hiển thị loading khi hard reload (F5, Ctrl+R)
 * - Đợi tất cả resources load xong
 * - Instant feedback - không delay
 */
export default function GlobalPageLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Immediately show loading
    setIsLoading(true)
    setProgress(10)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    // Wait for everything to load
    const checkIfReady = () => {
      // Check if DOM is ready
      if (document.readyState === 'loading') {
        const handler = () => {
          if (document.readyState === 'interactive' || document.readyState === 'complete') {
            checkResources()
          }
        }
        document.addEventListener('readystatechange', handler)
        return () => document.removeEventListener('readystatechange', handler)
      } else {
        checkResources()
      }
    }

    const checkResources = () => {
      // Wait for all images and resources
      if (document.readyState === 'complete') {
        finishLoading()
      } else {
        window.addEventListener('load', finishLoading)
      }
    }

    const finishLoading = () => {
      // Reduced minimum loading time for faster perceived performance
      const minLoadingTime = 300 // Reduced from 600ms
      const elapsed = Date.now() - startTime

      setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setIsLoading(false)
        }, 150) // Reduced from 300ms
      }, Math.max(0, minLoadingTime - elapsed))

      clearInterval(progressInterval)
    }

    const startTime = Date.now()
    checkIfReady()

    return () => {
      clearInterval(progressInterval)
      window.removeEventListener('load', finishLoading)
    }
  }, [])

  if (!isLoading) return null

  return (
    <FullScreenLoading
      message="Đang tải..."
      showProgress
      progress={progress}
    />
  )
}

