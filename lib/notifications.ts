// ============================================
// Notification Service (Server-side only)
// ============================================

import { supabaseAdmin } from './supabase-admin'
import type { Notification, CreateNotificationData, NotificationType } from './notifications-client'

// Re-export types for convenience
export type { Notification, NotificationType, NotificationPreferences, CreateNotificationData, EmailFrequency } from './notifications-client'

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(data: CreateNotificationData): Promise<Notification | null> {
    try {
      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          message: data.message,
          action_url: data.action_url || null,
          action_label: data.action_label || null,
          metadata: data.metadata || {},
          expires_at: data.expires_at || null
        })
        .select()
        .single()

      if (error) {
        console.error('[NotificationService] Create error:', error)
        return null
      }

      return notification
    } catch (error) {
      console.error('[NotificationService] Create exception:', error)
      return null
    }
  }

  /**
   * Create notifications for multiple users
   */
  static async createBulkNotifications(
    userIds: string[],
    data: Omit<CreateNotificationData, 'user_id'>
  ): Promise<Notification[]> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: data.type,
        title: data.title,
        message: data.message,
        action_url: data.action_url || null,
        action_label: data.action_label || null,
        metadata: data.metadata || {},
        expires_at: data.expires_at || null
      }))

      const { data: created, error } = await supabaseAdmin
        .from('notifications')
        .insert(notifications)
        .select()

      if (error) {
        console.error('[NotificationService] Bulk create error:', error)
        return []
      }

      return created || []
    } catch (error) {
      console.error('[NotificationService] Bulk create exception:', error)
      return []
    }
  }

  /**
   * Notify user about request status update
   */
  static async notifyRequestUpdate(
    userId: string,
    requestId: string,
    status: string,
    message?: string
  ): Promise<Notification | null> {
    const statusMessages: Record<string, { title: string; message: string; type: NotificationType }> = {
      processing: {
        title: 'Yêu cầu đang xử lý',
        message: message || 'Yêu cầu của bạn đang được xử lý bởi AI.',
        type: 'info'
      },
      completed: {
        title: 'Yêu cầu hoàn thành!',
        message: message || 'Yêu cầu của bạn đã được xử lý thành công.',
        type: 'success'
      },
      failed: {
        title: 'Yêu cầu thất bại',
        message: message || 'Có lỗi xảy ra khi xử lý yêu cầu của bạn.',
        type: 'error'
      }
    }

    const config = statusMessages[status] || {
      title: 'Cập nhật yêu cầu',
      message: message || `Trạng thái: ${status}`,
      type: 'info' as NotificationType
    }

    return this.createNotification({
      user_id: userId,
      type: 'request_update',
      title: config.title,
      message: config.message,
      action_url: `/requests/${requestId}`,
      action_label: 'Xem yêu cầu',
      metadata: { request_id: requestId, status }
    })
  }

  /**
   * Notify user when request is delivered
   */
  static async notifyRequestDelivered(
    userId: string,
    requestId: string,
    resultUrl: string
  ): Promise<Notification | null> {
    return this.createNotification({
      user_id: userId,
      type: 'request_delivered',
      title: 'Kết quả đã sẵn sàng!',
      message: 'Ảnh của bạn đã được khôi phục và sẵn sàng để tải xuống.',
      action_url: `/requests/${requestId}`,
      action_label: 'Tải xuống',
      metadata: { request_id: requestId, result_url: resultUrl }
    })
  }

  /**
   * Send system announcement to all users
   */
  static async notifySystemAnnouncement(
    title: string,
    message: string,
    actionUrl?: string,
    actionLabel?: string
  ): Promise<Notification[]> {
    try {
      // Get all user IDs
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id')

      if (!users || users.length === 0) return []

      const userIds = users.map(u => u.id)

      return this.createBulkNotifications(userIds, {
        type: 'system',
        title,
        message,
        action_url: actionUrl,
        action_label: actionLabel
      })
    } catch (error) {
      console.error('[NotificationService] System announcement error:', error)
      return []
    }
  }

  /**
   * Send admin message to specific user
   */
  static async notifyAdminMessage(
    userId: string,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<Notification | null> {
    return this.createNotification({
      user_id: userId,
      type: 'admin_message',
      title,
      message,
      action_url: actionUrl,
      action_label: 'Xem chi tiết'
    })
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

      if (error) {
        console.error('[NotificationService] Unread count error:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('[NotificationService] Unread count exception:', error)
      return 0
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      return !error
    } catch (error) {
      console.error('[NotificationService] Mark read error:', error)
      return false
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      return !error
    } catch (error) {
      console.error('[NotificationService] Mark all read error:', error)
      return false
    }
  }

  /**
   * Delete old read notifications (30 days)
   */
  static async deleteOldNotifications(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count, error } = await supabaseAdmin
        .from('notifications')
        .delete({ count: 'exact' })
        .eq('read', true)
        .lt('created_at', thirtyDaysAgo.toISOString())

      if (error) {
        console.error('[NotificationService] Delete old error:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('[NotificationService] Delete old exception:', error)
      return 0
    }
  }
}
