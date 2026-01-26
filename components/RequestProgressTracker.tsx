/**
 * Request Progress Tracker Component
 * 
 * Displays real-time processing progress for AI requests
 * Shows loading states, progress bars, and error messages
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface RequestProgressTrackerProps {
  requestId: string
  onComplete?: () => void
  onError?: (error: string) => void
}

interface ProgressState {
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  processedImages: number
  totalImages: number
  currentImage: string | null
  error: string | null
  adminNotes?: string
}

export default function RequestProgressTracker({
  requestId,
  onComplete,
  onError
}: RequestProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressState>({
    status: 'pending',
    processedImages: 0,
    totalImages: 0,
    currentImage: null,
    error: null
  })

  useEffect(() => {
    if (!requestId) return

    // Fetch initial state
    const fetchInitialState = async () => {
      const { data, error } = await supabase
        .from('user_requests')
        .select('status, original_images, restored_images, admin_notes')
        .eq('id', requestId)
        .single()

      if (error) {
        console.error('Failed to fetch request:', error)
        return
      }

      if (data) {
        setProgress({
          status: data.status as any,
          processedImages: data.restored_images?.length || 0,
          totalImages: data.original_images?.length || 0,
          currentImage: null,
          error: null,
          adminNotes: data.admin_notes
        })

        // Call callbacks
        if (data.status === 'completed' && onComplete) {
          onComplete()
        } else if (data.status === 'rejected' && onError) {
          onError(data.admin_notes || 'Request rejected')
        }
      }
    }

    fetchInitialState()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`request_progress:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_requests',
          filter: `id=eq.${requestId}`
        },
        (payload: { new: Record<string, any>; old: Record<string, any> }) => {
          console.log('📊 Progress update:', payload)
          
          const newData = payload.new as any
          
          setProgress(prev => ({
            ...prev,
            status: newData.status,
            processedImages: newData.restored_images?.length || 0,
            totalImages: newData.original_images?.length || prev.totalImages,
            adminNotes: newData.admin_notes
          }))

          // Call callbacks
          if (newData.status === 'completed' && onComplete) {
            onComplete()
          } else if (newData.status === 'rejected' && onError) {
            onError(newData.admin_notes || 'Request rejected')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [requestId, onComplete, onError])

  const progressPercentage = progress.totalImages > 0
    ? (progress.processedImages / progress.totalImages) * 100
    : 0

  return (
    <AnimatePresence mode="wait">
      {progress.status === 'processing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glassmorphism-strong p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <div>
              <h3 className="font-bold text-lg">Đang xử lý với AI</h3>
              <p className="text-sm text-gray-600">
                Vui lòng chờ, AI đang phân tích và cải thiện ảnh của bạn...
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tiến độ</span>
              <span className="font-semibold text-primary">
                {progress.processedImages}/{progress.totalImages} ảnh
              </span>
            </div>
            
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            <p className="text-xs text-gray-500 text-center">
              {progressPercentage.toFixed(0)}% hoàn thành
            </p>
          </div>

          {/* Sparkles Animation */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>AI đang làm việc...</span>
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
          </div>
        </motion.div>
      )}

      {progress.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glassmorphism-strong p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-bold text-lg text-green-800">Hoàn thành!</h3>
              <p className="text-sm text-green-700">
                AI đã xử lý thành công {progress.totalImages} ảnh của bạn
              </p>
            </div>
          </div>

          {progress.adminNotes && (
            <div className="mt-4 p-3 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-700 font-medium mb-1">Ghi chú:</p>
              <p className="text-sm text-gray-800 whitespace-pre-line">
                {progress.adminNotes}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {progress.status === 'rejected' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glassmorphism-strong p-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200"
        >
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-bold text-lg text-red-800">Yêu cầu bị từ chối</h3>
              <p className="text-sm text-red-700">
                {progress.adminNotes || 'Yêu cầu không thể xử lý'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {progress.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism-strong p-4 bg-amber-50 border-2 border-amber-200"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Có lỗi xảy ra</h4>
              <p className="text-sm text-amber-700">{progress.error}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
