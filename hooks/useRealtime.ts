// ✅ Supabase Realtime Hooks for Live Updates
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeRequestsOptions {
  userId?: string
  enabled?: boolean
  onInsert?: (request: any) => void
  onUpdate?: (request: any) => void
  onDelete?: (requestId: string) => void
}

/**
 * Real-Time Requests Hook
 *
 * Features:
 * - Listens to INSERT, UPDATE, DELETE events on user_requests table
 * - Automatically invalidates React Query cache
 * - Shows toast notifications for changes
 * - Auto-reconnects on connection loss
 * - Cleans up subscription on unmount
 *
 * Benefits:
 * - Users see updates without refresh
 * - Multi-user collaboration
 * - Admin changes reflect immediately
 * - Better UX for status changes
 */
export function useRealtimeRequests({
  userId,
  enabled = true,
  onInsert,
  onUpdate,
  onDelete
}: UseRealtimeRequestsOptions) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    // Don't subscribe if disabled or no userId
    if (!enabled || !userId) return

    // Create channel
    const channel = supabase.channel(`user_requests:${userId}`)

    // Listen to INSERT events
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_requests',
        filter: `user_id=eq.${userId}`
      },
      (payload: any) => {
        console.log('Realtime INSERT:', payload)

        // Invalidate queries to refetch
        queryClient.invalidateQueries({ queryKey: ['user-requests', userId] })
        queryClient.invalidateQueries({ queryKey: ['user-requests-infinite', userId] })

        // Show toast
        toast.success('Yêu cầu mới được tạo!', {
          icon: '🎉'
        })

        // Custom callback
        onInsert?.(payload.new)
      }
    )

    // Listen to UPDATE events
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_requests',
        filter: `user_id=eq.${userId}`
      },
      (payload: any) => {
        console.log('Realtime UPDATE:', payload)

        const oldStatus = (payload.old as any)?.status
        const newStatus = (payload.new as any)?.status

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['user-requests', userId] })
        queryClient.invalidateQueries({ queryKey: ['user-requests-infinite', userId] })

        // Show status change notification
        if (oldStatus !== newStatus) {
          const statusMessages = {
            pending: '⏳ Chờ xử lý',
            processing: '🔄 Đang xử lý',
            completed: '✅ Hoàn thành',
            rejected: '❌ Bị từ chối'
          }

          toast.success(
            `Trạng thái cập nhật: ${statusMessages[newStatus as keyof typeof statusMessages] || newStatus}`,
            { duration: 4000 }
          )
        }

        // Custom callback
        onUpdate?.(payload.new)
      }
    )

    // Listen to DELETE events
    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'user_requests',
        filter: `user_id=eq.${userId}`
      },
      (payload: any) => {
        console.log('Realtime DELETE:', payload)

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['user-requests', userId] })
        queryClient.invalidateQueries({ queryKey: ['user-requests-infinite', userId] })

        // Show toast
        toast.error('Yêu cầu đã bị xóa', {
          icon: '🗑️'
        })

        // Custom callback
        onDelete?.((payload.old as any)?.id)
      }
    )

    // Subscribe to channel
    channel.subscribe((status: string) => {
      console.log('Realtime connection status:', status)

      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime connected')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime connection error')
        toast.error('Mất kết nối real-time. Đang thử kết nối lại...')
      } else if (status === 'TIMED_OUT') {
        console.error('⏱️ Realtime connection timed out')
      }
    })

    // Store channel reference
    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting realtime')
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [userId, enabled, queryClient, onInsert, onUpdate, onDelete])

  return {
    channel: channelRef.current,
    isConnected: channelRef.current?.state === 'joined'
  }
}

/**
 * Usage Example:
 *
 * function RequestsPage() {
 *   const { user } = useAuth()
 *
 *   // Enable real-time updates
 *   const { isConnected } = useRealtimeRequests({
 *     userId: user?.id,
 *     enabled: !!user,
 *     onUpdate: (request) => {
 *       console.log('Request updated:', request)
 *     }
 *   })
 *
 *   return (
 *     <div>
 *       {isConnected && (
 *         <div className="text-green-500">
 *           🟢 Live updates active
 *         </div>
 *       )}
 *       Rest of component
 *     </div>
 *   )
 * }
 */

/**
 * Admin Hook - Listen to ALL requests (not filtered by userId)
 */
export function useRealtimeAllRequests({
  enabled = true
}: {
  enabled?: boolean
}) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const channel = supabase.channel('all_requests')

    // Listen to all changes (no filter)
    channel.on(
      'postgres_changes',
      {
        event: '*', // All events
        schema: 'public',
        table: 'user_requests'
      },
      (payload: any) => {
        console.log('Admin Realtime:', payload)

        // Invalidate admin queries
        queryClient.invalidateQueries({ queryKey: ['admin-requests'] })

        // Show notification
        if (payload.eventType === 'INSERT') {
          toast('Yêu cầu mới từ người dùng', {
            icon: '📬'
          })
        }
      }
    )

    channel.subscribe()
    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [enabled, queryClient])

  return {
    channel: channelRef.current,
    isConnected: channelRef.current?.state === 'joined'
  }
}

