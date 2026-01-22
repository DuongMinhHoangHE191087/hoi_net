import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Notification, NotificationPreferences } from '@/lib/notifications-client'

// Query Keys
export const notificationQueryKeys = {
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  preferences: ['notification-preferences'] as const,
}

// ============================================
// Notifications Hooks
// ============================================

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: unreadOnly ? notificationQueryKeys.notifications.unread : notificationQueryKeys.notifications.all,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (unreadOnly) params.append('unreadOnly', 'true')

      const response = await fetch(`/api/notifications?${params}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')

      const data = await response.json()
      return data
    },
    refetchInterval: false, // Tắt polling vì đã có realtime subscription
    staleTime: 60000, // 1 phút - tăng lên vì realtime sẽ invalidate query khi có update
  })
}

export function useUnreadCount() {
  const { data } = useNotifications(true)
  return data?.unreadCount || 0
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })

      if (!response.ok) throw new Error('Failed to mark as read')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications.all })
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications.unread })
    }
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      })

      if (!response.ok) throw new Error('Failed to mark all as read')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications.all })
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications.unread })
    }
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete notification')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications.all })
    }
  })
}

// ============================================
// Realtime Notifications Hook
// ============================================

export function useRealtimeNotifications(userId: string | undefined) {
  const queryClient = useQueryClient()
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (!userId) return

    console.log('[Realtime] Subscribing to notifications for user:', userId)

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          console.log('[Realtime] New notification:', payload)

          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications.all })
          queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications.unread })

          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = payload.new as Notification
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification.id
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          console.log('[Realtime] Notification updated:', payload)
          queryClient.invalidateQueries({ queryKey: notificationQueryKeys.notifications.all })
        }
      )
      .subscribe((status: any) => {
        console.log('[Realtime] Subscription status:', status)
        setIsSubscribed(status === 'SUBSCRIBED')
      })

    return () => {
      console.log('[Realtime] Unsubscribing from notifications')
      supabase.removeChannel(channel)
      setIsSubscribed(false)
    }
  }, [userId, queryClient])

  return { isSubscribed }
}

// ============================================
// Notification Preferences Hooks
// ============================================

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationQueryKeys.preferences,
    queryFn: async () => {
      const response = await fetch('/api/notifications/preferences')
      if (!response.ok) throw new Error('Failed to fetch preferences')

      const data = await response.json()
      return data.preferences as NotificationPreferences
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (!response.ok) throw new Error('Failed to update preferences')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.preferences })
    }
  })
}

// ============================================
// Browser Notification Permission
// ============================================

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    }
    return false
  }

  return { permission, requestPermission, isSupported: 'Notification' in window }
}
